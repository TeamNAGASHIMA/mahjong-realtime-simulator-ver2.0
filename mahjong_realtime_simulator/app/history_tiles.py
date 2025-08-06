from .calc import main_score_calc, score_calc

def htProcess(
        detections, # 物体検知結果のリストを取得
        syanten_Type, # フロントエンドからの向聴タイプの取得
        flag # フロントエンドからの設定項目の取得
):
    try:
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
                        err_message = "The number of tiles in your hand is invalid. ({} tiles detected in hand)".format(count)
                        status =420

                        previous_detect = [
                            detection_result["hand_tiles"],
                            detection_result["melded_blocks"]["melded_blocks_bottom"],
                            detection_result["discard_tiles"]["discard_tiles_bottom"]
                            ]

                        # 計算を行わない検出結果もresultsに格納する。statusコード420で識別できる。
                        results.append(
                            [
                                {
                                    "message": err_message,
                                    "detection_result": detection_result,
                                    'result_calc': []
                                },
                                status
                            ]
                        )
                    else:
                        # 現在の物体検知情報を格納
                        # 次のif文でひとつ前の処理の物体検知情報と比較する
                        now_detect = [
                            detection_result["hand_tiles"],
                            detection_result["melded_blocks"]["melded_blocks_bottom"],
                            detection_result["discard_tiles"]["discard_tiles_bottom"]
                            ]

                        # 自身の手牌、捨て牌、鳴き牌が不一致だった場合、計算を行う
                        # 一致した場合は何もせず次の処理移行する
                        if now_detect != previous_detect:
                            result_message = "The calculation for turn {} has been done.".format(turn)
                            # 物体検知の結果から計算を実行する。
                            # return値は計算結果かエラー結果が返される
                            result_calc = main_score_calc(
                                    doraList,
                                    hand_tiles,
                                    raw_melded_blocks,
                                    river_tiles,
                                    turn,
                                    syanten_Type,
                                    flag
                                )

                            # 計算結果、物体検知結果、メッセージを格納
                            results.append(
                                [
                                    {
                                        "message": result_message,
                                        "detection_result": detection_result,
                                        'result_calc': result_calc
                                    },
                                    result_calc["status"]
                                ]
                            )

                        # 現在の物体検知情報を保存し、次のif文で使用する。
                        previous_detect = now_detect

        rtn_message = "All calculations have been performed."
        return results, rtn_message

    except Exception as e:
        except_message = "An unexpected error occurred during the calculation process."
        rtn_message = "Exception error: {} {} {}".format(except_message, type(e), e)
        
        return results, rtn_message

def htFixesProcess(
        fixes_lists # 手動修正データの取得
):
    try:
        fixes_results = []
        for fixes_list in fixes_lists:
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

            counts = len(fixes_data["hand_tiles"]) + len(fixes_data["melded_blocks"])
            if counts <= 12 or counts >= 15:
                err_message = "The number of tiles in your hand is invalid. ({} tiles detected in hand)".format(counts)
                status =420

                fixes_results.append(
                    [
                        {
                            "message": err_message,
                            "detection_result": detection_result,
                            'result_calc': []
                        },
                        status
                    ]
                )
            else:
                # 物体検知は行わずに直接計算を行う
                result_calc = score_calc(fixes_data, fixes_river_tiles)

                success_message = "The calculation is complete."

                status = 200

                # 結果を格納する
                fixes_results.append(
                    [
                        {
                            "message": success_message,
                            "detection_result": detection_result,
                            'result_calc': result_calc
                        },
                        status
                    ]
                )

        return fixes_results, "success"

    except Exception as e:
        except_message = "An unexpected error occurred during the calculation process."
        rtn_message = "Exception error: {} {} {}".format(except_message, type(e), e)
        
        return fixes_results, rtn_message