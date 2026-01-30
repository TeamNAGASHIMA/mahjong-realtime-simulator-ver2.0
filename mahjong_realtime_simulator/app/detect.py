# detect.py
# 画像から手牌、盤面の情報を取得する

import cv2
import numpy as np
import math
import os
import onnxruntime as ort # onnxruntimeに変更
from django.conf import settings
from .meld_sep import melded_tiles_sep # meld_sep.pyからインポート
from .result_check import result_check_main # result_check.pyからインポート

# import detect_debug # デバッグ用モジュール


# ローカルモデルのパスを指定
LOCAL_YOLO_MODEL_PATH = os.path.join(settings.PT_ROOT, "yolov8-best-ver3-1.onnx") # onnxに変更
# LOCAL_YOLO_MODEL_PATH = os.path.join("yolov8-best-ver2.onnx")

# 検出閾値（YOLOv8の推論時に指定）
DETECTION_CONFIDENCE_THRESHOLD = 0.5
iou_threshold = 0.4

# YOLOv8の入力サイズ
INPUT_SHAPE = (640, 640)

# 牌種類変換表
tile_convert = {
    5: 18,  # 一索 (1s)
    3: 0,   # 一萬 (1m)
    4: 9,   # 一筒 (1p)
    9: 19,  # 二索 (2s)
    7: 1,   # 二萬 (2m)
    8: 10,  # 二筒 (2p)
    13: 20, # 三索 (3s)
    11: 2,  # 三萬 (3m)
    12: 11, # 三筒 (3p)
    17: 21, # 四索 (4s)
    15: 3,  # 四萬 (4m)
    16: 12, # 四筒 (4p)
    21: 22, # 五索 (5s)
    19: 4,  # 五萬 (5m)
    20: 13, # 五筒 (5p)
    25: 23, # 六索 (6s)
    23: 5,  # 六萬 (6m)
    24: 14, # 六筒 (6p)
    29: 24, # 七索 (7s)
    27: 6,  # 七萬 (7m)
    28: 15, # 七筒 (7p)
    33: 25, # 八索 (8s)
    31: 7,  # 八萬 (8m)
    32: 16, # 八筒 (8p)
    36: 26, # 九索 (9s)
    34: 8,  # 九萬 (9m)
    35: 17, # 九筒 (9p)
    6: 27, # 東 (1z)
    26: 32, # 發 (6z)
    18: 30, # 北 (4z)
    30: 33, # 中 (7z)
    10: 28, # 南 (2z)
    22: 31, # 白 (5z)
    14: 29, # 西 (3z)
    0: 34, # 5萬 (赤)
    1: 35, # 5筒 (赤)
    2: 36, # 5索 (赤)
}

# 赤ドラ用の新しいIDマッピングを追加 (旧コードはコメントアウト)
# red_dora_id_map = {
#     # YOLOのclass_id: 新しい麻雀牌ID
#     19: 34, # 5萬 (赤) (YOLOの5萬のIDが19)
#     20: 35, # 5筒 (赤) (YOLOの5筒のIDが20)
#     21: 36, # 5索 (赤) (YOLOの5索のIDが21)
# }


# グローバル変数としてONNXセッションを保持
_ort_session = None

def _load_yolo_model():
    """指定されたパスからYOLOv8モデルをロードし、グローバル変数に格納する。"""
    global _ort_session
    if _ort_session is None:
        if not os.path.exists(LOCAL_YOLO_MODEL_PATH):
            raise FileNotFoundError(f"YOLO model not found at: {LOCAL_YOLO_MODEL_PATH}. Please ensure the path is correct.")
        try:
            # GPUが使える場合はCUDA、使えない場合はCPUを使用する
            providers = ['CUDAExecutionProvider', 'CPUExecutionProvider']
            # 使用可能なプロバイダを確認して設定
            available_providers = ort.get_available_providers()
            if 'CUDAExecutionProvider' not in available_providers:
                providers = ['CPUExecutionProvider']

            _ort_session = ort.InferenceSession(LOCAL_YOLO_MODEL_PATH, providers=providers)
        except Exception as e:
            raise RuntimeError(f"Failed to load YOLO model from {LOCAL_YOLO_MODEL_PATH}: {e}")
    return _ort_session

