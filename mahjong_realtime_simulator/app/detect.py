# detect.py
# 画像から手牌、盤面の情報を取得する

import requests
import cv2
import numpy as np
import math
import os
from dotenv import load_dotenv
import re

# .env ファイルの読み込み
load_dotenv()

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
    34: 17, # 九筒
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
    APIキー、エンドポイントURL、検出閾値、画像リサイズ設定は環境変数から取得されます。
    API送信前に画像の最大辺が指定された寸法になるようにリサイズされます。

    Args:
        image_np (np.ndarray): 検出対象の画像データ (NumPy配列)。

    Returns:
        list: 検出された牌のリスト。各要素は
            {"confidence": float, "class_id": int, "x": float, "y": float, "width": float, "height": float}
            の辞書です。

    Raises:
        ValueError: Roboflow APIの設定エラー、画像エンコード失敗、
                    またはRoboflow APIからのエラーレスポンス（ステータスコードと具体的なメッセージを含む）。
        requests.exceptions.RequestException: ネットワークレベルのエラーが発生した場合。
    """
    # Roboflow APIの設定
    API_KEY = os.getenv("ROBOFLOW_API_KEY")
    BASE_URL = os.getenv("ROBOFLOW_BASE_URL")

    # 検出閾値
    CONFIDENCE_THRESHOLD = float(os.getenv("ROBOFLOW_CONFIDENCE", 0.6))
    OVERLAP_THRESHOLD = float(os.getenv("ROBOFLOW_OVERLAP", 0.5))

    # APIに送信する画像の最大辺の長さ（ピクセル）。0の場合、リサイズしない。
    API_MAX_IMAGE_DIMENSION = int(os.getenv("ROBOFLOW_MAX_IMAGE_DIMENSION", 0))

    # 環境変数が読み込めなかった場合
    if not API_KEY or not BASE_URL:
        raise ValueError("Roboflow API key or base URL is not set in environment variables.")

    # NumPy配列の有効性チェック (手牌以外の検出でも利用されるため残す)
    if not isinstance(image_np, np.ndarray) or image_np.size == 0:
        raise ValueError("Input image_np is not a valid NumPy array or is empty.")

    # API送信前に画像をリサイズ
    processed_image_np = image_np.copy()
    if API_MAX_IMAGE_DIMENSION > 0:
        h, w = processed_image_np.shape[:2]
        if max(h, w) > API_MAX_IMAGE_DIMENSION:
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

    # NumPy配列をJPEGバイトデータにエンコード
    is_success, encoded_image = cv2.imencode(".jpg", processed_image_np)
    if not is_success:
        raise ValueError("Failed to encode image to JPEG format for API submission.")

    # APIへ画像を送信
    files = {"file": ("image.jpg", encoded_image.tobytes(), "image/jpeg")}
    response = requests.post(url, files=files)

    # レスポンスの処理（検出処理）
    if response.status_code == 200:
        result = response.json()
        result_array = []

        # リサイズが行われた場合、APIから返される座標はリサイズ後の画像に対するものなので、
        # 元の画像サイズに戻すためのスケールファクターを計算
        original_h, original_w = image_np.shape[:2]
        if API_MAX_IMAGE_DIMENSION > 0 and max(original_h, original_w) > API_MAX_IMAGE_DIMENSION:
            scale_factor = max(original_h, original_w) / max(processed_image_np.shape[:2])
        else:
            scale_factor = 1.0

        for pred in result["predictions"]:
            confidence = float(pred["confidence"])
            class_id = int(pred["class_id"])

            # 変換表に存在しないclass_idは無視 (モデルの出力が想定外のclass_idを返す可能性を考慮)
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
        # APIからの具体的なエラーメッセージを抽出
        api_error_message = "Unknown API error"
        try:
            error_json = response.json()
            if "message" in error_json:
                api_error_message = error_json["message"]
            elif "error" in error_json: # エラーレスポンスによっては "error" キーの場合もある
                api_error_message = error_json["error"]
        except requests.exceptions.JSONDecodeError:
            # JSON形式でない場合はレスポンステキストをそのまま使用
            api_error_message = response.text

        # エラータイプ、ステータスコード、メッセージを簡潔に含むValueErrorを発生
        raise ValueError(f"Roboflow API error (status {response.status_code}): {api_error_message}")


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
            の辞書です。

    Raises:
        ValueError: `tile_detection` からエラーが伝播した場合。
    """
    all_raw_results = []

    # 0度 (オリジナル) での検出
    results_0_deg = tile_detection(image_np)
    for r in results_0_deg:
        if r["confidence"] >= confidence_threshold:
            all_raw_results.append(r)

    # 90度回転して検出
    rotated_image_90 = np.rot90(image_np)
    results_90_deg = tile_detection(rotated_image_90)
    for r in results_90_deg:
        if r["confidence"] >= confidence_threshold:
            all_raw_results.append(r)

    # -90度回転 (270度) して検出
    rotated_image_neg90 = np.rot90(image_np, k=-1)
    results_neg90_deg = tile_detection(rotated_image_neg90)
    for r in results_neg90_deg:
        if r["confidence"] >= confidence_threshold:
            all_raw_results.append(r)

    return all_raw_results


