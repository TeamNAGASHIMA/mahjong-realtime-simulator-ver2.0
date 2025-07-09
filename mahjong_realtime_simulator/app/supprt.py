# {"support": {"target": [0], "allset": [{"set": [0, 0], "type": "pon"}, {"set": [1, 2], "type": "chi-"}]}}

# support => "supprt"でサポート機能の牌組み合わせを取得する
    # target => 他プレイヤーの誰かが捨てた牌を持たせる
    # allset => 手牌の中から出来うるすべての組み合わせと、それに該当する鳴き形式をすべてまとめる。リスト形式
        # set => targetと組み合わせれる手牌を二つ若しくは三つを持たせる
        # type => 「pon、chi-、kan」のどれか、setに該当するtypeを持たせる

def createSupport(
        hand_tiles :list, target_pai :int, target_player :int
        ):
    # hand_tiles :list => リスト形式の手牌リスト
    # target_pai :int => target_playerが捨てた牌
    # target_player :int => 上家==1、下家==2、対面==3で受け取る
    
    # リターン値の作成
    support = {"target": target_pai, "allset":[]}

    # チーの組み合わせを探る
    if target_player == 1:
        chi_search = [target_pai - 2, target_pai - 1, target_pai + 1, target_pai + 2,]
        for search_start in len(chi_search) - 1:
            if chi_search[search_start] in hand_tiles and chi_search[search_start + 1] in hand_tiles:
                chi_set = {"set": [chi_search[search_start], chi_search[search_start] + 1], "type": "chi"}
                support["allset"].append(chi_set)
    
    # ポンの組み合わせを探る
    indices = [i for i, x in enumerate(hand_tiles) if x == target_pai]
    if len(indices) >= 2:
        pai_set = [hand_tiles[indices[i]] for i in range(2)]
        pon_set = {"set": pai_set, "type": "pon"}
        support["allset"].append(pon_set)

    # カンの組み合わせを探る
    if len(indices) >= 3:
        pai_set = [hand_tiles[indices[i]] for i in range(3)]
        kan_set = {"set": pai_set, "type": "kan"}
        support["allset"].append(kan_set)

    return support