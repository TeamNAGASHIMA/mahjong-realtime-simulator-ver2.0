# crop_discard_detection.py
# 画像の捨て牌部分を切り出す

import cv2
import numpy as np

def _get_crop_coordinates(image_np: np.ndarray, 
                        center_x_ratio: float, center_y_ratio: float,
                        width_ratio: float, height_ratio) -> tuple[int, int, int, int]:
    """
    画像サイズと中心比率、サイズ比率から切り出し領域のピクセル座標 (x, y, w, h) を計算するヘルパー関数。

    Args:
        image_np (np.ndarray): 入力画像データ (NumPy配列)。
        center_x_ratio (float): 画像の幅に対する切り出し領域の中心X座標の比率 (0.0〜1.0)。
        center_y_ratio (float): 画像の高さに対する切り出し領域の中心Y座標の比率 (0.0〜1.0)。
        width_ratio (float): 切り出し領域の幅を画像全体の幅に対する比率で指定 (0.0〜1.0)。
        height_ratio (float): 切り出し領域の高さを画像全体の高さに対する比率で指定 (0.0〜1.0)。

    Returns:
        tuple[int, int, int, int]: 切り出し領域の左上X座標, 左上Y座標, 幅, 高さ。
    """
    h_img, w_img = image_np.shape[:2]

    crop_w = int(w_img * width_ratio)
    crop_h = int(h_img * height_ratio)

    # 中心座標をピクセルで計算
    cx_pixels = int(w_img * center_x_ratio)
    cy_pixels = int(h_img * center_y_ratio)

    # 左上座標
    start_x = cx_pixels - crop_w // 2
    start_y = cy_pixels - crop_h // 2

    # 切り抜き範囲が画像の境界を超えないように調整
    start_x = max(0, start_x)
    start_y = max(0, start_y)
    
    end_x = start_x + crop_w
    end_y = start_y + crop_h

    # 調整後の幅と高さを再計算
    crop_w = min(end_x, w_img) - start_x
    crop_h = min(end_y, h_img) - start_y
    
    return start_x, start_y, crop_w, crop_h


