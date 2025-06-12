# detect.py
# 画像から手牌、盤面の情報を取得する

import requests
import cv2
import numpy as np
import math
import os 
from dotenv import load_dotenv

# .env ファイルの読み込み
load_dotenv()

# crop_open_detection.py, crop_dora_detection.py, crop_discard_detection.py
# は別途用意されていることを前提とします。
# これらはNumPy配列を引数として受け取り、NumPy配列を返す形式である必要があります。
import crop_open_detection 
import crop_dora_detection 
import crop_discard_detection 

# 牌種類変換表
tile_convert = {
    0: 18,  # 一索
    1: 0,   # 一萬
    2: 9,   # 一筒
    5: 19,  # 二索
    6: 1,   # 二萬
    7: 10,  # 二筒
    10: 20, # 三索
    11: 2,  # 三萬
    12: 11, # 三筒
    15: 21, # 四索
    16: 3,  # 四萬
    17: 12, # 四筒
    20: 22, # 五索
    21: 4,  # 五萬
    22: 13, # 五筒
    23: 23, # 六索
    24: 5,  # 六萬
    25: 14, # 六筒
    26: 24, # 七索
    27: 6,  # 七萬
    28: 15, # 七筒
    29: 25, # 八索
    30: 7,  # 八萬
    31: 16, # 八筒
    32: 26, # 九索
    33: 8,  # 九萬
    35: 27, # 東
    36: 32, # 發
    37: 30, # 北
    38: 33, # 中
    39: 28, # 南
    40: 31, # 白
    41: 29, # 西
}


def tile_detection(image_np: np.ndarray) -> list:
    """画像内の麻雀牌をRoboflow APIで検出し、その座標情報を含めて返します。

    Roboflow APIに画像（NumPy配列）を送信し、検出された牌の種類、信頼度、
    およびバウンディングボックスの座標（x, y, width, height）をリストで返します。
    APIキー、エンドポイントURL、検出閾値、画像リサイズ設定はコード内で直接定義されます。
    API送信前に画像の最大辺が指定された寸法になるようにリサイズされます。

    Args:
        image_np (np.ndarray): 検出対象の画像データ (NumPy配列)。

    Returns:
        list: 検出された牌のリスト。各要素は
            {"confidence": float, "class_id": int, "x": float, "y": float, "width": float, "height": float}
            の辞書です。エラーが発生した場合や検出されなかった場合は空のリストを返します。
    """
    # Roboflow APIの設定
    API_KEY = os.getenv("ROBOFLOW_API_KEY")
    BASE_URL = os.getenv("ROBOFLOW_BASE_URL")

    # 検出閾値
    CONFIDENCE_THRESHOLD = float(os.getenv("ROBOFLOW_CONFIDENCE"))
    OVERLAP_THRESHOLD = float(os.getenv("ROBOFLOW_OVERLAP"))
    
    # APIに送信する画像の最大辺の長さ（ピクセル）。0または負の値の場合、リサイズしない。
    # 例: 640 （画像の長い方の辺が640ピクセルになるようにリサイズ）
    API_MAX_IMAGE_DIMENSION = 0

    # 環境変数が読み込めなかった場合
    if not API_KEY or not BASE_URL:
        print("【エラー】tile_detection: Roboflow APIキーまたはベースURLが環境変数に設定されていません。")
        return []

    # 受け取ったNumPy配列が空もしくは存在しない場合
    if image_np is None or image_np.size == 0:
        print("【エラー】tile_detection: 入力画像が空または不正です。")
        return []

    # API送信前に画像をリサイズ
    processed_image_np = image_np.copy()
    if API_MAX_IMAGE_DIMENSION > 0: # 0より大きい値が設定されていればリサイズを実行
        h, w = processed_image_np.shape[:2]
        if max(h, w) > API_MAX_IMAGE_DIMENSION: # 画像の長い方の辺が指定された最大寸法を超えている場合
            scale = API_MAX_IMAGE_DIMENSION / max(h, w)
            new_w, new_h = int(w * scale), int(h * scale)
            processed_image_np = cv2.resize(processed_image_np, (new_w, new_h), interpolation=cv2.INTER_AREA)

    # エンドポイントURL
    url = (
        f"{BASE_URL}"
        f"?api_key={API_KEY}"
        f"&confidence={CONFIDENCE_THRESHOLD}" 
        f"&overlap={OVERLAP_THRESHOLD}"       
        "&format=json" 
        "&labels=true"
    )

    try:
        # NumPy配列をJPEGバイトデータにエンコード
        is_success, encoded_image = cv2.imencode(".jpg", processed_image_np) # リサイズ後の画像を使用
        if not is_success:
            print("【エラー】tile_detection: 画像のエンコードに失敗しました。")
            return []

        # APIへ画像を送信
        files = {"file": ("image.jpg", encoded_image.tobytes(), "image/jpeg")}
        response = requests.post(url, files=files)

        # レスポンスの処理（検出処理）
        if response.status_code == 200:
            result = response.json()
            result_array = []   # 牌の種類のクラスidと座標の配列
            
            # リサイズが行われた場合、APIから返される座標はリサイズ後の画像に対するものなので、
            # 元の画像サイズに戻すためのスケールファクターを計算
            original_h, original_w = image_np.shape[:2]
            if API_MAX_IMAGE_DIMENSION > 0 and max(original_h, original_w) > API_MAX_IMAGE_DIMENSION:
                scale_factor = max(original_h, original_w) / max(processed_image_np.shape[:2])
            else:
                scale_factor = 1.0 # リサイズが行われなかった場合

            for pred in result["predictions"]:
                confidence = float(pred["confidence"])
                class_id = int(pred["class_id"])
                
                # 変換表に存在しないclass_idは無視
                if class_id in tile_convert:
                    # 座標を元の画像サイズにスケールバック
                    x_orig = float(pred["x"]) * scale_factor
                    y_orig = float(pred["y"]) * scale_factor
                    width_orig = float(pred["width"]) * scale_factor
                    height_orig = float(pred["height"]) * scale_factor

                    result_array.append({
                        "confidence": confidence,
                        "class_id": class_id,
                        "x": x_orig,
                        "y": y_orig,
                        "width": width_orig,
                        "height": height_orig
                    })
            return result_array
        else:
            print(f"【エラー】Roboflow APIステータスコード: {response.status_code}")
            print(response.text)
            return [] # エラー時は空リストを返す
    except Exception as e:
        print(f"【エラー】tile_detection中に予期せぬエラーが発生しました: {e}")
        return []


