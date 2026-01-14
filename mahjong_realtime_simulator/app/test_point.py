from point_calculation import point_calculate

# 点数計算処理のテスト実行
# print("test : 1 (リーチ, ツモ, ドラ2)")
# point_calculate(
#     hand_tiles = [3,4,5,9,9,9,12,13,14,19,20,21,28,128],
#     win_tile = 5,
#     melds_list = [[]],
#     dora_list = [20,21],
#     options_dict = {
#         "player_wind": 27,
#         "round_wind": 27,
#         "is_tsumo": True,
#         "is_riichi": True,
#         "is_rinshan": False,
#         "is_ippatsu": False,
#         "is_chankan": False,
#         "is_haitei": False,
#         "is_houtei": False,
#         "is_daburu_riichi": False,
#         "is_nagashi_mangan": False,
#         "is_tenhou": False,
#         "is_renhou": False,
#         "is_chiihou": False,
#         "options": {
#             "kazoe_limit": 0,
#             "has_aka_dora": True,
#             "has_open_tanyao": False,
#             "has_double_yakuman": False,
#             "kiriage": False,
#             "fu_for_open_pinfu": False,
#             "fu_for_pinfu_tsumo": False,
#             "renhou_as_yakuman": False,
#             "has_daisharin": False,
#             "has_daisharin_other_suits": False
#         }
#     }
# )

# print("test : 2 (鳴きあり)")
# point_calculate(
#     hand_tiles = [0,1,2,109,10,11,18,19,20,27,127,1027,1131,131],
#     win_tile = 0,
#     melds_list = [[27,127,1027], [109,10,11]],
#     dora_list = [30,30,30],
#     options_dict = {
#         "player_wind": 27,
#         "round_wind": 27,
#         "is_tsumo": True,
#         "is_riichi": False,
#         "is_rinshan": False,
#         "is_ippatsu": False,
#         "is_chankan": False,
#         "is_haitei": True,
#         "is_houtei": False,
#         "is_daburu_riichi": False,
#         "is_nagashi_mangan": False,
#         "is_tenhou": False,
#         "is_renhou": False,
#         "is_chiihou": False,
#         "options": {
#             "kazoe_limit": 0,
#             "has_aka_dora": True,
#             "has_open_tanyao": False,
#             "has_double_yakuman": False,
#             "kiriage": False,
#             "fu_for_open_pinfu": False,
#             "fu_for_pinfu_tsumo": False,
#             "renhou_as_yakuman": False,
#             "has_daisharin": False,
#             "has_daisharin_other_suits": False
#         }
#     }
# )

# print("test : 3 (ダブル立直、ロン和了、赤ドラ和了)")
# point_calculate(
#     hand_tiles = [0,0,0,1,1,1,10,10,10,13,13,1131,131,35],
#     win_tile = 35,
#     melds_list = [[]],
#     dora_list = [12],
#     options_dict = {
#         "player_wind": 27,
#         "round_wind": 27,
#         "is_tsumo": False,
#         "is_riichi": False,
#         "is_rinshan": False,
#         "is_ippatsu": True,
#         "is_chankan": False,
#         "is_haitei": False,
#         "is_houtei": False,
#         "is_daburu_riichi": True,
#         "is_nagashi_mangan": False,
#         "is_tenhou": False,
#         "is_renhou": False,
#         "is_chiihou": False,
#         "options": {
#             "kazoe_limit": 0,
#             "has_aka_dora": True,
#             "has_open_tanyao": False,
#             "has_double_yakuman": False,
#             "kiriage": False,
#             "fu_for_open_pinfu": False,
#             "fu_for_pinfu_tsumo": False,
#             "renhou_as_yakuman": False,
#             "has_daisharin": False,
#             "has_daisharin_other_suits": False
#         }
#     }
# )

