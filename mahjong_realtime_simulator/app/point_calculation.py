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
def print_hand_result(hand_result, yaku_map):
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
        yaku_list = []
        for yaku in hand_result.yaku:
            yaku_str = str(yaku)
            if yaku_str[0:4] == "Dora":
                dora_num = yaku_str.split()
                yaku_list.append("{} {}枚".format(yaku_map[dora_num[0]], dora_num[1]))
            elif yaku_str[0:3] == "Aka":
                aka_num = yaku_str.split()
                yaku_list.append("{} {}枚".format(yaku_map[aka_num[0]], aka_num[2]))
            else:
                yaku_list.append(yaku_map[yaku_str])

        print(yaku_list)
        #符数の詳細
        try:
            for fu_item in hand_result.fu_details:
                print(fu_item)
        except:
            print("この役に符は含まれていません。")
        print('')

def id_change(change_card):
    if change_card >= 100:
        change_card = change_card % 100
    return change_card

# 点数計算メイン処理
def point_calculate(
        hand_tiles, # 手牌リスト、鳴き牌もすべて含めた形式にする。槓子がある場合でも、4つのまま追加する。
        win_tile,  # アガリ牌
        melds_list, # 鳴き牌、bottomのみの鳴き牌リスト
        dora_list, # ドラ牌リスト
        options_dict # オプション設定ディクショナリ
    ):
    try:
        # 麻雀牌MAP
        majong_map = [
            "m1","m2","m3","m4","m5","m6","m7","m8","m9",
            "p1","p2","p3","p4","p5","p6","p7","p8","p9",
            "s1","s2","s3","s4","s5","s6","s7","s8","s9",
            "h1","h2","h3","h4","h5","h6","h7",
            "m0","p0","s0"
            ]
        # 役MAP
        yaku_map = {
            "Dora" : "ドラ",
            "Aka" : "赤ドラ",
            "Riichi" : "立直",
            "Double Riichi" : "ダブル立直",
            "Ippatsu" : "一発",
            "Menzen Tsumo" : "門前清自摸和",
            "Rinshan Kaihou" : "嶺上開花",
            "Chankan" : "槍槓",
            "Tanyao" : "断幺九",
            "Pinfu" : "平和",
            "Iipeiko" :  "一盃口",
            "Ittsu" : "一気通貫",
            "Yakuhai (wind of place)" : "自風牌",
            "Yakuhai (wind of round)" : "場風牌",
            "Chiitoitsu" : "七対子",
            "Yakuhai (haku)" : "白",
            "Yakuhai (hatsu)" : "發",
            "Yakuhai (chun)" : "中",
            "Haitei Raoyue" : "海底撈月",
            "Houtei Raoyui" : "河底撈月",
            "Sanshoku Doujun" : "三色同順",
            "Sanshoku Doukou" : "三色同刻",
            "San Ankou" : "三暗刻",
            "San Kantsu" : "三槓子",
            "Toitoi" : "対々和",
            "Shou Sangen" : "小三元",
            "Chantai" : "混全帯幺九",
            "Junchan" : "純全帯幺九",
            "Ryanpeikou" : "二盃口",
            "Honroutou" : "混老頭",
            "Honitsu" : "混一色",
            "Chinitsu" : "清一色",
            "Tsuu Iisou" : "字一色",
            "Ryuuiisou" : "緑一色",
            "Chinroutou" : "清老頭",
            "Suu Ankou" :  "四暗刻",
            "Suu Ankou Tanki" :  "四暗刻単騎",
            "Daisangen" :  "大三元",
            "Suu Kantsu" :  "四槓子",
            "Shou Suushii" :  "小四喜",
            "Dai Suushii" :  "大四喜",
            "Chuuren Poutou" : "九蓮宝燈",
            "Daburu Chuuren Poutou" : "純正九蓮宝燈",
            "Kokushi Musou" : "国士無双",
            "Kokushi Musou Juusanmen Matchi" : "国士無双十三面待ち",
            "Tenhou" :  "天和",
            "Chihou" :  "地和",
            "Nagashi Mangan" : "流し満貫"
        }

        # 自風、場風MAP
        wind_map = {
            27 : EAST,
            28 : SOUTH,
            29 : WEST,
            30 : NORTH
        }

        # エラーメッセージ出力用
        message_err = "Error in hand_tiles"

        # 物体検知の結果の手牌を麻雀点数計算の形式に変換
        manz = [] # 萬子配列
        pinz = [] # 筒子配列
        souz = [] # 索子配列
        honz = [] # 字牌配列
        aka_dora_in_hand_tiles = False
        for hand_num in hand_tiles:
            hand_num = id_change(hand_num)
            if not aka_dora_in_hand_tiles and hand_num >= 34:
                aka_dora_in_hand_tiles = True
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
            has_aka_dora = aka_dora_in_hand_tiles
        )

        message_err = "Error in win_tile"
        # ツモorロン牌のコンバート処理
        card_win_tile = list(majong_map[win_tile])
        if card_win_tile[0] == "m":
            win_tile_convert = TilesConverter.string_to_136_array(man = card_win_tile[1], has_aka_dora = aka_dora_in_hand_tiles)[0]
        elif card_win_tile[0] == "p":
            win_tile_convert = TilesConverter.string_to_136_array(pin = card_win_tile[1], has_aka_dora = aka_dora_in_hand_tiles)[0]
        elif card_win_tile[0] == "s":
            win_tile_convert = TilesConverter.string_to_136_array(sou = card_win_tile[1], has_aka_dora = aka_dora_in_hand_tiles)[0]
        elif card_win_tile[0] == "h":
            win_tile_convert = TilesConverter.string_to_136_array(honors = card_win_tile[1], has_aka_dora = aka_dora_in_hand_tiles)[0]

        message_err = "Error in meld_tiles"
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
                        melds.append(Meld(Meld.CHI, TilesConverter.string_to_136_array(man=card_meld_chi_join, has_aka_dora=aka_dora_in_hand_tiles)))
                    elif chi_hai_type == "p":
                        melds.append(Meld(Meld.CHI, TilesConverter.string_to_136_array(pin=card_meld_chi_join, has_aka_dora=aka_dora_in_hand_tiles)))
                    elif chi_hai_type == "s":
                        melds.append(Meld(Meld.CHI, TilesConverter.string_to_136_array(sou=card_meld_chi_join, has_aka_dora=aka_dora_in_hand_tiles)))
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

        message_err = "Error in dora_indicators"
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

        message_err = "Error in options"
        # オプション設定
        kazoe_limit_map = [HandConfig.KAZOE_LIMITED, HandConfig.KAZOE_SANBAIMAN, HandConfig.KAZOE_NO_LIMIT]
        config = HandConfig(
            player_wind = wind_map[options_dict["player_wind"]],
            round_wind = wind_map[options_dict["round_wind"]],
            is_tsumo = options_dict["is_tsumo"],
            is_riichi = options_dict["is_riichi"],
            is_rinshan = options_dict["is_rinshan"],
            is_ippatsu = options_dict["is_ippatsu"],
            is_chankan = options_dict["is_chankan"],
            is_haitei = options_dict["is_haitei"],
            is_houtei = options_dict["is_houtei"],
            is_daburu_riichi = options_dict["is_daburu_riichi"],
            options = OptionalRules(
                kazoe_limit = kazoe_limit_map[options_dict["options"]["kazoe_limit"]],
                has_aka_dora = aka_dora_in_hand_tiles,
                has_open_tanyao = options_dict["options"]["has_open_tanyao"],
                has_double_yakuman = True,
                kiriage = options_dict["options"]["kiriage"],
            )
        )

        message_err = "Error in calculeted result"

        # 計算
        result = calculator.estimate_hand_value(tiles, win_tile_convert, melds, dora_indicators, config)

        # デバッグ用プリントコード
        # print_hand_result(result, yaku_map)

        # 計算結果のエラー判定
        if result.error:
            result_calc = None
            message = "【point calculation error】- cause: {}".format(result.error)
            status = 430
        else:
            if result.fu == None or result.han == None:
                result_calc = None
                message = "hu or han is None"
                status = 440
            else:
                #役
                yaku_list = []
                for yaku in result.yaku:
                    yaku_str = str(yaku)
                    if yaku_str[0:4] == "Dora":
                        dora_num = yaku_str.split()
                        yaku_list.append("{} {}枚".format(yaku_map[dora_num[0]], dora_num[1]))
                    elif yaku_str[0:3] == "Aka":
                        aka_num = yaku_str.split()
                        yaku_list.append("{} {}枚".format(yaku_map[aka_num[0]], aka_num[2]))
                    else:
                        yaku_list.append(yaku_map[yaku_str])

                result_calc = {
                    "hu" : result.fu,
                    "han" : result.han,
                    "main" : result.cost['main'],
                    "additional" : result.cost['additional'],
                    "yaku" : yaku_list,
                }
                message = "successful calculation"
                status = 200

        return {"message" : message, "result" : result_calc, "status" : status}
    except Exception as e:
        message = message_err
        return {'message': "Exception error <{}>: {} {}".format(message, type(e), e), "status": 400}