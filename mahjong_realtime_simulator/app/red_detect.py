import cv2
import numpy as np

# 画像内の赤色の割合を計算し、しきい値以上なら「赤ドラ！」と判定する関数
def check_red_color_with_percentage(image_path, red_pixel_threshold_percent=10, debug=False):

    # 1. 画像を読み込む
    img = cv2.imread(image_path)
    if img is None:
        print("エラー: 画像ファイルが読み込めませんでした。ファイルパスを確認してください。")
        return

    # 画像の総ピクセル数を計算
    total_pixels = img.shape[0] * img.shape[1]

    # 2. BGR色空間からHSV色空間に変換
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    # 3. 赤色のHSV範囲を定義 (前回の修正を維持)
    lower_red1 = np.array([0, 45, 45])
    upper_red1 = np.array([22, 255, 255])
    lower_red2 = np.array([155, 45, 45])
    upper_red2 = np.array([179, 255, 255])

    # 4. マスク画像を作成（指定した範囲の色を白、それ以外を黒にする）
    mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
    mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
    mask = mask1 + mask2 # 2つのマスクを結合

    # 5. 赤い部分のピクセル数をカウントし、割合を計算
    red_pixels = cv2.countNonZero(mask)
    red_percentage = (red_pixels / total_pixels) * 100

    print(f"画像中の赤色の割合: {red_percentage:.2f}%")

    # 6. 割合がしきい値以上であれば「赤ドラ！」と判定
    if red_percentage >= red_pixel_threshold_percent:
        print("赤ドラ！")
    else:
        print("普通")

    if debug:
    # (オプション) 検出されたマスク画像を表示して確認
        cv2.imshow("Original Image", img)
        cv2.imshow("Red Mask", mask)
        cv2.waitKey(0)
        cv2.destroyAllWindows()

# テスト用のコード
if __name__ == '__main__':
    image_files = ['aka.png']

    # 赤色の割合のしきい値を設定 (例: 10% 以上で赤ドラとする場合)
    # threshold = 10 # パーセンテージ (10% と同じ意味)
    threshold = 12

    for i in range(1, 2):
        print(f"--- 画像 {i}: {image_files[i-1]} ---")
        check_red_color_with_percentage(image_files[i-1], red_pixel_threshold_percent=threshold)