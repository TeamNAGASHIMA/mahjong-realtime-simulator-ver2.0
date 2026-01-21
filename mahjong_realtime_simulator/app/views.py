from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import cv2
import numpy as np
import json
from .calc import main_score_calc, score_calc
from .detect import analyze_mahjong_board
from .create_json import difference_check
from .point_calculation import point_calculate
from django.conf import settings
import os

def mahjong_render(request):
    
    return render(request, 'app/main.html')
    
    # debug
    # return render(request, 'app/test.html')

# 期待値計算エンドポイント
@csrf_exempt
def main(request):
    if request.method == 'POST':
        try:
            Img_FILES = request.FILES
            Req_BODY = request.POST
            # 手牌画像が取得できていなければエラーを返す
            # mode_flag = '1' -> 通常計算、'0' -> 牌譜保存時の計算
            if 'hand_tiles_image' not in Img_FILES and Req_BODY["mode_flag"] != '0':
                message = "No images of the hand cards included."
                return JsonResponse({'message': message}, status=400)
            else:
                # 手牌画像があれば正常処理を行う
                fixes_list = json.loads(Req_BODY["fixes_board_info"])
                print("fixes_list\n",fixes_list)
                # jsのリクエストデータから向聴タイプと設定項目のデータを挿入する
                syanten_Type = int(Req_BODY["syanten_Type"])
                flag = int(Req_BODY["flag"])
                # 修正内容があるかどうかを確認
                fixes_data = fixes_list["fixes_pai_info"]
                fixes_flag = any(
                    [
                        fixes_data["dora_indicators"], 
                        fixes_data["hand_tiles"], 
                        fixes_data["melded_blocks"], 
                        fixes_list["fixes_river_tiles"]
                    ]
                )

                # 手動修正内容がなければ物体検知を行う
                if not fixes_flag:
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
                    raw_melded_blocks = detection_result_simple["melded_tiles"]
                    river_tiles = detection_result_simple["discard_tiles"]
                    turn = detection_result_simple["turn"]

                    if len(detection_result["hand_tiles"]) + (len(detection_result["melded_tiles"]["melded_tiles_bottom"]) * 3) <= 12 or len(detection_result["hand_tiles"]) + (len(detection_result["melded_tiles"]["melded_tiles_bottom"]) * 3) >= 15:
                        message = "The number of tiles in your hand is invalid. ({} tiles detected in hand)".format(len(detection_result["hand_tiles"]))
                        status =420

                        return JsonResponse({
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
                else:
                    # jsのリクエストデータの手動修正データから得たドラ、手牌、鳴き牌、捨て牌、巡目数のデータを挿入する
                    fixes_river_tiles = fixes_list["fixes_river_tiles"]

                    detection_result = {
                        "turn": fixes_data["turn"],
                        "dora_indicators": fixes_data["dora_indicators"],
                        "hand_tiles": fixes_data["hand_tiles"],
                        "melded_blocks": fixes_data["melded_blocks"],
                        "discard_tiles": fixes_river_tiles
                    }

                    if len(fixes_data["hand_tiles"]) + len(fixes_data["melded_blocks"]['melded_tiles_bottom'] * 3) <= 12 or len(fixes_data["hand_tiles"]) + len(fixes_data["melded_blocks"]['melded_tiles_bottom'] * 3) >= 15:
                        message = "The number of tiles in your hand is invalid. ({} tiles detected in hand)".format(len(fixes_data["hand_tiles"]))
                        status =420

                        return JsonResponse({
                            'message': message,
                            "detection_result": detection_result
                            }, status=status
                        )
                    melded_blocks_bottom = fixes_data["melded_blocks"]["melded_tiles_bottom"]
                    newMelded_blocks_bottom = []

                    for meld_block_key in melded_blocks_bottom.keys():
                        newMelded_blocks_bottom.append(
                            {
                                "type": meld_block_key,
                                "tiles": melded_blocks_bottom[meld_block_key],
                                "discarded_tile": melded_blocks_bottom[meld_block_key][0],
                                "from": 0
                            }
                        )

                    fixes_data["melded_blocks"] = newMelded_blocks_bottom

                    # 物体検知は行わずに直接計算を行う
                    result_calc = score_calc(fixes_data, fixes_river_tiles)

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
            return JsonResponse({'message': "Exception error: {} {}".format(type(e), e)}, status=400)

    return JsonResponse({'message': 'Method not allowed'}, status=405)

# 牌譜作成、牌譜保存エンドポイント
@csrf_exempt
def tiles_save(request):
    '''
    引数:
        record_flag: 0、1=記録中、2=記録保存
        save_name: 牌譜保存時のファイル名（record_flagが2のときのみ必要）
    '''
    if request.method == 'POST':
        try:
            Img_FILES = request.FILES
            Req_BODY = request.POST
            if 'record_flag' not in Req_BODY:
                return JsonResponse(
                    {
                        'message': "No record flag provided.",
                    }, 
                    status=420
                )
            else:
                record_flag = int(Req_BODY["record_flag"])
                if record_flag == 0:
                    return JsonResponse({'message': 'No saving requested.'}, status=420)
                elif record_flag == 1:
                        save_data_return = savedata(Req_BODY, Img_FILES)
                        if isinstance(save_data_return, JsonResponse):
                            return save_data_return
                        save_data = save_data_return[0]
                        detection_result = save_data_return[1]

                        if save_data is not None:
                            # 牌譜保存処理の関数を呼び出す
                            difference_check(save_data,record_flag,"")
                        else:
                            return JsonResponse(
                                {
                                    'message': "No data to save.",
                                },
                                status=420
                            )

                        return JsonResponse(
                            {
                                'message': "successful",
                                'detection_result': detection_result
                            }, 
                            status="200"
                        )
                elif record_flag == 2:

                    save_data_return = savedata(Req_BODY, Img_FILES)
                    if isinstance(save_data_return, JsonResponse):
                        return save_data_return
                    save_data = save_data_return[0]
                    detection_result = save_data_return[1]

                    if 'save_name' not in Req_BODY:
                        return JsonResponse(
                            {
                                'message': "No save name provided.",
                            }, 
                            status=420
                        )
                    else:
                        save_name = Req_BODY["save_name"]
                        # 牌譜保存処理の関数を呼び出す
                        save_result = difference_check(save_data,record_flag,save_name)
                        if save_result["status"] != "200":
                            return JsonResponse(
                                {
                                    'message': save_result["message"],
                                }, 
                                status=save_result["status"]
                            )
                        else:
                            return JsonResponse(
                                {
                                    'message': save_result["message"],
                                    'file_name': save_result["file_name"],
                                }, 
                                status=save_result["status"]
                            )
        except Exception as e:
            return JsonResponse({'message': "Exception error: {} {}".format(type(e), e)}, status=400)

# 詳細牌譜データの参照エンドポイント
@csrf_exempt
def tiles_req(request):
    if request.method == 'POST':
        try:
            Req_BODY = request.POST
            # 牌譜フォルダのパスを取得
            haihu_dir = settings.HAIHU_ROOT
            if 'file_name' not in Req_BODY:
                # 牌譜フォルダが存在しない場合は作成
                os.makedirs(haihu_dir, exist_ok=True)
                
                # フォルダ内のJSONファイル一覧を取得
                json_files = [f for f in os.listdir(haihu_dir) if f.endswith('.json')]
                
                file_list = []
                for file_name in json_files:
                    file_path = os.path.join(haihu_dir, file_name)
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        # JSONデータからcreated_atを取得
                        created_at = data.get('created_at', 'N/A') 
                        file_list.append({'file_name': file_name, 'date': created_at})
                return JsonResponse(
                    {
                        'message': "successful",
                        'file_list': file_list
                    }, 
                    status=200
                )
            else:
                # file_nameがリクエストに含まれている場合 (特定の牌譜を返す想定)
                req_file_name = Req_BODY["file_name"]
                # 完全なファイルパスを作成
                file_path = os.path.join(haihu_dir, req_file_name)
                # ファイル名が牌譜フォルダ内に存在するかチェック
                if req_file_name and os.path.exists(file_path):
                    with open(file_path, 'r', encoding='utf-8') as f:
                        game_data = json.load(f)
                    
                    # temp_resultキーのデータを取得
                    temp_result = game_data.get('temp_result', [])

                    return JsonResponse(
                        {
                            'message': "successful",
                            'temp_result': temp_result
                        },
                        status=200
                    )
                else:
                    return JsonResponse({'message': f"File '{req_file_name}' not found."}, status=404)

        except Exception as e:
            return JsonResponse({'message': "Exception error: {} {}".format(type(e), e)}, status=400)
    else:
        return JsonResponse({'message': 'Method not allowed'}, status=405)

# 物体検知エンドポイント
@csrf_exempt
def detection_tiles(request):
    '''
    牌検知
    引数: 
        hand_tiles_image : 手牌画像
        board_tiles_image : 盤面画像

    戻り値:
        message : 処理結果メッセージ
        detection_result : 牌認識結果
        status : ステータスコード
    '''
    if request.method == 'POST':
        try:
            Img_FILES = request.FILES
            
            # 手牌画像＆盤面画像が取得できていなければエラーを返す
            if 'board_tiles_image' not in Img_FILES and 'hand_tiles_image' not in Img_FILES:
                message = "No images of the board and hand cards included."
                return JsonResponse({'message': message}, status=400)
            else:
                np_hand_tiles_image = imageChangeNp(Img_FILES['hand_tiles_image'])
                np_board_tiles_image = imageChangeNp(Img_FILES['board_tiles_image'])
                
                detection = analyze_mahjong_board(np_board_tiles_image, np_hand_tiles_image)

                # ステータスコードが200でない場合、物体検知処理上でエラーが出たのでそれをレスポンスする。
                if detection["status"] != 200:
                    message = detection["message"]
                    status = detection["status"]

                    return JsonResponse(
                        {
                        'message': message,
                        "detection_result": []
                        }, 
                        status=status
                    )
                
                detection_result = detection["result"]

                return JsonResponse(
                    {
                    'message': "successful",
                    "detection_result": detection_result
                    }, 
                    status=200
                    )
            
        except Exception as e:
            return JsonResponse({'message': "Exception error: {} {}".format(type(e), e)}, status=400)
    else:
        return JsonResponse({'message': 'Method not allowed'}, status=405)

# 点数計算エンドポイント
@csrf_exempt
def hand_tiles_point_calculate(request):
    '''
    牌検知
    引数: 
        hand_tiles_info : 手牌、鳴き牌、ドラ牌、ツモorロン牌
            hand_tiles : 手牌
            meld_tiles : 鳴き牌
            dora_indicators : ドラ牌
            win_tile : ツモorロン牌
        options : ユーザ任意設定オプション

    戻り値:
        message : 処理結果メッセージ
        point_result : 点数計算結果
        status : ステータスコード
    '''
    if request.method == 'POST':
        try:
            Req_BODY = request.POST

            hand_tiles_info = json.loads(Req_BODY["hand_tiles_info"])
            options = json.loads(Req_BODY["options"])

            point_result = point_calculate(
                hand_tiles_info["hand_tiles"],
                hand_tiles_info["win_tile"],
                hand_tiles_info["meld_tiles"],
                hand_tiles_info["dora_indicators"],
                options
            )

            # ステータスコードが200でない場合、物体検知処理上でエラーが出たのでそれをレスポンスする。
            message = point_result["message"]
            if point_result["status"] != 200:
                status = point_result["status"]

                return JsonResponse(
                    {
                    'message': message,
                    "point_result": []
                    }, 
                    status=status
                )

            return JsonResponse(
                {
                'message': message,
                "point_result": point_result["result"]
                }, 
                status=point_result["status"]
                )
            
        except Exception as e:
            return JsonResponse({'message': "Exception error: {} {}".format(type(e), e)}, status=400)
    else:
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


def savedata(Req_BODY, Img_FILES):
    # 手牌画像が取得できていなければエラーを返す
    if 'hand_tiles_image' not in Img_FILES:
        message = "No images of the hand cards included."
        return JsonResponse({'message': message}, status=400)
    else:
        # 手牌画像があれば正常処理を行う
        fixes_list = json.loads(Req_BODY["fixes_board_info"])
        # 修正内容があるかどうかを確認
        fixes_data = fixes_list["fixes_pai_info"]
        fixes_flag = any(
            [
                fixes_data["dora_indicators"], 
                fixes_data["hand_tiles"], 
                fixes_data["melded_blocks"], 
                fixes_list["fixes_river_tiles"]
            ]
        )
        # 手動修正内容がなければ物体検知を行う
        if not fixes_flag:
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

                return JsonResponse(
                    {
                    'message': message,
                    "detection_result": []
                    }, 
                    status=status
                )

            # detection_result => フロントエンドの盤面状況コンポーネント上に表示させる用のデータ
            detection_result = detectoin["result"]

            # 物体検知から得たドラ、手牌、鳴き牌、捨て牌、巡目数のデータを挿入する
            # doraList = detection_result["dora_indicators"]
            # hand_tiles = detection_result["hand_tiles"]
            # raw_melded_blocks = detection_result["melded_tiles"]
            # river_tiles = detection_result["discard_tiles"]
            # turn = detection_result["turn"]

            if len(detection_result["hand_tiles"]) + (len(detection_result["melded_tiles"]["melded_tiles_bottom"]) * 3) <= 12 or len(detection_result["hand_tiles"]) + (len(detection_result["melded_tiles"]["melded_tiles_bottom"]) * 3) >= 15:
                message = "The number of tiles in your hand is invalid. ({} tiles detected in hand)".format(len(detection_result["hand_tiles"]))
                status =420

                return JsonResponse(
                    {
                    'message': message,
                    "detection_result": detection_result
                    },
                    status=status
                )

            # 保存するデータをまとめる。
            save_data = (
                    detection_result
                )
        else:
            # jsのリクエストデータの手動修正データから得たドラ、手牌、鳴き牌、捨て牌、巡目数のデータを挿入する
            fixes_river_tiles = fixes_list["fixes_river_tiles"]

            detection_result = {
                "turn": fixes_data["turn"],
                "dora_indicators": fixes_data["dora_indicators"],
                "hand_tiles": fixes_data["hand_tiles"],
                "melded_blocks": fixes_data["melded_blocks"],
                "discard_tiles": fixes_river_tiles
            }

            if len(fixes_data["hand_tiles"]) + len(fixes_data["melded_blocks"] * 3) <= 12 or len(fixes_data["hand_tiles"]) + len(fixes_data["melded_blocks"] * 3) >= 15:
                message = "The number of tiles in your hand is invalid. ({} tiles detected in hand)".format(len(fixes_data["hand_tiles"]))
                status =420

                return JsonResponse(
                    {
                    'message': message,
                    "detection_result": detection_result
                    },
                    status=status
                )

            # 物体検知は行わずに直接計算を行う
            save_data = (
                    fixes_data["dora_indicators"],
                    fixes_data["hand_tiles"],
                    fixes_data["melded_blocks"],
                    fixes_river_tiles,
                    fixes_data["turn"]
                )
        # print(save_data)
    return save_data,detection_result