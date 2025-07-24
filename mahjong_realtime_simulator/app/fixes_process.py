from .calc import score_calc
from django.http import JsonResponse

#修正データがある時の関数
def fixesProcess(
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