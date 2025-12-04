# result_check.py
# 牌の検知結果をチェックするためのモジュール

# 誤検知の可能性がある牌はIDに1000を加算して区別する
# 1000で割れるIDは誤検知の可能性があるとして赤く表示するなどの処理を行う

import collections


# 定数定義
SUSPICIOUS_OFFSET = 1000
ROTATION_OFFSET = 100
RED_DORA_MAP = {
    34: 4,  # 赤5萬 -> 5萬
    35: 13, # 赤5筒 -> 5筒
    36: 22, # 赤5索 -> 5索
}
NORMAL_5_IDS = {4, 13, 22} # 通常の5の牌ID
CONFIDENCE_THRESHOLD = 0.75


# IDの正規化
def normalize_id(tile_id: int) -> int:

    # 1000のオフセットを取り除く
    tid = tile_id % SUSPICIOUS_OFFSET

    # 横向き牌のオフセットを取り除く
    if tid >= ROTATION_OFFSET:
        tid -= ROTATION_OFFSET

    # 赤ドラのIDを通常のIDに変換
    if tid in RED_DORA_MAP:
        tid = RED_DORA_MAP[tid]

    return tid


# 誤検知の可能性のある牌にフラグを立てる関数
def mark_suspicious(tile_id: int) -> int:
    if tile_id >= SUSPICIOUS_OFFSET:
        return tile_id
    return tile_id + SUSPICIOUS_OFFSET


# 1. 一種類の牌が5枚以上検出されている場合
# 赤ドラは2枚以上検知されたら誤検知の可能性が高いとみなす
# 通常の5の牌は4枚以上検知されたら誤検知の可能性が高いとみなす
def check_tile_counts(result: dict):

    all_tiles_refs = [] # 値を書き換えるために参照（リストとインデックス）を保持する
    
    count_per_id = collections.Counter()
    count_per_rank = collections.Counter()

    # リスト内の牌を集計する内部関数
    def process_list(tile_list):
        for i, tid in enumerate(tile_list):
            # 1. フラグと回転を除去したID (Clean ID)
            clean_id = tid % SUSPICIOUS_OFFSET
            if clean_id >= ROTATION_OFFSET:
                clean_id -= ROTATION_OFFSET
            
            # 2. 赤ドラを通常牌に変換したID (Normalized ID)
            norm_id = clean_id
            if clean_id in RED_DORA_MAP:
                norm_id = RED_DORA_MAP[clean_id]
            
            # 3. カウントアップ
            count_per_id[clean_id] += 1
            count_per_rank[norm_id] += 1
            
            # 4. 参照とID情報を保存
            all_tiles_refs.append((tile_list, i, clean_id, norm_id))

    # 各エリアの牌を処理
    process_list(result["hand_tiles"])
    process_list(result["dora_indicators"])
    for meld_sets in result["melded_tiles"].values():
        for meld_list in meld_sets:
            process_list(meld_list)
    for discard_list in result["discard_tiles"].values():
        process_list(discard_list)

    # 判定とマーク処理
    for lst, idx, clean_id, norm_id in all_tiles_refs:
        should_mark = False

        # 条件A: 同一種の牌（赤・通常込み）が合計5枚以上あるか？
        if count_per_rank[norm_id] > 4:
            should_mark = True
        
        # 条件B: 赤ドラが2枚以上あるか？
        elif clean_id in RED_DORA_MAP and count_per_id[clean_id] >= 2:
            should_mark = True

        # 条件C: 通常の5が4枚以上あるか？
        # (通常、赤1枚入りのルールなら通常5は最大3枚のはず)
        elif clean_id in NORMAL_5_IDS and count_per_id[clean_id] >= 4:
            should_mark = True
        
        if should_mark:
            lst[idx] = mark_suspicious(lst[idx])


