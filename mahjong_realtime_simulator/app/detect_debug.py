# detect_debug.py
# 誤検知の原因を表示するためのモジュール

# ANSIカラーコード
# プレイヤーごとに色を設定
class ANSI_COLOR:
    RESET = '\033[0m'
    MINE = '\033[38;5;217m'    
    RIGHT = '\033[38;5;111m'   
    TOP = '\033[38;5;151m'     
    LEFT = '\033[38;5;228m'      
    ANOMALIES = '\033[91m'
    
def colorize_text(text, color_code):
    return f"{color_code}{text}{ANSI_COLOR.RESET}"

PLAYER_COLORS = {
    'melded_tiles_bottom': ANSI_COLOR.MINE,
    'melded_tiles_right': ANSI_COLOR.RIGHT,
    'melded_tiles_top': ANSI_COLOR.TOP,
    'melded_tiles_left': ANSI_COLOR.LEFT,
    'discard_tiles_bottom': ANSI_COLOR.MINE,
    'discard_tiles_right': ANSI_COLOR.RIGHT,
    'discard_tiles_top': ANSI_COLOR.TOP,
    'discard_tiles_left': ANSI_COLOR.LEFT,
}


# ID牌変換表
str_convert = {
    # 縦向きの牌
    0: "一萬", 1: "二萬", 2: "三萬", 3: "四萬", 4: "五萬", 5: "六萬", 6: "七萬", 7: "八萬", 8: "九萬",
    9: "一筒", 10: "二筒", 11: "三筒", 12: "四筒", 13: "五筒", 14: "六筒", 15: "七筒", 16: "八筒", 17: "九筒",
    18: "一索", 19: "二索", 20: "三索", 21: "四索", 22: "五索", 23: "六索", 24: "七索", 25: "八索", 26: "九索",
    27: "東", 28: "南", 29: "西", 30: "北", 31: "白", 32: "發", 33: "中",

    # 横向きの牌
    100: "▶一萬", 101: "▶二萬", 102: "▶三萬", 103: "▶四萬", 104: "▶五萬", 105: "▶六萬", 106: "▶七萬", 107: "▶八萬", 108: "▶九萬",
    109: "▶一筒", 110: "▶二筒", 111: "▶三筒", 112: "▶四筒", 113: "▶五筒", 114: "▶六筒", 115: "▶七筒", 116: "▶八筒", 117: "▶九筒",
    118: "▶一索", 119: "▶二索", 120: "▶三索", 121: "▶四索", 122: "▶五索", 123: "▶六索", 124: "▶七索", 125: "▶八索", 126: "▶九索",
    127: "▶東", 128: "▶南", 129: "▶西", 130: "▶北", 131: "▶白", 132: "▶發", 133: "▶中"
}

PLAYER_MAP = {
    'melded_tiles_bottom': '自家鳴牌',
    'melded_tiles_right': '下家鳴牌',
    'melded_tiles_top': '対面鳴牌',
    'melded_tiles_left': '上家鳴牌',
    'discard_tiles_bottom': '自家捨牌',
    'discard_tiles_right': '下家捨牌',
    'discard_tiles_top': '対面捨牌',
    'discard_tiles_left': '上家捨牌',
}


def get_base_tile_id(tile_id):
    """異常プレフィックス(1000の位)を除去した牌IDを取得する。"""
    
    # プレフィックスの除去 (1000の位のみ)
    if tile_id >= 1000:
        tile_id %= 1000
        
    return tile_id

def tile_id_to_string(tile_id):
    """牌IDを文字列に変換する。横向き牌には▶が付与される。誤検知を示すプレフィックスは付けない。"""
    
    # 異常プレフィックス(1000の位)を除去した牌IDを取得 (0-133)
    base_id = get_base_tile_id(tile_id)
    
    # str_convert は 0-33 (縦向き名称) および 100-133 (▶横向き名称) を定義している
    tile_name_from_dict = str_convert.get(base_id, f"不明牌({base_id})")
    
    # [誤] プレフィックスは付けないため、そのまま名称を返す
    return tile_name_from_dict