def _detect_tiles_with_rotations(image_np: np.ndarray, confidence_threshold: float = 0.6) -> list:
    """画像を様々な角度に回転させて牌を検出し、信頼度でフィルタリングした結果を統合して返します。

    このヘルパー関数は、特定の画像を元の向き、90度回転、-90度回転の3つの向きで
    `tile_detection` にかけ、検出された牌の中から指定された信頼度閾値以上のものを集めます。
    これにより、牌の向きに依存しない検出精度向上を目指します。
    なお、回転後の座標変換はここでは行わず、元の検出結果の座標をそのまま返します。

    Args:
        image_np (np.ndarray): 検出対象の画像データ (NumPy配列)。
        confidence_threshold (float): 検出結果の信頼度閾値。この値以上の検出のみが採用されます。

    Returns:
        list: 信頼度閾値を超えた全ての検出結果のリスト。
            各要素は {"confidence": float, "class_id": int, "x": float, "y": float, "width": float, "height": float}
            の辞書です。牌が検出されなかった場合は空のリストを返します。
    """
    if image_np is None or image_np.size == 0:
        return []

    all_raw_results = []

    # 0度 (オリジナル) での検出
    results_0_deg = tile_detection(image_np)
    for r in results_0_deg:
        if r["confidence"] >= confidence_threshold:
            all_raw_results.append(r)

    # 90度回転して検出
    try:
        rotated_image_90 = np.rot90(image_np)
        results_90_deg = tile_detection(rotated_image_90)
        for r in results_90_deg:
            if r["confidence"] >= confidence_threshold:
                all_raw_results.append(r)
    except Exception as e:
        print(f"【エラー】回転 (90度) 処理中にエラーが発生しました: {e}")

    # -90度回転 (270度) して検出
    try:
        rotated_image_neg90 = np.rot90(image_np, k=-1)
        results_neg90_deg = tile_detection(rotated_image_neg90)
        for r in results_neg90_deg:
            if r["confidence"] >= confidence_threshold:
                all_raw_results.append(r)
    except Exception as e:
        print(f"【エラー】回転 (-90度) 処理中にエラーが発生しました: {e}")
    
    return all_raw_results