# 2. 鳴き牌の形式が不自然な場合
def check_melded_tiles(result: dict):
    for zone_key, meld_sets in result["melded_tiles"].items():
        for meld_list in meld_sets:
            if not meld_list:
                continue
                
            is_suspicious = False
            
            # 枚数チェック (少なすぎる、多すぎる)
            if len(meld_list) < 3 or len(meld_list) > 4:
                is_suspicious = True
            else:
                # IDを正規化して判定用にリスト化
                norm_ids = [normalize_id(tid) for tid in meld_list]
                norm_ids.sort()
                
                # 判定ロジック
                # パターンA: 刻子/槓子 (すべて同じID)
                if all(nid == norm_ids[0] for nid in norm_ids):
                    pass # OK
                
                # パターンB: 順子 (連続した3枚) - 字牌(27以上)は順子になれない
                elif len(norm_ids) == 3:
                    if norm_ids[0] >= 27: # 字牌の順子はありえない
                        is_suspicious = True
                    elif (norm_ids[0] + 1 == norm_ids[1]) and (norm_ids[1] + 1 == norm_ids[2]):
                        # 萬子(0-8), 筒子(9-17), 索子(18-26) の境界を跨いでいないかチェック
                        # 例えば 8(9m), 9(1p), 10(2p) のような並びは不正
                        suit1 = norm_ids[0] // 9
                        suit3 = norm_ids[2] // 9
                        if suit1 != suit3:
                            is_suspicious = True
                    else:
                        is_suspicious = True
                else:
                    # 4枚で順子はありえない（槓子はパターンAで通過済み）
                    is_suspicious = True

            # 疑わしい場合、その鳴きセット全ての牌をマーク
            if is_suspicious:
                for i in range(len(meld_list)):
                    meld_list[i] = mark_suspicious(meld_list[i])


# 3. 物体検知の信頼度が0.75未満の場合
def check_confidence(result: dict):
    # 手牌のチェック
    if "hand_confs" in result:
        for i, conf in enumerate(result["hand_confs"]):
            if conf < CONFIDENCE_THRESHOLD:
                result["hand_tiles"][i] = mark_suspicious(result["hand_tiles"][i])
        
    # ドラ表示牌のチェック
    if "dora_confs" in result:
        for i, conf in enumerate(result["dora_confs"]):
            if conf < CONFIDENCE_THRESHOLD:
                result["dora_indicators"][i] = mark_suspicious(result["dora_indicators"][i])

    # 捨て牌のチェック
    if "discard_confs" in result:
        for zone_key, conf_list in result["discard_confs"].items():
            discard_list = result["discard_tiles"].get(zone_key, [])
            for i, conf in enumerate(conf_list):
                if conf < CONFIDENCE_THRESHOLD:
                    discard_list[i] = mark_suspicious(discard_list[i])

    # 鳴き牌のチェック
    if "melded_confs" in result:
        for zone_key, meld_sets_confs in result["melded_confs"].items():
            meld_sets_ids = result["melded_tiles"].get(zone_key, [])

            if not meld_sets_ids or len(meld_sets_ids) != len(meld_sets_confs):
                continue

            # 各セットごと
            for set_idx, conf_list in enumerate(meld_sets_confs):
                id_list = meld_sets_ids[set_idx]
                
                if len(id_list) != len(conf_list):
                    continue

                # 牌ごと
                for i, conf in enumerate(conf_list):
                    if conf < CONFIDENCE_THRESHOLD:
                        id_list[i] = mark_suspicious(id_list[i])


# 4. 立直が2枚以上検出されている場合
def check_riichi_dup(result: dict):
    for zone_key, discard_list in result["discard_tiles"].items():
        # 横向き牌のインデックスを取得（マーク済みでないもの）
        # detect.pyでは横向きは ID + 100 されている前提
        riichi_indices = []
        for i, tid in enumerate(discard_list):
            # フラグ除去後のIDで確認
            clean_tid = tid % SUSPICIOUS_OFFSET
            
            # 100以上 かつ 200未満 (通常牌37種+100=137までなので)
            # detect.pyの仕様により横向きは+100される
            if 100 <= clean_tid < 200:
                riichi_indices.append(i)
        
        # 1人のプレイヤーが2回以上リーチ（横向き捨て牌）はありえない
        if len(riichi_indices) >= 2:
            for idx in riichi_indices:
                discard_list[idx] = mark_suspicious(discard_list[idx])