def check_red_color_with_percentage(image_np: np.ndarray, red_pixel_threshold_percent=12) -> bool:
    """NumPy配列画像内の赤色の割合を計算し、しきい値以上ならTrueを返す関数。"""
    if image_np is None or image_np.size == 0:
        return False

    total_pixels = image_np.shape[0] * image_np.shape[1]
    if total_pixels == 0:
        return False

    hsv = cv2.cvtColor(image_np, cv2.COLOR_BGR2HSV)

    lower_red1 = np.array([0, 45, 45])
    upper_red1 = np.array([22, 255, 255])
    lower_red2 = np.array([155, 45, 45])
    upper_red2 = np.array([179, 255, 255])

    mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
    mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
    mask = mask1 + mask2

    red_pixels = cv2.countNonZero(mask)
    red_percentage = (red_pixels / total_pixels) * 100

    return red_percentage >= red_pixel_threshold_percent


def letterbox(img, new_shape=(640, 640), color=(114, 114, 114), auto=False, scaleFill=False, scaleup=True):
    """画像をアスペクト比を維持したままリサイズし、パディングを追加する（YOLOの前処理用）。"""
    shape = img.shape[:2] # 現在の形状 [高さ, 幅]
    if isinstance(new_shape, int):
        new_shape = (new_shape, new_shape)

    # スケール比を計算
    r = min(new_shape[0] / shape[0], new_shape[1] / shape[1])
    if not scaleup:  # 小さい画像のスケールアップを防止
        r = min(r, 1.0)

    # パディングを計算
    ratio = r, r 
    new_unpad = int(round(shape[1] * r)), int(round(shape[0] * r))
    dw, dh = new_shape[1] - new_unpad[0], new_shape[0] - new_unpad[1] 

    # 自動パディング調整
    if auto: 
        dw, dh = np.mod(dw, 32), np.mod(dh, 32)
    elif scaleFill:
        dw, dh = 0.0, 0.0
        new_unpad = (new_shape[1], new_shape[0])
        ratio = new_shape[1] / shape[1], new_shape[0] / shape[0]

    dw /= 2
    dh /= 2

    if shape[::-1] != new_unpad:
        img = cv2.resize(img, new_unpad, interpolation=cv2.INTER_LINEAR)

    top, bottom = int(round(dh - 0.1)), int(round(dh + 0.1))
    left, right = int(round(dw - 0.1)), int(round(dw + 0.1))
    img = cv2.copyMakeBorder(img, top, bottom, left, right, cv2.BORDER_CONSTANT, value=color) 
    return img, ratio, (dw, dh)


def preprocess_image(img):
    """画像をONNX Runtime入力用に前処理する"""
    # レターボックス処理（アスペクト比維持リサイズ）
    image, ratio, dwdh = letterbox(img, new_shape=INPUT_SHAPE, auto=False)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = image.transpose(2, 0, 1)
    image = np.expand_dims(image, axis=0)
    image = np.ascontiguousarray(image) # メモリを連続化（ONNX Runtimeの要件）
    
    # float32に変換し、0-1に正規化（YOLOv8の入力仕様）
    image = image.astype(np.float32)
    image /= 255.0
    
    return image, ratio, dwdh