def turn_calculation(total_discards: int) -> int:
    """捨て牌の総数から現在の巡目数を計算します。

    Args:
        total_discards (int): 捨て牌の総数。

    Returns:
        int: 現在の巡目数 (1巡目から開始)。
            捨て牌が0枚の場合は1巡目と見なされます。
    """
    if total_discards == 0:
        return 1
    else:
        return (total_discards - 1) // 4 + 1


def dora_detection(board_image_np: np.ndarray) -> list:
    """盤面画像からドラ表示牌を検出し、その種類（ID）のリストを返します。

    `crop_dora_detection.py` を使用してドラ表示牌領域を切り出し、
    複数の回転方向で牌検出を行います。槓による複数枚のドラ表示牌も考慮し、
    検出された全ての牌をリストとして返します。

    Args:
        board_image_np (np.ndarray): 盤面全体の画像データ (NumPy配列)。

    Returns:
        list: 検出されたドラ表示牌のIDのリスト（昇順にソートされます）。
            検出されなかった場合は空のリストを返します。
    """
    # crop_dora_detection.main(board_image_np) は、NumPy配列を受け取り、
    # ドラ表示牌の領域をNumPy配列として返す
    cropped_dora_np = crop_dora_detection.main(board_image_np)
    
    if cropped_dora_np is None or cropped_dora_np.size == 0:
        print("【警告】dora_detection: 切り出されたドラ表示牌の画像が空です。")
        return []

    # 共通ヘルパー関数を呼び出し、複数の検出結果（牌の種類と信頼度）を取得
    all_raw_results = _detect_tiles_with_rotations(cropped_dora_np, confidence_threshold=0.6)

    # class_idのみ配列に格納
    final_tiles = []
    for rd in all_raw_results:
        converted_tile = tile_convert[rd["class_id"]]
        final_tiles.append(converted_tile)
        
    return sorted(final_tiles)


def open_detection(board_image_np: np.ndarray) -> list[list[int]]:
    """盤面画像から鳴き牌を検出し、その種類（ID）のリストのリストを返します。

    `crop_open_detection.py` を使用して鳴き牌領域を切り出し、
    切り出された各鳴き牌の塊に対して複数の回転方向で牌検出を行います。
    検出された全ての牌を鳴きセットごとに構造化されたリストとして返します。

    Args:
        board_image_np (np.ndarray): 盤面全体の画像データ (NumPy配列)。

    Returns:
        list[list[int]]: 検出された鳴き牌のセットのリスト。
                        各要素は一つの鳴きセット（チー、ポン、カンなど）を構成する牌のIDのリストで、
                        その内部リストは昇順にソートされます。
                        検出されなかった場合は空のリストを返します。
    """
    # crop_open_detection.main(board_image_np) は、NumPy配列のリストを返す
    cropped_naki_image_list = crop_open_detection.main(board_image_np)    
    
    all_melded_sets_structured = [] # 各鳴きセットごとの牌リストを格納する

    if not cropped_naki_image_list: # リストが空かどうかで判定
        print("【警告】open_detection: 切り出された鳴き牌の画像が空です。")
        return []

    # 各切り出し画像 (鳴き牌の塊ごと) に対して検出処理を実行
    for cropped_naki_single_np in cropped_naki_image_list:
        if cropped_naki_single_np is None or cropped_naki_single_np.size == 0:
            print("【警告】open_detection: リスト内の切り出し画像が空または不正です。スキップします。")
            continue 

        # 共通ヘルパー関数を呼び出し、この「単一の鳴き牌の塊」から検出された牌を取得
        results_for_single_naki = _detect_tiles_with_rotations(cropped_naki_single_np, confidence_threshold=0.6)
        
        # この鳴き塊から検出された牌のIDを変換して一時リストに格納
        current_naki_tiles_ids = []
        for rd in results_for_single_naki:
            converted_tile = tile_convert[rd["class_id"]]
            current_naki_tiles_ids.append(converted_tile)
        
        # 検出された牌があれば、ソートして構造化リストに追加
        if current_naki_tiles_ids:
            all_melded_sets_structured.append(sorted(current_naki_tiles_ids))

    return all_melded_sets_structured # ここで [[1,2,3],[5,5,5]] のような形式が返る


