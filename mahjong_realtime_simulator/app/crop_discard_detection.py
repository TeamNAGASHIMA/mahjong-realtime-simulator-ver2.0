import cv2
import numpy as np

# --- グローバル定数 ---
# !!! 画像に合わせて調整必須 !!!
# あなたの画像 (test_mahjong_open_1.jpg) での単一の縦置き牌の
# おおよそのピクセルサイズ（幅と高さ）に設定してください。
# 例: 画像エディタで測るか、初期検出された牌のサイズを参考にする。
# 以下は仮の値です。
REF_TILE_AVERAGE_WIDTH_VERTICAL = 30  # 例: 25ピクセル (画像に応じて調整)
REF_TILE_AVERAGE_HEIGHT_VERTICAL = 50 # 例: 35ピクセル (画像に応じて調整)

# 以下の値は上記から自動計算
REF_TILE_ASPECT_RATIO_VERTICAL_WH = REF_TILE_AVERAGE_WIDTH_VERTICAL / REF_TILE_AVERAGE_HEIGHT_VERTICAL

REF_TILE_AVERAGE_WIDTH_HORIZONTAL = REF_TILE_AVERAGE_HEIGHT_VERTICAL
REF_TILE_AVERAGE_HEIGHT_HORIZONTAL = REF_TILE_AVERAGE_WIDTH_VERTICAL
REF_TILE_ASPECT_RATIO_HORIZONTAL_WH = REF_TILE_AVERAGE_WIDTH_HORIZONTAL / REF_TILE_AVERAGE_HEIGHT_HORIZONTAL