# tile_detection関数をローカル推論用に置き換える
def tile_detection(image_np: np.ndarray, debug: bool = False) -> list:
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
        print(f"使用デバイス: {model.get_providers()[0]}")
    except (FileNotFoundError, RuntimeError) as e:
        # モデルロードに失敗した場合、ValueErrorを発生させる
        raise ValueError(f"Model loading failed: {e}") from e

    # NumPy配列の有効性チェック
    if not isinstance(image_np, np.ndarray) or image_np.size == 0:
        raise ValueError("Input image_np is not a valid NumPy array or is empty.")

    # チャンネル数が3であることを確認（BGR画像であること）
    if image_np.ndim != 3 or image_np.shape[2] != 3:
        raise ValueError("Input image_np must be a BGR image with 3 channels.")

    # 前処理
    input_tensor, ratio, (pad_w, pad_h) = preprocess_image(image_np)

    # 推論
    input_name = model.get_inputs()[0].name
    outputs = model.run(None, {input_name: input_tensor})

    prediction = outputs[0][0]
    prediction = prediction.transpose()

    # 検出結果の解析
    x = prediction[:, 0]
    y = prediction[:, 1]
    w = prediction[:, 2]
    h = prediction[:, 3]

    # クラススコア
    scores = prediction[:, 4:]

    # 最大スコアとクラスIDの取得
    max_scores = np.max(scores, axis=1)
    max_indices = np.argmax(scores, axis=1)

    # しきい値以上の検出をフィルタリング
    mask = max_scores >= DETECTION_CONFIDENCE_THRESHOLD

    filtered_x = x[mask]
    filtered_y = y[mask]
    filtered_w = w[mask]
    filtered_h = h[mask]
    filtered_scores = max_scores[mask]
    filtered_class_ids = max_indices[mask]

    # NMS用のボックスリストの作成
    nms_boxes = []
    nms_confidences = []
    nms_class_ids = []

    for i in range(len(filtered_scores)):
        cx = (filtered_x[i] - pad_w) / ratio[0]
        cy = (filtered_y[i] - pad_h) / ratio[1]
        width = filtered_w[i] / ratio[0]
        height = filtered_h[i] / ratio[1]

        # 左上座標に変換
        left = int(cx - width / 2)
        top = int(cy - height / 2)
        w_int = int(width)
        h_int = int(height)

        nms_boxes.append([left, top, w_int, h_int])
        nms_confidences.append(float(filtered_scores[i]))
        nms_class_ids.append(int(filtered_class_ids[i]))

    # NMS（非最大値抑制）を適用
    indices = cv2.dnn.NMSBoxes(nms_boxes, nms_confidences, DETECTION_CONFIDENCE_THRESHOLD, iou_threshold)

    detected_tiles = []

    # デバッグモードが有効な場合、画像に描画するためにコピーを作成
    if debug:
        debug_image = image_np.copy()

    # 推論結果の処理
    if len(indices) > 0:
        for i in indices.flatten():
            box = nms_boxes[i]
            confidence = round(nms_confidences[i], 2)
            class_id = nms_class_ids[i]
            
            x1, y1, width, height = box
            x2 = x1 + width
            y2 = y1 + height
            
            # 中心座標 (結果返却用)
            center_x = x1 + width / 2
            center_y = y1 + height / 2
            
            # 縦横比のチェック
            if width > height:
                orientation = "landscape"
            else:
                orientation = "portrait"

            # debug用に検出情報をコンソールに出力
            if debug:
                print(f"Detected tile - Class ID: {class_id}, Confidence: {confidence:.2f}, BBox: ({center_x:.1f}, {center_y:.1f}, {width:.1f}, {height:.1f})")

            # 変換表に存在しないclass_idは無視
            if class_id in tile_convert:
                converted_tile = tile_convert[class_id]
                
                # 5萬、5筒、5索の場合、赤ドラ判定を行う (旧コードはコメントアウト)
                # if class_id in [19, 20, 21]: 
                #     # バウンディングボックスを画像範囲内に収める
                #     img_h, img_w = image_np.shape[:2]
                #     clip_x1 = max(0, x1)
                #     clip_y1 = max(0, y1)
                #     clip_x2 = min(img_w, x2)
                #     clip_y2 = min(img_h, y2)
                    
                #     if clip_x2 > clip_x1 and clip_y2 > clip_y1:
                #         cropped_tile_image = image_np[int(clip_y1):int(clip_y2), int(clip_x1):int(clip_x2)]
                #         if check_red_color_with_percentage(cropped_tile_image):
                #             converted_tile = red_dora_id_map.get(class_id, tile_convert[class_id])

                detected_tiles.append({
                    "confidence": confidence,
                    "class_id": converted_tile,
                    "x": center_x,
                    "y": center_y,
                    "width": width,
                    "height": height,
                    "orientation": orientation
                })

                # デバッグモードで画像に描画
                if debug: 
                    # バウンディングボックスを描画
                    cv2.rectangle(debug_image, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2) 
                    
                    # ラベルと信頼度を描画
                    text = f"{class_id}: {confidence:.2f}" 
                    cv2.putText(debug_image, text, (int(x1), int(y1) - 10), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.25, (0, 255, 0), 1) 

    # デバッグモードがTrueの場合、検出後の画像を保存
    if debug and len(detected_tiles) > 0: # 何か検出された場合のみ保存 
        # 保存フォルダが存在しない場合は作成
        save_dir = "detected_images" 
        os.makedirs(save_dir, exist_ok=True) 

        # ファイル名の生成
        existing_files = [f for f in os.listdir(save_dir) if f.startswith("detected_image_") and f.endswith(".png")] 
        if not existing_files: 
            next_id = 1 
        else: 
            max_id = 0 
            for f in existing_files: 
                try: 
                    num_str = f.replace("detected_image_", "").replace(".png", "") 
                    max_id = max(max_id, int(num_str)) 
                except ValueError: 
                    continue # 数字でないファイル名は無視 
            next_id = max_id + 1 
        
        file_path = os.path.join(save_dir, f"detected_image_{next_id}.png") 
        cv2.imwrite(file_path, debug_image) 
        print(f"Detected image saved to {file_path}") 

    return detected_tiles


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