# print("test : 4 (槓子全種)")
# point_calculate(
#     hand_tiles = [5,5,5,5,11,11,11,11,15,15,15,15,19,19,33,33,33],
#     win_tile = 19,
#     melds_list = [[5,5,5,1005], [11,111,111,1011], [15,115,1015,15]],
#     dora_list = [1,3,10,12],
#     options_dict = {
#         "player_wind": 27,
#         "round_wind": 27,
#         "is_tsumo": True,
#         "is_riichi": False,
#         "is_rinshan": False,
#         "is_ippatsu": False,
#         "is_chankan": False,
#         "is_haitei": False,
#         "is_houtei": False,
#         "is_daburu_riichi": False,
#         "is_nagashi_mangan": False,
#         "is_tenhou": False,
#         "is_renhou": False,
#         "is_chiihou": False,
#         "options": {
#             "kazoe_limit": 0,
#             "has_aka_dora": True,
#             "has_open_tanyao": False,
#             "has_double_yakuman": False,
#             "kiriage": False,
#             "fu_for_open_pinfu": False,
#             "fu_for_pinfu_tsumo": False,
#             "renhou_as_yakuman": False,
#             "has_daisharin": False,
#             "has_daisharin_other_suits": False
#         }
#     }
# )

# print("test : 5 (四槓子)")
# point_calculate(
#     hand_tiles = [5,5,5,5,11,11,11,11,15,15,15,15,19,19,33,33,33,33],
#     win_tile = 19,
#     melds_list = [[5,5,5,1005], [11,111,1011,1011], [15,115,1015,15], [1033,1033,1133,1033]],
#     dora_list = [1,3,10,12],
#     options_dict = {
#         "player_wind": 27,
#         "round_wind": 27,
#         "is_tsumo": True,
#         "is_riichi": False,
#         "is_rinshan": True,
#         "is_ippatsu": False,
#         "is_chankan": False,
#         "is_haitei": False,
#         "is_houtei": False,
#         "is_daburu_riichi": False,
#         "is_nagashi_mangan": False,
#         "is_tenhou": False,
#         "is_renhou": False,
#         "is_chiihou": False,
#         "options": {
#             "kazoe_limit": 0,
#             "has_aka_dora": True,
#             "has_open_tanyao": False,
#             "has_double_yakuman": False,
#             "kiriage": False,
#             "fu_for_open_pinfu": False,
#             "fu_for_pinfu_tsumo": False,
#             "renhou_as_yakuman": False,
#             "has_daisharin": False,
#             "has_daisharin_other_suits": False
#         }
#     }
# )

# print("test : 6 (流し満貫)")
# point_calculate(
#     hand_tiles = [5,5,5,11,12,13,14,15,16,19,19,33,33,33],
#     win_tile = 19,
#     melds_list = [[]],
#     dora_list = [1],
#     options_dict = {
#         "player_wind": 27,
#         "round_wind": 27,
#         "is_tsumo": True,
#         "is_riichi": False,
#         "is_rinshan": False,
#         "is_ippatsu": False,
#         "is_chankan": False,
#         "is_haitei": False,
#         "is_houtei": False,
#         "is_daburu_riichi": False,
#         "is_nagashi_mangan": True,
#         "is_tenhou": False,
#         "is_renhou": False,
#         "is_chiihou": False,
#         "options": {
#             "kazoe_limit": 0,
#             "has_aka_dora": True,
#             "has_open_tanyao": False,
#             "has_double_yakuman": False,
#             "kiriage": False,
#             "fu_for_open_pinfu": False,
#             "fu_for_pinfu_tsumo": False,
#             "renhou_as_yakuman": False,
#             "has_daisharin": False,
#             "has_daisharin_other_suits": False
#         }
#     }
# )

# print("test : 7 (七対子)")
# point_calculate(
#     hand_tiles = [5,5,11,11,12,12,15,15,16,16,19,19,33,33],
#     win_tile = 5,
#     melds_list = [[]],
#     dora_list = [10],
#     options_dict = {
#         "player_wind": 27,
#         "round_wind": 27,
#         "is_tsumo": True,
#         "is_riichi": True,
#         "is_rinshan": False,
#         "is_ippatsu": False,
#         "is_chankan": False,
#         "is_haitei": False,
#         "is_houtei": False,
#         "is_daburu_riichi": False,
#         "is_nagashi_mangan": False,
#         "is_tenhou": False,
#         "is_renhou": False,
#         "is_chiihou": False,
#         "options": {
#             "kazoe_limit": 0,
#             "has_aka_dora": True,
#             "has_open_tanyao": False,
#             "has_double_yakuman": False,
#             "kiriage": False,
#             "fu_for_open_pinfu": False,
#             "fu_for_pinfu_tsumo": False,
#             "renhou_as_yakuman": False,
#             "has_daisharin": False,
#             "has_daisharin_other_suits": False
#         }
#     }
# )

