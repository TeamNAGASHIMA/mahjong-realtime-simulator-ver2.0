# DD-NR-004-B（物体検知機能）
import requests
import cv2
import numpy as np
import math
import crop_open_detection 
import crop_dora_detection 
import crop_discard_detection 

# 期待する出力
# {
#     "version": "0.9.0",
#     "zikaze": 27,               # 入力（自風）
#     "bakaze": 27,               # 入力（場風）
#     "turn": 3,                  # 検知必要（巡目数）
#     "syanten_type": 1,      
#     "dora_indicators": [27],    # 検知必要（ドラ表示牌）
#     "flag": 63,              
#     "hand_tiles": [1, 1, 1, 4, 5, 6, 11, 12, 20, 20, 23, 23, 24, 30],               # 検知必要  
#     "melded_blocks": [],        # 検知必要（鳴き牌）
#     "counts": [                 # 残りの牌の数（手牌 + 鳴き牌 + ドラ表示牌 + 捨て牌）
#         4, 1, 4, 4, 3, 3, 3, 4, 4, 4, 4, 3, 3, 4, 4, 4, 4, 4, 4, 4, 2, 4, 4, 2, 3,  
#         4, 4, 3, 4, 4, 3, 4, 4, 4, 1, 1, 1
#     ]             
#     +検知必要（捨て牌の種類ごとの数。リスト？）
# }


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


# 画像に映っている牌の種類を検出する
# image_path：画像のパス
# output_format：出力形式（imageかjson）
def tile_detection(image_path, output_format="image"):

    # APIキー（Roboflowのプロジェクトページから取得）
    api_key = "RMzBzTmiT7pWNdzcLppw"

    # エンドポイントURL（全オプション付き）
    url = (
        "https://detect.roboflow.com/mahjong-baq4s/61"
        f"?api_key={api_key}"
        "&confidence=0.4"            # 信頼度（0.0〜1.0）
        "&overlap=0.5"               # 重なりを許容する閾値（0.0～1.0）
        f"&format={output_format}"              # 出力形式（json / image - Roboflowドキュメントに記載）
        "&labels=true"
    )

    # APIへ画像を送信
    with open(image_path, "rb") as img_file:
        files = {"file": img_file}
        response = requests.post(url, files=files)

    # レスポンスの処理（検出処理）
    if response.status_code == 200:
        if output_format == "image":
            with open(image_path + "result.jpg", "wb") as f:
                f.write(response.content)

        if output_format == "json":
            result = response.json()
            result_array = []   # 牌の種類のクラスidの配列

            for pred in result["predictions"]:
                confidence = float(pred["confidence"])
                class_id = int(pred["class_id"])
                result_array.append({"confidence":confidence, "class_id":class_id})

            return result_array

    else:
        print(f"【エラー】ステータスコード: {response.status_code}")
        print(response.text)


# 巡目数を計算する関数（total_discards:捨て牌の総数）
def turn_calculation(total_discards):

    if total_discards == 0:
        return 1
    
    else:
        return (total_discards - 1) // 4 + 1