def discard_detection(board_image_np: np.ndarray) -> dict:
    """盤面画像から捨て牌を検出し、プレイヤーゾーン別に分類したリストを返します。

    `crop_discard_detection.py` を使用して各プレイヤーの捨て牌領域を個別に切り出し、
    それぞれの切り出し画像に対して牌認識を行います。

    Args:
        board_image_np (np.ndarray): 盤面全体の画像データ (NumPy配列)。

    Returns:
        dict: 検出された捨て牌の辞書。キーはプレイヤーゾーン（'discard_tiles_bottom', 'discard_tiles_right',
                'discard_tiles_top', 'discard_tiles_left'）で、値はそのプレイヤーの捨て牌IDのリスト。
                例: {"discard_tiles_bottom": [1, 2, 3], "discard_tiles_top": [10, 11], ...}
                検出されなかった場合は、全てのキーが空のリストを持つ辞書を返します。
    """
    # crop_discard_detection.main から各プレイヤーの切り出し画像を取得
    # これが {'bottom': img_np, 'right': img_np, 'top': img_np, 'left': img_np} の形式で返される
    cropped_discard_areas_dict = crop_discard_detection.main(board_image_np)

    # プレイヤーゾーンごとの捨て牌リストを初期化
    # 最終的にこの辞書が返される
    discard_by_player_zone = {
        "discard_tiles_bottom": [],  # 自分（画面下部）
        "discard_tiles_right": [],   # 下家（画面右側）
        "discard_tiles_top": [],     # 対面（画面上部）
        "discard_tiles_left": []     # 上家（画面左側）
    }

    if not cropped_discard_areas_dict:
        print("【警告】discard_detection: 切り出された捨て牌の画像辞書が空です。")
        return discard_by_player_zone # 初期化された空の辞書を返す

    # crop_discard_detection.py のキーとこの関数のキーのマッピング
    player_zone_key_map = {
        'bottom': "discard_tiles_bottom",
        'right': "discard_tiles_right",
        'top': "discard_tiles_top",
        'left': "discard_tiles_left"
    }

    # 各切り出し画像（各プレイヤーの河）に対してループ処理
    for crop_key, cropped_img_np in cropped_discard_areas_dict.items():
        # 対応するプレイヤーゾーンのキーを取得
        player_zone_actual_key = player_zone_key_map.get(crop_key)

        if player_zone_actual_key is None:
            # 想定外のキーがあれば警告してスキップ
            print(f"【警告】discard_detection: 未知の切り出しキー '{crop_key}' が検出されました。スキップします。")
            continue

        if cropped_img_np is None or cropped_img_np.size == 0:
            # 切り出し画像が空の場合は、そのゾーンのリストは空のままになるので、警告してスキップ
            print(f"【警告】discard_detection: '{crop_key}' の切り出し画像が空または不正です。")
            continue
        
        # tile_detection は既に内部で環境変数から読み込んだ信頼度閾値でフィルタリングを行います
        # 上家, 下家の場合は画像を90度回転
        if player_zone_actual_key == "discard_tiles_right" or player_zone_actual_key == "discard_tiles_left":
            cropped_img_np = np.rot90(cropped_img_np)
        detection_results = tile_detection(cropped_img_np)

        # 検出された牌のIDを抽出し、現在のプレイヤーゾーンのリストに追加
        current_zone_tiles = []
        for rd in detection_results:
            # tile_detection が既に信頼度フィルタリングを行っているため、ここでは再チェックは不要
            converted_tile = tile_convert[rd["class_id"]]
            current_zone_tiles.append(converted_tile)
        
        # 該当するプレイヤーゾーンのリストに牌を追加し、ソート
        discard_by_player_zone[player_zone_actual_key] = sorted(current_zone_tiles)

    return discard_by_player_zone

