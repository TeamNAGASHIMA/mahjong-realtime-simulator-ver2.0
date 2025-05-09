import os
import tempfile
from PIL import Image, ImageGrab, ImageDraw, ImageFont
# from inference_sdk import InferenceHTTPClient # 古いSDK
from roboflow import Roboflow # 新しいSDKの主要クラス
from dotenv import load_dotenv

# .envファイルから環境変数をロード
load_dotenv()

# --- 設定箇所 (環境変数から読み込み) ---
# 1. Roboflow API設定
# API_URL は Roboflow クラスが内部的に適切なエンドポイントを使用するため、直接は使わないことが多い
# ROBOFLOW_API_URL = os.getenv("ROBOFLOW_API_URL", "https://detect.roboflow.com") # 参考情報として残す
API_KEY = os.getenv("ROBOFLOW_API_KEY")
MODEL_ID = os.getenv("ROBOFLOW_MODEL_ID") # "プロジェクト名/バージョン番号" の形式 (例: "maj-soul/2")

# 2. 検知の信頼度閾値 (0.0 - 1.0)
try:
    CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.4"))
except ValueError:
    print("警告: 環境変数 CONFIDENCE_THRESHOLD の値が不正です。デフォルト値 0.4 を使用します。")
    CONFIDENCE_THRESHOLD = 0.4

# 重複除去のIoU閾値 (0.0 - 1.0)
try:
    IOU_THRESHOLD = float(os.getenv("ROBOFLOW_IOU_THRESHOLD", "0.3"))
except ValueError:
    print("警告: 環境変数 ROBOFLOW_IOU_THRESHOLD の値が不正です。デフォルト値 0.3 を使用します。")
    IOU_THRESHOLD = 0.3

# 3. スクリーンショットの範囲 (変更なし)
try:
    sr_left = os.getenv("SCREENSHOT_REGION_LEFT")
    sr_top = os.getenv("SCREENSHOT_REGION_TOP")
    sr_right = os.getenv("SCREENSHOT_REGION_RIGHT")
    sr_bottom = os.getenv("SCREENSHOT_REGION_BOTTOM")

    if all(val is not None and val != "" for val in [sr_left, sr_top, sr_right, sr_bottom]):
        SCREENSHOT_REGION = (int(sr_left), int(sr_top), int(sr_right), int(sr_bottom))
    else:
        SCREENSHOT_REGION = None
except ValueError:
    print("警告: 環境変数 SCREENSHOT_REGION_* の値が不正です。全画面キャプチャを使用します。")
    SCREENSHOT_REGION = None

# 4. 結果表示用のフォント (変更なし)
FONT_PATH = os.getenv("FONT_PATH", "arial.ttf")
try:
    FONT_SIZE = int(os.getenv("FONT_SIZE", "15"))
except ValueError:
    print("警告: 環境変数 FONT_SIZE の値が不正です。デフォルト値 15 を使用します。")
    FONT_SIZE = 15

# 5. 結果画像の保存ファイル名 (変更なし)
OUTPUT_IMAGE_FILENAME = os.getenv("OUTPUT_IMAGE_FILENAME", "detection_result.png")
# --- 設定箇所ここまで ---

def get_font(size=15): # (変更なし)
    """描画用のフォントを取得する"""
    try:
        font = ImageFont.truetype(FONT_PATH, size)
    except IOError:
        print(f"警告: フォント '{FONT_PATH}' が見つかりません。デフォルトフォントを使用します。")
        font = ImageFont.load_default()
    return font