# print("test : 8 (国士無双十三面待ち)")
# point_calculate(
#     hand_tiles = [0,8,9,17,18,26,27,28,29,30,31,32,33,33],
#     win_tile = 33,
#     melds_list = [[]],
#     dora_list = [10],
#     options_dict = {
#         "player_wind": 27,
#         "round_wind": 27,
#         "is_tsumo": False,
#         "is_riichi": False,
#         "is_rinshan": False,
#         "is_ippatsu": False,
#         "is_chankan": False,
#         "is_haitei": False,
#         "is_houtei": False,
#         "is_daburu_riichi": False,
#         "is_nagashi_mangan": False,
#         "is_tenhou": False,
#         "is_renhou": False,
#         "is_chiihou": False,
#         "options": {
#             "kazoe_limit": 0,
#             "has_aka_dora": True,
#             "has_open_tanyao": False,
#             "has_double_yakuman": False,
#             "kiriage": False,
#             "fu_for_open_pinfu": False,
#             "fu_for_pinfu_tsumo": False,
#             "renhou_as_yakuman": False,
#             "has_daisharin": False,
#             "has_daisharin_other_suits": False
#         }
#     }
# )

# print("test : 9 (六倍役満)")
# point_calculate(
#     hand_tiles = [27,27,27,27,28,28,28,28,29,29,29,29,30,30,30,30,33,33],
#     win_tile = 33,
#     melds_list = [[27,27,27,27],[28,28,28,28],[29,29,29,29],[30,30,30,30]],
#     dora_list = [10],
#     options_dict = {
#         "player_wind": 27,
#         "round_wind": 27,
#         "is_tsumo": True,
#         "is_riichi": False,
#         "is_rinshan": False,
#         "is_ippatsu": False,
#         "is_chankan": False,
#         "is_haitei": False,
#         "is_houtei": False,
#         "is_daburu_riichi": False,
#         "is_nagashi_mangan": False,
#         "is_tenhou": False,
#         "is_renhou": False,
#         "is_chiihou": False,
#         "options": {
#             "kazoe_limit": 0,
#             "has_aka_dora": True,
#             "has_open_tanyao": False,
#             "has_double_yakuman": True,
#             "kiriage": False,
#             "fu_for_open_pinfu": False,
#             "fu_for_pinfu_tsumo": False,
#             "renhou_as_yakuman": False,
#             "has_daisharin": False,
#             "has_daisharin_other_suits": False
#         }
#     }
# )

# print("test : 10 (二倍役満：四暗刻、字一色)")
# point_calculate(
#     hand_tiles = [28,28,28,29,29,29,30,30,30,32,32,33,33,33],
#     win_tile = 30,
#     melds_list = [[]],
#     dora_list = [10],
#     options_dict = {
#         "player_wind": 27,
#         "round_wind": 27,
#         "is_tsumo": True,
#         "is_riichi": False,
#         "is_rinshan": False,
#         "is_ippatsu": False,
#         "is_chankan": False,
#         "is_haitei": False,
#         "is_houtei": False,
#         "is_daburu_riichi": False,
#         "is_nagashi_mangan": False,
#         "is_tenhou": False,
#         "is_renhou": False,
#         "is_chiihou": False,
#         "options": {
#             "kazoe_limit": 0,
#             "has_aka_dora": True,
#             "has_open_tanyao": False,
#             "has_double_yakuman": True,
#             "kiriage": False,
#             "fu_for_open_pinfu": False,
#             "fu_for_pinfu_tsumo": False,
#             "renhou_as_yakuman": False,
#             "has_daisharin": False,
#             "has_daisharin_other_suits": False
#         }
#     }
# )

# print("test : 11 (二倍役満：純正九蓮宝燈)")
# point_calculate(
#     hand_tiles = [0,0,0,1,2,3,4,5,6,7,8,8,8,8],
#     win_tile = 8,
#     melds_list = [[]],
#     dora_list = [10],
#     options_dict = {
#         "player_wind": 27,
#         "round_wind": 27,
#         "is_tsumo": False,
#         "is_riichi": False,
#         "is_rinshan": False,
#         "is_ippatsu": False,
#         "is_chankan": False,
#         "is_haitei": False,
#         "is_houtei": False,
#         "is_daburu_riichi": False,
#         "is_nagashi_mangan": False,
#         "is_tenhou": False,
#         "is_renhou": False,
#         "is_chiihou": False,
#         "options": {
#             "kazoe_limit": 0,
#             "has_aka_dora": True,
#             "has_open_tanyao": False,
#             "has_double_yakuman": True,
#             "kiriage": False,
#             "fu_for_open_pinfu": False,
#             "fu_for_pinfu_tsumo": False,
#             "renhou_as_yakuman": False,
#             "has_daisharin": False,
#             "has_daisharin_other_suits": False
#         }
#     }
# )