# 盤面画像からドラを検出する関数（切り出し込み）
# 別ファイルで作成（crop_dora_detection.py）
# ※読み取れない場合は回転して読み取る
def dora_detection(image_path):

    crop_dora_detection.main(image_path)
    image_path_origin = "cropped_dora_indicator_1.jpg"
    image_path = image_path_origin
    result_1 = tile_detection(image_path, output_format="json")
    
    for i in range(len(result_1)):
        if result_1[i]["confidence"] < 0.6:   # 確信度が50%未満だったらはじく
            result_1.pop(i)

    # 90度回転して再度読み直す
    image = cv2.imread(image_path_origin)
    rotated_image = np.rot90(image)
    cv2.imwrite("cropped_dora_indicator_2.jpg", rotated_image)
    image_path = "cropped_dora_indicator_2.jpg"
    result_2 = tile_detection(image_path, output_format="json")

    for i in range(len(result_2)):
        if result_2[i]["confidence"] < 0.6:   # 確信度が50%未満だったらはじく
            result_2.pop(i)

    # 90度回転して再度読み直す
    image = cv2.imread(image_path_origin)
    rotated_rev_image = np.rot90(image, k=-1)
    cv2.imwrite("cropped_dora_indicator_3.jpg", rotated_rev_image)
    image_path = "cropped_dora_indicator_3.jpg"
    result_3 = tile_detection(image_path, output_format="json")

    for i in range(len(result_3)):
        if result_3[i]["confidence"] < 0.6:   # 確信度が50%未満だったらはじく
            result_3.pop(i)

    result = result_1 + result_2 + result_3
    result_array = []   # 検出結果リスト

    for rd in result:
        result_array.append(tile_convert[rd["class_id"]])
    return result_array


# 盤面画像から鳴き牌を検出する関数（切り出し込み）
# 別ファイルで作成（crop_open_detection.py）
# ※読み取れない場合は回転して読み取る
def open_detection(image_path):

    crop_open_detection.main(image_path)    # 元画像から切り取る
    image_path_origin = "cropped_naki_1.jpg"
    image_path = image_path_origin
    result_1 = tile_detection(image_path, output_format="json")

    for i in range(len(result_1)):
        if result_1[i]["confidence"] < 0.6:   # 確信度が50%未満だったらはじく
            result_1.pop(i)

    # 90度回転して再度読み直す
    image = cv2.imread(image_path_origin)
    rotated_image = np.rot90(image)
    cv2.imwrite("cropped_naki_2.jpg", rotated_image)
    image_path = "cropped_naki_2.jpg"
    result_2 = tile_detection(image_path, output_format="json")

    for i in range(len(result_2)):
        if result_2[i]["confidence"] < 0.6:   # 確信度が50%未満だったらはじく
            result_2.pop(i)

    # 90度回転して再度読み直す
    image = cv2.imread(image_path_origin)
    rotated_rev_image = np.rot90(image, k=-1)
    cv2.imwrite("cropped_naki_3.jpg", rotated_rev_image)
    image_path = "cropped_naki_3.jpg"
    result_3 = tile_detection(image_path, output_format="json")

    for i in range(len(result_3)):
        if result_3[i]["confidence"] < 0.6:   # 確信度が50%未満だったらはじく
            result_3.pop(i)

    result = result_1 + result_2 + result_3
    result_array = []   # 検出結果リスト

    for rd in result:
        result_array.append(tile_convert[rd["class_id"]])
    return result_array

# 盤面画像から捨て牌を検出する関数（切り出し込み）
# 画像の決まった位置（捨て牌がありそうな位置）を切り出すようにする
def discard_detection(image_path):
    return None

# 手牌画像から手牌を検出する関数
# hand_image_path：手牌画像のパス
# 返り値：手牌のクラスidの配列
def hand_detection(hand_image_path):
    result_array = []
    result = tile_detection(hand_image_path, "json")
    for i in range(len(result)):
        if result[i]["confidence"] > 0.5:
            if result[i]["class_id"] in tile_convert.keys():
                result_array.append(tile_convert[result[i]["class_id"]])
    return result_array

# 手牌テスト
image_path = "test_mahjong_tehai_1.jpg"
result = hand_detection(image_path)
print(f"手牌：{result}")

# 捨て牌テスト
image_path = "test_mahjong_discard_1.jpg"
result = hand_detection(image_path)
print(f"捨て牌：{result}")

# 鳴きテスト
image_path = "test_mahjong_open_1.jpg"
result = open_detection(image_path)
print(f"鳴き牌：{result}")

# ドラ表示テスト
image_path = "test_mahjong.jpg"
result = dora_detection(image_path)
print(f"ドラ表示牌：{result}")
