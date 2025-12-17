# 計算
from mahjong.hand_calculating.hand import HandCalculator
# 麻雀牌
from mahjong.tile import TilesConverter
# 役, オプションルール
from mahjong.hand_calculating.hand_config import HandConfig, OptionalRules
# 鳴き
from mahjong.meld import Meld
# 風(場&自)
from mahjong.constants import EAST, SOUTH, WEST, NORTH

# HandCalculator(計算用クラス)のインスタンスを生成
calculator = HandCalculator()

# 結果出力用
def print_hand_result(hand_result):
    # エラー判定をここに追加
    if hand_result.error:
        print("【計算エラー】")
        print(f"原因: {hand_result.error}")
        print("----------------------------")
    else:
        #翻数, 符数
        print(hand_result.fu,"符")
        print(hand_result.han, "翻")
        #点数
        print("点数(ツモアガリの場合[上：親失点, 下:子失点], ロンアガリの場合[上:放銃者失点, 下:0])")
        print(hand_result.cost['main'], "点")
        print(hand_result.cost['additional'], "点")

        #役
        print(hand_result.yaku)
        #符数の詳細
        try:
            for fu_item in hand_result.fu_details:
                print(fu_item)
        except:
            print("この役に符は含まれていません。")
        print('')

def id_change(change_card):
    if change_card >= 1000:
        change_card = change_card - 1000
    if change_card >= 100:
        change_card = change_card - 100
    return change_card

