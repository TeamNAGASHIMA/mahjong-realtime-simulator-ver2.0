import asyncio

# 麻雀牌定義
# fmt:off
class Tile:
    Null = -1
    Manzu1 = 0      # 一萬
    Manzu2 = 1      # 二萬
    Manzu3 = 2      # 三萬
    Manzu4 = 3      # 四萬
    Manzu5 = 4      # 五萬
    Manzu6 = 5      # 六萬
    Manzu7 = 6      # 七萬
    Manzu8 = 7      # 八萬
    Manzu9 = 8      # 九萬
    Pinzu1 = 9      # 一筒
    Pinzu2 = 10     # 二筒
    Pinzu3 = 11     # 三筒
    Pinzu4 = 12     # 四筒
    Pinzu5 = 13     # 五筒
    Pinzu6 = 14     # 六筒
    Pinzu7 = 15     # 七筒
    Pinzu8 = 16     # 八筒
    Pinzu9 = 17     # 九筒
    Sozu1 = 18      # 一索
    Sozu2 = 19      # 二索
    Sozu3 = 20      # 三索
    Sozu4 = 21      # 四索
    Sozu5 = 22      # 五索
    Sozu6 = 23      # 六索
    Sozu7 = 24      # 七索
    Sozu8 = 25      # 八索
    Sozu9 = 26      # 九索
    Ton = 27        # 東
    Nan = 28        # 南
    Sya = 29        # 西
    Pe = 30         # 北
    Haku = 31       # 白
    Hatu = 32       # 発
    Tyun = 33       # 中
    AkaManzu5 = 34  # 赤五萬
    AkaPinzu5 = 35  # 赤五筒
    AkaSozu5 = 36   # 赤五索

    Name = [
        "一萬","二萬","三萬","四萬","五萬","六萬","七萬","八萬","九萬",
        "一筒","二筒","三筒","四筒","五筒","六筒","七筒","八筒","九筒",
        "一索","二索","三索","四索","五索","六索","七索","八索","九索",
        "東","南","西","北",
        "白","発","中",
        "赤五萬","赤五筒","赤五索"
    ]
# fmt:on

# 聴牌タイプ
# fmt:off
class SyantenType:
    Normal = 1 # 通常手
    Tiitoi = 2 # 七対子手
    Kokusi = 4 # 国士無双手
# fmt:on

# 期待値オプション(ビットフラグ)
# fmt:off
class ExpOption:
    CalcSyantenDown = 1      # 向聴落とし考慮
    CalcTegawari = 1 << 1    # 手変わり考慮
    CalcDoubleReach = 1 << 2  # ダブル立直考慮
    CalcIppatu = 1 << 3      # 一発考慮
    CalcHaiteitumo = 1 << 4  # 海底撈月考慮
    CalcUradora = 1 << 5     # 裏ドラ考慮
    CalcAkaTileTumo = 1 << 6 # 赤牌自摸考慮
    MaximaizeWinProb = 1 << 7 # 和了確率を最大化 (指定されていない場合は期待値を最大化)
# fmt:on

# メンツ種類定義
class MeldType:
    Null = -1
    Pon = 1
    Ti = 2
    Ankan = 3
    Minkan = 4
    Kakan = 5

    Name = ["ポン", "チー", "暗槓", "明槓", "加槓"]

# メンツ種類推測
def infer_meld_type(tiles, type):
    # tilesがリストであることを確認する
    if not isinstance(tiles, list):
        raise TypeError(f"Expected 'tiles' to be a list, but got {type(tiles)}. Value: {tiles}")

    if len(tiles) == 3:
        if tiles[0] + 1 == tiles[1] and tiles[1] + 1 == tiles[2]:
            return MeldType.Ti
        elif tiles[0] == tiles[1] and tiles[1] == tiles[2]:
            return MeldType.Pon
        else:
            raise ValueError("Invalid tiles pattern for meld.")
    elif len(tiles) == 4:
        if tiles[0] == tiles[1] and tiles[1] == tiles[2] and tiles[2] == tiles[3]:
            return MeldType.Minkan  # 明槓と仮定
        else:
            raise ValueError("Invalid tiles pattern for meld.")

    raise ValueError("Number of tiles must be 3 or 4.")

# メンツ情報格納
def create_meld_block(tiles, type=MeldType.Null):
    if type == MeldType.Null:
        type = infer_meld_type(tiles, type)
    elif type == MeldType.Ti:
        assert (
            len(tiles) == 3 and tiles[0] + 1 == tiles[1] and tiles[1] + 1 == tiles[2]
        ), "Invalid tiles pattern for meld."
    elif type == MeldType.Pon:
        assert (
            len(tiles) == 3 and tiles[0] == tiles[1] and tiles[1] == tiles[2]
        ), "Invalid tiles pattern for meld."
    elif type in [MeldType.Ankan, MeldType.Minkan, MeldType.Kakan]:
        assert (
            len(tiles) == 4
            and tiles[0] == tiles[1]
            and tiles[1] == tiles[2]
            and tiles[2] == tiles[3]
        ), "Invalid tiles pattern for meld."

    # discard_tile (鳴いた牌) と from (誰から鳴かれたか) は計算には関係ないので、適当に埋める。
    meld_block = {"type": type, "tiles": tiles, "discarded_tile": tiles[0], "from": 0}

    return meld_block

