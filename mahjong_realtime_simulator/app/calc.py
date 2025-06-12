import json
import requests
from mrs_class import *

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

# 結果の整形
def print_result(result):
    result_type = result["result_type"]  # 結果の種類
    syanten = result["syanten"]  # 向聴数
    time_us = result["time"]  # 計算時間 (マイクロ秒)

    print(
        f"向聴数: {syanten['syanten']}"
        f" (通常手: {syanten['normal']}, 七対子手: {syanten['tiitoi']}, 国士無双手: {syanten['kokusi']})"
    )
    print(f"計算時間: {time_us / 1e6}秒")

    if result_type == 0:
        #
        # 手牌の枚数が13枚の場合、有効牌、期待値、和了確率、聴牌確率が得られる。
        #
        required_tiles = result["required_tiles"]  # 有効牌
        exp_values = result["exp_values"]  # 期待値 (1~17巡目)
        win_probs = result["win_probs"]  # 和了確率 (1~17巡目)
        tenpai_probs = result["tenpai_probs"]  # 聴牌確率 (1~17巡目)

        tiles = [f"{tile['tile']}: {tile['count']}枚" for tile in required_tiles]
        print(f"  有効牌: {', '.join(tiles)}")

        for turn, (exp, win_prop, tenpai_prop) in enumerate(
            zip(exp_values, win_probs, tenpai_probs), 1
        ):
            print(
                f"  {turn}巡目 期待値: {exp:.0f}点, 和了確率: {win_prop:.1%}, 聴牌確率: {tenpai_prop:.1%}"
            )

    elif result_type == 1:
        #
        # 手牌の枚数が14枚の場合、打牌候補ごとに有効牌、期待値、和了確率、聴牌確率が得られる。
        #
        for candidate in result["candidates"]:
            tile = candidate["tile"]  # 打牌候補
            syanten_down = candidate["syanten_down"]  # 向聴戻しとなる打牌かどうか
            required_tiles = candidate["required_tiles"]  # 有効牌
            exp_values = candidate["exp_values"]  # 期待値 (1~17巡目)
            win_probs = candidate["win_probs"]  # 和了確率 (1~17巡目)
            tenpai_probs = candidate["tenpai_probs"]  # 聴牌確率 (1~17巡目)

            print(f"打牌候補: {Tile.Name[tile]} (向聴落とし: {syanten_down})")

            tiles = [f"{tile['tile']}: {tile['count']}枚" for tile in required_tiles]
            print(f"  有効牌: {', '.join(tiles)}")

            for turn, (exp, win_prop, tenpai_prop) in enumerate(
                zip(exp_values, win_probs, tenpai_probs), 1
            ):
                print(
                    f"  {turn}巡目 期待値: {exp:.0f}点, 和了確率: {win_prop:.1%}, 聴牌確率: {tenpai_prop:.1%}"
                )

# 期待値計算
async def async_score_calc(doraList, hand_tiles, raw_melded_blocks, river_tiles, turn, syanten_Type, flag):
    """
    引数:
    - doraList: ドラ
    - hand_tiles: 手牌
    - raw_melded_blocks: 鳴き牌
    - river_tiles: 河牌
    - turn: 巡目
    - syanten_Type: 聴牌タイプ
    - flag: 設定フラグ

    async_score_calc(
        doraList:[Tile.Manzu5], 
        hand_tiles:[
            Tile.Manzu1, 
            Tile.Manzu2, 
            Tile.Manzu3,
            Tile.Pinzu4, 
            Tile.Pinzu5, 
            Tile.Pinzu6,
            Tile.Haku
        ], 
        raw_melded_blocks:[
            [Tile.Ton, Tile.Ton, Tile.Ton],
            [Tile.Sya, Tile.Sya, Tile.Sya]
        ], 
        river_tiles:[
            Tile.Pinzu1, 
            Tile.Pinzu2, 
            Tile.Pinzu3, 
            Tile.Pinzu4, 
            Tile.Pinzu5
        ], 
        turn:1,
        syanten_Type:SyantenType.Normal,
        flag:ExpOption.CalcSyantenDown + ExpOption.CalcTegawari
    )

    戻り値:
    - tile: 打牌する牌
    - required_tiles
    - count: 残り枚数
    - tile: 有効牌
    - syanten_down: 向聴戻しになるかどうか
    - exp_values: 1~17 巡目における期待値
    - win_probs: 1~17 巡目における和了確率
    - tenpai_probs: 1~17 巡目における聴牌確率

    {
        "tile": 1,
        "required_tiles": [
            {"count": 3, "tile": 1},
            {"count": 4, "tile": 4},
            {"count": 3, "tile": 16},
            {"count": 3, "tile": 25},
        ],
        "syanten_down": True,
        "exp_values": [
            3891.424884520901,
            3611.387861422344,
            3324.9602806561834,
            3032.9968246078943,
            2736.61314257078,
            2437.2401686922626,
            2136.6891411450547,
            1837.2294593562674,
            1541.681958625137,
            1253.5307198421215,
            977.0571881068047,
            717.5011748665181,
            481.2542973307469,
            276.0926081180646,
            111.45663941547303,
            0.0,
            0.0,
        ],
        "win_probs": [
            0.28676429520079144,
            0.2648826688812986,
            0.2425884467324838,
            0.21996018286576025,
            0.19709834604910853,
            0.17412977831069812,
            0.15121302315346807,
            0.12854469610673472,
            0.10636710599982613,
            0.08497737871415958,
            0.06473838800697322,
            0.046091862473938344,
            0.029574116525271518,
            0.015834949744313175,
            0.005660377358490566,
            0.0,
            0.0,
        ],
        "tenpai_probs": [
            0.86033118739783,
            0.8433620793246688,
            0.8241517682984493,
            0.802380082468734,
            0.7776775927773254,
            0.7496174831278617,
            0.7177059858794518,
            0.6813711127748264,
            0.6399493574355539,
            0.5926699801291114,
            0.5386364060646058,
            0.47680417182584156,
            0.40595473676059113,
            0.32466433231730357,
            0.23126684636118597,
            0.1238095238095238,
            0.0,
        ],
    }
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
    # return req_data

    payload = json.dumps(req_data)
    # リクエストを送信する。
    res = requests.post(
        "http://localhost:8888", payload, headers={"Content-Type": "application/json"}
    )
    res_data = res.json()

    # 結果出力
    if not res_data["success"]:
        error_msg = ('error', {'error': f"計算の実行に失敗しました。(理由: {res_data['err_msg']})"})
        return error_msg
        # raise RuntimeError(f"計算の実行に失敗しました。(理由: {res_data['err_msg']})")
    
    result = res_data["response"]
    
    # result_msg = ('result', {'result': result})
    return result