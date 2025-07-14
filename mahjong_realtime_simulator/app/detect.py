# detect.py
# 画像から手牌、盤面の情報を取得する

import cv2
import numpy as np
import math
import os
from ultralytics import YOLO    # YOLOv8のライブラリ
from django.conf import settings

# ローカルモデルのパスを指定
LOCAL_YOLO_MODEL_PATH = os.path.join(settings.PT_ROOT, "best.pt")

# 検出閾値（YOLOv8の推論時に指定）
DETECTION_CONFIDENCE_THRESHOLD = 0.6

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

# グローバル変数としてYOLOモデルをロードしておく
_yolo_model = None

def _load_yolo_model():
    """指定されたパスからYOLOv8モデルをロードし、グローバル変数に格納する。"""
    global _yolo_model
    if _yolo_model is None:
        if not os.path.exists(LOCAL_YOLO_MODEL_PATH):
            raise FileNotFoundError(f"YOLO model not found at: {LOCAL_YOLO_MODEL_PATH}. Please ensure the path is correct.")
        try:
            _yolo_model = YOLO(LOCAL_YOLO_MODEL_PATH)
        except Exception as e:
            raise RuntimeError(f"Failed to load YOLO model from {LOCAL_YOLO_MODEL_PATH}: {e}")
    return _yolo_model

# tile_detection関数をローカル推論用に置き換える
def tile_detection(image_np: np.ndarray) -> list:
    """画像内の麻雀牌をローカルのYOLOv8モデルで検出し、その座標情報を含めて返します。
    ローカルにロードされたYOLOv8モデルを使用して
    画像内の牌を検出し、検出された牌の種類、信頼度、およびバウンディングボックスの
    座標（x, y, width, height）をリストで返します。

    Args:
        image_np (np.ndarray): 検出対象の画像データ (NumPy配列)。

    Returns:
        list: 検出された牌のリスト。各要素は
            {"confidence": float, "class_id": int, "x": float, "y": float, "width": float, "height": float}
            の辞書です。

    Raises:
        ValueError: 入力画像が無効な場合、またはYOLOv8モデルの推論中にエラーが発生した場合。
    """
    # モデルがロードされているか確認し、ロードされていなければロードする
    try:
        model = _load_yolo_model()
    except (FileNotFoundError, RuntimeError) as e:
        # モデルロードに失敗した場合、ValueErrorを発生させる
        raise ValueError(f"Model loading failed: {e}") from e

    # NumPy配列の有効性チェック
    if not isinstance(image_np, np.ndarray) or image_np.size == 0:
        raise ValueError("Input image_np is not a valid NumPy array or is empty.")

    # YOLOv8モデルで推論を実行する
    # verbose=Falseで推論時のコンソール出力を抑制
    results = model.predict(source=image_np, conf=DETECTION_CONFIDENCE_THRESHOLD, verbose=False)

    detected_tiles = []

    # 推論結果の処理
    if results and len(results) > 0:
        result = results[0] # 各画像に対する検出結果
        
        # YOLOv8の検出結果から必要な情報を抽出する
        boxes = result.boxes
        
        for box in boxes:
            # バウンディングボックスの座標を Roboflow 形式 (center_x, center_y, width, height) に変換
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            center_x = (x1 + x2) / 2
            center_y = (y1 + y2) / 2
            width = x2 - x1
            height = y2 - y1

            confidence = float(box.conf[0]) # 信頼度
            class_id = int(box.cls[0]) # モデルが出力するクラスID

            # 変換表に存在しないclass_idは無視
            if class_id in tile_convert:
                detected_tiles.append({
                    "confidence": confidence,
                    "class_id": class_id,
                    "x": center_x, # center x
                    "y": center_y, # center y
                    "width": width, # width
                    "height": height # height
                })
    return detected_tiles