# print("test : 12 (数え役満：13翻以上を役満とする場合)")
# point_calculate(
#     hand_tiles = [1,1,1,1,3,3,3,4,6,6,6,6,8,8,8,8,34],
#     win_tile = 34,
#     melds_list = [[1,1,1,1],[6,6,1006,6],[1108,8,8,8]],
#     dora_list = [0,0,5,7],
#     options_dict = {
#         "player_wind": 27,
#         "round_wind": 27,
#         "is_tsumo": True,
#         "is_riichi": False,
#         "is_rinshan": True,
#         "is_ippatsu": False,
#         "is_chankan": False,
#         "is_haitei": False,
#         "is_houtei": False,
#         "is_daburu_riichi": False,
#         "is_nagashi_mangan": False,
#         "is_tenhou": False,
#         "is_renhou": False,
#         "is_chiihou": False,
#         "options": {
#             "kazoe_limit": 0,
#             "has_aka_dora": True,
#             "has_open_tanyao": False,
#             "has_double_yakuman": False,
#             "kiriage": False,
#             "fu_for_open_pinfu": False,
#             "fu_for_pinfu_tsumo": False,
#             "renhou_as_yakuman": False,
#             "has_daisharin": False,
#             "has_daisharin_other_suits": False
#         }
#     }
# )

# print("test : 13 (数え役満：13翻以上を三倍満とする場合)")
# point_calculate(
#     hand_tiles = [1,1,1,1,3,3,3,4,6,6,6,6,8,8,8,8,34],
#     win_tile = 34,
#     melds_list = [[1,1,1,1],[6,6,1006,6],[1108,8,8,8]],
#     dora_list = [0,0,5,7],
#     options_dict = {
#         "player_wind": 27,
#         "round_wind": 27,
#         "is_tsumo": True,
#         "is_riichi": False,
#         "is_rinshan": True,
#         "is_ippatsu": False,
#         "is_chankan": False,
#         "is_haitei": False,
#         "is_houtei": False,
#         "is_daburu_riichi": False,
#         "is_nagashi_mangan": False,
#         "is_tenhou": False,
#         "is_renhou": False,
#         "is_chiihou": False,
#         "options": {
#             "kazoe_limit": 1,
#             "has_aka_dora": True,
#             "has_open_tanyao": False,
#             "has_double_yakuman": False,
#             "kiriage": False,
#             "fu_for_open_pinfu": False,
#             "fu_for_pinfu_tsumo": False,
#             "renhou_as_yakuman": False,
#             "has_daisharin": False,
#             "has_daisharin_other_suits": False
#         }
#     }
# )

# print("test : 14 (数え役満：13翻以上を役満とする場合、26翻以上を二倍役満とする場合)")
# point_calculate(
#     hand_tiles = [1,1,1,1,3,3,3,4,6,6,6,6,8,8,8,8,34],
#     win_tile = 34,
#     melds_list = [[1,1,1,1],[6,6,1006,6],[1108,8,8,8]],
#     dora_list = [0,0,5,7],
#     options_dict = {
#         "player_wind": 27,
#         "round_wind": 27,
#         "is_tsumo": True,
#         "is_riichi": False,
#         "is_rinshan": True,
#         "is_ippatsu": False,
#         "is_chankan": False,
#         "is_haitei": False,
#         "is_houtei": False,
#         "is_daburu_riichi": False,
#         "is_nagashi_mangan": False,
#         "is_tenhou": False,
#         "is_renhou": False,
#         "is_chiihou": False,
#         "options": {
#             "kazoe_limit": 2,
#             "has_aka_dora": True,
#             "has_open_tanyao": False,
#             "has_double_yakuman": False,
#             "kiriage": False,
#             "fu_for_open_pinfu": False,
#             "fu_for_pinfu_tsumo": False,
#             "renhou_as_yakuman": False,
#             "has_daisharin": False,
#             "has_daisharin_other_suits": False
#         }
#     }
# )