# メインのチェック関数
def result_check_main(result: dict) -> dict:

    if not result:
        return result
    
    # 牌の枚数チェック
    check_tile_counts(result)
    
    # 鳴き牌の形式チェック
    check_melded_tiles(result)

    # 信頼度チェック
    # 確信度がある場合のみ行う
    if "hand_confs" in result:
        check_confidence(result)

    # 立直重複チェック
    check_riichi_dup(result)
    
    return result

if __name__ == '__main__':
    # テスト用データ (信頼度データの構造も模倣)
    mock_result = {
        "turn": 5,
        
        # ------------------------------------------------------------------
        # ドラ: ID[1]
        # テスト: 信頼度が低い(0.2) -> マークされるべき
        # ------------------------------------------------------------------
        "dora_indicators": [1], 
        "dora_confs":      [0.2], 

        # ------------------------------------------------------------------
        # 手牌: [0, 2, 34(赤5m)]
        # テスト: 正常な信頼度
        # ------------------------------------------------------------------
        "hand_tiles": [0, 2, 34], 
        "hand_confs": [0.9, 0.9, 0.9],

        # ------------------------------------------------------------------
        # 鳴き牌:
        # bottom 1: [0,1,2] -> OK
        # bottom 2: [5,5,6] -> 不正な並び -> マークされるべき
        # right 1:  [2,4,3] -> ソートすれば[2,3,4]でOKだが、信頼度が低い牌がある想定
        # right 2:  [120,121,122] -> 字牌(南,西,北)の順子はありえない -> マークされるべき
        # ------------------------------------------------------------------
        "melded_tiles": {
            "melded_tiles_bottom": [[0, 1, 2], [5, 5, 6]],
            "melded_tiles_right":  [[2, 4, 3], [27, 28, 29]], # 27=東,28=南,29=西 (字牌順子)
            "melded_tiles_top":    [],
            "melded_tiles_left":   []
        },
        "melded_confs": {
            "melded_tiles_bottom": [[0.9, 0.9, 0.9], [0.9, 0.9, 0.9]],
            "melded_tiles_right":  [[0.9, 0.1, 0.9], [0.9, 0.9, 0.9]], # 2つ目の牌が低信頼度
            "melded_tiles_top":    [],
            "melded_tiles_left":   []
        },

        # ------------------------------------------------------------------
        # 捨て牌:
        # bottom: リーチ(横向き)が2つある -> 重複でマークされるべき
        # right/top/left: 合計で赤5m(34)が2枚、通常5m(4)が3枚ある
        #   -> 手牌の赤5m(34)と合わせて赤3枚になるため、赤ドラ枚数超過でマークされるべき
        #   -> 通常5m(4)は合計3枚なのでセーフ
        # ------------------------------------------------------------------
        "discard_tiles": {
            "discard_tiles_bottom": [105, 106, 1],
            "discard_tiles_right":  [34, 4, 1],
            "discard_tiles_top":    [34, 4],
            "discard_tiles_left":   [21, 4]
        },
        "discard_confs": {
            "discard_tiles_bottom": [0.9, 0.9, 0.9],
            "discard_tiles_right":  [0.9, 0.9, 0.9],
            "discard_tiles_top":    [0.9, 0.9],
            "discard_tiles_left":   [0.9, 0.9]
        }
    }

    import pprint
    print("Before:")
    pprint.pprint(mock_result)
    
    checked_result = result_check_main(mock_result)
    
    print("\nAfter:")
    # 期待される結果の概要:
    # dora[0]: +1000 (信頼度不足)
    # meld_bottom[1]: [5,5,6] 全て +1000 (構成不正)
    # meld_right[0]: 2つ目の牌 +1000 (信頼度不足)
    # meld_right[1]: [27,28,29] 全て +1000 (字牌順子不正)
    # discard_bottom: 105, 106 が +1000 (リーチ重複)
    # 赤5m(34): 手牌1 + 捨て牌2 = 計3枚 -> 赤5mは全て +1000 (枚数超過)
    pprint.pprint(checked_result)