def hand_detection(hand_image_np: np.ndarray) -> list:
    """手牌の画像から手牌を検出し、その種類（ID）のリストを返します。

    検出された牌の中から、一定の信頼度閾値（0.5）を超えるもののみを採用し、
    牌IDに変換してリストとして返します。

    Args:
        hand_image_np (np.ndarray): 手牌の画像データ (NumPy配列)。

    Returns:
        list: 検出された手牌のIDのリスト（昇順にソートされます）。
                検出されなかった場合は空のリストを返します。
    """
    result_array = []
    detection_results = tile_detection(hand_image_np)

    # class_idのみ配列に格納する
    for r in detection_results:
        converted_tile = tile_convert[r["class_id"]]
        result_array.append(converted_tile)
    
    return sorted(result_array)


def analyze_mahjong_board(
    board_image_np: np.ndarray, 
    hand_image_np: np.ndarray   
) -> dict:
    """麻雀の盤面と手牌のNumPy配列を受け取り、現在の局面情報を辞書形式で返します。

    この関数は、与えられた画像（NumPy配列）から手牌、鳴き牌、ドラ表示牌、捨て牌を検出し、
    それらから巡目数を計算し、結果を構造化された辞書として返します。
    盤面画像 (board_image_np) が空の場合は、盤面に関する処理はスキップし、
    手牌 (hand_tiles) の情報のみを返します。手牌画像 (hand_image_np) は必ず入力される前提です。

    Args:
        board_image_np (np.ndarray): 盤面全体の画像データ (NumPy配列)。空のNumPy配列も許容。
        hand_image_np (np.ndarray): 手牌の画像データ (NumPy配列)。必ず有効なNumPy配列が入力されます。

    Returns:
        tuple [dict, dict]: 解析結果を格納した2つの辞書のタプル。
            最初の辞書 (`result`) は詳細な捨て牌情報を含みます。
            二番目の辞書 (`result_simple`) は捨て牌情報が簡略化されています。

            result (dict):
                - "turn" (int): 現在の巡目数。
                - "dora_indicators" (list[int]): ドラ表示牌のIDリスト。
                - "hand_tiles" (list[int]): 手牌のIDリスト。
                - "melded_blocks" (list[int]): 鳴き牌のIDリスト。
                - "discard_tiles" (dict): 捨て牌の辞書。
                                        キー: 'discard_tiles_bottom', 'discard_tiles_right',
                                                'discard_tiles_top', 'discard_tiles_left' (各プレイヤーの捨て牌リスト)
                                        値: 各プレイヤーの捨て牌IDのリスト (list[int])。

            result_simple (dict):
                - "turn" (int): 現在の巡目数。
                - "dora_indicators" (list[int]): ドラ表示牌のIDリスト。
                - "hand_tiles" (list[int]): 手牌のIDリスト。
                - "melded_blocks" (list[int]): 鳴き牌のIDリスト。
                - "discard_tiles" (list[int]): 全ての捨て牌IDをまとめたリスト (ソート済み)。

            エラーが発生した場合は、`hand_tiles`以外の項目は初期値（空リストや1）の辞書が返されます。
    """
    
    # hand_image_np は必ず入力される前提だが、念のためチェック
    if hand_image_np is None or hand_image_np.size == 0:
        print("【エラー】analyze_mahjong_board: 入力された手牌画像 (NumPy配列) が空または不正です。")
        return {}

    # board_image_np が空かどうかの判定
    is_board_image_empty = (board_image_np is None or board_image_np.size == 0)

    # 1. 手牌の検出は常に行う
    hand_tiles = hand_detection(hand_image_np)

    # 盤面関連の変数を初期化
    melded_blocks = []
    dora_indicators = []
    discard_tiles_by_zone = {
        "discard_tiles_bottom": [],
        "discard_tiles_right": [],
        "discard_tiles_top": [],
        "discard_tiles_left": []
    }
    turn = 1 # 捨て牌がない（盤面検出しない）場合は1巡目とする

    if not is_board_image_empty:
        # board_image_np が有効な場合のみ、盤面関連の検出を行う
        try:
            melded_blocks = open_detection(board_image_np)
            dora_indicators = dora_detection(board_image_np)
            discard_tiles_by_zone = discard_detection(board_image_np) # discard_detection内にcv2.imshowが含まれる

            # 巡目数の計算 (全てのプレイヤーの捨て牌の合計枚数)
            total_discards = 0
            for zone_key in discard_tiles_by_zone:
                total_discards += len(discard_tiles_by_zone[zone_key])
            
            turn = turn_calculation(total_discards)

        except Exception as e:
            print(f"【エラー】analyze_mahjong_board: 盤面処理中に予期せぬエラーが発生しました: {e}")
            # 盤面処理でエラーが発生しても、hand_tilesは返す
            # その他の盤面関連は初期値のままとなる
    else:
        print("【情報】analyze_mahjong_board: 盤面画像が空のため、盤面に関する検出はスキップされました。")


    # 3. 結果の構築
    result = {
        "turn": turn,
        "dora_indicators": dora_indicators,
        "hand_tiles": hand_tiles,
        "melded_blocks": melded_blocks,
        "discard_tiles": discard_tiles_by_zone, 
    }

    # 全ての捨て牌をまとめる
    discard_tiles = []
    for dd in discard_tiles_by_zone.values():
        discard_tiles += dd
    simple_discard_tiles = sorted(discard_tiles)
    
    result_simple = {
        "turn": turn,
        "dora_indicators": dora_indicators,
        "hand_tiles": hand_tiles,
        "melded_blocks": melded_blocks,
        "discard_tiles": simple_discard_tiles,
    }

    return result, result_simple


