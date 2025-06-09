import asyncio
from mrs_class import *
import calc

doraList = [Tile.Manzu5]
hand_tiles = [
    0, 1, 2,     
    Tile.Pinzu4, Tile.Pinzu5, Tile.Pinzu6,
    Tile.Haku
    ]
raw_melded_blocks = [
    [Tile.Ton, Tile.Ton, Tile.Ton],
    [Tile.Sya, Tile.Sya, Tile.Sya]
    ]
river_tiles = [
    Tile.Pinzu1,Tile.Pinzu2,Tile.Pinzu3,Tile.Pinzu4,Tile.Pinzu5,Tile.Pinzu6,
    Tile.Pinzu7,Tile.Pinzu8,Tile.Pinzu9,Tile.Sozu1,Tile.Sozu2,Tile.Sozu3,
    Tile.Sozu4,Tile.Sozu5,Tile.Sozu6,Tile.Sozu7,Tile.Sozu8,Tile.Sozu9,
    Tile.Pinzu1, Tile.Pinzu1
    ]
turn = 1
syanten_Type = SyantenType.Normal
flag = ExpOption.CalcSyantenDown | ExpOption.CalcTegawari


# 残り牌計算のtest
melded_blocks_ex1 = [calc.create_meld_block([Tile.Ton, Tile.Ton, Tile.Ton])]
remaining_tiles_ex1 = calc.calc_remaining_tiles(hand_tiles, doraList, melded_blocks_ex1, river_tiles)
print("残りの牌:")
for i, count in enumerate(remaining_tiles_ex1[:37]): # 赤牌のカウントは含めない
    print(f"  {Tile.Name[i]}: {count}枚")
print("\n")



# 期待値計算のtest
# asyncio.runを使って非同期関数を実行
result = asyncio.run(calc.async_score_calc(doraList, hand_tiles, raw_melded_blocks, river_tiles, turn, syanten_Type, flag))

calc.print_result(result)
print(result)