def _detect_tiles_with_rotations(image_np: np.ndarray, confidence_threshold: float = DETECTION_CONFIDENCE_THRESHOLD) -> list:
    """画像を様々な角度に回転させて牌を検出し、信頼度でフィルタリングした結果を統合して返します。

    このヘルパー関数は、特定の画像を元の向き、90度回転、-90度回転の3つの向きで
    `tile_detection` (ローカル推論版) にかけ、検出された牌の中から指定された信頼度閾値以上のものを集めます。
    これにより、牌の向きに依存しない検出精度向上を目指します。
    なお、回転後の座標変換はここでは行わず、検出結果の座標（回転後の画像基準）をそのまま返します。

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
    try:
        results_0_deg = tile_detection(image_np)
        for r in results_0_deg:
            if r["confidence"] >= confidence_threshold:
                all_raw_results.append(r)
    except ValueError as e:
        # モデルロード失敗などのエラーは、ここで警告を出す代わりに、
        # エラーが発生したことを把握したい場合はログを使用するなどの方法を取るべきです。
        # ここでは、エラーが発生しても処理を続行するため、何もせず次の処理に進みます。
        pass # 何もせず続行

    # 90度回転して検出
    rotated_image_90 = np.rot90(image_np)
    try:
        results_90_deg = tile_detection(rotated_image_90)
        for r in results_90_deg:
            if r["confidence"] >= confidence_threshold:
                all_raw_results.append(r)
    except ValueError as e:
        pass # 何もせず続行

    # -90度回転 (270度) して検出
    rotated_image_neg90 = np.rot90(image_np, k=-1)
    try:
        results_neg90_deg = tile_detection(rotated_image_neg90) 
        for r in results_neg90_deg:
            if r["confidence"] >= confidence_threshold:
                all_raw_results.append(r)
    except ValueError as e:
        pass # 何もせず続行

    # 検出された牌が重複する可能性があるため、必要に応じて後処理を追加する必要がある。
    # 例: IoUベースでの重複排除など。
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
        ValueError: `crop_dora_main` から無効な画像が返された場合、
                    またはその後の牌検出中にエラーが発生した場合。
    """
    # クロップモジュールのインポート方法を調整（相対/絶対インポートの試行）
    try:
        from .crop_dora_detection import crop_dora_main
    except ImportError:
        try:
            import crop_dora_detection
            crop_dora_main = crop_dora_detection.crop_dora_main
        except ImportError:
            raise ImportError("Could not import 'crop_dora_detection'. Ensure it is in the same directory or accessible via PYTHONPATH.")

    cropped_dora_np = crop_dora_main(board_image_np)

    # 切り出し画像が有効であることを確認
    if not isinstance(cropped_dora_np, np.ndarray) or cropped_dora_np.size == 0:
        # ドラ表示牌が見つからなかった場合は空リストを返す
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

    Raises:
        ValueError: `crop_open_main` から無効な結果が返された場合、
                    リスト内の個々の画像が無効な場合、
                    またはその後の牌検出中にエラーが発生した場合。
    """
    # クロップモジュールのインポート方法を調整（相対/絶対インポートの試行）
    try:
        from .crop_open_detection import crop_open_main
    except ImportError:
        try:
            import crop_open_detection
            crop_open_main = crop_open_detection.crop_open_main
        except ImportError:
            raise ImportError("Could not import 'crop_open_detection'. Ensure it is in the same directory or accessible via PYTHONPATH.")

    cropped_naki_image_list = crop_open_main(board_image_np)

    all_melded_sets_structured = [] # 各鳴きセットごとの牌リストを格納する

    if not isinstance(cropped_naki_image_list, list):
        # 鳴き牌が検出されなかった場合、空リストが返る
        return []

    # リストが空の場合は、鳴き牌がなかったということで正常終了
    if not cropped_naki_image_list:
        return []

    # 各切り出し画像 (鳴き牌の塊ごと) に対して検出処理を実行
    for i, cropped_naki_single_np in enumerate(cropped_naki_image_list):
        # 個々の切り出し画像が有効であることを確認
        if not isinstance(cropped_naki_single_np, np.ndarray) or cropped_naki_single_np.size == 0:
            # 無効な切り出し画像があった場合、何もせずスキップするのが最もクリーン
            pass # 何もせずスキップ
            # continue
            # raise ValueError(f"Cropped open detection image (index {i}) is not a valid NumPy array or is empty.")

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
        ValueError: `crop_discard_main` から無効な結果が返された場合、
                    辞書内の個々の画像が無効な場合、
                    またはその後の牌検出中にエラーが発生した場合。
    """
    # クロップモジュールのインポート方法を調整（相対/絶対インポートの試行）
    try:
        from .crop_discard_detection import crop_discard_main
    except ImportError:
        try:
            import crop_discard_detection
            crop_discard_main = crop_discard_detection.crop_discard_main
        except ImportError:
            raise ImportError("Could not import 'crop_discard_detection'. Ensure it is in the same directory or accessible via PYTHONPATH.")

    # crop_discard_main から各プレイヤーの切り出し画像を取得
    cropped_discard_areas_dict = crop_discard_main(board_image_np)

    # プレイヤーゾーンごとの捨て牌リストを初期化
    discard_by_player_zone = {
        "discard_tiles_bottom": [],  # 自分（画面下部）
        "discard_tiles_right": [],   # 下家（画面右側）
        "discard_tiles_top": [],     # 対面（画面上部）
        "discard_tiles_left": []     # 上家（画面左側）
    }

    # クロップ処理からの返り値が辞書でない場合にエラーを発生させるのではなく、空の辞書を返すように変更
    if not isinstance(cropped_discard_areas_dict, dict):
        return discard_by_player_zone # 空の辞書を返して処理を続行
        # raise ValueError("Cropped discard detection result is not in dictionary format.")

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
            # 未知のキーが見つかった場合、何もせずスキップするのが最もクリーン
            pass # 何もせずスキップ
            # continue
            # raise ValueError(f"Unknown discard detection key '{crop_key}' detected from crop_discard_detection.")

        # 切り出し画像が有効であることを確認
        if not isinstance(cropped_img_np, np.ndarray) or cropped_img_np.size == 0:
            # 空の切り出し画像の場合、そのプレイヤーの捨て牌はないとみなし、スキップする
            continue # スキップして次のゾーンへ

        # 上家、下家の場合は画像を90度回転して検出
        current_img_for_detection = cropped_img_np
        if player_zone_actual_key in ["discard_tiles_right", "discard_tiles_left"]:
            current_img_for_detection = np.rot90(cropped_img_np)

        # ローカルモデルで牌検出を実行
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
    # tile_detection はローカル推論版になったため、そのまま呼び出す
    detection_results = tile_detection(hand_image_np)

    # class_idのみ配列に格納する
    result_array = []
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
    盤面画像 (board_image_np) が空のNumPy配列の場合は、盤面に関する処理はスキップし、
    手牌 (hand_tiles) の情報のみを返します。
    手牌画像は常に有効なNumPy配列として与えられることが前提とされます。

    Args:
        board_image_np (np.ndarray): 盤面全体の画像データ (NumPy配列)。空のNumPy配列も許容。
        hand_image_np (np.ndarray): 手牌の画像データ (NumPy配列)。有効なNumPy配列が保証される。

    Returns:
        dict: 解析結果を格納した辞書。
            成功時: {'message': str, 'status': int, 'result': dict, 'result_simple': dict}
            失敗時: {'message': str, 'status': int}

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
    """
    # YOLOモデルがロードできているか確認
    try:
        model = _load_yolo_model()
    except (FileNotFoundError, RuntimeError) as e:
        # モデルロード失敗時にはエラーメッセージを返して終了
        return {'message': f"Fatal: Model loading failed: {e}", 'status': 500}

    try:
        is_board_image_empty = (board_image_np is None or board_image_np.size == 0)
        
        # 手牌画像の有効性チェック
        if not isinstance(hand_image_np, np.ndarray) or hand_image_np.size == 0:
            # 無効な手牌画像の場合、エラーを返す
            return {'message': "Error: Invalid hand image provided.", 'status': 400}

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
            except (ValueError, ImportError) as e:
                # クロップモジュール等でエラーがあった場合、警告を表示して続行 
                pass # エラーを無視して続行
            
            try:
                dora_indicators = dora_detection(board_image_np)
            except (ValueError, ImportError) as e:
                pass # エラーを無視して続行

            try:
                discard_tiles_by_zone = discard_detection(board_image_np)
            except (ValueError, ImportError) as e:
                pass # エラーを無視して続行

            # 巡目数の計算 (全てのプレイヤーの捨て牌の合計枚数)
            total_discards = 0
            for zone_key in discard_tiles_by_zone:
                total_discards += len(discard_tiles_by_zone[zone_key])

            turn = turn_calculation(total_discards)
        # else:
            # 盤面画像が空で検出をスキップした場合、turn=1, 各リストは空のまま

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

    # 予期せぬエラーが発生した場合も、一貫した形式でエラーメッセージを返す
    except Exception as e:
        # もし、このexceptブロックに来るのは、モデルロード失敗以外の予期せぬエラーの場合
        # モデルロード失敗は、上のtry-exceptで先に処理されるので、ここではそれ以外の例外を扱う
        return {'message': f"An unexpected internal error occurred: {type(e).__name__}: {e}", 'status': 500}


# メイン関数（テスト用）
if __name__ == '__main__':

    # テスト用画像パス
    BOARD_IMAGE_PATH_TEST = "test_mahjong.jpg"
    HAND_IMAGE_PATH_TEST = "test_mahjong_tehai_1.jpg"

    # 画像を読み込む
    # cv2.imread が None を返した場合、警告を表示して空のNumPy配列にする
    board_image_np = cv2.imread(BOARD_IMAGE_PATH_TEST)
    if board_image_np is None:
        board_image_np = np.array([]) # 盤面画像がない場合は空のNumPy配列を使用

    hand_image_np = cv2.imread(HAND_IMAGE_PATH_TEST)
    if hand_image_np is None:
        exit(1)

    # analyze_mahjong_board 関数を実行して結果を表示する
    analysis_result = analyze_mahjong_board(board_image_np, hand_image_np)
    
    print(analysis_result)