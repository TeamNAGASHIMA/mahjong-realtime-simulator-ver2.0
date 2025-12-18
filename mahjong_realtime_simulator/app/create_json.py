import json
import os
from django.conf import settings
from datetime import datetime


# 前回の手牌データを保存・読み込みする関数
def save_prev_hand(data=[]):
    hand_data = {"prev_hand": data}
    with open('prev_hand.json', 'w', encoding='utf-8') as f:
        json.dump(hand_data, f, ensure_ascii=False, indent=4)

# 前回の手牌データを読み込む関数
def load_prev_hand():
    if not os.path.exists('prev_hand.json'):
        return []
    
    with open('prev_hand.json', 'r', encoding='utf-8') as f:
        hand_data = json.load(f)
    
    return hand_data.get("prev_hand", [])

# 前回の手牌を削除する関数
def delete_prev_hand():
    if os.path.exists('prev_hand.json'):
        os.remove('prev_hand.json')


# 一時的にresultを保存・追記する関数
def save_temp_result(step_data={}):
    """
    一時的なresultファイルに新しいゲームステップ（辞書）を追記する関数。
    temp_resultの中身をリストとして扱い、時系列で追加する。
    """
    FILE_NAME = 'temp_result.json'

    current_steps = []
    if os.path.exists(FILE_NAME) and os.path.getsize(FILE_NAME) > 0:
        try:
            with open(FILE_NAME, 'r', encoding='utf-8') as f:
                temp_data = json.load(f)
                # 既存のデータがリスト形式であることを期待
                current_steps = temp_data.get("temp_result", [])
                if not isinstance(current_steps, list):
                    # 予期せぬ形式の場合は空のリストから始める
                    current_steps = []
                
        except json.JSONDecodeError:
            return {"message": "Failed to read existing temp_result.json.", "status": "503"}

    # 2. リストの末尾に新しいステップデータを追加 (追記)
    current_steps.append(step_data)
    print(f"一時結果に新しいステップを追加しました (合計ステップ数: {len(current_steps)})")
    
    # 3. 変更後のリスト全体を新しい構造で上書き保存
    final_data = {"temp_result": current_steps}
    with open(FILE_NAME, 'w', encoding='utf-8') as f:
        json.dump(final_data, f, ensure_ascii=False, indent=4)

# 一時的なresultを読み込む関数
def load_temp_result():
    if not os.path.exists('temp_result.json'):
        return {}
    
    with open('temp_result.json', 'r', encoding='utf-8') as f:
        temp_data = json.load(f)
    
    return temp_data

# 一時的なresultを削除する関数
def delete_temp_result():
    if os.path.exists('temp_result.json'):
        os.remove('temp_result.json')


# 手牌が変化したら前回の手牌データとして保存する関数
def difference_in_hands(data):
    """手牌が変化したかどうかをチェックし、変化があれば前回の手牌データを保存する。
    Args:
        data (list): 新しい手牌データ

    Returns:
        bool: 手牌が変化した場合はTrue、変化していない場合はFalse
    """

    prev_hand = load_prev_hand()
    if prev_hand != data:
        save_prev_hand(data)
        return True
    return False

def create_game_data_json(folder_path="game_data_json_files", file_name="", data={}):
    """
    指定されたファイル名でJSONファイルを作成する関数。
    データ内に作成日時を記録します。

    Args:
        folder_path (str): ファイルを作成したいフォルダーのパス。
        file_name (str): ファイル名（例: 'my_game.json'）。
        data (dict/list): ファイルに書き込むデータ。
    """
    
    # 保存するデータに作成日時を追加
    timestamp_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    data_to_save = {"created_at": timestamp_str}
    data_to_save.update(data)
    
    
    # フォルダーの存在を確認し、なければ作成する
    try:
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)
            print(f"フォルダーを作成しました: {folder_path}")
        else:
            print(f"フォルダーは既に存在します: {folder_path}")
            
    except Exception as e:
        return {"message": f"Create folder error occurred: {e}", "status": "503"}

    # ファイルのフルパスを作成
    file_path = os.path.join(folder_path, file_name)

    # JSONデータをファイルに書き込む
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data_to_save, f, ensure_ascii=False, indent=4)
        
        print(f"JSONファイルが正常に作成されました: {file_path}")
        
    except Exception as e:
        print(f"ファイルの書き込み中にエラーが発生しました: {e}")


# ファイル名チェック
# 重複、空文字チェックなど
def file_name_check(folder_path, file_name=""):
    base_name = file_name.replace(".json", "")
    if base_name.strip() == "":
        return False

    if os.path.exists(os.path.join(folder_path, file_name)):
        return False

    return True


# 差分チェックとJSON作成の関数
def difference_check(save_data, record_flg, file_name="game_data"):
    change_flg = False
    
    # # 手牌が変化したかどうかをチェック
    # if save_data != "":
    #     hand_tiles = save_data[1]
    #     if difference_in_hands(hand_tiles):
    #         print("前回の手牌データ（更新後）:", load_prev_hand())
    #         # タプルを辞書に変換
    #         step_data = {
    #             "dora_indicators": save_data[0],
    #             "hand_tiles": save_data[1],
    #             "melded_blocks": save_data[2],
    #             "river_tiles": save_data[3],
    #             "turn": save_data[4]
    #         }
    #         # 一時的にresultを保存
    #         save_temp_result(step_data)
    #         change_flg = True
    
    # 差分チェックをせず、データがあれば常に保存する
    if save_data != "":
        save_temp_result(save_data)
        change_flg = True

    # 記録終了ボタンが押された場合
    if record_flg == 2:
        haihu_dir = settings.HAIHU_ROOT
        json_file_name = f"{file_name}.json"
        # ファイルの名前が重複している場合、エラーを返す
        if not file_name_check(haihu_dir, json_file_name):
            return {'message': "File name is invalid.", 'status': "412"}

        # すべてのデータをまとめてJSONファイルを作成
        temp_result_data = load_temp_result()
        # 辞書をそのまま渡す
        create_game_data_json(folder_path=haihu_dir, file_name=json_file_name, data=temp_result_data)
        # 一時的なresultと前回のhand_tilesを削除
        delete_prev_hand()
        delete_temp_result()

        return {'message': "Data saved successfully.", 'status': "200", 'file_name': json_file_name}
    
    if not change_flg:
        return {'message': "No changes in hand tiles.", 'status': "200"}
    else:
        return {'message': "Hand tiles changed and data saved temporarily.", 'status': "200"}


if __name__ == "__main__":
    # テスト用の実行部分
    
    # 差分チェックとJSON作成のテスト
    test_save_data = ([], [9, 9, 9, 10, 11, 12, 13, 14, 14, 15, 16, 17, 17], {'melded_tiles_mine': [], 'melded_tiles_other': []}, [], 1)
    record_flag = 1  # 記録終了をシミュレート

    result = difference_check(test_save_data, record_flag, file_name="大三元")
    # print(result)

    # 記録終了で保存した場合にファイル名を返す
    # 何もない場合は空文字を返す""
    # ファイル名が重複している場合、エラーを返す