# メイン関数（テスト用）
if __name__ == '__main__':
    # テスト用画像パス（コード内に直接記述）
    BOARD_IMAGE_PATH_TEST = "test_mahjong.jpg"
    HAND_IMAGE_PATH_TEST = "test_mahjong_tehai_1.jpg"

    # --- ケース1: 盤面画像も手牌画像も存在する場合 ---
    print("\n--- テストケース1: 盤面画像も手牌画像も存在する場合 ---")
    board_image_np_test_full = None
    hand_image_np_test_full = None

    if not os.path.exists(BOARD_IMAGE_PATH_TEST):
        print(f"【エラー】BOARD_IMAGE_PATH_TEST: '{BOARD_IMAGE_PATH_TEST}' が見つかりません。")
    else:
        board_image_np_test_full = cv2.imread(BOARD_IMAGE_PATH_TEST)
        if board_image_np_test_full is None:
            print(f"【エラー】テスト用盤面画像 '{BOARD_IMAGE_PATH_TEST}' の読み込みに失敗しました。")

    if not os.path.exists(HAND_IMAGE_PATH_TEST):
        print(f"【エラー】HAND_IMAGE_PATH_TEST: '{HAND_IMAGE_PATH_TEST}' が見つかりません。")
    else:
        hand_image_np_test_full = cv2.imread(HAND_IMAGE_PATH_TEST)
        if hand_image_np_test_full is None:
            print(f"【エラー】テスト用手牌画像 '{HAND_IMAGE_PATH_TEST}' の読み込みに失敗しました。")
    
    if board_image_np_test_full is not None and hand_image_np_test_full is not None:
        analysis_result_full = analyze_mahjong_board(board_image_np_test_full, hand_image_np_test_full)
        print(analysis_result_full)
    else:
        print("テストケース1を実行できませんでした。画像ファイルを確認してください。")

    # --- ケース2: 盤面画像が空のNumPy配列の場合 (手牌画像は存在する) ---
    print("\n--- テストケース2: 盤面画像が空のNumPy配列の場合 (手牌画像は存在する) ---")
    board_image_np_test_empty = np.array([]) # 空のNumPy配列
    hand_image_np_test_only_hand = None

    if not os.path.exists(HAND_IMAGE_PATH_TEST):
        print(f"【エラー】HAND_IMAGE_PATH_TEST: '{HAND_IMAGE_PATH_TEST}' が見つかりません。")
    else:
        hand_image_np_test_only_hand = cv2.imread(HAND_IMAGE_PATH_TEST)
        if hand_image_np_test_only_hand is None:
            print(f"【エラー】テスト用手牌画像 '{HAND_IMAGE_PATH_TEST}' の読み込みに失敗しました。")
    
    if hand_image_np_test_only_hand is not None:
        analysis_result_only_hand = analyze_mahjong_board(board_image_np_test_empty, hand_image_np_test_only_hand)
        print(analysis_result_only_hand)
    else:
        print("テストケース2を実行できませんでした。手牌ファイルを確認してください。")