# 点数計算メイン処理
def point_calculate(
        hand_tiles, # 手牌リスト、鳴き牌もすべて含めた形式にする。槓子がある場合でも、4つのまま追加する。
        win_tile,  # アガリ牌
        melds_list, # 鳴き牌、bottomのみの鳴き牌リスト
        dora_list, # ドラ牌リスト
        options_dict # オプション設定ディクショナリ
    ):
    # 麻雀牌MAP
    majong_map = [
        "m1","m2","m3","m4","m5","m6","m7","m8","m9",
        "p1","p2","p3","p4","p5","p6","p7","p8","p9",
        "s1","s2","s3","s4","s5","s6","s7","s8","s9",
        "h1","h2","h3","h4","h5","h6","h7",
        "m0","p0","s0"
        ]
    # 物体検知の結果の手牌を麻雀点数計算の形式に変換
    manz = [] # 萬子配列
    pinz = [] # 筒子配列
    souz = [] # 索子配列
    honz = [] # 字牌配列
    for hand_num in hand_tiles:
        hand_num = id_change(hand_num)
        card_hand = list(majong_map[hand_num])
        if card_hand[0] == "m":
            manz.append(int(card_hand[1]))
        elif card_hand[0] == "p":
            pinz.append(int(card_hand[1]))
        elif card_hand[0] == "s":
            souz.append(int(card_hand[1]))
        elif card_hand[0] == "h":
            honz.append(int(card_hand[1]))

    # 各配列をソートする
    if manz != []:
        manz_sort = sorted(manz)
        manz_sort_join = "".join(map(str, manz_sort))
    else:
        manz_sort_join = None
    if pinz != []:
        pinz_sort = sorted(pinz)
        pinz_sort_join = "".join(map(str, pinz_sort))
    else:
        pinz_sort_join = None
    if souz != []:
        souz_sort = sorted(souz)
        souz_sort_join = "".join(map(str, souz_sort))
    else:
        souz_sort_join = None
    if honz != []:
        honz_sort = sorted(honz)
        honz_sort_join = "".join(map(str, honz_sort))
    else:
        honz_sort_join = None

    # アガリ形(honors=1:東, 2:南, 3:西, 4:北, 5:白, 6:發, 7:中)
    tiles = TilesConverter.string_to_136_array(
        man = manz_sort_join,
        pin = pinz_sort_join,
        sou = souz_sort_join,
        honors = honz_sort_join,
        has_aka_dora = options_dict["options"]["has_aka_dora"]
    )

    win_tile_aka_dora = False
    win_tile = id_change(win_tile)
    if win_tile >= 34:
        win_tile_aka_dora = True
    card_win_tile = list(majong_map[win_tile])
    if card_win_tile[0] == "m":
        win_tile_convert = TilesConverter.string_to_136_array(man = card_win_tile[1], has_aka_dora = win_tile_aka_dora)[0]
    elif card_win_tile[0] == "p":
        win_tile_convert = TilesConverter.string_to_136_array(pin = card_win_tile[1], has_aka_dora = win_tile_aka_dora)[0]
    elif card_win_tile[0] == "s":
        win_tile_convert = TilesConverter.string_to_136_array(sou = card_win_tile[1], has_aka_dora = win_tile_aka_dora)[0]
    elif card_win_tile[0] == "h":
        win_tile_convert = TilesConverter.string_to_136_array(honors = card_win_tile[1], has_aka_dora = win_tile_aka_dora)[0]

    # 鳴き(ダイミンカン:true, アンカン:False)
    # 鳴き(チー:CHI, ポン:PON, カン:KAN(True:ミンカン,False:アンカン), カカン:CHANKAN, ヌキドラ:NUKI)
    melds = []
    for meld in melds_list:
        # PONかCHIである場合
        if len(meld) == 3:
            meld_id_change = list(meld)
            meld = []
            for meld_num in meld_id_change:
                meld.append(id_change(meld_num))
            # PONの場合
            if meld[1:] == meld[:-1]:
                card_meld_pon = list(majong_map[meld[0]])
                if card_meld_pon[0] == "m":
                    melds.append(Meld(Meld.PON, TilesConverter.string_to_136_array(man=card_meld_pon[1]*3)))
                elif card_meld_pon[0] == "p":
                    melds.append(Meld(Meld.PON, TilesConverter.string_to_136_array(pin=card_meld_pon[1]*3)))
                elif card_meld_pon[0] == "s":
                    melds.append(Meld(Meld.PON, TilesConverter.string_to_136_array(sou=card_meld_pon[1]*3)))
                elif card_meld_pon[0] == "h":
                    melds.append(Meld(Meld.PON, TilesConverter.string_to_136_array(honors=card_meld_pon[1]*3)))
            # CHIの場合
            else:
                card_meld_chi_1 = list(majong_map[meld[0]])
                card_meld_chi_2 = list(majong_map[meld[1]])
                card_meld_chi_3 = list(majong_map[meld[2]])

                chi_hai_type = card_meld_chi_1[0]
                card_meld_chi_sort = sorted([int(card_meld_chi_1[1]), int(card_meld_chi_2[1]), int(card_meld_chi_3[1])])
                card_meld_chi_join = "".join(map(str, card_meld_chi_sort))
                if chi_hai_type == "m":
                    melds.append(Meld(Meld.CHI, TilesConverter.string_to_136_array(man=card_meld_chi_join)))
                elif chi_hai_type == "p":
                    melds.append(Meld(Meld.CHI, TilesConverter.string_to_136_array(pin=card_meld_chi_join)))
                elif chi_hai_type == "s":
                    melds.append(Meld(Meld.CHI, TilesConverter.string_to_136_array(sou=card_meld_chi_join)))
                elif chi_hai_type == "h":
                    melds.append(Meld(Meld.CHI, TilesConverter.string_to_136_array(honors=card_meld_chi_join)))
        elif len(meld) == 4:
            # KANの場合
            kan_type_counter = 0
            kan_meld = []
            for meld_hai in meld:
                if meld_hai >= 1000:
                    meld_hai = meld_hai - 1000
                if meld_hai >= 100:
                    kan_type_counter += 1
                    meld_hai = meld_hai - 100
                card_meld_kan = list(majong_map[meld_hai])
                kan_meld.append(card_meld_kan[1])
            kan_hai_type = card_meld_kan[0]
            kan_meld_join = "".join(kan_meld)

            # 暗槓の場合
            if kan_type_counter == 0:
                if kan_hai_type == "m":
                    melds.append(Meld(Meld.KAN, TilesConverter.string_to_136_array(man=kan_meld_join), False))
                elif kan_hai_type == "p":
                    melds.append(Meld(Meld.KAN, TilesConverter.string_to_136_array(pin=kan_meld_join), False))
                elif kan_hai_type == "s":
                    melds.append(Meld(Meld.KAN, TilesConverter.string_to_136_array(sou=kan_meld_join), False))
                elif kan_hai_type == "h":
                    melds.append(Meld(Meld.KAN, TilesConverter.string_to_136_array(honors=kan_meld_join), False))
            # 明槓の場合
            elif kan_type_counter == 1:
                if kan_hai_type == "m":
                    melds.append(Meld(Meld.KAN, TilesConverter.string_to_136_array(man=kan_meld_join), True))
                elif kan_hai_type == "p":
                    melds.append(Meld(Meld.KAN, TilesConverter.string_to_136_array(pin=kan_meld_join), True))
                elif kan_hai_type == "s":
                    melds.append(Meld(Meld.KAN, TilesConverter.string_to_136_array(sou=kan_meld_join), True))
                elif kan_hai_type == "h":
                    melds.append(Meld(Meld.KAN, TilesConverter.string_to_136_array(honors=kan_meld_join), True))
            #加槓の場合
            else:
                if kan_hai_type == "m":
                    melds.append(Meld(Meld.CHANKAN, TilesConverter.string_to_136_array(man=kan_meld_join)))
                elif kan_hai_type == "p":
                    melds.append(Meld(Meld.CHANKAN, TilesConverter.string_to_136_array(pin=kan_meld_join)))
                elif kan_hai_type == "s":
                    melds.append(Meld(Meld.CHANKAN, TilesConverter.string_to_136_array(sou=kan_meld_join)))
                elif kan_hai_type == "h":
                    melds.append(Meld(Meld.CHANKAN, TilesConverter.string_to_136_array(honors=kan_meld_join)))
    if melds == []:
        melds = None

    # ドラ(表示牌を枚数分だけ)
    dora_indicators = []
    for dora in dora_list:
        dora = id_change(dora)
        card = list(majong_map[dora])
        if card[0] == "m":
            dora_indicators.append(TilesConverter.string_to_136_array(man = card[1])[0])
        elif card[0] == "p":
            dora_indicators.append(TilesConverter.string_to_136_array(pin = card[1])[0])
        elif card[0] == "s":
            dora_indicators.append(TilesConverter.string_to_136_array(sou = card[1])[0])
        elif card[0] == "h":
            dora_indicators.append(TilesConverter.string_to_136_array(honors = card[1])[0])
    if dora_indicators == []:
        dora_indicators = None

    #### caluculator.estimate_hand_value()の引数 ####
    #・tiles(麻雀牌のアガリ形)
    #・win_tile(アガリ牌)
    #・melds(鳴き)
    #・dora_indicators(ドラ)
    #・config(オプション)設定

    # configの設定例
    # config=HandConfig(is_tsumo=True)

    ####configの設定一覧 ####
    # ・ツモ  　　　　　　　→　is_tsumo == True or False
    # ・リーチ　　　　　　　→　is_riichi == True or False
    # ・イッパツ　　　　　　→　is_ippatsu == True or False
    # ・リンシャンカイホウ　→　is_rinshan == True or False
    # ・チャンカン　　　　　→　is_chankan == True or False
    # ・ハイテイ　　　　　　→　is_haitei == True or False
    # ・ホウテイ　　　　　　→　is_houtei == True or False
    # ・ダブルリーチ　　　　→　is_daburu_riichi == True or False
    # ・流しマンガン　　　　→　is_nagashi_mangan == True or False
    # ・テンホー　　　　　　→　is_tenhou == True or False
    # ・レンホー　　　　　　→　is_renhou == True or False
    # ・チーホー　　　　　　→　is_chiihou == True or False
    # ・その他オプション　　→　options == ディクショナリ型(OptionalRulesクラス)

    #### その他オプション(OptionalRulesクラス)一覧 ####
    # ・数えヤクマン　　　　　　　　→　kazoe_limit == 1 or 2 or 3
    #   ------ 1 : HandConfig.KAZOE_LIMITED(13翻以上をヤクマンとする場合(通常の数えヤクマン))
    #   ------ 2 : HandConfig.KAZOE_SANBAIMAN(13翻以上をサンバイマンとする場合)
    #   ------ 3 : HandConfig.KAZOE_NO_LIMIT(13翻以上をヤクマン,26翻以上をダブルヤクマンとする場合))
    # ・赤ドラあり　　　　　　　　　→　has_aka_dora == True or False
    # ・喰いタン　　　　　　       →　has_open_tanyao == True or False
    # ・ダブルヤクマン　　　　　　　→　has_double_yakuman == True or False
    # ・切り上げマンガン　　　　　　→　kiriage == True or False
    # ・ピンフ　　　　　　　　　　　→　fu_for_open_pinfu == True or False
    # ・ピンフツモ　　　　　　　　　→　fu_for_pinfu_tsumo == True or False
    # ・レンホー　　　　　　　　　　→　renhou_as_yakuman == True or False
    # ・ダイシャリン　　　　　　　　→　has_daisharin == True or False
    # ・ダイチクリン&ダイスウリン　 →　has_daisharin_other_suits == True or False

    # その他オプション設定例
    #options=OptionalRules(has_open_tanyao=True, has_aka_dora=True)

    # オプション設定
    kazoe_limit_map = [HandConfig.KAZOE_LIMITED, HandConfig.KAZOE_SANBAIMAN, HandConfig.KAZOE_NO_LIMIT]
    config = HandConfig(
        is_tsumo = options_dict["is_tsumo"],
        is_riichi = options_dict["is_riichi"],
        is_rinshan = options_dict["is_rinshan"],
        is_ippatsu = options_dict["is_ippatsu"],
        is_chankan = options_dict["is_chankan"],
        is_haitei = options_dict["is_haitei"],
        is_houtei = options_dict["is_houtei"],
        is_daburu_riichi = options_dict["is_daburu_riichi"],
        is_nagashi_mangan = options_dict["is_nagashi_mangan"],
        is_tenhou = options_dict["is_tenhou"],
        is_renhou = options_dict["is_renhou"],
        is_chiihou = options_dict["is_chiihou"],
        options = OptionalRules(
            kazoe_limit = kazoe_limit_map[options_dict["options"]["kazoe_limit"]],
            has_aka_dora = options_dict["options"]["has_aka_dora"],
            has_open_tanyao = options_dict["options"]["has_open_tanyao"],
            has_double_yakuman = options_dict["options"]["has_double_yakuman"],
            kiriage = options_dict["options"]["kiriage"],
            fu_for_open_pinfu = options_dict["options"]["fu_for_open_pinfu"],
            fu_for_pinfu_tsumo = options_dict["options"]["fu_for_pinfu_tsumo"],
            renhou_as_yakuman = options_dict["options"]["renhou_as_yakuman"],
            has_daisharin = options_dict["options"]["has_daisharin"],
            has_daisharin_other_suits = options_dict["options"]["has_daisharin_other_suits"]
        )
    )

    # 計算
    result = calculator.estimate_hand_value(tiles, win_tile_convert, melds, dora_indicators, config)

    print_hand_result(result)

    return result