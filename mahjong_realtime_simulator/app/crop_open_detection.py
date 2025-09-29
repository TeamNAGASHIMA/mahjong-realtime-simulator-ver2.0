# crop_open_detection.py
# 画像の鳴き牌部分を切り出し、プレイヤーごとに分類する (固定位置切り出し版、画面表示なし)

import cv2
import numpy as np
import os

# find_all_tile_faces, is_plausible_tile_bundle, estimate_connected_tiles の各関数は
# 今回の「固定位置切り出し」の目的では直接使用しないため、そのまま残しますが、
# 鳴き牌の切り出し処理には影響しません。
# 将来的に、検出ロジックと固定領域を組み合わせる場合や、
# 他の目的で牌検出結果を利用する可能性があるため、保持しています。

def find_all_tile_faces(image_np: np.ndarray, debug=False) -> tuple[list, np.ndarray]:
    """麻雀画像 (NumPy配列) から牌の表面候補を検出する。
    今回の「固定位置切り出し」の目的では直接使用しないが、他の用途のために保持。
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

    # DEBUG_MODEでも画面には表示しない
    # if debug and mask_white_closed is not None:
    #     cv2.imshow("White Mask for Tiles (find_all_tile_faces)", mask_white_closed)

    contours, _ = cv2.findContours(mask_white_closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    detected_tiles = []

    min_tile_area = 1500
    max_tile_area = 50000

    min_valid_ar1 = 0.15
    max_valid_ar1 = 0.85
    min_valid_ar2 = 1.15
    max_valid_ar2 = 4.5

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
    """今回の「固定位置切り出し」の目的では直接使用しないが、他の用途のために保持。"""
    if num_tiles_estimate <= 0: return False
    expected_w, expected_h = 0.0, 0.0

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
        if num_tiles_estimate != 1:
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
    """今回の「固定位置切り出し」の目的では直接使用しないが、他の用途のために保持。"""
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
        if is_plausible_tile_bundle(w, h, 1, 'vertical',
                                    avg_single_vertical_tile_w, avg_single_vertical_tile_h,
                                    avg_single_horizontal_tile_ar,
                                    dim_tolerance_ratio=0.30, debug=debug):
            num_estimated = 1
    
    if debug:
        print(f"    Estimate for Rect=({tile_info['x']},{tile_info['y']},{w},{h}), AR={tile_info['aspect_ratio']:.2f}, Orient={orientation}: Est枚数={num_estimated}")
    return num_estimated, orientation


def crop_naki_sets_from_fixed_regions(original_full_image_np: np.ndarray, debug=False) -> tuple[dict, np.ndarray]:
    """麻雀画像から、プレイヤーごとに定義された固定の領域を切り出す。

    Args:
        original_full_image_np (np.ndarray): 切り出し元の、加工されていないオリジナル画像 (NumPy配列)。
        debug (bool): デバッグ情報を表示するかどうかのフラグ。

    Returns:
        tuple[dict, np.ndarray]: プレイヤーごとに分類された鳴き牌画像の辞書と、描画後の画像。
                                  各プレイヤーには一つの切り出し画像が格納されます。
    """
    player_naki_images = {'bottom': [], 'right': [], 'top': [], 'left': []}
    
    img_h, img_w = original_full_image_np.shape[:2]
    
    # !!! ここに各プレイヤーの鳴き牌領域の固定座標を定義 !!!
    # これらは画像サイズや卓のレイアウトによって調整が必要です。
    # 例: {'x': x_start, 'y': y_start, 'w': width, 'h': height}
    # 値は画像のピクセル数で指定します。
    # この例では、画像の幅・高さに対する割合で指定しています。
    # 実際の画像に合わせて、これらの値を微調整してください。
    
    fixed_regions = {
        'bottom': {'x': int(img_w * 0.35), 'y': int(img_h * 0.82), 'w': int(img_w * 0.3), 'h': int(img_h * 0.08)},
        'right':  {'x': int(img_w * 0.88), 'y': int(img_h * 0.35), 'w': int(img_w * 0.08), 'h': int(img_h * 0.3)},
        'top':    {'x': int(img_w * 0.35), 'y': int(img_h * 0.10), 'w': int(img_w * 0.3), 'h': int(img_h * 0.08)},
        'left':   {'x': int(img_w * 0.04), 'y': int(img_h * 0.35), 'w': int(img_w * 0.08), 'h': int(img_h * 0.3)},
    }
    
    image_for_drawing = original_full_image_np.copy() # デバッグ時に保存する描画用画像

    if debug:
        print(f"\n--- Cropping Naki Sets from Fixed Regions by Player ---")
        print(f"Image Dims: W={img_w}, H={img_h}")

    for player, region_coords in fixed_regions.items():
        x, y, w, h = region_coords['x'], region_coords['y'], region_coords['w'], region_coords['h']

        # 座標が画像範囲内に収まるように調整
        crop_x1 = max(0, x)
        crop_y1 = max(0, y)
        crop_x2 = min(img_w, x + w)
        crop_y2 = min(img_h, y + h)

        # 有効な領域があるかチェック
        if crop_x2 > crop_x1 and crop_y2 > crop_y1:
            cropped_img = original_full_image_np[crop_y1:crop_y2, crop_x1:crop_x2]
            
            if cropped_img.size > 0: # 空の画像でないことを確認
                player_naki_images[player].append(cropped_img) # 各プレイヤーには1つの固定領域を想定
                if debug:
                    print(f"  Cropped region for '{player}': ({crop_x1},{crop_y1}) to ({crop_x2},{crop_y2})")
                
                # デバッグ用に切り出し領域を描画 (保存用画像に描画)
                color_map = {'bottom': (255, 0, 0), 'right': (0, 255, 0), 'top': (0, 255, 255), 'left': (255, 0, 255)}
                cv2.rectangle(image_for_drawing, (crop_x1, crop_y1), (crop_x2, crop_y2),
                              color_map.get(player, (255,255,255)), 3)
            elif debug:
                print(f"  Cropping resulted in an empty image for '{player}' at ({x},{y}).")
        elif debug:
            print(f"  Invalid region for '{player}': ({x},{y},{w},{h}) resulted in zero or negative dimensions after clamping.")

    if debug:
        total_cropped_regions = sum(len(v) for v in player_naki_images.values())
        print(f"Total {total_cropped_regions} fixed regions cropped.")

    return player_naki_images, image_for_drawing # 描画済みの画像を返す


# --- crop_open_main 関数の変更点 ---
def crop_open_main(image_np: np.ndarray, original_filename: str = 'output.jpg', debug=False) -> dict:
    """麻雀画像 (NumPy配列) の解析パイプラインを実行し、プレイヤーごとに分類された鳴き牌の切り出し画像リストを返す。

    Args:
        image_np (np.ndarray): 入力画像データ (NumPy配列)。
        original_filename (str): 保存時のベースとなる元のファイル名。
        debug (bool): デバッグ情報を表示するかどうかのフラグ。Trueの場合、詳細なログが表示される。

    Returns:
        dict: プレイヤーごとに分類された鳴き牌の領域の画像データ (NumPy配列) の辞書。
              キーは 'bottom', 'right', 'top', 'left'。検出できなかった場合は空のリストを持つ辞書を返す。
    """
    if image_np is None or image_np.size == 0:
        print("致命的エラー: 元画像が空または不正です。")
        return {'bottom': [], 'right': [], 'top': [], 'left': []}

    # 1. ステップ1: 牌の表面候補をすべて検出 (この情報は固定位置切り出しには使わないが、将来の拡張のために呼び出しは残す)
    if debug: print("\n--- Step 1: 牌の表面候補を検出中 (固定位置切り出しでは直接使用しません)... ---")
    detected_tiles, step1_image_for_debug = find_all_tile_faces(image_np, debug=debug)
    
    # 検出された牌候補があったとしても、今回の固定位置切り出しでは利用しないため、
    # その後の処理 (plausible_tile_bundlesの生成など) は行いません。
    if debug and detected_tiles:
        print(f"ステップ1で {len(detected_tiles)} 個の牌候補を検出しました (固定位置切り出しでは直接使用しません)。")

    # 2. ステップ2: 鳴きセットを固定位置から切り出し、プレイヤーごとに分類
    if debug: print("\n--- Step 2: 鳴きセットを固定位置から切り出し、プレイヤーごとに分類中... ---")
    player_separated_naki_images, image_with_fixed_regions = crop_naki_sets_from_fixed_regions( # 変更: step2_image_for_debug の名前を変更
        image_np, debug=debug
    )

    # 3. 結果のサマリー表示 (デバッグ用)
    if debug:
        print("\n--- 解析結果 ---")
        total_cropped = sum(len(imgs) for imgs in player_separated_naki_images.values())
        if total_cropped > 0:
            print(f"成功: 合計 {total_cropped} 個の固定鳴き牌領域を切り出しました。")
            for player, images in player_separated_naki_images.items():
                if images:
                    print(f"  - Player '{player}': {len(images)} 個")
        else:
            print("切り出し対象の固定鳴き牌領域は見つかりませんでした。")

    # 4. デバッグ用の画像を保存 (画面表示はしない)
    if debug:
        print("\nデバッグモード: 画像保存処理を開始します。")
        
        # --- ここから追加・変更 ---
        output_folder = "output_open"
        if not os.path.exists(output_folder):
            try:
                os.makedirs(output_folder)
                print(f"フォルダ '{output_folder}' を作成しました。")
            except OSError as e:
                print(f"エラー: フォルダ '{output_folder}' の作成に失敗しました。 reason: {e}")
                # フォルダ作成に失敗した場合、カレントディレクトリに保存するようにフォールバック
                output_folder = "." 
                print(f"警告: '{output_folder}' に画像を保存します。")
        # --- ここまで追加・変更 ---

        # 描画された画像を保存
        base_name, ext = os.path.splitext(os.path.basename(original_filename)) # os.path.basename を追加してファイル名のみを取得
        if not ext:
            ext = '.jpg'

        # 固定領域が描画された元画像を保存
        if image_with_fixed_regions is not None and image_with_fixed_regions.size > 0:
            full_img_save_filename = os.path.join(output_folder, f"{base_name}_fixed_regions_overlay{ext}") # 変更: output_folder をパスに追加
            try:
                cv2.imwrite(full_img_save_filename, image_with_fixed_regions)
                print(f"保存成功: 全体画像に固定領域を描画した画像を {full_img_save_filename} に保存しました。")
            except Exception as e:
                print(f"エラー: {full_img_save_filename} の保存に失敗しました。 reason: {e}")

        # 各プレイヤーの切り出し画像を保存
        print("\n--- 各プレイヤーの切り出し画像の保存処理 ---")
        save_count = 0
        for player, images in player_separated_naki_images.items():
            if not images:
                continue
            for i, img in enumerate(images):
                save_filename = os.path.join(output_folder, f"{base_name}_fixed_crop_{player}_{i+1}{ext}") # 変更: output_folder をパスに追加
                try:
                    cv2.imwrite(save_filename, img)
                    print(f"保存成功: {save_filename}")
                    save_count += 1
                except Exception as e:
                    print(f"エラー: {save_filename} の保存に失敗しました。 reason: {e}")
        
        if save_count > 0:
            print(f"合計 {save_count} 個の切り出し画像を保存しました。")
        else:
            print("保存対象の切り出し画像はありませんでした。")
        
        # 画面表示は行わないため、waitKeyやdestroyAllWindowsは不要
        # cv2.waitKey(0) 
        # cv2.destroyAllWindows()
    
    return player_separated_naki_images


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
        result_naki_dict = crop_open_main(
            image_np=input_image_np, 
            original_filename=IMAGE_FILE,
            debug=DEBUG_MODE
        )

        total_sets_found = sum(len(v) for v in result_naki_dict.values())
        if total_sets_found > 0:
            print(f"\nテスト完了: 合計 {total_sets_found} 個の固定鳴き牌領域が切り出されました。")
            for player, images in result_naki_dict.items():
                print(f"  - Player '{player}': {len(images)} 個の鳴き牌セット")
        else:
            print("\nテスト完了: 固定鳴き牌領域は切り出されませんでした。")