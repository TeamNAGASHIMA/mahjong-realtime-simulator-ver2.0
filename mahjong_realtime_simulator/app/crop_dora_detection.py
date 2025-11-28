import cv2
import numpy as np
import os

# デバッグ出力先フォルダ
SAVE_DIR = "debug_cropper_output"

def process_mahjong_image_shrink_mask(
    image_np: np.ndarray, 
    shrink_amount=75, 
    debug: bool = False  # デバッグフラグを 'debug' に統一
) -> tuple[np.ndarray, np.ndarray | None]:
    """
    画像から緑色のマット部分を検出し、その検出された緑の領域を囲む最小の四角形を、
    指定された量だけ内側に縮小してから黒く塗りつぶし、
    その黒く塗りつぶされた領域の外側をトリミングして、最終的な牌検出用画像を返します。
    
    Args:
        image_np: 入力画像 (BGR形式のNumPy配列)。
        shrink_amount: 緑の境界を内側に縮小するピクセル数。
        debug: Trueの場合、処理過程を画像として保存します。
        
    Returns:
        tuple[np.ndarray, np.ndarray | None]: 
            (牌検出用画像, デバッグ描画用画像（Noneの場合は処理失敗）)
    """
    img = image_np
    if img is None or img.size == 0:
        return np.array([]), None

    # 処理結果のデバッグ用画像コピー（BGRのまま）
    debug_img_bgr = img.copy()
    h_img, w_img, _ = img.shape
    
    # --- ステップ 1: 緑色のプレイエリアを検出 ---
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    lower_green = np.array([75, 80, 40])
    upper_green = np.array([85, 255, 255])
    mask = cv2.inRange(hsv, lower_green, upper_green)

    # ノイズ除去
    kernel = np.ones((11, 11), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    mask = cv2.dilate(mask, kernel, iterations=3)

    # --- ステップ 2: 検出された緑の輪郭から最小の矩形を特定 ---
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    target_rect = None
    
    if contours:
        largest_contour = max(contours, key=cv2.contourArea)

        if cv2.contourArea(largest_contour) > (w_img * h_img * 0.1):  # 面積が画像全体の10%以上の場合のみ有効とする
            x, y, w, h = cv2.boundingRect(largest_contour)
            target_rect = (x, y, x + w, y + h)  # (X_min, Y_min, X_max, Y_max)

    if not target_rect:
        return np.array([]), None

    X_min, Y_min, X_max, Y_max = target_rect
    
    # --- デバッグ描画: 検出された緑の領域を緑で描画 ---
    cv2.rectangle(debug_img_bgr, (X_min, Y_min), (X_max, Y_max), (0, 255, 0), 2)
    
    # --- ステップ 2 (修正): 検出された矩形を内側に縮小する ---
    X_min_shrink = X_min + shrink_amount
    Y_min_shrink = Y_min + shrink_amount
    X_max_shrink = X_max - shrink_amount
    Y_max_shrink = Y_max - shrink_amount
    
    final_X_min = max(0, X_min_shrink)
    final_Y_min = max(Y_min_shrink, 0)
    final_X_max = min(w_img, X_max_shrink)
    final_Y_max = min(h_img, Y_max_shrink)
    
    # --- ステップ 2 (続き): 縮小された矩形を黒く塗りつぶす ---
    masked_img = img.copy()
    
    if final_X_max > final_X_min and final_Y_max > final_Y_min:
        masked_img[final_Y_min:final_Y_max, final_X_min:final_X_max] = [0, 0, 0]
        
        # デバッグ描画: 縮小/黒塗りされた領域を赤で描画
        cv2.rectangle(debug_img_bgr, (final_X_min, final_Y_min), (final_X_max, final_Y_max), (0, 0, 255), 2)
        
    # --- ステップ 3 & 4: トリミング ---
    padding = 40
    crop_y_min = max(0, Y_min - padding)
    crop_x_min = max(0, X_min - padding)
    crop_y_max = min(h_img, Y_max + padding)
    crop_x_max = min(w_img, X_max + padding)

    cropped_masked_img = masked_img[crop_y_min:crop_y_max, crop_x_min:crop_x_max]
    debug_cropped_img = debug_img_bgr[crop_y_min:crop_y_max, crop_x_min:crop_x_max]
    
    return cropped_masked_img, debug_cropped_img

def crop_dora_main(board_image_np: np.ndarray, debug: bool = False) -> np.ndarray:
    """
    盤面画像からドラ表示牌領域を切り出し、背景（緑マット）をマスキングした画像を返すメイン関数。
    
    Args:
        board_image_np (np.ndarray): 盤面全体の画像データ (NumPy配列)。
        debug (bool): Trueの場合、処理過程を画像として保存します。
        
    Returns:
        np.ndarray: ドラ検出に使う切り出し画像。見つからなかった場合は空のNumPy配列。
    """
    # process_mahjong_image_shrink_mask に debug フラグを渡す
    cropped_img, debug_img = process_mahjong_image_shrink_mask(
        board_image_np, 
        shrink_amount=75, 
        debug=debug
    )

    if debug and debug_img is not None and debug_img.size > 0:
        os.makedirs(SAVE_DIR, exist_ok=True)
        
        # ファイル名の決定 (デバッグ画像用)
        existing_files = [f for f in os.listdir(SAVE_DIR) if f.startswith("dora_debug_") and f.endswith(".png")]
        next_id = 1
        if existing_files:
            max_id = 0
            for f in existing_files:
                try:
                    num_str = f.replace("dora_debug_", "").replace(".png", "")
                    max_id = max(max_id, int(num_str))
                except ValueError:
                    continue
            next_id = max_id + 1
        
        file_path = os.path.join(SAVE_DIR, f"dora_debug_{next_id}.png")
        cv2.imwrite(file_path, debug_img)
        print(f"[CROPPER DEBUG] Dora debug image saved to: {file_path}")
            
    return cropped_img


# --- 単体実行時のテストコード ---
if __name__ == '__main__':
    IMAGE_PATH_TEST = "board_tiles_image.jpg"

    if not os.path.exists(IMAGE_PATH_TEST):
        print(f"エラー: テスト画像ファイル '{IMAGE_PATH_TEST}' が見つかりません。実行するにはこの名前で画像を準備してください。")
    else:
        board_image_np = cv2.imread(IMAGE_PATH_TEST)
        
        if board_image_np is None:
            print(f"エラー: 画像 '{IMAGE_PATH_TEST}' を読み込めませんでした。")
        else:
            print(f"--- Running {__file__} in standalone mode (Debug=True) ---")
            
            # デバッグ出力=Trueを指定して実行
            result_crop = crop_dora_main(board_image_np, debug=True)

            if result_crop.size > 0:
                print("ドラ領域の切り出しに成功しました。")
                
                os.makedirs(SAVE_DIR, exist_ok=True)
                final_path = os.path.join(SAVE_DIR, "dora_final_output.png")
                cv2.imwrite(final_path, result_crop)
                print(f"Final cropped image saved to: {final_path}")
                
            else:
                print("ドラ領域の検出または切り出しに失敗しました。")