def print_detection_details(result):
    """
    検出結果の詳細を見やすい形式で表示する。
    """
    if 'result' not in result:
        print("エラー: 'result' キーが検出データに見つかりません。")
        return

    data = result['result']

    print("-" * 30)
    print("★【麻雀牌 検出詳細】")
    print("-" * 30)

    # 1. 巡目
    turn = data.get('turn', '不明')
    print(f"巡目: {turn}巡目")
    print("-" * 30)

    # 2. ドラ表示牌
    dora_ids = data.get('dora_indicators', [])
    dora_names = [tile_id_to_string(id) for id in dora_ids]
    print(f"ドラ表示牌: {', '.join(dora_names)}")
    print("-" * 30)

    # 3. 手牌 (ソート済み)
    hand_ids = data.get('hand_tiles', [])
    
    # (元の牌ID, ソートキーとなる基本ID(0-33)) のタプルリストを作成
    sortable_hand_tiles = [
        (tile_id, get_base_tile_id(tile_id) % 100)
        for tile_id in hand_ids
    ]

    # 基本IDでソート
    sorted_hand_tiles = sorted(sortable_hand_tiles, key=lambda x: (x[1], x[0]))
    sorted_hand_ids = [tile_id for tile_id, _ in sorted_hand_tiles]

    hand_names = [tile_id_to_string(id) for id in sorted_hand_ids]
    print(f"手牌 ({len(hand_ids)}枚):")
    print(f"  {', '.join(hand_names)}")
    print("-" * 30)
    
    # 4. 鳴牌 (色付け適用)
    melded_tiles = data.get('melded_tiles', {})
    print("鳴牌:")
    
    player_keys = ['melded_tiles_bottom', 'melded_tiles_right', 'melded_tiles_top', 'melded_tiles_left']
    
    for key in player_keys:
        player_name = PLAYER_MAP.get(key, key)
        color = PLAYER_COLORS.get(key, ANSI_COLOR.RESET)
        melds = melded_tiles.get(key, [])
        
        if melds:
            melds_str = []
            for group in melds:
                group_names = [tile_id_to_string(id) for id in group]
                # 牌の名称全体に色を適用
                melds_str.append(colorize_text(f"[{', '.join(group_names)}]", color))
            print(f"  {colorize_text(player_name, color)}: {', '.join(melds_str)}")
        else:
            print(f"  {colorize_text(player_name, color)}: なし")
    print("-" * 30)

    # 5. 捨牌 (色付け適用)
    discard_tiles = data.get('discard_tiles', {})
    print("捨牌:")

    player_keys = ['discard_tiles_bottom', 'discard_tiles_right', 'discard_tiles_top', 'discard_tiles_left']

    for key in player_keys:
        player_name = PLAYER_MAP.get(key, key)
        color = PLAYER_COLORS.get(key, ANSI_COLOR.RESET)
        discards = discard_tiles.get(key, [])
        
        discard_names = [tile_id_to_string(id) for id in discards]
        
        if discard_names:
            # 捨牌を6枚ごとに区切って表示
            grouped_discards = []
            for i in range(0, len(discard_names), 6):
                # 牌一つ一つに色を適用し、結合
                colored_group = ', '.join([colorize_text(name, color) for name in discard_names[i:i+6]])
                grouped_discards.append(colored_group)
            
            print(f"  {colorize_text(player_name, color)} ({len(discards)}枚):")
            for group in grouped_discards:
                print(f"    {group}")
        else:
            print(f"  {colorize_text(player_name, color)}: なし")
    print("-" * 30)


def extract_all_anomalous_tiles_with_prefix(result):
    all_tiles = []

    all_tiles.extend(result['result']['dora_indicators'])
    all_tiles.extend(result['result']['hand_tiles'])

    for key in result['result']['melded_tiles']:
        for group in result['result']['melded_tiles'][key]:
            all_tiles.extend(group)

    for key in result['result']['discard_tiles']:
        all_tiles.extend(result['result']['discard_tiles'][key])
        
    anomalous_tiles = [
        tile_id for tile_id in all_tiles if tile_id >= 1000
    ]
    
    return anomalous_tiles


def analyze_anomalies_by_prefix(result):
    
    all_anomalous_tiles = extract_all_anomalous_tiles_with_prefix(result)
    
    anomalies = {
        "誤検知": set(),
    }

    # 異常を分類
    for tile_id in all_anomalous_tiles:
        
        # 異常プレフィックスのみを除去した牌IDを取得 (100の位は保持される)
        base_id_with_100s = get_base_tile_id(tile_id)

        if tile_id >= 1000:
            anomalies["誤検知"].add(base_id_with_100s)


    # 結果の整形と出力
    print(f"{ANSI_COLOR.ANOMALIES}以下の牌は、検出時に誤検知フラグ(1000の位)が付与されていました:{ANSI_COLOR.RESET}")

    all_empty = True
    categories = ["誤検知"]
    
    for category in categories:
        tile_ids = anomalies[category]
        if tile_ids:
            all_empty = False
            # ソートして文字列に変換
            sorted_ids = sorted(list(tile_ids))
            
            # 誤検知の出力は色付けなし
            print(f"{category}: {', '.join(tile_id_to_string(id) for id in sorted_ids)}")

    if all_empty:
        print("該当する異常は検出されませんでした。")