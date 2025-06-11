import cv2
import numpy as np


def find_and_crop_dora_indicator(image_path, debug=False):
    """
    麻雀画像からドラ表示牌の山を検出し、その領域を切り出す。
    ドラ表示牌の山は「黄色い牌の山の一部がめくられ、白い牌が見えている」という特徴を持つ。
    """
    image = cv2.imread(image_path)
    if image is None:
        print(f"エラー: 画像が見つかりません - {image_path}")
        return None

    original_image_for_drawing = image.copy() # 描画用のコピー
    hsv_image = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)



    # --- 1. 黄色い牌の山の候補を検出 ---
    # 黄色のHSV範囲 (これらの値は画像や照明条件によって調整が必要です)
    lower_yellow = np.array([20, 100, 100]) # 例: H:20-30, S:100-255, V:100-255
    upper_yellow = np.array([30, 255, 255])
    mask_yellow = cv2.inRange(hsv_image, lower_yellow, upper_yellow)

    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    mask_yellow_opened = cv2.morphologyEx(mask_yellow, cv2.MORPH_OPEN, kernel, iterations=1)
    mask_yellow_closed = cv2.morphologyEx(mask_yellow_opened, cv2.MORPH_CLOSE, kernel, iterations=2)

    contours_yellow, _ = cv2.findContours(mask_yellow_closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    candidate_yellow_piles = []
    min_yellow_area = 1500  # 黄色い塊の最小面積 (要調整)
    for cnt_y in contours_yellow:
        area_y = cv2.contourArea(cnt_y)
        if area_y > min_yellow_area:
            candidate_yellow_piles.append(cnt_y)
            if debug:
                cv2.drawContours(original_image_for_drawing, [cnt_y], -1, (0, 255, 255), 2) # 黄色

    if debug:
        cv2.imshow("Yellow Mask Processed", mask_yellow_closed)



    # --- 2. 白い牌（ドラ表示牌の候補）を検出 ---
    lower_white = np.array([0, 0, 170])   # 例: H:0-180, S:0-70, V:170-255 (要調整)
    upper_white = np.array([180, 70, 255]) # (要調整)
    mask_white = cv2.inRange(hsv_image, lower_white, upper_white)

    mask_white_opened = cv2.morphologyEx(mask_white, cv2.MORPH_OPEN, kernel, iterations=1)
    mask_white_closed = cv2.morphologyEx(mask_white_opened, cv2.MORPH_CLOSE, kernel, iterations=1)

    contours_white, _ = cv2.findContours(mask_white_closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    candidate_white_tiles = []
    # 白い牌のフィルタリング条件 (要調整)
    min_white_area = 200
    max_white_area = 3000
    min_aspect_ratio_white = 0.6
    max_aspect_ratio_white = 1.7

    # # --- デバッグ用: 白い牌のフィルタリングを一時的に緩和する場合 ---
    # min_white_area_debug = 10
    # max_white_area_debug = 100000
    # min_aspect_ratio_white_debug = 0.1
    # max_aspect_ratio_white_debug = 10.0
    # # ---------------------------------------------------------

    for cnt_w in contours_white:
        area_w = cv2.contourArea(cnt_w)
        # if min_white_area_debug < area_w < max_white_area_debug: # デバッグ用
        if min_white_area < area_w < max_white_area: # 通常
            x_w_rect, y_w_rect, w_w_rect, h_w_rect = cv2.boundingRect(cnt_w)
            if w_w_rect > 0 and h_w_rect > 0:
                aspect_ratio1 = float(w_w_rect) / h_w_rect
                aspect_ratio2 = float(h_w_rect) / w_w_rect
                # if (min_aspect_ratio_white_debug < aspect_ratio1 < max_aspect_ratio_white_debug) or \
                #    (min_aspect_ratio_white_debug < aspect_ratio2 < max_aspect_ratio_white_debug): # デバッグ用
                if (min_aspect_ratio_white < aspect_ratio1 < max_aspect_ratio_white) or \
                   (min_aspect_ratio_white < aspect_ratio2 < max_aspect_ratio_white): # 通常
                    if debug:
                        print(f"Candidate White Tile - Area: {area_w:.0f}, Aspect1: {aspect_ratio1:.2f}, Aspect2: {aspect_ratio2:.2f}, Rect: ({x_w_rect},{y_w_rect},{w_w_rect},{h_w_rect})")
                    candidate_white_tiles.append(cnt_w)
                    if debug:
                         cv2.drawContours(original_image_for_drawing, [cnt_w], -1, (255, 100, 100), 2) # 青っぽい色
    if debug:
        cv2.imshow("White Mask Processed", mask_white_closed)



    # --- 3. 黄色い塊と白い牌の位置関係を評価し、ドラ表示牌の山を特定 ---
    found_dora_pile_contours = None # (yellow_contour, white_contour)

    # 位置関係の評価のためのパラメータ (要調整)
    y_overlap_threshold_ratio = 0.4  # 白い牌の高さに対するY方向の重なりの最小比率
    proximity_margin_factor_inner = 1.0 # 黄色い山の右端から白い牌の幅のN%内側まで許容
    proximity_margin_factor_outer = 0.3 # 黄色い山の右端から白い牌の幅のN%外側まで許容
    partially_outside_threshold_ratio = 0.1 # 白い牌が黄色い山の右端から自身の幅のN%以上はみ出す

    for cnt_y in candidate_yellow_piles:
        x_y, y_y, w_y, h_y = cv2.boundingRect(cnt_y)

        for cnt_w in candidate_white_tiles:
            x_w, y_w_tile, w_w, h_w_tile = cv2.boundingRect(cnt_w)

            # --- Y座標の重なり/アラインメント評価 ---
            y_center_w = y_w_tile + h_w_tile / 2.0
            y_overlap_abs = max(0, min(y_y + h_y, y_w_tile + h_w_tile) - max(y_y, y_w_tile))
            
            is_y_aligned_check1 = (y_y < y_center_w < y_y + h_y)
            is_y_aligned_check2 = (h_w_tile > 0 and (y_overlap_abs / h_w_tile) >= y_overlap_threshold_ratio) # h_w_tileが0でないことを確認

            y_distance = 0
            if y_w_tile + h_w_tile < y_y: # 白い牌が黄色い山の上にある場合
                y_distance = y_y - (y_w_tile + h_w_tile)
            elif y_w_tile > y_y + h_y: # 白い牌が黄色い山の下にある場合
                y_distance = y_w_tile - (y_y + h_y)
            # else: # 重なっているか、包含関係にある場合は y_distance = 0 のまま
            
            max_allowed_y_distance = 10 # 例: 10ピクセルまでの垂直方向の隙間を許容 (この値を調整)
            is_y_aligned_check3 = (y_distance < max_allowed_y_distance)

            is_y_aligned = is_y_aligned_check1 or is_y_aligned_check2 or is_y_aligned_check3
            
            # --- X座標の隣接性評価 ---
            x_proximity_lower_bound = (x_y + w_y) - (w_w * proximity_margin_factor_inner)
            x_proximity_upper_bound = (x_y + w_y) + (w_w * proximity_margin_factor_outer)
            
            is_x_adjacent_check1 = (x_proximity_lower_bound < x_w < x_proximity_upper_bound)
            is_x_adjacent_check2 = (w_w > 0 and (x_w + w_w > x_y + w_y + (w_w * partially_outside_threshold_ratio))) # w_wが0でないことを確認
            is_x_adjacent = is_x_adjacent_check1 and is_x_adjacent_check2

            if debug:
                print(f"\n--- Checking Pair ---")
                print(f"Yellow Cnt Area: {cv2.contourArea(cnt_y):.0f}, Rect: {(x_y, y_y, w_y, h_y)}")
                print(f"White Cnt Area: {cv2.contourArea(cnt_w):.0f}, Rect: {(x_w, y_w_tile, w_w, h_w_tile)}")

                print(f"  Y_aligned_check1 (center_in_range): {is_y_aligned_check1} (y_center_w: {y_center_w:.2f} vs yellow_y_range: {y_y}-{y_y+h_y})")
                if h_w_tile > 0:
                    print(f"  Y_aligned_check2 (overlap_ratio): {is_y_aligned_check2} (overlap_abs/h_w: {y_overlap_abs/h_w_tile:.2f} >= threshold: {y_overlap_threshold_ratio:.2f})")
                else:
                    print(f"  Y_aligned_check2 (overlap_ratio): {is_y_aligned_check2} (h_w_tile is 0, cannot calculate ratio)")
                print(f"  ==> is_y_aligned: {is_y_aligned}")

                print(f"  X_adjacent_check1 (proximity): {is_x_adjacent_check1} (x_w: {x_w}, expected x_range: {x_proximity_lower_bound:.2f} - {x_proximity_upper_bound:.2f})")
                if w_w > 0:
                    print(f"  X_adjacent_check2 (partially_outside): {is_x_adjacent_check2} (x_w+w_w: {x_w+w_w:.2f} > yellow_R+margin: {x_y + w_y + (w_w * partially_outside_threshold_ratio):.2f})")
                else:
                     print(f"  X_adjacent_check2 (partially_outside): {is_x_adjacent_check2} (w_w is 0, cannot calculate margin)")
                print(f"  ==> is_x_adjacent: {is_x_adjacent}")

            if is_y_aligned and is_x_adjacent:
                found_dora_pile_contours = (cnt_y, cnt_w)
                if debug:
                    print(f"★★★★★★★★★★★★★★★ Pair FOUND! ★★★★★★★★★★★★★★★")
                    print(f"Yellow Area: {cv2.contourArea(cnt_y):.0f}, White Area: {cv2.contourArea(cnt_w):.0f}")
                    print(f"★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★")
                break 
        if found_dora_pile_contours:
            break



    # --- 4. 対象領域の切り出し ---
    cropped_dora_area = None
    if found_dora_pile_contours:
        cnt_y_dora, cnt_w_dora = found_dora_pile_contours
        x_y_dora, y_y_dora, w_y_dora, h_y_dora = cv2.boundingRect(cnt_y_dora)
        x_w_dora, y_w_dora, w_w_dora, h_w_dora = cv2.boundingRect(cnt_w_dora)

        final_x = min(x_y_dora, x_w_dora)
        final_y = min(y_y_dora, y_w_dora)
        final_right = max(x_y_dora + w_y_dora, x_w_dora + w_w_dora)
        final_bottom = max(y_y_dora + h_y_dora, y_w_dora + h_w_dora)
        
        final_w = final_right - final_x
        final_h = final_bottom - final_y

        margin = 10 # ピクセルマージン (切り出す範囲を少し広げる)
        crop_x1 = max(0, final_x - margin)
        crop_y1 = max(0, final_y - margin)
        crop_x2 = min(image.shape[1], final_x + final_w + margin)
        crop_y2 = min(image.shape[0], final_y + final_h + margin)

        cropped_dora_area = image[crop_y1:crop_y2, crop_x1:crop_x2]
        
        if debug:
            cv2.rectangle(original_image_for_drawing, (x_y_dora, y_y_dora), (x_y_dora + w_y_dora, y_y_dora + h_y_dora), (0, 255, 255), 2)
            cv2.rectangle(original_image_for_drawing, (x_w_dora, y_w_dora), (x_w_dora + w_w_dora, y_w_dora + h_w_dora), (255, 0, 0), 2)
            cv2.rectangle(original_image_for_drawing, (crop_x1, crop_y1), (crop_x2, crop_y2), (0, 255, 0), 3) # 緑の切り出し枠
    else:
        if debug: # debugモードの時だけ「見つかりませんでした」をコンソールに出力
            print("\nドラ表示牌の山を特定できませんでした。")

    if debug:
        # ウィンドウが重ならないように少しずらして表示 (オプション)
        cv2.imshow("Original with Detections", original_image_for_drawing)
        # cv2.moveWindow("Original with Detections", 0, 0)
        # if mask_yellow_closed is not None: cv2.moveWindow("Yellow Mask Processed", 400, 0)
        # if mask_white_closed is not None: cv2.moveWindow("White Mask Processed", 800, 0)


    if cropped_dora_area is not None and debug:
        cv2.imshow("Cropped Dora Indicator Area", cropped_dora_area)
        # cv2.moveWindow("Cropped Dora Indicator Area", 0, 500)
    
    if debug:
        print("\nデバッグウィンドウを閉じるには、いずれかのウィンドウを選択して何かキーを押してください。")
        cv2.waitKey(0)
        cv2.destroyAllWindows()

    return cropped_dora_area



def main(image_path, debug=False):
    """
    指定された画像からドラ表示牌を検出し、切り出して保存するメイン処理。
    """

    output_filename="cropped_dora_indicator_1.jpg"
    print(f"処理を開始します... (対象画像: {image_path}, デバッグモード: {debug})")

    # ドラ表示牌の検出と切り出しを実行する関数を呼び出す
    cropped_image = find_and_crop_dora_indicator(image_path, debug=debug)

    # --- 結果の処理 ---
    print("\n--- 処理結果 ---")
    if cropped_image is not None:
        print("成功: ドラ表示牌の切り出しが完了しました。")

        # 切り出した画像をファイルに保存
        try:
            cv2.imwrite(output_filename, cropped_image)
            print(f"切り出した画像を '{output_filename}' として保存しました。")
        except Exception as e:
            print(f"エラー: 画像の保存に失敗しました - {e}")

    else:
        print("失敗: ドラ表示牌を特定できませんでした。")


# --- スクリプトのエントリーポイント ---
if __name__ == '__main__':
    # --- 設定 ---
    # ここに処理したい画像のパスを指定してください
    TARGET_IMAGE_PATH = 'test_mahjong.jpg'

    # Trueにすると、処理途中の中間画像や詳細なログが表示されます
    DEBUG_MODE = False

    # --- 実行 ---
    main(image_path=TARGET_IMAGE_PATH, debug=DEBUG_MODE)