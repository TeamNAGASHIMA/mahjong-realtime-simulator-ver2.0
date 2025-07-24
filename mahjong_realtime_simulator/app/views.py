from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import cv2
import numpy as np
import json
from .calc import main_score_calc, score_calc
from .real_time_simulator import rtsProcess
from .history_tiles import fixesRtsProcess
from .detect import analyze_mahjong_board
from django.conf import settings
import os
import concurrent.futures

def mahjong_render(request):
    return render(request, 'app/main.html')

@csrf_exempt
def main(request):
    if request.method == 'POST':
        try:
            Img_FILES = request.FILES
            Req_BODY = request.POST
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
                if len(fixes_list["fixes_pai_info"]["hand_tiles"]) == 0:
                    np_hand_tiles_image_list = imageChangeNp(Img_FILES['hand_tiles_image'])
                    # 盤面画像が取得できていればnp配列に挿入し、無ければ空のnp配列を作成する
                    if 'board_tiles_image' in Img_FILES:
                        np_board_tiles_image_list = imageChangeNp(Img_FILES['board_tiles_image'])
                    else:
                        # 空のnp配列の作成
                        np_board_tiles_image_list = np.array([])

                    # 物体検知関数の呼び出し
                    tasks_args = []
                    for i in range(len(np_hand_tiles_image_list)):
                        # 実行したいタスクの引数をタプルのリストとして用意する
                        tasks_args.append((np_board_tiles_image_list[i], np_hand_tiles_image_list[i]))

                    # スレッドプールを作成してタスクを実行
                    with concurrent.futures.ThreadPoolExecutor(max_workers=16) as executor:
                        # mapの第1引数に関数、第2引数以降に関数に渡す引数のイテラブルを渡す
                        np_board_tiles_image = [arg[0] for arg in tasks_args]
                        np_hand_tiles_image = [arg[1] for arg in tasks_args]

                        detections = executor.map(analyze_mahjong_board, np_board_tiles_image, np_hand_tiles_image)

                    # reqest_typeが0だった場合、リアルタイムシミュレーションモードとして処理
                    # reqest_typeが1だった場合、牌譜作成モードとして処理
                    if Req_BODY["reqest_type"] == 0:
                        msg, res = rtsProcess(detections[0], syanten_Type, flag)
                        if msg == "success":
                            result_calc = res[0]
                            detection_result = res[1]
                        else:
                            return res
                    else:
                        print("牌譜作成モードの処理")
                else:
                    # reqest_typeが0だった場合、リアルタイムシミュレーションモードとして処理
                    # reqest_typeが1だった場合、牌譜作成モードとして処理
                    if Req_BODY["reqest_type"] == 0:
                        msg, res = fixesRtsProcess(fixes_list)
                        if msg == "success":
                            result_calc = res[0]
                            detection_result = res[1]
                        else:
                            return res
                    else:
                        print("牌譜作成モードの処理")

                if result_calc["status"] == 200:
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

def imageChangeNp(request_image_list):

    np_request_image_list = []

    for request_image in request_image_list:
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

        np_request_image_list.append(np_request_image)

    return np_request_image_list