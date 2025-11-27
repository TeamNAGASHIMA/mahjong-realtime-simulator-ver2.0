# meld_sep.py (最終版)

from typing import List

ORIENTATION_OFFSET = 100 # 横向き牌のIDオフセット(横向きの場合は元のIDに100を加算されている)

def _get_base_id(tile_id: int) -> int:
    """IDからオフセットを引いて基本IDを取得する (100以上なら引く)"""
    return tile_id if tile_id < ORIENTATION_OFFSET else tile_id - ORIENTATION_OFFSET

def melded_tiles_sep(ids_in_order: List[int]) -> List[List[int]]:
    """
    X座標順に並んだIDリストから、3枚または4枚のセット（順子、ポン、カン）に分割します。
    比較には基本IDを使用し、セットの要素には元のID（+100情報を含む）を保持します。
    """
    final_sets = []
    i = 0
    N = len(ids_in_order)
    
    while i < N:
        
        # 処理のために現在の3枚の基本IDを取得
        base_ids = []
        if i + 3 <= N:
            # 3枚確保可能
            for k in range(3):
                base_ids.append(_get_base_id(ids_in_order[i + k]))
            
            id1, id2, id3 = base_ids[0], base_ids[1], base_ids[2]
            
            # 暗槓チェック（基本IDで比較）
            is_doublet = (id1 == id2)

            # 刻子チェック（基本IDで比較）
            is_triplet = (id1 == id2 and id2 == id3)

            if is_triplet:
                # 4枚目（カン）をチェック
                if i + 4 <= N and _get_base_id(ids_in_order[i + 3]) == id1:
                    # 4枚すべてが同じID (カン) -> 元のID 4つをセットに追加
                    final_sets.append(ids_in_order[i : i + 4])
                    i += 4
                else:
                    # 3枚で確定 (ポン) -> 元のID 3つをセットに追加
                    final_sets.append(ids_in_order[i : i + 3])
                    i += 3
            else:
                if is_doublet:
                    # 暗槓
                    final_sets.append(ids_in_order[i : i + 2]*2)
                    i += 2
                else:
                    # 順子またはその他の3枚セットとして確定 -> 元のID 3つをセットに追加
                    final_sets.append(ids_in_order[i : i + 3])
                    i += 3
        
        # 残りの牌の処理 (2枚以下の場合)
        elif i < N:
            # 2枚の場合は暗槓として扱う
            if i + 2 <= N:
                final_sets.append(ids_in_order[i : i + 2]*2)
                i += 2
            # 1枚の場合は削除
            elif i + 1 <= N:
                i += 1
        else:
            break

    return final_sets

if __name__ == '__main__':
    # テストケース1
    test_input = [1, 2, 103, 12, 12, 112]
    result = melded_tiles_sep(test_input)
    print("テストケース1結果:", result)

    # テストケース2
    test_input = [5, 5, 5, 105, 23, 124, 25, 30]
    result = melded_tiles_sep(test_input)
    print("テストケース2結果:", result)

    # テストケース3
    test_input = [10, 11, 12, 20, 20, 20, 120, 30]
    result = melded_tiles_sep(test_input)
    print("テストケース3結果:", result)

    # テストケース4
    test_input = [12, 12, 11, 11, 11]
    result = melded_tiles_sep(test_input)
    print("テストケース4結果:", result)

    # テストケース5
    test_input = [103, 3, 3, 103, 4, 5]
    result = melded_tiles_sep(test_input)
    print("テストケース5結果:", result)

    # テストケース6
    test_input = [6, 7, 8, 0, 0, 31, 31, 31, 131]
    result = melded_tiles_sep(test_input)
    print("テストケース6結果:", result)

    # テストケース7
    test_input = [0, 0, 1, 1, 2, 2, 3, 3]
    result = melded_tiles_sep(test_input)
    print("テストケース7結果:", result)
    
    # テストケース8
    test_input = [1, 1]
    result = melded_tiles_sep(test_input)
    print("テストケース8結果:", result)