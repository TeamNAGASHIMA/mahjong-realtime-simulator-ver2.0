import os
import tempfile
from PIL import Image, ImageGrab, ImageDraw, ImageFont
from inference_sdk import InferenceHTTPClient
from dotenv import load_dotenv

# .envファイルから環境変数をロード
load_dotenv()

# --- 設定箇所 (環境変数から読み込み) ---
# 1. Roboflow API設定
API_URL = os.getenv("ROBOFLOW_API_URL", "https://detect.roboflow.com")
API_KEY = os.getenv("ROBOFLOW_API_KEY")
MODEL_ID = os.getenv("ROBOFLOW_MODEL_ID")

# 2. 検知の閾値
try:
    CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.4"))
except ValueError:
    print("警告: 環境変数 CONFIDENCE_THRESHOLD の値が不正です。デフォルト値 0.4 を使用します。")
    CONFIDENCE_THRESHOLD = 0.4

# 3. スクリーンショットの範囲
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

# 4. 結果表示用のフォント
FONT_PATH = os.getenv("FONT_PATH", "arial.ttf")
try:
    FONT_SIZE = int(os.getenv("FONT_SIZE", "15"))
except ValueError:
    print("警告: 環境変数 FONT_SIZE の値が不正です。デフォルト値 15 を使用します。")
    FONT_SIZE = 15

# 5. 結果画像の保存ファイル名 (オプションで .env からも読み込めるようにする)
OUTPUT_IMAGE_FILENAME = os.getenv("OUTPUT_IMAGE_FILENAME", "detection_result.png")
# --- 設定箇所ここまで ---

def get_font(size=15):
    """描画用のフォントを取得する"""
    try:
        font = ImageFont.truetype(FONT_PATH, size)
    except IOError:
        print(f"警告: フォント '{FONT_PATH}' が見つかりません。デフォルトフォントを使用します。")
        font = ImageFont.load_default()
    return font

def detect_tiles_from_screenshot_inference_sdk():
    """
    スクリーンショットを取得し、Roboflow Inference SDKで牌を検知して結果を表示・保存する関数
    """
    if not API_KEY:
        print("エラー: 環境変数 ROBOFLOW_API_KEY が設定されていません。.envファイルを確認してください。")
        return
    if not MODEL_ID:
        print("エラー: 環境変数 ROBOFLOW_MODEL_ID が設定されていません。.envファイルを確認してください。")
        return

    try:
        client = InferenceHTTPClient(api_url=API_URL, api_key=API_KEY)
        print(f"Roboflow Inference Client を初期化しました。モデルID: {MODEL_ID}")
    except Exception as e:
        print(f"Roboflow Inference Client の初期化中にエラーが発生しました: {e}")
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
    image_with_boxes = screenshot.copy() # 描画用に元画像をコピーしておく

    try:
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp_file:
            screenshot_path = tmp_file.name
            screenshot.save(screenshot_path, "JPEG")
        print(f"一時ファイルに画像を保存: {screenshot_path}")

        print("牌の検知処理を実行中...")
        result = client.infer(screenshot_path, model_id=MODEL_ID)
        
        if isinstance(result, dict):
            predictions = result.get('predictions', [])
        elif hasattr(result, 'predictions'):
            predictions = result.predictions
        else:
            print("エラー: 予測結果の形式が不明です。")
            predictions = []
            
        print(f"{len(predictions)} 個の牌候補を検知しました（フィルタリング前）。")

        filtered_predictions = [p for p in predictions if p.get('confidence', 0) >= CONFIDENCE_THRESHOLD]
        print(f"{len(filtered_predictions)} 個の牌候補を検知しました（信頼度 > {CONFIDENCE_THRESHOLD}）。")

        if not filtered_predictions:
            print("条件を満たす牌は検知されませんでした。")
            # 元のスクリーンショットを表示（または保存しても良い）
            screenshot.show()
            try:
                screenshot.save(OUTPUT_IMAGE_FILENAME)
                print(f"検知対象なしの画像を '{OUTPUT_IMAGE_FILENAME}' に保存しました。")
            except Exception as e:
                print(f"検知対象なしの画像の保存中にエラーが発生しました: {e}")
            return

        # ここで image_with_boxes に描画する
        draw = ImageDraw.Draw(image_with_boxes)
        font = get_font(FONT_SIZE)
        detected_tiles_info = []

        for pred in filtered_predictions:
            x_center = pred['x']
            y_center = pred['y']
            width = pred['width']
            height = pred['height']
            confidence = pred['confidence']
            class_name = pred['class']

            x0 = x_center - width / 2
            y0 = y_center - height / 2
            x1 = x_center + width / 2
            y1 = y_center + height / 2

            tile_info = f"牌: {class_name}, 信頼度: {confidence:.2f}, 位置: (x:{int(x_center)}, y:{int(y_center)})"
            print(tile_info)
            detected_tiles_info.append({
                "class": class_name,
                "confidence": confidence,
                "x": int(x_center),
                "y": int(y_center),
                "width": int(width),
                "height": int(height)
            })

            draw.rectangle([x0, y0, x1, y1], outline="lime", width=3)
            label = f"{class_name} ({confidence:.2f})"
            
            try:
                text_bbox = draw.textbbox((x0, y0 - FONT_SIZE - 2), label, font=font)
                draw.rectangle(text_bbox, fill="lime")
            except AttributeError: # Pillow < 8.0.0
                text_width, text_height = draw.textsize(label, font=font)
                draw.rectangle([x0, y0 - FONT_SIZE - 2, x0 + text_width, y0 - 2], fill="lime")

            draw.text((x0, y0 - FONT_SIZE - 2), label, fill="black", font=font)

        # 6. 結果画像を表示
        print("\n検知結果を画像で表示します...")
        image_with_boxes.show()

        # 7. 検知結果が描画された画像を保存
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
    print("麻雀牌検知プログラム (Inference SDK版, .env対応, 結果画像保存) を開始します。")
    print("設定:")
    print(f"  - API URL: {API_URL}")
    print(f"  - API Key: {'設定済み' if API_KEY else '未設定'}")
    print(f"  - Model ID: {MODEL_ID if MODEL_ID else '未設定'}")
    print(f"  - Confidence Threshold: {CONFIDENCE_THRESHOLD}")
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