def find_all_tile_faces(image_path, debug=False):
    """
    麻雀画像から牌の表面候補を検出する。
    """
    image = cv2.imread(image_path)
    if image is None:
        print(f"エラー: 画像が見つかりません - {image_path}")
        return None, None

    original_image_for_drawing = image.copy()
    hsv_image = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    # === HSV閾値の調整例 ===
    # 牌の白い部分を抽出する。画像の照明条件や牌の色によって調整が必要。
    lower_white = np.array([0, 0, 170])   # Sの下限は0, Vの下限を上げて明るい白を狙う
    upper_white = np.array([179, 70, 255]) # Sの上限を絞って無彩色に近いものを、Vの上限は最大
    mask_white = cv2.inRange(hsv_image, lower_white, upper_white)

    if debug:
        cv2.imshow("Initial White Mask", mask_white)

    # === モルフォロジー演算の調整例 ===
    # 小さなノイズ除去と、牌内部の小さな穴埋め、分断された部分の連結
    kernel_open = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
    kernel_close = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3)) # 牌のサイズが小さい場合、(2,2)も試す
    
    mask_white_opened = cv2.morphologyEx(mask_white, cv2.MORPH_OPEN, kernel_open, iterations=1)
    if debug:
        cv2.imshow("Opened Mask", mask_white_opened)
        
    mask_white_closed = cv2.morphologyEx(mask_white_opened, cv2.MORPH_CLOSE, kernel_close, iterations=2) # iterationは状況を見て調整

    if debug and mask_white_closed is not None:
        cv2.imshow("Closed Mask (find_all_tile_faces)", mask_white_closed)

    contours, _ = cv2.findContours(mask_white_closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    detected_tiles = []

    # === 面積フィルタの調整例 (REF_TILE... の値に依存) ===
    # 単一牌の面積の目安: REF_TILE_AVERAGE_WIDTH_VERTICAL * REF_TILE_AVERAGE_HEIGHT_VERTICAL
    single_tile_est_area = REF_TILE_AVERAGE_WIDTH_VERTICAL * REF_TILE_AVERAGE_HEIGHT_VERTICAL
    min_tile_area = single_tile_est_area * 0.5  # 単一牌の半分程度の面積から許容
    max_tile_area = single_tile_est_area * 5.5  # 単一牌の5.5倍程度の面積まで許容 (4枚連結+α)

    # === アスペクト比 (W/H) のフィルタ (REF_TILE... の値に依存) ===
    min_valid_ar1 = REF_TILE_ASPECT_RATIO_VERTICAL_WH * 0.70
    max_valid_ar1 = REF_TILE_ASPECT_RATIO_VERTICAL_WH * 1.30 # 少し広めに

    min_valid_ar2 = REF_TILE_ASPECT_RATIO_HORIZONTAL_WH * 0.70
    max_valid_ar2 = (REF_TILE_ASPECT_RATIO_HORIZONTAL_WH * 4.5) / 3.0 # 4枚連結のARより少し広め ( (H*4)/W )のW/H
                                                                  # REF_TILE_AVERAGE_HEIGHT_VERTICAL * 4 / REF_TILE_AVERAGE_WIDTH_VERTICAL

    if debug:
        print(f"\n--- Filtering Contours in find_all_tile_faces ---")
        print(f"REF_TILE_AVERAGE_WIDTH_VERTICAL: {REF_TILE_AVERAGE_WIDTH_VERTICAL}, REF_TILE_AVERAGE_HEIGHT_VERTICAL: {REF_TILE_AVERAGE_HEIGHT_VERTICAL}")
        print(f"Estimated Single Tile Area: {single_tile_est_area}")
        print(f"Area Range: [{min_tile_area:.0f} - {max_tile_area:.0f}]")
        print(f"Aspect Ratio Vertical (W/H) Approx: {REF_TILE_ASPECT_RATIO_VERTICAL_WH:.2f}")
        print(f"Aspect Ratio Horizontal (W/H) Approx: {REF_TILE_ASPECT_RATIO_HORIZONTAL_WH:.2f}")
        print(f"Aspect Ratio Valid Ranges: [{min_valid_ar1:.2f} - {max_valid_ar1:.2f}] OR [{min_valid_ar2:.2f} - {max_valid_ar2:.2f}]")
        print(f"Number of contours found before filtering: {len(contours)}")

    for i, cnt in enumerate(contours):
        area = cv2.contourArea(cnt)
        x, y, w, h = cv2.boundingRect(cnt)

        if debug:
            # print(f"\nContour #{i}: Area = {area:.0f}, Rect=({x},{y},{w},{h})") # ログが多すぎる場合はコメントアウト
            pass


        if min_tile_area < area < max_tile_area:
            if w > 0 and h > 0:
                aspect_ratio = float(w) / h
                if debug:
                    # print(f"  Contour #{i}: Area={area:.0f}, Rect=({x},{y},{w},{h}), AR={aspect_ratio:.2f} - Passed Area Filter.")
                    pass

                is_ar_valid = (min_valid_ar1 < aspect_ratio < max_valid_ar1) or \
                              (min_valid_ar2 < aspect_ratio < max_valid_ar2)

                if is_ar_valid:
                    cv2.rectangle(original_image_for_drawing, (x, y), (x + w, y + h), (0, 0, 255), 1) # Red: Accepted
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
                        print(f"    Contour #{i} ==> ACCEPTED: Area={area:.0f}, Rect=({x},{y},{w},{h}), AR={aspect_ratio:.2f}")
                elif debug:
                    # cv2.rectangle(original_image_for_drawing, (x, y), (x + w, y + h), (0, 255, 255), 1) # Yellow: Rejected by AR
                    is_near_square = (max_valid_ar1 <= aspect_ratio <= min_valid_ar2)
                    # if is_near_square:
                    #      print(f"    Contour #{i} REJECTED by AR (near square or outside): Area={area:.0f}, Rect=({x},{y},{w},{h}), AR={aspect_ratio:.2f}")
                    # else:
                    #     print(f"    Contour #{i} REJECTED by AR (outside all): Area={area:.0f}, Rect=({x},{y},{w},{h}), AR={aspect_ratio:.2f}")
                    pass
            elif debug:
                # print(f"  Contour #{i} Passed Area Filter, but w or h is 0. Rect: ({x},{y},{w},{h})")
                pass
        elif debug and area > 100: # 小さすぎるノイズはログ出力しない
            # print(f"  Contour #{i} REJECTED by Area: Area={area:.0f} (not in [{min_tile_area:.0f}-{max_tile_area:.0f}]) Rect=({x},{y},{w},{h})")
            pass


    if debug:
        print(f"\nFound {len(detected_tiles)} tile face candidates after filtering.")

    return detected_tiles, original_image_for_drawing

def is_plausible_tile_bundle(bundle_w, bundle_h, num_tiles_estimate, orientation,
                             # ref_tile_w_v, ref_tile_h_v, ref_tile_ar_h_wh, (これらはグローバル定数を使う)
                             dim_tolerance_ratio=0.40, debug=False): # 許容誤差を少し広げる
    if num_tiles_estimate <= 0: return False
    expected_w, expected_h = 0, 0

    if orientation == 'horizontal': # 横に並んだ牌の塊 (各牌は横向き)
        if num_tiles_estimate == 0: return False
        expected_w = REF_TILE_AVERAGE_WIDTH_HORIZONTAL * num_tiles_estimate
        expected_h = REF_TILE_AVERAGE_HEIGHT_HORIZONTAL
        
        if not (expected_w * (1 - dim_tolerance_ratio) < bundle_w < expected_w * (1 + dim_tolerance_ratio)):
            if debug: print(f"      Plausibility Fail (H_Bundle Width): Est.num={num_tiles_estimate}, BundleW={bundle_w:.0f}, ExpectedW={expected_w:.1f} (Ref H_牌幅={REF_TILE_AVERAGE_WIDTH_HORIZONTAL}, Tol: {dim_tolerance_ratio*100:.0f}%)")
            return False
        if not (expected_h * (1 - dim_tolerance_ratio) < bundle_h < expected_h * (1 + dim_tolerance_ratio)):
            if debug: print(f"      Plausibility Fail (H_Bundle Height): Est.num={num_tiles_estimate}, BundleH={bundle_h:.0f}, ExpectedH={expected_h:.1f} (Ref H_牌高={REF_TILE_AVERAGE_HEIGHT_HORIZONTAL}, Tol: {dim_tolerance_ratio*100:.0f}%)")
            return False
    elif orientation == 'vertical': # 縦に並んだ牌の塊 (各牌は縦向き)
        expected_w = REF_TILE_AVERAGE_WIDTH_VERTICAL * (1 if num_tiles_estimate <=2 else 1) # 縦2枚までは幅1枚分とみなす (稀なケース)
        expected_h = REF_TILE_AVERAGE_HEIGHT_VERTICAL * num_tiles_estimate

        if not (expected_w * (1 - dim_tolerance_ratio) < bundle_w < expected_w * (1 + dim_tolerance_ratio)):
            if debug: print(f"      Plausibility Fail (V_Bundle Width): Est.num={num_tiles_estimate}, BundleW={bundle_w:.0f}, ExpectedW={expected_w:.1f} (Ref V_牌幅={REF_TILE_AVERAGE_WIDTH_VERTICAL}, Tol: {dim_tolerance_ratio*100:.0f}%)")
            return False
        if not (expected_h * (1 - dim_tolerance_ratio) < bundle_h < expected_h * (1 + dim_tolerance_ratio)):
            if debug: print(f"      Plausibility Fail (V_Bundle Height): Est.num={num_tiles_estimate}, BundleH={bundle_h:.0f}, ExpectedH={expected_h:.1f} (Ref V_牌高={REF_TILE_AVERAGE_HEIGHT_VERTICAL}, Tol: {dim_tolerance_ratio*100:.0f}%)")
            return False
    else:
        if debug: print(f"      Plausibility Fail: Unknown orientation '{orientation}'")
        return False
    if debug: print(f"      Plausibility OK: Est.num={num_tiles_estimate}, Orient={orientation}")
    return True

def estimate_connected_tiles(tile_info, debug=False):
    num_estimated = 0
    w, h = tile_info['w'], tile_info['h']
    tile_ar = tile_info['aspect_ratio'] # W/H
    
    # 塊の見た目の向きで推定する枚数を変える
    bundle_orientation_by_shape = 'horizontal' if w > h else 'vertical'

    if bundle_orientation_by_shape == 'horizontal':
        # 塊が横長の場合、横向き牌の「幅」(REF_TILE_AVERAGE_WIDTH_HORIZONTAL) で割る
        num_tiles_candidate = round(w / REF_TILE_AVERAGE_WIDTH_HORIZONTAL)
        if num_tiles_candidate > 0 and num_tiles_candidate <= 4 : # 1-4枚の可能性
            if is_plausible_tile_bundle(w, h, num_tiles_candidate, 'horizontal', debug=debug):
                num_estimated = int(num_tiles_candidate)
    
    # 横長として妥当でなかった場合、または最初から縦長だった場合
    if num_estimated == 0 or bundle_orientation_by_shape == 'vertical':
        # 塊が縦長の場合、縦向き牌の「高さ」(REF_TILE_AVERAGE_HEIGHT_VERTICAL) で割る
        num_tiles_candidate_v = round(h / REF_TILE_AVERAGE_HEIGHT_VERTICAL)
        # 縦置きの場合、通常は1枚。カンなら4枚。
        if num_tiles_candidate_v == 1 or num_tiles_candidate_v == 4 :
             if is_plausible_tile_bundle(w, h, num_tiles_candidate_v, 'vertical', debug=debug):
                num_estimated = int(num_tiles_candidate_v)
        # 単独牌 (num_tiles_candidate=1) のチェックを優先 (num_estimatedが0の場合のみ)
        elif num_estimated == 0 and is_plausible_tile_bundle(w, h, 1, 'vertical', debug=debug):
            num_estimated = 1
            bundle_orientation_by_shape = 'vertical' # 明示的に

    final_bundle_orientation = bundle_orientation_by_shape
    if num_estimated > 0 : # 枚数推定が成功した場合、その時の向きを最終とする
        if bundle_orientation_by_shape == 'horizontal' and is_plausible_tile_bundle(w,h,num_estimated, 'horizontal', debug=False):
            final_bundle_orientation = 'horizontal'
        elif is_plausible_tile_bundle(w,h,num_estimated, 'vertical', debug=False):
            final_bundle_orientation = 'vertical'
        else: # どちらでもないなら枚数推定失敗とみなす
            num_estimated = 0


    if debug:
        print(f"    Estimate for Rect=({tile_info['x']},{tile_info['y']},{w},{h}), AR={tile_ar:.2f},塊ShapeOrient={bundle_orientation_by_shape}: Est枚数={num_estimated}, FinalOrient={final_bundle_orientation if num_estimated > 0 else 'N/A'}")
    return num_estimated, final_bundle_orientation if num_estimated > 0 else bundle_orientation_by_shape


def find_naki_sets(original_full_image, detected_tiles_step1, image_to_draw_on, debug=False):
    naki_sets_found = {'chi': [], 'pon': [], 'kan_ming': [], 'kan_an': []}
    cropped_naki_images = []
    naki_set_rects = [] 

    if debug:
        print(f"\n--- Analyzing candidates for Naki Sets ---")
        print(f"Using V_Tile: W={REF_TILE_AVERAGE_WIDTH_VERTICAL}, H={REF_TILE_AVERAGE_HEIGHT_VERTICAL}. H_Tile: W={REF_TILE_AVERAGE_WIDTH_HORIZONTAL}, H={REF_TILE_AVERAGE_HEIGHT_HORIZONTAL}")

    plausible_tile_bundles = []
    for tile_candidate in detected_tiles_step1:
        estimated_num_tiles, bundle_orientation = estimate_connected_tiles(tile_candidate, debug=debug)
        
        if estimated_num_tiles > 0:
            bundle_info = {**tile_candidate, 'num_actual_tiles': estimated_num_tiles, 'bundle_orientation': bundle_orientation}
            plausible_tile_bundles.append(bundle_info)
            if debug: print(f"  Bundle ACCEPTED: Rect=({tile_candidate['x']},{tile_candidate['y']},{tile_candidate['w']},{tile_candidate['h']}), Num={estimated_num_tiles}, BundleOrient={bundle_orientation}")
        elif debug: print(f"  Bundle REJECTED by estimate_connected_tiles: Rect=({tile_candidate['x']},{tile_candidate['y']},{tile_candidate['w']},{tile_candidate['h']})")

    if not plausible_tile_bundles:
        if debug: print("  No plausible tile bundles found to form naki sets.")
        return naki_sets_found, image_to_draw_on, cropped_naki_images, naki_set_rects

    crop_margin = 5

    for bundle in plausible_tile_bundles:
        is_naki = False
        naki_type_str = ""
        color = (0,0,0)

        # 横に3枚 (チー or ポン横置き)
        if bundle['num_actual_tiles'] == 3 and bundle['bundle_orientation'] == 'horizontal':
            naki_sets_found['chi'].append(bundle) 
            is_naki = True
            naki_type_str = "CHI/PON_H(3)"
            color = (0, 255, 0) # Green

        # 横に4枚 (カン横置き)
        elif bundle['num_actual_tiles'] == 4 and bundle['bundle_orientation'] == 'horizontal':
            naki_sets_found['kan_ming'].append(bundle) 
            is_naki = True
            naki_type_str = "KAN_H(4)"
            color = (255, 255, 0) # Cyan
        
        # TODO: 縦向きのポン（3牌が近接している）、縦向きのカン（num_actual_tiles == 4 and bundle_orientation == 'vertical'）のロジック
        # 縦向きのカンは estimate_connected_tiles で num_actual_tiles == 4 and bundle_orientation == 'vertical' で検出されるはず
        elif bundle['num_actual_tiles'] == 4 and bundle['bundle_orientation'] == 'vertical':
            naki_sets_found['kan_an'].append(bundle) # 暗槓か加槓縦
            is_naki = True
            naki_type_str = "KAN_V(4)"
            color = (255, 165, 0) # Orange


        if is_naki:
            naki_set_rects.append((bundle['x'], bundle['y'], bundle['w'], bundle['h']))
            if debug:
                print(f"    ★★★ Potential {naki_type_str} FOUND ★★★")
                print(f"      Bundle: x={bundle['x']}, y={bundle['y']}, w={bundle['w']}, h={bundle['h']}")
            cv2.rectangle(image_to_draw_on, (bundle['x'], bundle['y']),
                          (bundle['x'] + bundle['w'], bundle['y'] + bundle['h']),
                          color, 2) # 太さ2に変更

            bx, by, bw, bh = bundle['x'], bundle['y'], bundle['w'], bundle['h']
            crop_x1 = max(0, bx - crop_margin); crop_y1 = max(0, by - crop_margin)
            crop_x2 = min(original_full_image.shape[1], bx + bw + crop_margin)
            crop_y2 = min(original_full_image.shape[0], by + bh + crop_margin)
            cropped_img = original_full_image[crop_y1:crop_y2, crop_x1:crop_x2]
            if cropped_img.size > 0:
                cropped_naki_images.append(cropped_img)

    if debug:
        is_any_naki_found = False
        for key in naki_sets_found:
            if naki_sets_found[key]:
                is_any_naki_found = True
                break
        if not is_any_naki_found:
            print("  No specific naki patterns were identified from plausible bundles.")

    return naki_sets_found, image_to_draw_on, cropped_naki_images, naki_set_rects


def find_discarded_tiles(
    original_full_image,
    all_tile_candidates,    
    identified_naki_rects,  
    image_to_draw_on,
    debug=False
):
    discarded_tiles_info = []
    cropped_discarded_images = []
    crop_margin = 3

    if debug:
        print(f"\n--- Step 3: Finding Discarded Tiles ---")
        print(f"  Number of initial candidates for discard check: {len(all_tile_candidates)}")
        print(f"  Number of naki rects to exclude: {len(identified_naki_rects)}")

    def rects_overlap(rect1_xywh, rect2_xywh, overlap_threshold=0.3): # 候補の30%が鳴きと重なったら除外
        x1, y1, w1, h1 = rect1_xywh
        x2, y2, w2, h2 = rect2_xywh
        
        inter_x1 = max(x1, x2)
        inter_y1 = max(y1, y2)
        inter_x2 = min(x1 + w1, x2 + w2)
        inter_y2 = min(y1 + h1, y2 + h2)

        inter_area = max(0, inter_x2 - inter_x1) * max(0, inter_y2 - inter_y1)
        rect1_area = w1 * h1
        
        if rect1_area == 0: return False
        return (inter_area / rect1_area) > overlap_threshold

    for i, tile_candidate in enumerate(all_tile_candidates):
        candidate_rect = (tile_candidate['x'], tile_candidate['y'], tile_candidate['w'], tile_candidate['h'])
        is_part_of_naki = False
        for naki_rect in identified_naki_rects:
            if rects_overlap(candidate_rect, naki_rect):
                is_part_of_naki = True
                break
        
        if is_part_of_naki:
            if debug:
                # print(f"  Discard Candidate {i} (Rect: {candidate_rect}) overlaps with a naki set. Skipping.")
                pass
            continue

        # if debug:
            # print(f"\n  Evaluating non-naki candidate #{i} for discard: Rect=({tile_candidate['x']},{tile_candidate['y']},{tile_candidate['w']},{tile_candidate['h']}), AR={tile_candidate['aspect_ratio']:.2f}")

        num_estimated, bundle_orientation = estimate_connected_tiles(tile_candidate, debug=False) # ここでのデバッグはオフ

        if num_estimated == 1 and bundle_orientation == 'vertical':
            # アスペクト比は find_all_tile_faces でフィルタ済みなので、ここでは枚数と向きを重視
            # REF_TILE_ASPECT_RATIO_VERTICAL_WH を使った厳密なARチェックは find_all_tile_faces で行われているはず
            # (min_valid_ar1 < tile_candidate['aspect_ratio'] < max_valid_ar1)
            
            if debug:
                print(f"    ==> ACCEPTED as Discarded Tile: Rect=({tile_candidate['x']},{tile_candidate['y']},{tile_candidate['w']},{tile_candidate['h']}), Est.1, Vertical Bundle.")
            
            discarded_tiles_info.append(tile_candidate)
            cv2.rectangle(image_to_draw_on,
                          (tile_candidate['x'], tile_candidate['y']),
                          (tile_candidate['x'] + tile_candidate['w'], tile_candidate['y'] + tile_candidate['h']),
                          (255, 0, 255), 2)  # 捨て牌はマゼンタ色, 太さ2

            dx, dy, dw, dh = tile_candidate['x'], tile_candidate['y'], tile_candidate['w'], tile_candidate['h']
            crop_x1 = max(0, dx - crop_margin); crop_y1 = max(0, dy - crop_margin)
            crop_x2 = min(original_full_image.shape[1], dx + dw + crop_margin)
            crop_y2 = min(original_full_image.shape[0], dy + dh + crop_margin)
            
            cropped_img = original_full_image[crop_y1:crop_y2, crop_x1:crop_x2]
            if cropped_img.size > 0:
                cropped_discarded_images.append(cropped_img)
        elif debug and num_estimated > 0 : # 推定枚数が0でない場合のみログ表示 (ノイズ除外)
             if num_estimated != 1 : print(f"    REJECTED (Discard) Rect=({tile_candidate['x']},{tile_candidate['y']},{tile_candidate['w']},{tile_candidate['h']}): Est num_tiles = {num_estimated} (not 1)")
             elif bundle_orientation != 'vertical': print(f"    REJECTED (Discard) Rect=({tile_candidate['x']},{tile_candidate['y']},{tile_candidate['w']},{tile_candidate['h']}): Est bundle_orientation = {bundle_orientation} (not vertical)")


    if debug:
        print(f"\nFound {len(discarded_tiles_info)} discarded tile candidates after filtering.")
        if image_to_draw_on is not None and len(discarded_tiles_info)>0: # 1件でも検出されたら表示
            # cv2.imshow("Step 3: Detected Discarded Tiles (Magenta)", image_to_draw_on) # Final Detectionsでまとめて表示
            pass

    return discarded_tiles_info, image_to_draw_on, cropped_discarded_images


# --- メイン処理 ---
if __name__ == '__main__':
    image_path = 'test_mahjong.jpg' # ここに対象の画像パスを指定
    debug_flag = True

    original_image_for_cropping = cv2.imread(image_path)
    if original_image_for_cropping is None:
        print(f"致命的エラー: 元画像が読み込めません - {image_path}")
        exit()

    # --- Step 1: 全ての牌候補を検出 ---
    print(f"--- Step 1: Finding All Tile Candidates ---")
    detected_tiles_list, image_with_step1_detections = find_all_tile_faces(image_path, debug=debug_flag)

    if detected_tiles_list is None:
        print("Critical error in Step 1: Failed to detect tiles or image not loaded.")
        if debug_flag:
            cv2.waitKey(0)
            cv2.destroyAllWindows()
        exit()
    
    print(f"\n--- Step 1 Results ---")
    print(f"Number of initially detected tile candidates: {len(detected_tiles_list)}")
    if debug_flag and image_with_step1_detections is not None:
        cv2.imshow("Step 1: All Tile Candidates (Red=Accepted in Step1)", image_with_step1_detections)

    # --- Step 2: 鳴きセットを検出 ---
    image_for_naki_drawing = original_image_for_cropping.copy() # 描画は毎回オリジナルから
    
    print(f"\n--- Step 2: Finding Naki Sets ---")
    naki_sets_result, image_with_naki_detections, cropped_naki_list, naki_set_rects_result = find_naki_sets(
        original_image_for_cropping,
        detected_tiles_list, 
        image_for_naki_drawing, # Step1の赤枠は引き継がない
        debug=debug_flag
    )

    if debug_flag:
        print(f"\n--- Naki Sets Detection Results ---")
        for naki_type, sets in naki_sets_result.items():
            if sets: print(f"  Found {len(sets)} {naki_type.upper()} set(s).")
        is_any_naki_found = any(val for subl in naki_sets_result.values() for val in subl if subl)
        if not is_any_naki_found:
             print("  No naki sets identified in Step 2.")
        # if image_with_naki_detections is not None: # find_discarded_tiles の後でまとめて表示
            # cv2.imshow("Step 2: Detected Naki Sets", image_with_naki_detections)

    if cropped_naki_list:
        print(f"\nSuccessfully cropped {len(cropped_naki_list)} naki set(s).")
        for i, cropped_naki_img in enumerate(cropped_naki_list):
            if debug_flag and cropped_naki_img is not None and cropped_naki_img.size > 0:
                cv2.imshow(f"Cropped Naki Set #{i+1}", cropped_naki_img)
            output_filename = f"test_mahjong_cropped_naki_{i+1}.jpg"
            try:
                if cropped_naki_img is not None and cropped_naki_img.size > 0:
                    cv2.imwrite(output_filename, cropped_naki_img)
                    print(f"  Saved: {output_filename}")
                else:
                    print(f"  Skipped saving empty naki crop #{i+1}")
            except Exception as e:
                print(f"  Error saving {output_filename}: {e}")
    else:
        print("No naki sets were cropped in Step 2.")

    # --- Step 3: 捨て牌を検出 ---
    # Step2で鳴きが描画された画像をベースに、さらに捨て牌を描画する
    image_for_all_drawing = image_with_naki_detections.copy() if image_with_naki_detections is not None else original_image_for_cropping.copy()

    discarded_tiles_info_result, image_with_all_detections, cropped_discarded_list = find_discarded_tiles(
        original_image_for_cropping,
        detected_tiles_list,    
        naki_set_rects_result,  
        image_for_all_drawing,
        debug=debug_flag
    )

    if debug_flag:
        print(f"\n--- Discarded Tiles Detection Results ---")
        print(f"  Found {len(discarded_tiles_info_result)} discarded tile(s) in Step 3.")
        if image_with_all_detections is not None:
            cv2.imshow("Final Detections: Naki (Color) & Discarded (Magenta)", image_with_all_detections)

    if cropped_discarded_list:
        print(f"\nSuccessfully cropped {len(cropped_discarded_list)} discarded tile(s).")
        for i, cropped_discarded_img in enumerate(cropped_discarded_list):
            if debug_flag and cropped_discarded_img is not None and cropped_discarded_img.size > 0:
                cv2.imshow(f"Cropped Discarded Tile #{i+1}", cropped_discarded_img)
            output_filename = f"test_mahjong_cropped_discarded_{i+1}.jpg"
            try:
                if cropped_discarded_img is not None and cropped_discarded_img.size > 0:
                    cv2.imwrite(output_filename, cropped_discarded_img)
                    print(f"  Saved: {output_filename}")
                else:
                    print(f"  Skipped saving empty discard crop #{i+1}")

            except Exception as e:
                print(f"  Error saving {output_filename}: {e}")
    else:
        print("No discarded tiles were cropped in Step 3.")


    if debug_flag:
        print("\nPress any key in a displayed window to close all windows.")
        cv2.waitKey(0)
        cv2.destroyAllWindows()