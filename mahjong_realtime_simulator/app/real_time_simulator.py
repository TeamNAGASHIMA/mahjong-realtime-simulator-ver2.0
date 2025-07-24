from .calc import main_score_calc, score_calc
from django.http import JsonResponse

# 通常(修正データがない時)の関数
def rtsProcess(
        detection, # 物体検知結果
        syanten_Type, # 向聴タイプ
        flag # 設定項目内容
):
    # ステータスコードが200でない場合、物体検知処理上でエラーが出たのでそれをレスポンスする。
    if detection["status"] != 200:
        message = detection["message"]
        status = detection["status"]

        return "error", JsonResponse({
            'message': message,
            "detection_result": []
            }, status=status
        )

    # detection_result => フロントエンドの盤面状況コンポーネント上に表示させる用のデータ
    # detection_result_simple => 計算プログラム用のデータ
    detection_result = detection["result"]
    detection_result_simple = detection["result_simple"]

    # 物体検知から得たドラ、手牌、鳴き牌、捨て牌、巡目数のデータを挿入する
    doraList = detection_result_simple["dora_indicators"]
    hand_tiles = detection_result_simple["hand_tiles"]
    raw_melded_blocks = detection_result_simple["melded_blocks"]
    river_tiles = detection_result_simple["discard_tiles"]
    turn = detection_result_simple["turn"]

    if len(detection_result["hand_tiles"]) <= 12 or len(detection_result["hand_tiles"]) >= 15:
        message = "The number of tiles in your hand is invalid. ({} tiles detected in hand)".format(len(detection_result["hand_tiles"]))
        status =420

        return "error", JsonResponse({
            'message': message,
            "detection_result": detection_result
            }, status=status
        )

    # 物体検知の結果から計算を実行する。
    result_calc = main_score_calc(
            doraList,
            hand_tiles,
            raw_melded_blocks,
            river_tiles,
            turn,
            syanten_Type,
            flag
        )
    return "success", [result_calc, detection_result]

#修正データがある時の関数
def fixesRtsProcess(
        fixes_list # 手動修正データの取得
):
    # jsのリクエストデータの手動修正データから得たドラ、手牌、鳴き牌、捨て牌、巡目数のデータを挿入する
    fixes_data = fixes_list["fixes_pai_info"]
    fixes_river_tiles = fixes_list["fixes_river_tiles"]

    detection_result = {
        "turn": fixes_data["turn"],
        "dora_indicators": fixes_data["dora_indicators"],
        "hand_tiles": fixes_data["hand_tiles"],
        "melded_blocks": fixes_data["melded_blocks"],
        "discard_tiles": fixes_river_tiles
    }

    if len(fixes_data["hand_tiles"]) <= 12 or len(fixes_data["hand_tiles"]) >= 15:
        message = "The number of tiles in your hand is invalid. ({} tiles detected in hand)".format(len(fixes_data["hand_tiles"]))
        status =420

        return "error", JsonResponse({
            'message': message,
            "detection_result": detection_result
            }, status=status
        )

    # 物体検知は行わずに直接計算を行う
    result_calc = score_calc(fixes_data, fixes_river_tiles)

    return "success", [result_calc, detection_result]