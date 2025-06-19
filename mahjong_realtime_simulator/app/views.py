from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import cv2
import numpy as np
import json
from .calc import main_score_calc, score_calc
from .detect import analyze_mahjong_board
from django.conf import settings
import os

def mahjong_render(request):
    return render(request, 'app/main.html')

@csrf_exempt
def main(request):
    if request.method == 'POST':
        try:
            Img_FILES = request.FILES
            Req_BODY = request.POST
            print(Img_FILES)
            print(Req_BODY)
            # 手牌画像が取得できていなければエラーを返す
            if 'hand_tiles_image' not in Img_FILES:
                message = "No images of the hand cards included."
                return JsonResponse({'message': message}, status=400)
            else:
                # 手牌画像があれば正常処理を行う
                fixes_list = json.loads(Req_BODY["fixes_board_info"])
                # jsのリクエストデータから向聴タイプと設定項目のデータを挿入する
                syanten_Type = int(Req_BODY["syanten_Type"])
                flag = int(Req_BODY["flag"])

                # 手動修正内容がなければ物体検知を行う
                if len(fixes_list) == 0:
                    np_hand_tiles_image = imageChangeNp(Img_FILES['hand_tiles_image'])
                    # 盤面画像が取得できていればnp配列に挿入し、無ければ空のnp配列を作成する
                    if 'board_tiles_image' in Img_FILES:
                        np_board_tiles_image = imageChangeNp(Img_FILES['board_tiles_image'])
                    else:
                        # 空のnp配列の作成
                        np_board_tiles_image = np.array([])

                    # 物体検知関数の呼び出し
                    detectoin = analyze_mahjong_board(np_board_tiles_image, np_hand_tiles_image)

                    # ステータスコードが200でない場合、物体検知処理上でエラーが出たのでそれをレスポンスする。
                    if detectoin["status"] != 200:
                        message = detectoin["message"]
                        status = detectoin["status"]

                        return JsonResponse({
                            'message': message,
                            "detection_result": []
                            }, status=status
                        )

                    # detection_result => フロントエンドの盤面状況コンポーネント上に表示させる用のデータ
                    # detection_result_simple => 計算プログラム用のデータ
                    detection_result = detectoin["result"]
                    detection_result_simple = detectoin["result_simple"]

                    # 物体検知から得たドラ、手牌、鳴き牌、捨て牌、巡目数のデータを挿入する
                    doraList = detection_result_simple["dora_indicators"]
                    hand_tiles = detection_result_simple["hand_tiles"]
                    raw_melded_blocks = detection_result_simple["melded_blocks"]
                    river_tiles = detection_result_simple["discard_tiles"]
                    turn = detection_result_simple["turn"]

                    hand_tiles.append(0)
                    print("データ表示")
                    print(doraList)
                    print(hand_tiles)
                    print(raw_melded_blocks)
                    print(river_tiles)
                    print(turn)
                    print(syanten_Type)
                    print(flag)

                    print("データ型表示")
                    print(type(doraList))
                    print(type(hand_tiles))
                    print(type(raw_melded_blocks))
                    print(type(river_tiles))
                    print(type(turn))
                    print(type(syanten_Type))
                    print(type(flag))

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
                    print("2")
                    print(result_calc)
                else:
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

                    # 物体検知は行わずに直接計算を行う
                    result_calc = score_calc(fixes_data, fixes_river_tiles)

                if result_calc["status"] == 200:
                    print(result_calc)
                    # 処理結果をフロントエンドへレスポンスする
                    return JsonResponse({
                        'message': result_calc["message"],
                        'result_calc': result_calc["result"],
                        'detection_result': detection_result
                        }, status=result_calc["status"]
                    )
                else:
                    return JsonResponse({
                        'message': result_calc["message"],
                        "detection_result": detection_result
                        }, status=result_calc["status"]
                    )

        except Exception as e:
            message = "Exception error"
            return JsonResponse({'message': "{}: {} {}".format(message, type(e), e)}, status=400)

    return JsonResponse({'message': 'Method not allowed'}, status=405)

def imageChangeNp(request_image):
    # 保存先のフルパスを作成（例: media/uploads/filename.png）
    path = os.path.join(settings.MEDIA_ROOT, request_image.name)

    # ディレクトリがなければ作成
    os.makedirs(os.path.dirname(path), exist_ok=True)

    # ファイルを書き込み
    with open(path, "wb+") as destination:
        for chunk in request_image.chunks():
            destination.write(chunk)

    # OpenCVで読み込み（BGR形式のnp.ndarray）
    np_request_image = cv2.imread(path)

    # request_image_bytes = np.frombuffer(request_image.read(), np.uint8)
    # np_request_image_bgr = cv2.imdecode(request_image_bytes, cv2.IMREAD_COLOR)

    return np_request_image