def turn_calculation(total_discards: int) -> int:
    """捨て牌の総数から現在の巡目数を計算します。

    Args:
        total_discards (int): 捨て牌の総数。

    Returns:
        int: 現在の巡目数 (1巡目から開始)。
            捨て牌が0枚の場合は1巡目と見なされます。
    """
    if total_discards <= 0:
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

    Raises:
        ValueError: `crop_dora_detection.main` から無効な画像が返された場合、
                    またはその後の牌検出中にエラーが発生した場合。
    """
    # crop_dora_detection.main(board_image_np) は、NumPy配列を受け取り、
    # ドラ表示牌の領域をNumPy配列として返す
    cropped_dora_np = crop_dora_detection.main(board_image_np)

    # 切り出し画像が有効であることを確認
    if not isinstance(cropped_dora_np, np.ndarray) or cropped_dora_np.size == 0:
        raise ValueError("Cropped dora indicator image is not a valid NumPy array or is empty.")

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

    Raises:
        ValueError: `crop_open_detection.main` から無効な結果が返された場合、
                    リスト内の個々の画像が無効な場合、
                    またはその後の牌検出中にエラーが発生した場合。
    """
    # crop_open_detection.main(board_image_np) は、NumPy配列のリストを返す
    cropped_naki_image_list = crop_open_detection.main(board_image_np)

    all_melded_sets_structured = [] # 各鳴きセットごとの牌リストを格納する

    if not isinstance(cropped_naki_image_list, list):
        raise ValueError("Cropped open detection result is not in list format.")

    # リストが空の場合は、鳴き牌がなかったということで正常終了
    if not cropped_naki_image_list:
        return []

    # 各切り出し画像 (鳴き牌の塊ごと) に対して検出処理を実行
    for i, cropped_naki_single_np in enumerate(cropped_naki_image_list):
        # 個々の切り出し画像が有効であることを確認
        if not isinstance(cropped_naki_single_np, np.ndarray) or cropped_naki_single_np.size == 0:
            raise ValueError(f"Cropped open detection image (index {i}) is not a valid NumPy array or is empty.")

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

    return all_melded_sets_structured


def discard_detection(board_image_np: np.ndarray) -> dict:
    """盤面画像から捨て牌を検出し、プレイヤーゾーン別に分類したリストを返します。

    `crop_discard_detection.py` を使用して各プレイヤーの捨て牌領域を個別に切り出し、
    それぞれの切り出し画像に対して牌認識を行います。

    Args:
        board_image_np (np.ndarray): 盤面全体の画像データ (NumPy配列)。

    Returns:
        dict: 検出された捨て牌の辞書。キーはプレイヤーゾーン（'discard_tiles_bottom', 'discard_tiles_right',
                'discard_tiles_top', 'discard_tiles_left'）で、値はそのプレイヤーの捨て牌IDのリスト。
                例: {"discard_tiles_bottom": [1, 2, 3], "discard_tiles_top": [10, 11], ...}。

    Raises:
        ValueError: `crop_discard_detection.main` から無効な結果が返された場合、
                    辞書内の個々の画像が無効な場合、
                    またはその後の牌検出中にエラーが発生した場合。
    """
    # crop_discard_detection.main から各プレイヤーの切り出し画像を取得
    # これが {'bottom': img_np, 'right': img_np, 'top': img_np, 'left': img_np} の形式で返される
    cropped_discard_areas_dict = crop_discard_detection.main(board_image_np)

    # プレイヤーゾーンごとの捨て牌リストを初期化
    discard_by_player_zone = {
        "discard_tiles_bottom": [],  # 自分（画面下部）
        "discard_tiles_right": [],   # 下家（画面右側）
        "discard_tiles_top": [],     # 対面（画面上部）
        "discard_tiles_left": []     # 上家（画面左側）
    }

    if not isinstance(cropped_discard_areas_dict, dict):
        raise ValueError("Cropped discard detection result is not in dictionary format.")

    # 辞書が空の場合は、捨て牌がなかったということで正常終了
    if not cropped_discard_areas_dict:
        return discard_by_player_zone

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
            # 想定外のキーがあればエラー
            raise ValueError(f"Unknown discard detection key '{crop_key}' detected from crop_discard_detection.")

        # 切り出し画像が有効であることを確認
        if not isinstance(cropped_img_np, np.ndarray) or cropped_img_np.size == 0:
            raise ValueError(f"Cropped discard image for '{crop_key}' is not a valid NumPy array or is empty.")

        # 上家, 下家の場合は画像を90度回転して検出 (tile_detection は既に内部で環境変数から読み込んだ信頼度閾値でフィルタリングを行う)
        current_img_for_detection = cropped_img_np
        if player_zone_actual_key in ["discard_tiles_right", "discard_tiles_left"]:
            current_img_for_detection = np.rot90(cropped_img_np)

        detection_results = tile_detection(current_img_for_detection)

        # 検出された牌のIDを抽出し、現在のプレイヤーゾーンのリストに追加
        current_zone_tiles = []
        for rd in detection_results:
            converted_tile = tile_convert[rd["class_id"]]
            current_zone_tiles.append(converted_tile)

        # 該当するプレイヤーゾーンのリストに牌を追加し、ソート
        discard_by_player_zone[player_zone_actual_key] = sorted(current_zone_tiles)

    return discard_by_player_zone