# print("test : 15 (海底撈月のみ)")
# point_calculate(
#     hand_tiles = [0,1,2,4,5,6,10,11,12,15,16,17,30,30],
#     win_tile = 16,
#     melds_list = [[100,1,2],[4,5,106]],
#     dora_list = [0,9,10,11,12,20,21,25],
#     options_dict = {
#         "player_wind": 27,
#         "round_wind": 27,
#         "is_tsumo": True,
#         "is_riichi": False,
#         "is_rinshan": False,
#         "is_ippatsu": False,
#         "is_chankan": False,
#         "is_haitei": True,
#         "is_houtei": False,
#         "is_daburu_riichi": False,
#         "is_nagashi_mangan": False,
#         "is_tenhou": False,
#         "is_renhou": False,
#         "is_chiihou": False,
#         "options": {
#             "kazoe_limit": 2,
#             "has_aka_dora": True,
#             "has_open_tanyao": False,
#             "has_double_yakuman": True,
#             "kiriage": False,
#             "fu_for_open_pinfu": False,
#             "fu_for_pinfu_tsumo": False,
#             "renhou_as_yakuman": False,
#             "has_daisharin": False,
#             "has_daisharin_other_suits": False
#         }
#     }
# )

# print("test : 16 (純全帯幺九)")
# point_calculate(
#     hand_tiles = [0,1,2,9,9,9,17,17,17,18,19,20,26,26],
#     win_tile = 26,
#     melds_list = [[]],
#     dora_list = [8],
#     options_dict = {
#         "player_wind": 27,
#         "round_wind": 27,
#         "is_tsumo": False,
#         "is_riichi": True,
#         "is_rinshan": False,
#         "is_ippatsu": False,
#         "is_chankan": False,
#         "is_haitei": False,
#         "is_houtei": True,
#         "is_daburu_riichi": False,
#         "is_nagashi_mangan": False,
#         "is_tenhou": False,
#         "is_renhou": False,
#         "is_chiihou": False,
#         "options": {
#             "kazoe_limit": 2,
#             "has_aka_dora": True,
#             "has_open_tanyao": False,
#             "has_double_yakuman": True,
#             "kiriage": False,
#             "fu_for_open_pinfu": False,
#             "fu_for_pinfu_tsumo": False,
#             "renhou_as_yakuman": False,
#             "has_daisharin": False,
#             "has_daisharin_other_suits": False
#         }
#     }
# )

# print("test : 17 (小三元)")
# point_calculate(
#     hand_tiles = [0,1,2,9,9,9,31,31,31,32,32,32,33,33],
#     win_tile = 33,
#     melds_list = [[31,31,131]],
#     dora_list = [33],
#     options_dict = {
#         "player_wind": 27,
#         "round_wind": 27,
#         "is_tsumo": False,
#         "is_riichi": False,
#         "is_rinshan": False,
#         "is_ippatsu": False,
#         "is_chankan": False,
#         "is_haitei": False,
#         "is_houtei": False,
#         "is_daburu_riichi": False,
#         "is_nagashi_mangan": False,
#         "is_tenhou": False,
#         "is_renhou": False,
#         "is_chiihou": False,
#         "options": {
#             "kazoe_limit": 0,
#             "has_aka_dora": True,
#             "has_open_tanyao": False,
#             "has_double_yakuman": True,
#             "kiriage": False,
#             "fu_for_open_pinfu": False,
#             "fu_for_pinfu_tsumo": False,
#             "renhou_as_yakuman": False,
#             "has_daisharin": False,
#             "has_daisharin_other_suits": False
#         }
#     }
# )

# print("test : 18 (二盃口)")
# point_calculate(
#     hand_tiles = [0,1,2,0,1,2,10,11,12,10,11,12,33,33],
#     win_tile = 33,
#     melds_list = [[]],
#     dora_list = [10],
#     options_dict = {
#         "player_wind": 27,
#         "round_wind": 27,
#         "is_tsumo": False,
#         "is_riichi": False,
#         "is_rinshan": False,
#         "is_ippatsu": False,
#         "is_chankan": False,
#         "is_haitei": False,
#         "is_houtei": False,
#         "is_daburu_riichi": False,
#         "is_nagashi_mangan": False,
#         "is_tenhou": False,
#         "is_renhou": False,
#         "is_chiihou": False,
#         "options": {
#             "kazoe_limit": 0,
#             "has_aka_dora": True,
#             "has_open_tanyao": False,
#             "has_double_yakuman": True,
#             "kiriage": False,
#             "fu_for_open_pinfu": False,
#             "fu_for_pinfu_tsumo": False,
#             "renhou_as_yakuman": False,
#             "has_daisharin": False,
#             "has_daisharin_other_suits": False
#         }
#     }
# )