# 残り牌計算
def calc_remaining_tiles(hand_tiles, dora_indicators, melded_blocks, river_tiles):
    # counts[0] ~ counts[33]: 各牌の残り枚数、counts[34] ~ counts[36]: 赤牌が残っているかどうか
    # 牌の総数は0-33の34種類 + 赤牌3種類 = 合計37種類
    counts = [4 for _ in range(34)] + [1, 1, 1] 
    
    # melded_blocksはMeldBlockオブジェクトのリストであることを前提とする
    meld_tiles = []
    for meld in melded_blocks:
        # meldが辞書型であり、"tiles"キーを持っているかを確認
        if not isinstance(meld, dict) or "tiles" not in meld:
            raise TypeError(f"Expected meld to be a dictionary with 'tiles' key, but got {meld}")
        meld_tiles.extend(meld["tiles"])

    visible_tiles = hand_tiles + dora_indicators + meld_tiles + river_tiles

    for tile in visible_tiles:
        if tile < 0 or tile >= len(counts):
            print(f"Warning: Tile value {tile} is out of expected range for counts array. Skipping count reduction.")
            continue # 無効な牌はスキップ

        # その牌自体のカウントを減らす
        counts[tile] -= 1
        
        # 赤牌の場合、対応する通常の5の牌のカウントも減らす
        if tile == Tile.AkaManzu5:
            counts[Tile.Manzu5] -= 1
        elif tile == Tile.AkaPinzu5:
            counts[Tile.Pinzu5] -= 1
        elif tile == Tile.AkaSozu5:
            counts[Tile.Sozu5] -= 1

    return counts

# 期待値計算
async def async_score_calc(doraList, hand_tiles, raw_melded_blocks, river_tiles, turn, syanten_Type, flag):
    """
    async_score_clac
    (
    # ドラ
    doralist:[Tile.Manzu5], 
    # 手牌
    hand_tiles:[Tile.Manzu1, Tile.Manzu2, Tile.Manzu3,
                        Tile.Pinzu4, Tile.Pinzu5, Tile.Pinzu6,
                        Tile.Haku], 
    # 鳴き牌 (牌のリストのリスト)
    raw_melded_blocks:[[Tile.Ton, Tile.Ton, Tile.Ton],[Tile.Sya, Tile.Sya, Tile.Sya]], 
    # 河牌
    river_tiles:[Tile.Pinzu1, Tile.Pinzu2, Tile.Pinzu3, Tile.Pinzu4, Tile.Pinzu5], 
    # 現在の局
    turn:1,
    # 聴牌タイプ
    syanten_Type:SyantenType.Normal,
    # 設定フラグ
    flag:ExpOption.CalcSyantenDown + ExpOption.CalcTegawari
    )
    """
    melded_blocks = [create_meld_block(block_tiles) for block_tiles in raw_melded_blocks]

    counts = calc_remaining_tiles(hand_tiles, doraList, melded_blocks, river_tiles)

    req_data = {
        "version": "0.9.0",
        "zikaze": Tile.Ton, 
        "bakaze": Tile.Ton, 
        "turn": turn,
        "syanten_type": syanten_Type,
        "dora_indicators": doraList,
        "flag": flag,
        "hand_tiles": hand_tiles,
        "melded_blocks": melded_blocks, 
        "counts": counts,
    }
    return req_data


    # payload = json.dumps(req_data)
    # # リクエストを送信する。
    # res = requests.post(
    #     "http://localhost:8888", payload, headers={"Content-Type": "application/json"}
    # )
    # res_data = res.json()

    # ########################################
    # # 結果出力
    # ########################################
    # if not res_data["success"]:
    #     emit('error', {'error': f"計算の実行に失敗しました。(理由: {res_data['err_msg']})"})
    #     raise RuntimeError(f"計算の実行に失敗しました。(理由: {res_data['err_msg']})")
    
    # result = res_data["response"]
    # # result_emit = print_result(result)

    # # emit('result', {'result': result_emit})
    # emit('result', {'result': result})


# 期待値計算のtest
doraList = [Tile.Manzu5]
hand_tiles = [
    Tile.Manzu1, Tile.Manzu2, Tile.Manzu3,     
    Tile.Pinzu4, Tile.Pinzu5, Tile.Pinzu6,
    Tile.Haku
]
raw_melded_blocks = [
    [Tile.Ton, Tile.Ton, Tile.Ton],
    [Tile.Sya, Tile.Sya, Tile.Sya]
]
river_tiles = [Tile.Pinzu1, Tile.Pinzu2, Tile.Pinzu3, Tile.Pinzu4, Tile.Pinzu5]
turn = 1
syanten_Type = SyantenType.Normal
flag = ExpOption.CalcSyantenDown | ExpOption.CalcTegawari

# asyncio.runを使って非同期関数を実行
req_data = asyncio.run(async_score_calc(doraList, hand_tiles, raw_melded_blocks, river_tiles, turn, syanten_Type, flag))
print("期待値計算のリクエストデータ:")
print(req_data)