def hand_detection(hand_image_np: np.ndarray) -> list:
    """手牌の画像から手牌を検出し、その種類（ID）のリストを返します。

    検出された牌の中から、一定の信頼度閾値を超えるもののみを採用し、
    牌IDに変換してリストとして返します。

    Args:
        hand_image_np (np.ndarray): 手牌の画像データ (NumPy配列)。

    Returns:
        list: 検出された手牌のIDのリスト（昇順にソートされます）。

    Raises:
        ValueError: 牌検出中にエラーが発生した場合。
    """
    result_array = []
    # tile_detectionは内部で環境変数から読み込んだ信頼度閾値でフィルタリングを行います
    detection_results = tile_detection(hand_image_np)

    # class_idのみ配列に格納する
    for r in detection_results:
        converted_tile = tile_convert[r["class_id"]]
        result_array.append(converted_tile)

    return sorted(result_array)


def analyze_mahjong_board(
    board_image_np: np.ndarray,
    hand_image_np: np.ndarray
) -> tuple[dict, dict] | dict:
    """麻雀の盤面と手牌のNumPy配列を受け取り、現在の局面情報を辞書形式で返します。

    この関数は、与えられた画像（NumPy配列）から手牌、鳴き牌、ドラ表示牌、捨て牌を検出し、
    それらから巡目数を計算し、結果を構造化された辞書として返します。
    盤面画像 (board_image_np) が空のNumPy配列の場合は、盤面に関する処理はスキップし、
    手牌 (hand_tiles) の情報のみを返します。
    手牌画像は常に有効なNumPy配列として与えられることが前提とされます。

    Args:
        board_image_np (np.ndarray): 盤面全体の画像データ (NumPy配列)。空のNumPy配列も許容。
        hand_image_np (np.ndarray): 手牌の画像データ (NumPy配列)。有効なNumPy配列が保証される。

    Returns:
        tuple[dict, dict]: 解析結果を格納した2つの辞書のタプル (成功時)。
            最初の辞書 (`result`) は詳細な捨て牌情報を含みます。
            二番目の辞書 (`result_simple`) は捨て牌情報が簡略化されています。

            result (dict):
                - "turn" (int): 現在の巡目数。
                - "dora_indicators" (list[int]): ドラ表示牌のIDリスト。
                - "hand_tiles" (list[int]): 手牌のIDリスト。
                - "melded_blocks" (list[list[int]]): 鳴き牌のIDリストのリスト。
                - "discard_tiles" (dict): 捨て牌の辞書。
                                        キー: 'discard_tiles_bottom', 'discard_tiles_right',
                                                'discard_tiles_top', 'discard_tiles_left' (各プレイヤーの捨て牌リスト)
                                        値: 各プレイヤーの捨て牌IDのリスト (list[int])。

            result_simple (dict):
                - "turn" (int): 現在の巡目数。
                - "dora_indicators" (list[int]): ドラ表示牌のIDリスト。
                - "hand_tiles" (list[int]): 手牌のIDリスト。
                - "melded_blocks" (list[list[int]]): 鳴き牌のIDリストのリスト。
                - "discard_tiles" (list[int]): 全ての捨て牌IDをまとめたリスト (ソート済み)。

        dict: エラーが発生した場合は、`{'message': str, 'status': int}` 形式の辞書を返します。
    """
    try:
        is_board_image_empty = (board_image_np is None or board_image_np.size == 0)
        # is_hand_image_empty のチェックは前提条件により不要

        # 1. 手牌の検出は常に行う (手牌画像は有効であることが保証されているため、直接処理)
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
            melded_blocks = open_detection(board_image_np)
            dora_indicators = dora_detection(board_image_np)
            discard_tiles_by_zone = discard_detection(board_image_np)

            # 巡目数の計算 (全てのプレイヤーの捨て牌の合計枚数)
            total_discards = 0
            for zone_key in discard_tiles_by_zone:
                total_discards += len(discard_tiles_by_zone[zone_key])

            turn = turn_calculation(total_discards)
        else:
            # 盤面画像が空で検出をスキップした場合
            pass


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

        return {'message': 'Detection successful!', 'status': 200, 'result': result, 'result_simple': result_simple}

    except ValueError as e:
        # ValueError を捕捉し、メッセージ内容に基づいてステータスコードと簡潔なメッセージを決定
        raw_message = str(e)
        status_code = 500 # デフォルトはInternal Server Error
        display_message = "An internal processing error occurred." # デフォルトの表示メッセージ

        # Roboflow API関連のエラーメッセージを解析
        if raw_message.startswith("Roboflow API error (status"):
            match = re.search(r"status (\d{3})\): (.*)", raw_message)
            if match:
                api_status_code = int(match.group(1))
                api_detail_message = match.group(2)
                status_code = api_status_code # Roboflowからのステータスコードをそのまま利用
                display_message = f"Roboflow API error: {api_detail_message}"
            else:
                # パースに失敗した場合もRoboflowエラーとしてマーク
                status_code = 502 # Bad Gateway
                display_message = f"Roboflow API error: Failed to parse API response. Raw: {raw_message}"

        # その他の特定のValueErrorメッセージ
        elif "Roboflow API key or base URL is not set" in raw_message:
            status_code = 400
            display_message = "Configuration error: Roboflow API key or base URL is not set."
        elif "Failed to encode image" in raw_message:
            status_code = 400
            display_message = "Image processing error: Failed to encode image for API submission."
        elif "not a valid NumPy array or is empty" in raw_message:
            status_code = 400
            # このエラーは主にcrop_xxx_detectionの結果が空だった場合に発生すると想定される
            display_message = f"Input data error: One of the image inputs or cropped regions is invalid or empty. Detail: {raw_message}"
        elif "detection result is not in list format" in raw_message or \
            "detection result is not in dictionary format" in raw_message or \
            "Unknown discard detection key" in raw_message:
            status_code = 400
            display_message = f"Internal data consistency error from cropping modules: {raw_message}"
        else:
            # その他の未分類のValueError
            display_message = f"Processing error: {raw_message}"


        return {'message': display_message, 'status': status_code}
    except requests.exceptions.RequestException as e:
        # ネットワーク関連のエラー
        return {'message': f"Network Error: Failed to connect to Roboflow API. Detail: {e}", 'status': 503}
    except Exception as e:
        # その他の予期せぬエラー
        return {'message': f"An unexpected internal error occurred: {type(e).__name__}: {e}", 'status': 500}


# メイン関数（テスト用）
if __name__ == '__main__':

    # テスト用画像パス
    BOARD_IMAGE_PATH_TEST = "test_mahjong.jpg"
    HAND_IMAGE_PATH_TEST = "test_mahjong_tehai_1.jpg"

    # 画像を読み込む
    # ファイルが存在しない、または読み込み失敗の場合、cv2.imreadはNoneを返す
    # analyze_mahjong_boardはNumPy配列を期待するため、Noneの場合は空の配列を渡す
    board_image_np = cv2.imread(BOARD_IMAGE_PATH_TEST)
    if board_image_np is None:
        board_image_np = np.array([]) # 盤面画像がない場合は空のNumPy配列を使用

    hand_image_np = cv2.imread(HAND_IMAGE_PATH_TEST)
    if hand_image_np is None:
        # 手牌画像がない場合は処理できないため、最低限でも終了させる
        print(f"Error: Hand image '{HAND_IMAGE_PATH_TEST}' not found or could not be loaded. Exiting.")
        exit(1)

    # 解析を実行し、結果を出力
    analysis_result = analyze_mahjong_board(board_image_np, hand_image_np)
    print(analysis_result)