def main(image_np: np.ndarray) -> dict[str, np.ndarray]:
    """盤面画像から4人分の捨て牌領域を個別に検出・切り出します。

    各プレイヤーの捨て牌（河）の位置は、盤面全体の画像サイズに対する
    固定の比率として定義されます。この関数は、それらの定義に基づいて
    各河の領域を切り出し、辞書形式で返します。

    Args:
        image_np (np.ndarray): 盤面全体の画像データ (NumPy配列)。

    Returns:
        dict[str, np.ndarray]: 各プレイヤーの捨て牌領域の画像データ (NumPy配列) を格納した辞書。
                            キーは 'bottom', 'right', 'top', 'left'。
                            画像が切り出せなかった場合は、そのキーの値はNoneとなります。
                            入力画像が不正な場合は空の辞書を返します。
    """
    if image_np is None or image_np.size == 0:
        print("致命的エラー: main (crop_discard_detection) - 入力画像が空または不正です。")
        return {}

    # 各プレイヤーの捨て牌領域の定義（画像の幅・高さに対する比率）
    # これらの値は、使用するカメラとテーブルのセットアップに合わせて調整する必要があります。
    # 例: 卓の中央に捨て牌が集まる一般的な麻雀卓の配置を想定。
    # ここでは仮の値を設定しています。実際の使用環境に合わせて調整してください。
    # --------------------------------------------------------------------------
    # 注意: これらの比率はボード全体の画像に対するものです。
    # 例えば、横幅の0.5は画像中央、縦幅の0.8は画像の下から20%の位置を指します。
    # --------------------------------------------------------------------------

    # 1. 自分（画面下）の捨て牌
    # 河の領域の中心X座標、中心Y座標、幅、高さの比率
    BOTTOM_DISCARD_REGION = {
        'center_x_ratio': 0.5,
        'center_y_ratio': 0.7, # 卓の中央よりやや下
        'width_ratio': 0.2,     # 牌が横に並ぶ幅
        'height_ratio': 0.2   # 牌が縦に積まれる高さ（通常3段まで）
    }

    # 2. 下家（画面右）の捨て牌
    RIGHT_DISCARD_REGION = {
        'center_x_ratio': 0.65,  # 卓の中央よりやや右
        'center_y_ratio': 0.5,
        'width_ratio': 0.18,    # 牌が横に積まれる幅（通常3段まで）
        'height_ratio': 0.25     # 牌が縦に並ぶ高さ
    }

    # 3. 対面（画面上）の捨て牌
    TOP_DISCARD_REGION = {
        'center_x_ratio': 0.5,
        'center_y_ratio': 0.27, # 卓の中央よりやや上
        'width_ratio': 0.2,
        'height_ratio': 0.2
    }

    # 4. 上家（画面左）の捨て牌
    LEFT_DISCARD_REGION = {
        'center_x_ratio': 0.35,  # 卓の中央よりやや左
        'center_y_ratio': 0.45,
        'width_ratio': 0.18,
        'height_ratio': 0.25
    }

    # 各領域を切り出す
    cropped_discard_areas = {}
    
    # デバッグ表示用オリジナル画像のコピー (imshowコメントアウトに伴い不要だが、残しておく)
    # debug_original_image = image_np.copy()

    regions_to_process = {
        'bottom': BOTTOM_DISCARD_REGION,
        'right': RIGHT_DISCARD_REGION,
        'top': TOP_DISCARD_REGION,
        'left': LEFT_DISCARD_REGION
    }

    for key, params in regions_to_process.items():
        x, y, w, h = _get_crop_coordinates(
            image_np,
            params['center_x_ratio'], params['center_y_ratio'],
            params['width_ratio'], params['height_ratio']
        )
        
        cropped_img = None
        # 妥当な幅と高さがある場合のみ切り出し
        if w > 0 and h > 0:
            cropped_img = image_np[y:y+h, x:x+w]
        
        cropped_discard_areas[key] = cropped_img

        # デバッグ表示 (各領域の切り出しを視覚的に確認)
        # これらの行をコメントアウト
        # if cropped_img is not None:
        #     color_map = {
        #         'bottom': (0, 255, 0),  # 緑
        #         'right': (0, 255, 255), # 黄
        #         'top': (255, 0, 0),     # 青
        #         'left': (255, 255, 0)   # シアン
        #     }
        #     color = color_map.get(key, (255, 255, 255))
        #     cv2.rectangle(debug_original_image, (x, y), (x + w, y + h), color, 2)
        #     cv2.putText(debug_original_image, key, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
        #     if w > 50 and h > 50: 
        #         cv2.imshow(f"Cropped Discard: {key}", cropped_img)


    # これらの行をコメントアウト
    # cv2.imshow("Original Image with Discard Regions", debug_original_image)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()


    return cropped_discard_areas


# --- スクリプトのエントリーポイント ---
if __name__ == '__main__':
    # テスト用設定
    TEST_IMAGE_PATH = 'test_mahjong.jpg' # テスト用画像パス
    
    # --- 実行 ---
    input_image_np = cv2.imread(TEST_IMAGE_PATH)

    if input_image_np is None:
        print(f"エラー: 画像ファイル '{TEST_IMAGE_PATH}' が見つからないか、読み込めません。")
    else:
        print("discard_detectionのテストを開始します。")
        # main関数を呼び出すだけ (imshowは内部で実行されない)
        result_cropped_dict = main(input_image_np)

        if result_cropped_dict:
            print("\nテスト完了: 4人分の捨て牌領域が切り出され、辞書として返されました。")
            for key, img_np in result_cropped_dict.items():
                if img_np is not None:
                    h, w, _ = img_np.shape
                    print(f"  '{key}' 領域: サイズ = {w}x{h} ピクセル")
        else:
            print("\nテスト完了: 捨て牌領域の切り出しに失敗しました。")