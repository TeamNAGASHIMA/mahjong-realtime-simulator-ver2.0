from .calc import main_score_calc

def htProcess(
        detections,
        syanten_Type,
        flag
):
    results = []
    previous_detect = []
    for detection in detections:
        # ステータスコードが200でない場合、物体検知処理上でエラーが出たのでそれをレスポンスする。
        if detection["status"] != 200:
            message = detection["message"]
            status = detection["status"]

            results.append(
                [
                    {
                        "message": message,
                        "detection_result": [],
                        'result_calc': []
                    },
                    status
                ]
            )
        else:
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

            if len(hand_tiles) + len(doraList) + len(river_tiles) + len(raw_melded_blocks) >= 13:
                count = len(detection_result["hand_tiles"]) + len(detection_result["melded_blocks"]["melded_blocks_bottom"])
                # 自身の手牌(鳴き牌含む)の合計数が12枚以下または15枚以上の場合、計算できないので
                if count <= 12 or count >= 15:
                    message = "The number of tiles in your hand is invalid. ({} tiles detected in hand)".format(len(detection_result["hand_tiles"]))
                    status =420

                    now_detect = [
                        detection_result["hand_tiles"],
                        detection_result["melded_blocks"]["melded_blocks_bottom"],
                        detection_result["discard_tiles"]["discard_tiles_bottom"]
                        ]

                    results.append(
                        [
                            {
                                "message": message,
                                "detection_result": detection_result,
                                'result_calc': []
                            },
                            status
                        ]
                    )
                else:
                    now_detect = [
                        detection_result["hand_tiles"],
                        detection_result["melded_blocks"]["melded_blocks_bottom"],
                        detection_result["discard_tiles"]["discard_tiles_bottom"]
                        ]

                    # 自身の手牌、捨て牌、鳴き牌が不一致だった場合、計算を行う
                    # 一致した場合は何もせず次の処理移行する
                    if now_detect != previous_detect:
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

                        results.append(
                            [
                                {
                                    "message": message,
                                    "detection_result": detection_result,
                                    'result_calc': result_calc
                                },
                                status
                            ]
                        )

    rtn_message = "All calculations have been performed."
    return results, rtn_message

def fixesHtProcess(
        detections
):
    print()