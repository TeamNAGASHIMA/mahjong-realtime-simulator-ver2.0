# crop_open_detection.py
# 画像の捨て牌部分を切り出す

import cv2
import numpy as np
import os

# --- 定数定義 ---
# 各プレイヤーの捨て牌領域の定義（画像の幅・高さに対する比率）
# これらの値は、使用するカメラとテーブルのセットアップに合わせて調整する必要があります。
# --------------------------------------------------------------------------
# 注意: これらの比率はボード全体の画像に対するものです。
# 例えば、横幅の0.5は画像中央、縦幅の0.8は画像の下から20%の位置を指します。
# --------------------------------------------------------------------------
open_REGIONS = {
    # 1. 自分（画面下）の捨て牌
    'bottom': {
        'center_x_ratio': 0.6,
        'center_y_ratio': 0.95, # 卓の中央よりやや下
        'width_ratio': 0.4,    # 牌が横に並ぶ幅
        'height_ratio': 0.1    # 牌が縦に積まれる高さ（通常3段まで）
    },
    # 2. 下家（画面右）の捨て牌
    'right': {
        'center_x_ratio': 0.27,  # 卓の中央よりやや右
        'center_y_ratio': 0.7,
        'width_ratio': 0.07,     # 牌が横に積まれる幅（通常3段まで）
        'height_ratio': 0.6     # 牌が縦に並ぶ高さ
    },
    # 3. 対面（画面上）の捨て牌
    'top': {
        'center_x_ratio': 0.42,
        'center_y_ratio': 0.05, # 卓の中央よりやや上
        'width_ratio': 0.4,
        'height_ratio': 0.1
    },
    # 4. 上家（画面左）の捨て牌
    'left': {
        'center_x_ratio': 0.77,  # 卓の中央よりやや左
        'center_y_ratio': 0.3,
        'width_ratio': 0.07,
        'height_ratio': 0.6
    }
}

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


def crop_open_main(image_np: np.ndarray) -> dict[str, np.ndarray]:
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
        print("致命的エラー: main (crop_open_detection) - 入力画像が空または不正です。")
        return {}

    # 各領域を切り出す
    cropped_open_areas = {}
    
    for key, params in open_REGIONS.items():
        x, y, w, h = _get_crop_coordinates(
            image_np,
            params['center_x_ratio'], params['center_y_ratio'],
            params['width_ratio'], params['height_ratio']
        )
        
        cropped_img = None
        # 妥当な幅と高さがある場合のみ切り出し
        if w > 0 and h > 0:
            cropped_img = image_np[y:y+h, x:x+w]
        
        cropped_open_areas[key] = cropped_img

    return cropped_open_areas


# --- スクリプトのエントリーポイント ---
if __name__ == '__main__':
    # --- テスト用設定 ---
    TEST_IMAGE_PATH = 'board_tiles_image.jpg' # テスト用画像パス
    OUTPUT_DIR = 'output_opens'           # 出力ディレクトリ名

    # --- 実行 ---
    # 出力ディレクトリを作成（存在しない場合）
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    input_image_np = cv2.imread(TEST_IMAGE_PATH)

    if input_image_np is None:
        print(f"エラー: 画像ファイル '{TEST_IMAGE_PATH}' が見つからないか、読み込めません。")
    else:
        print("open_detectionのテストを開始します。")
        
        # 1. main関数を呼び出し、切り出し結果を取得
        result_cropped_dict = crop_open_main(input_image_np)

        if not result_cropped_dict:
            print("\nテスト完了: 捨て牌領域の切り出しに失敗しました。")
        else:
            # 2. 切り出した各画像をファイルに保存
            print(f"\n切り出した画像を '{OUTPUT_DIR}/' に保存します...")
            for key, img_np in result_cropped_dict.items():
                if img_np is not None and img_np.size > 0:
                    h, w, _ = img_np.shape
                    save_path = os.path.join(OUTPUT_DIR, f"cropped_open_{key}.jpg")
                    cv2.imwrite(save_path, img_np)
                    print(f"  -> '{key}' 領域 (サイズ: {w}x{h}) を '{save_path}' に保存しました。")
                else:
                    print(f"  -> '{key}' 領域は切り出せませんでした。")

            # 3. 範囲を可視化した画像を生成して保存
            print(f"\n切り出し範囲を可視化した画像を '{OUTPUT_DIR}/' に保存します...")
            visualized_image = input_image_np.copy()

            color_map = {
                'bottom': (0, 255, 0),  # 緑
                'right': (0, 255, 255), # 黄
                'top': (255, 0, 0),     # 青
                'left': (255, 255, 0)   # シアン
            }

            for key, params in open_REGIONS.items():
                # ヘルパー関数を使って再度座標を計算
                x, y, w, h = _get_crop_coordinates(
                    input_image_np,
                    params['center_x_ratio'], params['center_y_ratio'],
                    params['width_ratio'], params['height_ratio']
                )
                if w > 0 and h > 0:
                    color = color_map.get(key, (255, 255, 255))
                    # 矩形を描画
                    cv2.rectangle(visualized_image, (x, y), (x + w, y + h), color, 3) # 線を太くして見やすく
                    # ラベルを描画
                    cv2.putText(visualized_image, key, (x + 5, y + 25), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)

            visualized_save_path = os.path.join(OUTPUT_DIR, "visualized_open_regions.jpg")
            cv2.imwrite(visualized_save_path, visualized_image)
            print(f"  -> 可視化画像を '{visualized_save_path}' に保存しました。")

            print("\nテスト完了。")