def detect_tiles_from_screenshot_inference_sdk(): # 関数名は変更しないでおきます
    """
    スクリーンショットを取得し、Roboflow SDK (Roboflowクラス)で牌を検知して結果を表示・保存する関数
    """
    if not API_KEY:
        print("エラー: 環境変数 ROBOFLOW_API_KEY が設定されていません。.envファイルを確認してください。")
        return
    if not MODEL_ID:
        print("エラー: 環境変数 ROBOFLOW_MODEL_ID が設定されていません。.envファイルを確認してください。")
        return

    try:
        # MODEL_ID からプロジェクトIDとバージョンを分離
        model_parts = MODEL_ID.split('/')
        if len(model_parts) != 2:
            print(f"エラー: ROBOFLOW_MODEL_ID '{MODEL_ID}' の形式が不正です。「プロジェクト名/バージョン番号」の形式である必要があります。")
            return
        project_id = model_parts[0]
        try:
            version_number = int(model_parts[1])
        except ValueError:
            print(f"エラー: ROBOFLOW_MODEL_ID '{MODEL_ID}' のバージョン番号 '{model_parts[1]}' が不正です。数値である必要があります。")
            return

        rf = Roboflow(api_key=API_KEY)
        # API_URL は通常、Roboflowクラスが内部で管理します。
        # 特定のエンドポイントを指定する必要がある場合は、Roboflowクラスのドキュメントを参照してください。
        project = rf.workspace().project(project_id)
        model = project.version(version_number).model
        print(f"Roboflow Client を初期化し、モデルを取得しました。プロジェクトID: {project_id}, バージョン: {version_number}")

    except Exception as e:
        print(f"Roboflow Client の初期化またはモデル取得中にエラーが発生しました: {e}")
        import traceback
        traceback.print_exc()
        return

    print("スクリーンショットを取得中...")
    try:
        screenshot = ImageGrab.grab(bbox=SCREENSHOT_REGION)
        if screenshot.mode == 'RGBA':
            screenshot = screenshot.convert('RGB')
        print(f"スクリーンショットを取得しました (サイズ: {screenshot.size})。")
    except Exception as e:
        print(f"スクリーンショットの取得に失敗しました: {e}")
        return

    screenshot_path = None
    image_with_boxes = screenshot.copy()

    try:
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp_file:
            screenshot_path = tmp_file.name
            screenshot.save(screenshot_path, "JPEG")
        print(f"一時ファイルに画像を保存: {screenshot_path}")

        # Roboflow SDK (Roboflowクラス) では、confidence と overlap (IoU) は 0-100 の整数で指定
        api_confidence_value = int(CONFIDENCE_THRESHOLD * 100)
        api_overlap_value = int(IOU_THRESHOLD * 100) # IoU threshold は overlap と呼ばれる

        print(f"牌の検知処理を実行中... (API Confidence: {api_confidence_value}%, API Overlap/IoU: {api_overlap_value}%)")
        
        # 推論実行
        # model.predict() は PredictionGroup オブジェクトを返す
        prediction_group = model.predict(screenshot_path, confidence=api_confidence_value, overlap=api_overlap_value)
        
        # 結果をJSON形式 (辞書) で取得
        result_json = prediction_group.json() # {'predictions': [...], ...} のような形式
        predictions = result_json.get('predictions', [])
        
        # あるいは、PredictionGroup オブジェクトから直接 Prediction オブジェクトのリストとして取得する場合:
        # predictions_objects = prediction_group.predictions
        # predictions = []
        # if predictions_objects:
        #     for p_obj in predictions_objects:
        #         # p_obj.json() や p_obj.as_dict() のようなメソッドがあるか、
        #         # または直接属性 (p_obj.x, p_obj.confidence など) にアクセスできるか確認
        #         # ここでは、より一般的な .json() 経由の方法を採用します。
        #         # p_obj.json_representation が辞書を返すことが多いです。
        #         predictions.append(p_obj.json_representation)


        print(f"{len(predictions)} 個の牌を検知しました（APIによるフィルタリング後）。")

        if not predictions:
            print("条件を満たす牌は検知されませんでした。")
            screenshot.show()
            try:
                screenshot.save(OUTPUT_IMAGE_FILENAME)
                print(f"検知対象なしの画像を '{OUTPUT_IMAGE_FILENAME}' に保存しました。")
            except Exception as e:
                print(f"検知対象なしの画像の保存中にエラーが発生しました: {e}")
            return

        draw = ImageDraw.Draw(image_with_boxes)
        font = get_font(FONT_SIZE)
        detected_tiles_info = []

        for pred_data in predictions:
            if not isinstance(pred_data, dict):
                print(f"警告: 予測データの形式が予期せぬものです ({type(pred_data)})。スキップします。")
                continue

            # 返ってくる辞書のキーを確認。
            # Roboflow の predict().json() の 'predictions' リスト内の辞書は、
            # 'x', 'y' (中心座標), 'width', 'height', 'confidence' (0.0-1.0), 'class' を持つはず。
            x_center = pred_data.get('x')
            y_center = pred_data.get('y')
            width = pred_data.get('width')
            height = pred_data.get('height')
            pred_confidence = pred_data.get('confidence') # これは 0.0-1.0 のはず
            class_name = pred_data.get('class')

            if None in [x_center, y_center, width, height, pred_confidence, class_name]:
                print(f"警告: 予測データに必要なキーが不足しています: {pred_data}。スキップします。")
                continue


            x0 = x_center - width / 2
            y0 = y_center - height / 2
            x1 = x_center + width / 2
            y1 = y_center + height / 2

            tile_info = f"牌: {class_name}, 信頼度: {pred_confidence:.2f}, 位置: (x:{int(x_center)}, y:{int(y_center)})"
            print(tile_info)
            detected_tiles_info.append({
                "class": class_name,
                "confidence": pred_confidence,
                "x": int(x_center),
                "y": int(y_center),
                "width": int(width),
                "height": int(height)
            })

            draw.rectangle([x0, y0, x1, y1], outline="lime", width=3)
            label = f"{class_name} ({pred_confidence:.2f})"
            
            label_draw_x = x0
            label_draw_y = y0 - FONT_SIZE - 5 
            if label_draw_y < 0: 
                label_draw_y = y1 + 2 

            try:
                bbox = draw.textbbox((label_draw_x, label_draw_y), label, font=font)
                draw.rectangle(bbox, fill="lime")
                draw.text((label_draw_x, label_draw_y), label, fill="black", font=font)
            except AttributeError: 
                text_width, text_height = draw.textsize(label, font=font)
                draw.rectangle(
                    [label_draw_x, label_draw_y, label_draw_x + text_width, label_draw_y + text_height],
                    fill="lime"
                )
                draw.text((label_draw_x, label_draw_y), label, fill="black", font=font)

        print("\n検知結果を画像で表示します...")
        image_with_boxes.show()

        try:
            image_with_boxes.save(OUTPUT_IMAGE_FILENAME)
            print(f"検知結果を '{OUTPUT_IMAGE_FILENAME}' に保存しました。")
        except Exception as e:
            print(f"結果画像の保存中にエラーが発生しました: {e}")

    except Exception as e:
        print(f"予測または結果処理中にエラーが発生しました: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if screenshot_path and os.path.exists(screenshot_path):
            os.remove(screenshot_path)
            print(f"一時ファイルを削除しました: {screenshot_path}")

if __name__ == "__main__":
    print("麻雀牌検知プログラム (Roboflow SDK版, .env対応, 結果画像保存) を開始します。")
    print("設定:")
    # print(f"  - API URL (参考): {ROBOFLOW_API_URL}") # 不要ならコメントアウト
    print(f"  - API Key: {'設定済み' if API_KEY else '未設定'}")
    print(f"  - Model ID (Project/Version): {MODEL_ID if MODEL_ID else '未設定'}")
    print(f"  - Confidence Threshold (0.0-1.0 for display, scaled for API): {CONFIDENCE_THRESHOLD}")
    print(f"  - IoU Threshold (0.0-1.0 for display, scaled for API): {IOU_THRESHOLD}")
    print(f"  - Screenshot Region: {'全画面' if SCREENSHOT_REGION is None else SCREENSHOT_REGION}")
    print(f"  - Font Path: {FONT_PATH}, Size: {FONT_SIZE}")
    print(f"  - Output Image Filename: {OUTPUT_IMAGE_FILENAME}")
    print("-" * 30)
    
    if not API_KEY or not MODEL_ID:
        print("必須の設定 (ROBOFLOW_API_KEY, ROBOFLOW_MODEL_ID) が .env ファイルに設定されていません。")
        print("プログラムを終了します。")
    else:
        detect_tiles_from_screenshot_inference_sdk()
        print("\nプログラムを終了します。")