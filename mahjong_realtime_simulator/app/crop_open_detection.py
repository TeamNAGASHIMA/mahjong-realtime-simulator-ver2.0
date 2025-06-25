# crop_open_detection.py
# 画像の鳴き牌部分を切り出す

import cv2
import numpy as np

def find_all_tile_faces(image_np: np.ndarray, debug=False) -> tuple[list, np.ndarray]:
    """麻雀画像 (NumPy配列) から牌の表面候補を検出する。

    連結した鳴き牌の塊を優先し、単体置きの字牌（例：東）や正方形に近い点棒は除外する。

    Args:
        image_np (np.ndarray): 入力画像データ (NumPy配列)。
        debug (bool): デバッグ情報を表示するかどうかのフラグ。

    Returns:
        tuple[list, np.ndarray]: 検出された牌候補の情報のリストと、描画用画像のNumPy配列。
                                検出できなかった場合は空のリストとNoneを返す。
    """
    if image_np is None or image_np.size == 0:
        print("エラー: 入力画像が空または不正です。")
        return [], None

    original_image_for_drawing = image_np.copy()
    hsv_image = cv2.cvtColor(image_np, cv2.COLOR_BGR2HSV)

    lower_white = np.array([0, 0, 150])
    upper_white = np.array([180, 80, 255])
    mask_white = cv2.inRange(hsv_image, lower_white, upper_white)

    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    mask_white_opened = cv2.morphologyEx(mask_white, cv2.MORPH_OPEN, kernel, iterations=1)
    mask_white_closed = cv2.morphologyEx(mask_white_opened, cv2.MORPH_CLOSE, kernel, iterations=2)

    if debug and mask_white_closed is not None:
        cv2.imshow("White Mask for Tiles (find_all_tile_faces)", mask_white_closed)

    contours, _ = cv2.findContours(mask_white_closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    detected_tiles = []

    min_tile_area = 1500
    max_tile_area = 50000

    min_valid_ar1 = 0.15
    max_valid_ar1 = 0.85
    min_valid_ar2 = 1.15
    max_valid_ar2 = 3.5

    if debug:
        print(f"\n--- Filtering Contours in find_all_tile_faces ---")
        print(f"Area Range: [{min_tile_area} - {max_tile_area}]")
        print(f"Aspect Ratio Valid Ranges: [{min_valid_ar1:.2f} - {max_valid_ar1:.2f}] OR [{min_valid_ar2:.2f} - {max_valid_ar2:.2f}]")

    for i, cnt in enumerate(contours):
        area = cv2.contourArea(cnt)
        if debug:
            print(f"\nContour #{i}: Area = {area:.0f}")

        if min_tile_area < area < max_tile_area:
            x, y, w, h = cv2.boundingRect(cnt)
            if w > 0 and h > 0:
                aspect_ratio = float(w) / h
                if debug:
                    print(f"  Passed Area Filter. Rect: ({x},{y},{w},{h}), Aspect Ratio: {aspect_ratio:.2f}")

                is_ar_valid = (min_valid_ar1 < aspect_ratio < max_valid_ar1) or \
                                (min_valid_ar2 < aspect_ratio < max_valid_ar2)

                if is_ar_valid:
                    cv2.rectangle(original_image_for_drawing, (x, y), (x + w, y + h), (0, 0, 255), 2) # Red: Accepted
                    tile_info = {
                        'x': x, 'y': y, 'w': w, 'h': h,
                        'area': area,
                        'aspect_ratio': aspect_ratio,
                        'contour': cnt,
                        'center_x': x + w // 2,
                        'center_y': y + h // 2,
                        'orientation': 'horizontal' if w > h else 'vertical'
                    }
                    detected_tiles.append(tile_info)
                    if debug:
                        print(f"    ==> ACCEPTED (Aspect Ratio OK)")
                elif debug:
                    cv2.rectangle(original_image_for_drawing, (x, y), (x + w, y + h), (0, 255, 255), 1) # Yellow: Rejected by AR
                    if (max_valid_ar1 <= aspect_ratio <= min_valid_ar2):
                        print(f"    ==> REJECTED by Aspect Ratio (AR: {aspect_ratio:.2f} is too close to 1.0)")
                    else:
                        print(f"    ==> REJECTED by Aspect Ratio (AR: {aspect_ratio:.2f} is outside all valid ranges)")
            elif debug:
                print(f"  Passed Area Filter, but w or h is 0. Rect: ({x},{y},{w},{h})")
        elif debug:
            print(f"  REJECTED by Area (Area: {area:.0f} is not in [{min_tile_area} - {max_tile_area}])")

    if debug:
        print(f"\nFound {len(detected_tiles)} tile face candidates after filtering.")

    return detected_tiles, original_image_for_drawing

def is_plausible_tile_bundle(bundle_w: int, bundle_h: int, num_tiles_estimate: int, orientation: str,
                            single_tile_w_ref: int, single_tile_h_ref: int,
                            single_tile_ar_horizontal_ref: float,
                            dim_tolerance_ratio: float = 0.35, debug=False) -> bool:
    """検出された塊が、推定される枚数と向きに対して妥当なサイズであるかをチェックする。

    Args:
        bundle_w (int): 塊の幅。
        bundle_h (int): 塊の高さ。
        num_tiles_estimate (int): 推定される牌の枚数。
        orientation (str): 牌の向き ('horizontal' または 'vertical')。
        single_tile_w_ref (int): 単一の縦置き牌の参照幅。
        single_tile_h_ref (int): 単一の縦置き牌の参照高さ。
        single_tile_ar_horizontal_ref (float): 単一の横置き牌の参照アスペクト比 (幅/高さ)。
        dim_tolerance_ratio (float): 寸法許容誤差の比率。
        debug (bool): デバッグ情報を表示するかどうかのフラグ。

    Returns:
        bool: 妥当なサイズであればTrue、そうでなければFalse。
    """
    if num_tiles_estimate <= 0: return False
    expected_w, expected_h = 0.0, 0.0 # float型として初期化

    if orientation == 'horizontal':
        if num_tiles_estimate == 0: return False
        expected_single_h_for_horizontal = single_tile_w_ref / single_tile_ar_horizontal_ref
        expected_w = single_tile_w_ref * num_tiles_estimate
        expected_h = expected_single_h_for_horizontal
        
        if not (expected_w * (1 - dim_tolerance_ratio) < bundle_w < expected_w * (1 + dim_tolerance_ratio)):
            if debug: print(f"      Plausibility Fail (H_Bundle Width): Est.num={num_tiles_estimate}, BundleW={bundle_w:.0f}, ExpectedW={expected_w:.1f} (Tol: {dim_tolerance_ratio*100:.0f}%)")
            return False
        if not (expected_h * (1 - dim_tolerance_ratio) < bundle_h < expected_h * (1 + dim_tolerance_ratio)):
            if debug: print(f"      Plausibility Fail (H_Bundle Height): Est.num={num_tiles_estimate}, BundleH={bundle_h:.0f}, ExpectedH={expected_h:.1f} (Tol: {dim_tolerance_ratio*100:.0f}%)")
            return False
    elif orientation == 'vertical':
        if num_tiles_estimate != 1: # 縦置きは1枚のみを想定
            if debug: print(f"      Plausibility Fail (V_Bundle Est.Num): Est.num={num_tiles_estimate} != 1 for vertical check")
            return False
        expected_w = float(single_tile_w_ref)
        expected_h = float(single_tile_h_ref)
        
        if not (expected_w * (1 - dim_tolerance_ratio) < bundle_w < expected_w * (1 + dim_tolerance_ratio)):
            if debug: print(f"      Plausibility Fail (V_Bundle Width): Est.num={num_tiles_estimate}, BundleW={bundle_w:.0f}, ExpectedW={expected_w:.1f} (Tol: {dim_tolerance_ratio*100:.0f}%)")
            return False
        if not (expected_h * (1 - dim_tolerance_ratio) < bundle_h < expected_h * (1 + dim_tolerance_ratio)):
            if debug: print(f"      Plausibility Fail (V_Bundle Height): Est.num={num_tiles_estimate}, BundleH={bundle_h:.0f}, ExpectedH={expected_h:.1f} (Tol: {dim_tolerance_ratio*100:.0f}%)")
            return False
    else:
        if debug: print(f"      Plausibility Fail: Unknown orientation '{orientation}'")
        return False
    
    if debug: print(f"      Plausibility OK: Est.num={num_tiles_estimate}, Orient={orientation}")
    return True

def estimate_connected_tiles(tile_info: dict,
                            avg_single_vertical_tile_w: int, avg_single_vertical_tile_h: int,
                            avg_single_horizontal_tile_ar: float,
                            debug=False) -> tuple[int, str]:
    """検出された単一の牌候補の長方形から、それが何枚の牌が連結した塊であるかを推定する。

    Args:
        tile_info (dict): 牌候補の情報（x, y, w, h, orientationなど）。
        avg_single_vertical_tile_w (int): 単一の縦置き牌の平均幅。
        avg_single_vertical_tile_h (int): 単一の縦置き牌の平均高さ。
        avg_single_horizontal_tile_ar (float): 単一の横置き牌の平均アスペクト比 (幅/高さ)。
        debug (bool): デバッグ情報を表示するかどうかのフラグ。

    Returns:
        tuple[int, str]: 推定された牌の枚数と、処理された牌の向き。
                        推定できなかった場合は枚数0を返す。
    """
    num_estimated = 0
    orientation = tile_info['orientation']
    w, h = tile_info['w'], tile_info['h']

    if orientation == 'horizontal':
        num_tiles_candidate = round(w / avg_single_vertical_tile_w)
        if num_tiles_candidate > 0:
            if is_plausible_tile_bundle(w, h, num_tiles_candidate, 'horizontal',
                                        avg_single_vertical_tile_w, avg_single_vertical_tile_h,
                                        avg_single_horizontal_tile_ar,
                                        dim_tolerance_ratio=0.40, debug=debug):
                num_estimated = int(num_tiles_candidate)
    elif orientation == 'vertical':
        # 縦置きは1枚のみを想定して、サイズが妥当かチェック
        if is_plausible_tile_bundle(w, h, 1, 'vertical',
                                    avg_single_vertical_tile_w, avg_single_vertical_tile_h,
                                    avg_single_horizontal_tile_ar,
                                    dim_tolerance_ratio=0.30, debug=debug):
            num_estimated = 1
    
    if debug:
        print(f"    Estimate for Rect=({tile_info['x']},{tile_info['y']},{w},{h}), AR={tile_info['aspect_ratio']:.2f}, Orient={orientation}: Est枚数={num_estimated}")
    return num_estimated, orientation

def find_naki_sets(original_full_image_np: np.ndarray, detected_tiles_step1: list, image_to_draw_on_np: np.ndarray, debug=False) -> tuple[dict, np.ndarray, list]:
    """検出された牌候補のリストから、鳴きセットを検出し、その領域を切り出す。

    Args:
        original_full_image_np (np.ndarray): 切り出し元の、加工されていないオリジナル画像 (NumPy配列)。
        detected_tiles_step1 (list): find_all_tile_facesで検出された牌候補のリスト。
        image_to_draw_on_np (np.ndarray): 描画用のベース画像 (NumPy配列)。
        debug (bool): デバッグ情報を表示するかどうかのフラグ。

    Returns:
        tuple[dict, np.ndarray, list]: 検出された鳴きセットのカテゴリ別辞書, 描画後の画像, 切り出された鳴き牌の画像リスト。
    """
    naki_sets_found = {'chi': [], 'pon': [], 'kan_ming': [], 'kan_an': []}
    cropped_naki_images = [] # 切り出した画像を格納するリスト

    # 牌の平均的なサイズ（これらは画像の解像度や牌の写り込み方によって調整が必要です）
    # 例として一般的な値を使用
    AVG_SINGLE_VERTICAL_TILE_W = 100 
    AVG_SINGLE_VERTICAL_TILE_H = 100 
    # 横置きの牌のW/H比。例: 牌の幅が高さの約0.82倍（日本の一般的な牌）
    AVG_SINGLE_HORIZONTAL_TILE_AR = 0.82 

    if debug:
        print(f"\n--- Analyzing candidates for Naki Sets ---")
        print(f"Using single tile references: V_W={AVG_SINGLE_VERTICAL_TILE_W}, V_H={AVG_SINGLE_VERTICAL_TILE_H}, H_AR(W/H)={AVG_SINGLE_HORIZONTAL_TILE_AR:.2f}")

    plausible_tile_bundles = []
    for tile_candidate in detected_tiles_step1:
        estimated_num_tiles, orientation = estimate_connected_tiles(
            tile_candidate,
            AVG_SINGLE_VERTICAL_TILE_W,
            AVG_SINGLE_VERTICAL_TILE_H,
            AVG_SINGLE_HORIZONTAL_TILE_AR,
            debug=debug
        )
        if estimated_num_tiles > 0:
            bundle_info = {**tile_candidate, 'num_actual_tiles': estimated_num_tiles, 'processed_orientation': orientation}
            plausible_tile_bundles.append(bundle_info)
            if debug: print(f"  Bundle ACCEPTED: Rect=({tile_candidate['x']},{tile_candidate['y']},{tile_candidate['w']},{tile_candidate['h']}), Num={estimated_num_tiles}, Orient={orientation}")
        elif debug: print(f"  Bundle REJECTED: Rect=({tile_candidate['x']},{tile_candidate['y']},{tile_candidate['w']},{tile_candidate['h']}) was not plausible.")

    if not plausible_tile_bundles:
        if debug: print("  No plausible tile bundles found to form naki sets.")
        return naki_sets_found, image_to_draw_on_np, cropped_naki_images

    crop_margin = 5 # 切り出し時のマージン

    for bundle in plausible_tile_bundles:
        # 現時点では、単純に横置き3枚の塊を「チー」の候補として扱う。
        # ポンやカンの横置きもこの条件に合致するが、詳細な区別は後段の牌認識に委ねる。
        if bundle['num_actual_tiles'] == 3 and bundle['processed_orientation'] == 'horizontal':
            naki_sets_found['chi'].append(bundle) # 仮にチーとして登録
            if debug:
                print(f"    ★★★ Potential CHI or PON (3 horizontal) FOUND ★★★")
                print(f"      Bundle: x={bundle['x']}, y={bundle['y']}, w={bundle['w']}, h={bundle['h']}")
                cv2.rectangle(image_to_draw_on_np, (bundle['x'], bundle['y']),
                            (bundle['x'] + bundle['w'], bundle['y'] + bundle['h']),
                            (0, 255, 0), 3) # Green for Chi/Pon_H

            # --- 切り出し処理 ---
            bx, by, bw, bh = bundle['x'], bundle['y'], bundle['w'], bundle['h']
            crop_x1 = max(0, bx - crop_margin)
            crop_y1 = max(0, by - crop_margin)
            crop_x2 = min(original_full_image_np.shape[1], bx + bw + crop_margin)
            crop_y2 = min(original_full_image_np.shape[0], by + bh + crop_margin)

            cropped_img = original_full_image_np[crop_y1:crop_y2, crop_x1:crop_x2]
            if cropped_img.size > 0: # 空の画像でないことを確認
                cropped_naki_images.append(cropped_img)
                if debug:
                    print(f"      Cropped naki image from rect: ({crop_x1},{crop_y1}) to ({crop_x2},{crop_y2})")
            elif debug:
                print(f"      Cropping resulted in an empty image for bundle at ({bx},{by}).")

    if debug:
        if not any(naki_sets_found['chi'] + naki_sets_found['pon'] + naki_sets_found['kan_ming'] + naki_sets_found['kan_an']):
            print("  No specific naki patterns (Chi, Pon, Kan) were identified from plausible bundles.")

    return naki_sets_found, image_to_draw_on_np, cropped_naki_images

def crop_open_main(image_np: np.ndarray, debug=False) -> list[np.ndarray]:
    """麻雀画像 (NumPy配列) の解析パイプラインを実行し、鳴き牌の切り出し画像リストを返す。

    Args:
        image_np (np.ndarray): 入力画像データ (NumPy配列)。
        debug (bool): デバッグ情報を表示するかどうかのフラグ。Trueの場合、詳細なログが表示される。

    Returns:
        list[np.ndarray]: 切り出された鳴き牌の領域の画像データ (NumPy配列) のリスト。
                        検出できなかった場合は空のリストを返す。
    """
    if image_np is None or image_np.size == 0:
        print("致命的エラー: 元画像が空または不正です。")
        return []

    # 1. ステップ1: 牌の表面候補をすべて検出
    if debug: print("\n--- Step 1: 牌の表面候補を検出中... ---")
    detected_tiles, step1_image_for_debug = find_all_tile_faces(image_np, debug=debug)

    # 牌候補が見つからなければ処理を終了
    if not detected_tiles:
        if debug: print("牌の候補が見つかりませんでした。")
        if debug and step1_image_for_debug is not None:
            cv2.imshow("Step 1: No Tile Candidates Found", step1_image_for_debug)
            cv2.waitKey(0)
        return []

    if debug: print(f"ステップ1で {len(detected_tiles)} 個の牌候補を検出しました。")

    # 2. ステップ2: 鳴きセットを検出し、画像を切り出す
    if debug: print("\n--- Step 2: 鳴きセットを検出中... ---")
    # 描画用のベース画像を準備 (ステップ1の候補を薄く描画)
    step2_drawing_base = image_np.copy()
    for tile in detected_tiles:
        cv2.rectangle(step2_drawing_base, (tile['x'], tile['y']), (tile['x'] + tile['w'], tile['y'] + tile['h']), (255, 150, 0), 1)

    naki_sets, step2_image_for_debug, cropped_images = find_naki_sets(
        image_np, detected_tiles, step2_drawing_base, debug=debug
    )

    # 3. 結果のサマリー表示 (デバッグ用)
    if debug:
        print("\n--- 解析結果 ---")
        if cropped_images:
            print(f"成功: {len(cropped_images)} 個の鳴きセットを切り出しました。")
        else:
            print("切り出し対象の鳴きセットは見つかりませんでした。")

    # 4. デバッグ用の画像を一括表示
    if debug:
        print("\nデバッグウィンドウを表示します。いずれかのキーを押して終了してください。")
        if step1_image_for_debug is not None:
            cv2.imshow("Step 1: Tile Candidates (Red=Accepted)", step1_image_for_debug)
        if step2_image_for_debug is not None:
            cv2.imshow("Step 2: Naki Sets (Green=Detected)", step2_image_for_debug)
        for i, img in enumerate(cropped_images):
            cv2.imshow(f"Cropped Naki Set #{i+1}", img)
        
        cv2.waitKey(0)
        cv2.destroyAllWindows()
    
    return cropped_images


# --- スクリプトのエントリーポイント ---
if __name__ == '__main__':
    # --- 設定 ---
    IMAGE_FILE = 'test_mahjong_open_1.jpg' # テスト用画像パス
    DEBUG_MODE = True # テスト時はTrueにして動作確認推奨
    
    # --- 実行 ---
    input_image_np = cv2.imread(IMAGE_FILE)

    if input_image_np is None:
        print(f"エラー: 画像ファイル '{IMAGE_FILE}' が見つからないか、読み込めません。")
    else:
        result_cropped_naki_list = crop_open_main(image_np=input_image_np, debug=DEBUG_MODE)

        # テストの成否を示すメッセージは残す
        if result_cropped_naki_list:
            print(f"テスト完了: {len(result_cropped_naki_list)} 個の鳴き牌画像データがNumPy配列リストとして返されました。")
        else:
            print("テスト完了: 鳴き牌は検出されませんでした。")