# print("test : 19 (一盃口)")
# point_calculate(
#     hand_tiles = [0,1,2,1,2,3,10,11,12,10,11,12,33,33],
#     win_tile = 33,
#     melds_list = [[]],
#     dora_list = [10],
#     options_dict = {
#         "player_wind": 27,
#         "round_wind": 27,
#         "is_tsumo": False,
#         "is_riichi": False,
#         "is_rinshan": False,
#         "is_ippatsu": False,
#         "is_chankan": False,
#         "is_haitei": False,
#         "is_houtei": False,
#         "is_daburu_riichi": False,
#         "is_nagashi_mangan": False,
#         "is_tenhou": False,
#         "is_renhou": False,
#         "is_chiihou": False,
#         "options": {
#             "kazoe_limit": 0,
#             "has_aka_dora": True,
#             "has_open_tanyao": False,
#             "has_double_yakuman": True,
#             "kiriage": False,
#             "fu_for_open_pinfu": False,
#             "fu_for_pinfu_tsumo": False,
#             "renhou_as_yakuman": False,
#             "has_daisharin": False,
#             "has_daisharin_other_suits": False
#         }
#     }
# )

# print("test : 20 (東)")
# point_calculate(
#     hand_tiles = [0,1,2,1,2,3,10,11,12,27,27,27,33,33],
#     win_tile = 33,
#     melds_list = [[]],
#     dora_list = [10],
#     options_dict = {
#         "player_wind": 28,
#         "round_wind": 27,
#         "is_tsumo": False,
#         "is_riichi": False,
#         "is_rinshan": False,
#         "is_ippatsu": False,
#         "is_chankan": False,
#         "is_haitei": False,
#         "is_houtei": False,
#         "is_daburu_riichi": False,
#         "is_nagashi_mangan": False,
#         "is_tenhou": False,
#         "is_renhou": False,
#         "is_chiihou": False,
#         "options": {
#             "kazoe_limit": 0,
#             "has_aka_dora": True,
#             "has_open_tanyao": False,
#             "has_double_yakuman": True,
#             "kiriage": False,
#             "fu_for_open_pinfu": False,
#             "fu_for_pinfu_tsumo": False,
#             "renhou_as_yakuman": False,
#             "has_daisharin": False,
#             "has_daisharin_other_suits": False
#         }
#     }
# )

# print("test : 21 (タンヤオ)")
# point_calculate(
#     hand_tiles = [1,1,1,1,2,3,10,11,12,12,13,14,15,15],
#     win_tile = 10,
#     melds_list = [],
#     dora_list = [10],
#     options_dict = {
#         "player_wind": 28,
#         "round_wind": 27,
#         "is_tsumo": True,
#         "is_riichi": False,
#         "is_rinshan": False,
#         "is_ippatsu": False,
#         "is_chankan": False,
#         "is_haitei": True,
#         "is_houtei": False,
#         "is_daburu_riichi": True,
#         "options": {
#             "kazoe_limit": 0,
#             "has_aka_dora": True,
#             "has_open_tanyao": False,
#             "kiriage": False,
#         }
#     }
# )

print("test : 22 (手牌のhas_aka_dora動作確認)")
point_calculate(
    hand_tiles = [0,0,0,1,1,1,2,2,2,3,3,3,13,13],
    win_tile = 34,
    melds_list = [],
    dora_list = [10],
    options_dict = {
        "player_wind": 28,
        "round_wind": 27,
        "is_tsumo": True,
        "is_riichi": False,
        "is_rinshan": False,
        "is_ippatsu": False,
        "is_chankan": False,
        "is_haitei": True,
        "is_houtei": False,
        "is_daburu_riichi": True,
        "options": {
            "kazoe_limit": 0,
            "has_aka_dora": True,
            "has_open_tanyao": False,
            "kiriage": False,
        }
    }
)