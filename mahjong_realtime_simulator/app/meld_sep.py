# meld_sep.py
from typing import List, Tuple

ORIENTATION_OFFSET = 100 

def _get_base_id(tile_id: int) -> int:
    return tile_id if tile_id < ORIENTATION_OFFSET else tile_id - ORIENTATION_OFFSET

def melded_tiles_sep(ids_in_order: List[int], confs_in_order: List[float] = None) -> Tuple[List[List[int]], List[List[float]]]:
    """
    X座標順に並んだIDリストと信頼度リストから、3枚または4枚のセットに分割します。
    暗槓（2枚検出）の場合、IDも信頼度も2倍（リピート）して返します。
    """
    final_sets_ids = []
    final_sets_confs = []
    
    # 信頼度リストがない場合はダミー（None）で処理してエラーを防ぐ
    if confs_in_order is None:
        confs_in_order = [0.0] * len(ids_in_order)

    i = 0
    N = len(ids_in_order)
    
    while i < N:
        
        base_ids = []
        if i + 3 <= N:
            for k in range(3):
                base_ids.append(_get_base_id(ids_in_order[i + k]))
            
            id1, id2, id3 = base_ids[0], base_ids[1], base_ids[2]
            is_doublet = (id1 == id2)
            is_triplet = (id1 == id2 and id2 == id3)

            if is_triplet:
                # 4枚目（カン）をチェック
                if i + 4 <= N and _get_base_id(ids_in_order[i + 3]) == id1:
                    # 4枚すべてが同じID (カン)
                    final_sets_ids.append(ids_in_order[i : i + 4])
                    final_sets_confs.append(confs_in_order[i : i + 4])
                    i += 4
                else:
                    # 3枚で確定 (ポン)
                    final_sets_ids.append(ids_in_order[i : i + 3])
                    final_sets_confs.append(confs_in_order[i : i + 3])
                    i += 3
            else:
                if is_doublet:
                    # 暗槓 (2枚 -> 4枚に増幅)
                    # 信頼度も同様に増幅させる
                    final_sets_ids.append(ids_in_order[i : i + 2] * 2)
                    final_sets_confs.append(confs_in_order[i : i + 2] * 2)
                    i += 2
                else:
                    # 順子
                    final_sets_ids.append(ids_in_order[i : i + 3])
                    final_sets_confs.append(confs_in_order[i : i + 3])
                    i += 3
        
        elif i < N:
            # 2枚の場合は暗槓として扱う
            if i + 2 <= N:
                final_sets_ids.append(ids_in_order[i : i + 2] * 2)
                final_sets_confs.append(confs_in_order[i : i + 2] * 2)
                i += 2
            # 1枚の場合は削除（無視）
            elif i + 1 <= N:
                i += 1
        else:
            break

    return final_sets_ids, final_sets_confs

if __name__ == '__main__':
    # テストケース1
    ids_in_order = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5]
    confs_in_order = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0]
    final_sets_ids, final_sets_confs = melded_tiles_sep(ids_in_order, confs_in_order)
    print(final_sets_ids)
    print(final_sets_confs)