def extract_ids_and_confs(detetion_results: list) -> tuple:
    """検出結果リストからIDと信頼度のリストを抽出します。"""
    ids = []
    confs = []
    for res in detetion_results:
        ids.append(res["class_id"])
        confs.append(res["confidence"])
    return ids, confs


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
    all_raw_results = tile_detection(cropped_dora_np)

    # ID順にソート
    all_raw_results = sorted(all_raw_results, key=lambda r: r["x"])

    # IDと信頼度を分離
    return extract_ids_and_confs(all_raw_results)

def open_detection(board_image_np: np.ndarray) -> tuple:
    """盤面画像から鳴き牌を検出し、その種類（ID）のリストのリストを返します。

    `crop_open_detection.py` を使用して鳴き牌領域を切り出し、
    切り出された各鳴き牌の塊に対して牌検出を行います。
    検出された全ての牌を鳴きセットごとに構造化されたリストとして返します。

    Args:
        board_image_np (np.ndarray): 盤面全体の画像データ (NumPy配列)。

    Returns:
        dict: プレイヤーゾーンごとの鳴き牌セットの辞書。
                キーはプレイヤーゾーン名、値はそのプレイヤーの鳴きセットのリストのリスト。
                例: {"melded_tiles_bottom": [[1, 2, 3], [10, 10, 10]], ...}

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

    cropped_open_areas = crop_open_main(board_image_np)

    melded_tiles_by_player_zone = {
        "melded_tiles_bottom": [],  # 自分（画面下部）
        "melded_tiles_right": [],   # 下家（画面右側）
        "melded_tiles_top": [],     # 対面（画面上部）
        "melded_tiles_left": []     # 上家（画面左側）
    }
    melded_confs_by_player_zone = {
        "melded_tiles_bottom": [],  # 自分
        "melded_tiles_right": [],   # 下家
        "melded_tiles_top": [],     # 対面
        "melded_tiles_left": []     # 上家
    }

    player_map = {
        'bottom': 'melded_tiles_bottom',
        'right': 'melded_tiles_right',
        'top': 'melded_tiles_top',
        'left': 'melded_tiles_left'
    }

    for player_key, cropped_img in cropped_open_areas.items():

        result_key = player_map[player_key]

        if result_key is None:
            continue

        if cropped_img is None or cropped_img.size == 0:
            continue

        # 回転ロジックの追加
        if player_key == "right":
            cropped_img = np.rot90(cropped_img)
        elif player_key == "left":
            cropped_img = np.rot90(cropped_img, k=-1)
        elif player_key == "top":
            cropped_img = np.rot90(cropped_img, k=2)

        detection_results = tile_detection(cropped_img)

        # X座標でソート
        detection_results = sorted(detection_results, key=lambda r: r["x"])

        # 鳴き牌IDのリストを作成
        current_player_melded_ids = []
        current_player_confs = []

        for rd in detection_results:
            tile_id = rd["class_id"]
            if rd.get("orientation") == "landscape":
                tile_id += 100

            current_player_melded_ids.append(tile_id)
            current_player_confs.append(rd["confidence"])
        
        # 鳴き牌の分離処理を実行
        separated_ids, separated_confs = melded_tiles_sep(current_player_melded_ids, current_player_confs)

        melded_tiles_by_player_zone[result_key] = separated_ids
        melded_confs_by_player_zone[result_key] = separated_confs
    
    return melded_tiles_by_player_zone, melded_confs_by_player_zone


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

    # 信頼度用の辞書を初期化
    discard_confs_by_player_zone = {
        "discard_tiles_bottom": [],  # 自分（画面下部）
        "discard_tiles_right": [],   # 下家（画面右側）
        "discard_tiles_top": [],     # 対面（画面上部）
        "discard_tiles_left": []     # 上家（画面左側）
    }

    # クロップ処理からの返り値が辞書でない場合にエラーを発生させるのではなく、空の辞書を返すように変更
    if not isinstance(cropped_discard_areas_dict, dict):
        return discard_by_player_zone, discard_confs_by_player_zone

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
            continue

        if not isinstance(cropped_img_np, np.ndarray) or cropped_img_np.size == 0:
            continue

        # 上家、下家の場合は画像を90度回転して検出
        current_img_for_detection = cropped_img_np
        if player_zone_actual_key in ["discard_tiles_left"]:
            current_img_for_detection = np.rot90(cropped_img_np)
        
        if player_zone_actual_key in ["discard_tiles_right"]:
            current_img_for_detection = np.rot90(cropped_img_np, k=-1)

        if player_zone_actual_key in ["discard_tiles_top"]:
            current_img_for_detection = np.rot90(cropped_img_np, k=2)
        
        # ローカルモデルで牌検出を実行
        detection_results = tile_detection(current_img_for_detection)

        detection_results.sort(key=lambda r: r["y"])

        rows = []

        if detection_results:
            current_row = [detection_results[0]]
            # 隣り合う牌のY座標差が10以内なら同じ行とみなす
            Y_THRESHOLD = 10

            for i in range(1, len(detection_results)):
                if detection_results[i]["y"] - detection_results[i - 1]["y"] <= Y_THRESHOLD:
                    current_row.append(detection_results[i])
                else:
                    rows.append(current_row)
                    current_row = [detection_results[i]]
            rows.append(current_row)

        sorted_results = []
        for row in rows:
            row.sort(key=lambda r: r["x"])
            sorted_results.extend(row)

        # IDと信頼度を分離
        final_ids = []
        final_confs = []
        for rd in sorted_results:
            tile_id = rd["class_id"]
            if rd.get("orientation") == "landscape":
                tile_id += 100

            final_ids.append(tile_id)
            final_confs.append(rd["confidence"])

        discard_by_player_zone[player_zone_actual_key] = final_ids
        discard_confs_by_player_zone[player_zone_actual_key] = final_confs

    return discard_by_player_zone, discard_confs_by_player_zone

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

    # ID順にソート
    detection_results = sorted(detection_results, key=lambda r: r["x"])

    # 牌の枚数が15枚以上の場合は確信度の低い順に削除し、14枚にする
    if len(detection_results) > 14:
        # 確信度順にソートしてから切り取る
        sorted_results = sorted(detection_results, key=lambda r: r["confidence"], reverse=True)
        detection_results = sorted_results[:14]

    # IDと信頼度を分離
    return extract_ids_and_confs(detection_results)


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
                - "melded_tiles" (list[list[int]]): 鳴き牌のIDリストのリスト。
                - "discard_tiles" (dict): 捨て牌の辞書。
                                        キー: 'discard_tiles_bottom', 'discard_tiles_right',
                                                'discard_tiles_top', 'discard_tiles_left' (各プレイヤーの捨て牌リスト)
                                        値: 各プレイヤーの捨て牌IDのリスト (list[int])。

            result_simple (dict):
                - "turn" (int): 現在の巡目数。
                - "dora_indicators" (list[int]): ドラ表示牌のIDリスト。
                - "hand_tiles" (list[int]): 手牌のIDリスト。
                - "melded_tiles" (list[list[int]]): 鳴き牌のIDリストのリスト。
                - "discard_tiles" (list[int]): 全ての捨て牌IDをまとめたリスト (ソート済み)。
    """
    # YOLOモデルがロードできているか確認
    try:
        model = _load_yolo_model()
    except (FileNotFoundError, RuntimeError) as e:
        # モデルロード失敗時にはエラーメッセージを返して終了
        return {'message': f"Fatal: Model loading failed: {e}", 'status': 501}

    try:
        is_board_image_empty = (board_image_np is None or board_image_np.size == 0)
        
        # 手牌画像の有効性チェック
        if not isinstance(hand_image_np, np.ndarray) or hand_image_np.size == 0:
            # 無効な手牌画像の場合、エラーを返す
            return {'message': "Error: Invalid hand image provided.", 'status': 401}

        # 1. 手牌の検出は常に行う
        hand_tiles, hand_confs = hand_detection(hand_image_np)

        # 盤面関連の変数を初期化
        melded_tiles_by_zone = {
            "melded_tiles_bottom": [],  # 自分（画面下部）
            "melded_tiles_right": [],   # 下家（画面右側）
            "melded_tiles_top": [],     # 対面（画面上部）
            "melded_tiles_left": []     # 上家（画面左側）
        }
        melded_confs_by_zone = {k: [] for k in melded_tiles_by_zone.keys()}
        dora_indicators = []
        dora_confs = []
        discard_tiles_by_zone = {
            "discard_tiles_bottom": [],  # 自分（画面下部）
            "discard_tiles_right": [],   # 下家（画面右側）
            "discard_tiles_top": [],     # 対面（画面上部）
            "discard_tiles_left": []     # 上家（画面左側）
        }
        discard_confs_by_zone = {k: [] for k in discard_tiles_by_zone.keys()}
        turn = 1  # 巡目数の初期値

        if not is_board_image_empty:
            # board_image_np が有効な場合のみ、盤面関連の検出を行う
            try:
                melded_tiles_by_zone, melded_confs_by_zone = open_detection(board_image_np)
            except (ValueError, ImportError) as e:
                # クロップモジュール等でエラーがあった場合、警告を表示して続行 
                pass 
            
            try:
                dora_indicators, dora_confs = dora_detection(board_image_np)
            except (ValueError, ImportError) as e:
                pass 

            try:
                discard_tiles_by_zone, discard_confs_by_zone = discard_detection(board_image_np)
            except (ValueError, ImportError) as e:
                pass 

            # 巡目数の計算 (全てのプレイヤーの捨て牌の合計枚数)
            total_discards = 0
            for zone_key in discard_tiles_by_zone:
                total_discards += len(discard_tiles_by_zone[zone_key])

            turn = turn_calculation(total_discards)

        # 3. 結果の構築
        result = {
            "turn": turn,
            "dora_indicators": dora_indicators,
            "dora_confs": dora_confs,
            "hand_tiles": hand_tiles,
            "hand_confs": hand_confs,
            "melded_tiles": melded_tiles_by_zone,
            "melded_confs": melded_confs_by_zone,
            "discard_tiles": discard_tiles_by_zone,
            "discard_confs": discard_confs_by_zone,
        }

        result = result_check_main(result)

        # resultからconfsを除いて再構築
        result = {
            "turn": result["turn"],
            "dora_indicators": result["dora_indicators"],
            "hand_tiles": result["hand_tiles"],
            "melded_tiles": result["melded_tiles"],
            "discard_tiles": result["discard_tiles"],
        }

        melded_tiles_mine = melded_tiles_by_zone.get("melded_tiles_bottom", [])
        melded_tiles_other = melded_tiles_by_zone.get("melded_tiles_right", []) + \
                                melded_tiles_by_zone.get("melded_tiles_top", []) + \
                                melded_tiles_by_zone.get("melded_tiles_left", [])
        
        # 鳴き牌で100以上のIDを元に戻す
        melded_tiles_mine = [[tile_id % 100 if tile_id >= 100 else tile_id for tile_id in meld] for meld in melded_tiles_mine]
        melded_tiles_other = [[tile_id % 100 if tile_id >= 100 else tile_id for tile_id in meld] for meld in melded_tiles_other]


        # 100以上のIDを元に戻す
        melded_tiles_mine = [[tile_id - 100 if tile_id >= 100 else tile_id for tile_id in meld] for meld in melded_tiles_mine]
        melded_tiles_other = [[tile_id - 100 if tile_id >= 100 else tile_id for tile_id in meld] for meld in melded_tiles_other]

        # 全ての捨て牌をまとめる
        discard_tiles = []
        for dd in discard_tiles_by_zone.values():
            discard_tiles += dd

        # 捨て牌で100以上のIDを元に戻す
        discard_tiles = [tile_id % 100 if tile_id >= 100 else tile_id for tile_id in discard_tiles]
        simple_discard_tiles = sorted(discard_tiles)

        # 手牌で100以上のIDを元に戻す
        hand_tiles = [tile_id % 100 if tile_id >= 100 else tile_id for tile_id in hand_tiles]

        # ドラ表示牌で100以上のIDを元に戻す
        dora_indicators = [tile_id % 100 if tile_id >= 100 else tile_id for tile_id in dora_indicators]

        result_simple = {
            "turn": turn,
            "dora_indicators": dora_indicators,
            "hand_tiles": hand_tiles,
            "melded_tiles": {
                "melded_tiles_mine": melded_tiles_mine,
                "melded_tiles_other": melded_tiles_other
            },
            "discard_tiles": simple_discard_tiles,
        }

        return {'message': 'Detection successful!', 'status': 200, 'result': result, 'result_simple': result_simple}

    # 予期せぬエラーが発生した場合も、一貫した形式でエラーメッセージを返す
    except Exception as e:
        # もし、このexceptブロックに来るのは、モデルロード失敗以外の予期せぬエラーの場合
        # モデルロード失敗は、上のtry-exceptで先に処理されるので、ここではそれ以外の例外を扱う
        return {'message': f"An unexpected internal error occurred: {type(e).__name__}: {e}", 'status': 502}


# メイン関数（テスト用）
if __name__ == '__main__':

    # テスト用画像パス
    BOARD_IMAGE_PATH_TEST = "test.jpg"
    HAND_IMAGE_PATH_TEST = "test_h2.jpg"

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

    # # デバッグ用
    # detect_debug.print_detection_details(analysis_result)
    # detect_debug.analyze_anomalies_by_prefix(analysis_result)