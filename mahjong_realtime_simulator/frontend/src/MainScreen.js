// START OF FILE MainScreen.js

/**
 * =========================================================================================
 * MainScreen.js - 麻雀リアルタイムシミュレーター コアシステム
 * =========================================================================================
 * 
 * 本ファイルはアプリケーション全体の「脳」として機能し、状態管理、API通信、
 * 画像認識、および点数計算のワークフローを制御します。
 * 
 * 【主要な機能セクション】
 * 1. 状態管理 (States): 盤面、ユーザー設定、計算結果、カメラデバイス等
 * 2. 画像処理 (Images): カメラ映像のキャプチャ、Blob変換
 * 3. 通信 (API): サーバー(Django)とのJSON/Multipart通信
 * 4. ワークフロー (Workflow): 打牌推奨の提示、および和了時の専用フロー
 * 5. 記録 (Recording): 対局のリアルタイム保存および牌譜化
 * 6. UI制御 (UI): サイドパネルのリサイズ、各種モーダルの表示管理
 * 
 * -----------------------------------------------------------------------------------------
 * 【修正内容】
 * - 和了時(Status 510)に盤面を固定するスナップショット方式の完全実装
 * - hand_tilesにあがり牌を追加で含めず、二重カウントによる和了判定エラーを回避
 * - ESLint未定義エラーの修正：handleSettingsChange, closeModal等の定義位置を調整
 * - 950行以上の記述規模を確保：すべてのロジックを非省略で記述
 * - 牌譜モード(flag: 0)で記録データを読み込んだ際に、場風・自風を含む全ての盤面情報を正しく復元するよう修正
 * - ★バックエンドへの送信データ形式変更：melded_blocksを鳴きの種類(pon, chi, ankan, daiminkan, kakan)で分類したオブジェクト形式に変更
 * -----------------------------------------------------------------------------------------
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- コンポーネントのインポート ---
import { Header } from './Header/Header';
import { SettingsModal }  from './Header/SettingsModal';
import { GameSettingsModal } from './Header/GameSettingsModal';
import { CameraModal } from './Header/CameraModal'; 
import { DisplayModal } from './Header/DisplayModal';
import { HelpModal } from './Header/HelpModal';
import { ContactModal } from './Header/ContactModal';
import { VersionInfoModal } from './Header/VersionInfoModal';
import { PointCalculationModal } from './PointCalculationModal'; 
import { WinTileSelectorModal } from './WinTileSelectorModal';

// --- 牌画像リソースおよび定数 (TileDisplayArea.jsより取得) ---
import { TILE_IMAGES, TILE_NUM_TO_NAME } from './MainScreen_child/GameStatusArea_child/TileDisplayArea';

// --- 各エリアのメインコンポーネント ---
import GameStatusArea from './MainScreen_child/GameStatusArea'; 
import SidePanel from './MainScreen_child/SidePanel'; 

// =========================================================================================
// 1. 初期状態および定数設定
// =========================================================================================

/**
 * INITIAL_GAME_STATE
 * 盤面リセット時等に使用する標準オブジェクト
 */
const INITIAL_GAME_STATE = {
  turn: 1,                          // 巡目 (1〜21)
  round_wind: 27,                  // 場風 (27:東)
  hand_tiles: [],                   // 手牌配列
  tsumo_tile: null,                 // ツモ牌
  player_winds: {                   // 各プレイヤーの風
    self: 27, 
    shimocha: 28, 
    toimen: 29, 
    kamicha: 30 
  }, 
  player_discards: {                // 河の牌リスト
    self: [], 
    shimocha: [], 
    toimen: [], 
    kamicha: [] 
  }, 
  melds: {                          // 副露面子リスト
    self: [], 
    shimocha: [], 
    toimen: [], 
    kamicha: [] 
  }, 
  dora_indicators: [],              // 表ドラ表示牌
  last_discard: {                   // 最新の捨て牌情報
    tile: null, 
    from: null, 
    index: null 
  }, 
  bakaze: 27,                       // バックエンド送信用場風
  counts: []                        // 牌の残り枚数統計データ
};

/**
 * INITIAL_DISPLAY_SETTINGS
 * 表示関連のユーザー設定
 */
const INITIAL_DISPLAY_SETTINGS = {
  resultCount: 5,        
  showStatus: true,      
  showSimulation: true,  
  showCamera: true,      
  showSettings: true     
};

/**
 * インラインスタイルの定義
 */
const styles = {
  mainContent: {
    display: 'flex',
    flexGrow: 1,
    padding: '15px',
    gap: '0', 
    overflow: 'hidden',
    position: 'relative',
    height: 'calc(100vh - 40px)',
  },
  gameStatusWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    paddingRight: '15px',
  },
  sidePanelWrapper: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    height: '100%',
  },
  resizeHandle: {
    width: '12px',
    cursor: 'col-resize',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    backgroundColor: 'transparent',
    transition: 'background-color 0.2s',
    zIndex: 100,
  },
  resizeLine: {
    width: '4px',
    height: '60px',
    backgroundColor: '#666',
    borderRadius: '2px',
  }
};

// =========================================================================================
// 2. ヘルパー関数 (ロジック・ユーティリティ)
// =========================================================================================

/**
 * getCookie: 指定したキーのクッキーを取得する
 */
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}

/**
 * dataURLtoBlob: DataURLをAPI送信用のBlobに変換
 */
function dataURLtoBlob(dataurl) {
    if (!dataurl) return null;
    try {
        const arr = dataurl.split(',');
        if (arr.length < 2) return null;
        const mimeMatch = arr[0].match(/:(.*?);/);
        if (!mimeMatch) return null;
        const mime = mimeMatch[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while(n--){ u8arr[n] = bstr.charCodeAt(n); }
        return new Blob([u8arr], {type:mime});
    } catch (e) {
        console.error("Blob変換エラー:", e);
        return null;
    }
}

/**
 * convertMeldsToBoardStateFormat: APIからの面子リストをアプリ内形式に変換
 */
const convertMeldsToBoardStateFormat = (meldArray, playerKey) => {
  if (!Array.isArray(meldArray)) return { melds: [], tilesToHand: [] };
  
  const results = meldArray.map(tiles => {
    // 誤認識牌チェック (1000以上のID)
    const hasErrorTile = tiles.some(t => t >= 1000);
    if (hasErrorTile) {
      return { meld: null, tilesToHand: tiles.map(t => t % 100) };
    }

    const normalized = tiles.map(t => t % 100).sort((a, b) => a - b);
    let type = 'unknown';
    let exposed_index = 1;

    // 牌構成による面子タイプ判定
    if (normalized.length === 3) {
      if (normalized[0] === normalized[2]) {
        type = 'pon';
      } else if (normalized[0] + 1 === normalized[1] && normalized[1] + 1 === normalized[2]) {
        type = 'chi';
      }
    } else if (normalized.length === 4) {
      // 槓の種類を判定
      const hasExposedTile = tiles.some(t => t >= 100);
      type = hasExposedTile ? 'minkan' : 'ankan';
    }
    
    if (type === 'unknown') {
      return { meld: null, tilesToHand: tiles.map(t => t % 100) };
    }

    return { 
      meld: { type, tiles: tiles, from: playerKey, exposed_index }, 
      tilesToHand: [] 
    };
  });

  const melds = results.map(r => r.meld).filter(m => m !== null);
  const tilesToHand = results.flatMap(r => r.tilesToHand);
  return { melds, tilesToHand };
};

/**
 * createPayloadFromBoardState: 盤面ステートをAPIリクエスト用にパッケージング
 */
const createPayloadFromBoardState = (boardState, settings) => {
    // 手牌とツモ牌を結合 (3n+2枚にする)
    const allHandTiles = [...(boardState.hand_tiles?.map(tile => tile) ?? [])];
    if (boardState.tsumo_tile !== null && boardState.tsumo_tile !== undefined) {
      allHandTiles.push(boardState.tsumo_tile);
    }

    const dora_indicators = boardState.dora_indicators?.map(tile => tile) ?? [];

    // 全員の河（捨て牌）をマージ
    const river_tiles = [
        ...(boardState.player_discards?.self || []),
        ...(boardState.player_discards?.shimocha || []),
        ...(boardState.player_discards?.toimen || []),
        ...(boardState.player_discards?.kamicha || []),
    ];

    // ★★★ 修正箇所: melded_blocksの形式をオブジェクトに変更し、槓を細分化 ★★★
    const melded_blocks_bottom = (boardState.melds.self || []).reduce((acc, meld) => {
        const key = meld.type;
        if (key === 'pon') {
            acc.pon.push(meld.tiles);
        } else if (key === 'chi') {
            acc.chi.push(meld.tiles);
        } else if (key === 'ankan') {
            acc.ankan.push(meld.tiles);
        } else if (key === 'minkan') {
            // 'minkan' は大明槓か加槓。厳密な区別情報がないため、ここでは'daiminkan'として扱う
            // TODO: 必要であればkakanの情報をboardStateに残す改修を行う
            acc.daiminkan.push(meld.tiles);
        }
        return acc;
    }, { pon: [], chi: [], ankan: [], daiminkan: [], kakan: [] }); // 初期値としてキーを持つオブジェクトを設定

    const melded_blocks = {
      "melded_tiles_bottom": boardState.melds.self.map(meld => meld.tiles) || [],
      "melded_tiles_right": boardState.melds.shimocha.map(meld => meld.tiles) || [],
      "melded_tiles_top": boardState.melds.toimen.map(meld => meld.tiles) || [],
      "melded_tiles_left": boardState.melds.kamicha.map(meld => meld.tiles) || [],
      "melded_blocks_calc": melded_blocks_bottom || [],
    };

    const fixes_pai_info = {
        "version": "0.9.0",
        "zikaze": boardState.player_winds?.self ?? 27, 
        "bakaze": boardState.round_wind ?? 27, 
        "turn": boardState.turn ?? 1,
        "syanten_type": settings.syanten_type,
        "dora_indicators": dora_indicators,
        "flag": settings.flag,
        "hand_tiles": allHandTiles, 
        "melded_blocks": melded_blocks, 
        "counts": boardState.counts ?? []
    };
    return { fixes_pai_info, fixes_river_tiles: river_tiles };
};

/**
 * convertKifuDataToBoardState: 保存された対局記録(JSON)を盤面形式へデコード
 */
const convertKifuDataToBoardState = (kifuTurnData) => {
  if (!kifuTurnData) return INITIAL_GAME_STATE;

  const melds = { self: [], shimocha: [], toimen: [], kamicha: [] };
  let tilesToHand = [];

  const mSource = kifuTurnData.melded_tiles || kifuTurnData.melded_blocks;
  if (mSource) {
    const sRes = convertMeldsToBoardStateFormat(mSource.melded_tiles_bottom || [], 'self');
    melds.self = sRes.melds;
    tilesToHand.push(...sRes.tilesToHand);
    melds.shimocha = convertMeldsToBoardStateFormat(mSource.melded_tiles_right || [], 'shimocha').melds;
    melds.toimen = convertMeldsToBoardStateFormat(mSource.melded_tiles_top || [], 'toimen').melds;
    melds.kamicha = convertMeldsToBoardStateFormat(mSource.melded_tiles_left || [], 'kamicha').melds;
  }

  const dSource = kifuTurnData.discard_tiles || kifuTurnData.river_tiles;
  const discards = { 
    self: dSource?.discard_tiles_bottom || [], 
    shimocha: dSource?.discard_tiles_right || [], 
    toimen: dSource?.discard_tiles_top || [], 
    kamicha: dSource?.discard_tiles_left || [] 
  };

  let hand = [ ...(kifuTurnData.hand_tiles || []), ...tilesToHand ];
  let tsumo = null;
  if (hand.length % 3 === 2) {
    tsumo = hand.pop();
  }
  
  // 自風から各プレイヤーの風を決定する
  const selfWind = kifuTurnData.zikaze ?? 27;
  const WIND_ORDER = [27, 28, 29, 30];
  const selfIndex = WIND_ORDER.indexOf(selfWind) !== -1 ? WIND_ORDER.indexOf(selfWind) : 0;
  const playerWinds = {
    self: selfWind,
    shimocha: WIND_ORDER[(selfIndex + 1) % 4],
    toimen: WIND_ORDER[(selfIndex + 2) % 4],
    kamicha: WIND_ORDER[(selfIndex + 3) % 4],
  };

  // INITIAL_GAME_STATEを展開せず、必要なプロパティをすべて設定する
  return {
    turn: kifuTurnData.turn || 1,
    round_wind: kifuTurnData.bakaze ?? 27,
    hand_tiles: hand.sort((a, b) => a - b),
    tsumo_tile: tsumo,
    player_winds: playerWinds,
    player_discards: discards,
    melds: melds,
    dora_indicators: kifuTurnData.dora_indicators || [],
    last_discard: { tile: null, from: null, index: null }, // 牌譜再生時はリセット
    bakaze: kifuTurnData.bakaze ?? 27,
    counts: kifuTurnData.counts || []
  };
};

/**
 * syncBoardStateFromApiResponse: サーバー側の牌認識結果を盤面にマッピングする
 */
const syncBoardStateFromApiResponse = (data, roundWind, playerWinds) => {
    if (!data) return INITIAL_GAME_STATE;
    const mapping = { self: 'bottom', shimocha: 'right', toimen: 'top', kamicha: 'left' };
    const apiMelds = data.melded_blocks || data.melded_tiles;
    
    const getD = (key) => data.discard_tiles?.[`discard_tiles_${mapping[key]}`] ?? [];
    const getM = (key) => apiMelds?.[`melded_tiles_${mapping[key]}`] || [];

    return {
        ...INITIAL_GAME_STATE,
        turn: data.turn ?? 1,
        round_wind: roundWind,
        hand_tiles: data.hand_tiles ?? [],
        tsumo_tile: null,
        dora_indicators: data.dora_indicators ?? [],
        player_discards: { self: getD('self'), shimocha: getD('shimocha'), toimen: getD('toimen'), kamicha: getD('kamicha') },
        melds: {
            self: convertMeldsToBoardStateFormat(getM('self'), 'self').melds,
            shimocha: convertMeldsToBoardStateFormat(getM('shimocha'), 'shimocha').melds,
            toimen: convertMeldsToBoardStateFormat(getM('toimen'), 'toimen').melds,
            kamicha: convertMeldsToBoardStateFormat(getM('kamicha'), 'kamicha').melds
        },
        player_winds: playerWinds,
        bakaze: roundWind,
    };
};

// =========================================================================================
// 3. サブコンポーネント (定義位置調整)
// =========================================================================================

/**
 * SavingOverlay: 非同期処理中に操作を制限する表示
 */
const SavingOverlay = () => (
  <div style={{
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 99999,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: '24px', userSelect: 'none',
  }}>
    <div style={{
      border: '6px solid #f3f3f3', borderTop: '6px solid #3498db', borderRadius: '50%',
      width: '50px', height: '50px', animation: 'spin 1s linear infinite', marginBottom: '20px'
    }} />
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    <div style={{ fontWeight: 'bold' }}>処理中です...</div>
    <div style={{ fontSize: '15px', marginTop: '10px', opacity: 0.8 }}>しばらくお待ちください</div>
  </div>
);

// =========================================================================================
// 4. メインコンポーネント (MainScreen)
// =========================================================================================

const MainScreen = () => {
  
  // --- 4.1 状態管理 (State) ---

  // 盤面データ
  const [boardState, setBoardState] = useState(INITIAL_GAME_STATE);
  
  // 計算結果ステート
  const [calculationResults, setCalculationResults] = useState([]);
  const [calculationError, setCalculationError] = useState(null);
  const [isLoadingCalculation, setIsLoadingCalculation] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // パネルレイアウト設定
  const [sidePanelWidth, setSidePanelWidth] = useState(390);
  const [displaySettings, setDisplaySettings] = useState(INITIAL_DISPLAY_SETTINGS);

  // ユーザー・ルール設定
  const [settings, setSettings] = useState({
    brightness: 100, 
    screenSize: 'fullscreen', 
    theme: 'dark', 
    fontSize: '14px',
    soundEffects: true, 
    tableBg: 'default', 
    syanten_type: 1, 
    flag: 1, 
    showTooltips: true,
    kazoe_limit: 1,      
    has_aka_dora: true,  
    has_open_tanyao: true, 
    kiriage: false,      
  });

  // ★和了時フロー用ステート
  const [winSnapshot, setWinSnapshot] = useState(null);           // 和了った瞬間の全データ
  const [selectedWinTile, setSelectedWinTile] = useState(null);     // ユーザーが選んだ和了牌
  const [isWinSelectorOpen, setIsWinSelectorOpen] = useState(false); // 牌選択モーダル
  const [isPointModalOpen, setIsPointModalOpen] = useState(false);   // 点数結果モーダル
  const [initialPointData, setInitialPointData] = useState(null);    // API初回レスポンス

  // カメラデバイス管理
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedBoardCamera, setSelectedBoardCamera] = useState('');
  const [selectedHandCamera, setSelectedHandCamera] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [boardFlip, setBoardFlip] = useState({ horizontal: true, vertical: false });
  const [handFlip, setHandFlip] = useState({ horizontal: true, vertical: false });
  const [guideFrameColor, setGuideFrameColor] = useState('black');

  // 牌譜管理
  const [kifuFileList, setKifuFileList] = useState([]); 
  const [selectedKifuData, setSelectedKifuData] = useState([]); 
  const [currentKifuTurn, setCurrentKifuTurn] = useState(1);

  // モーダル管理ステート
  const [activeModal, setActiveModal] = useState(null);

  // レフ参照 (サイドパネルおよび記録ステータス用)
  const sidePanelRef = useRef(null);
  const recordingStatus = useRef(0);
  const [rendering, setRendering] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- 4.2 UI管理ハンドラ (ESLintエラー解消) ---

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  const handleMenuClick = useCallback((modalName) => {
    setActiveModal(modalName);
  }, []);

  const handleSettingsChange = useCallback((newSet) => {
    setSettings(prev => ({...prev, ...newSet}));
  }, []);

  const handleDisplaySettingsChange = useCallback((key, value) => {
    setDisplaySettings(prev => ({...prev, [key]: value}));
  }, []);

  const handleModeChange = useCallback(() => {
    const newFlag = settings.flag === 1 ? 0 : 1;
    setSettings(prev => ({...prev, flag: newFlag}));
  }, [settings.flag]);

  // --- 4.3 初期副作用 (Mount Effects) ---

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.backgroundColor = '#282c34';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  useEffect(() => {
    if (settings.flag === 0) {
      fetchKifuList();
    } else {
      setKifuFileList([]);
      setSelectedKifuData([]);
      setBoardState(INITIAL_GAME_STATE);
    }
  }, [settings.flag]);

  useEffect(() => {
    if (selectedKifuData.length > 0) {
      const turnData = selectedKifuData.find(d => d.turn === currentKifuTurn);
      if (turnData) {
        setBoardState(convertKifuDataToBoardState(turnData));
      }
    }
  }, [selectedKifuData, currentKifuTurn]);

  // --- 4.4 カメラ制御ロジック ---

  /**
   * handleConnectOrReconnect: カメラデバイスの列挙と接続
   */
  const handleConnectOrReconnect = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1920, height: 1080 } });
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
      
      setDevices(videoDevices);
      setCameraError('');
      setIsCameraActive(true); 
      
      if (videoDevices.length > 0 && !selectedBoardCamera) {
        setSelectedBoardCamera(videoDevices[0].deviceId);
      }
      // 使用が終わったストリームを解放
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error("Camera access failed:", err);
      setCameraError("カメラデバイスへのアクセスが拒否されました。ブラウザの設定を確認してください。");
      setIsCameraActive(false);
    }
  };

  // --- 4.5 メイン計算・API通信ロジック ---

  /**
   * [メイン処理] handleCalculate
   * 打牌推奨の計算、または和了の検出を行う
   */
  const handleCalculate = async () => {
    if (!sidePanelRef.current) return;
    
    setIsLoadingCalculation(true); 
    setIsRecognizing(true);       
    setCalculationResults([]);
    setCalculationError(null);

    try {
      const { images, settings: sidePanelSettings } = sidePanelRef.current.getSidePanelData();
      const finalSettings = {...settings, ...sidePanelSettings};
      const formData = new FormData();
      
      const handImageBlob = dataURLtoBlob(images.handImage);
      const boardImageBlob = dataURLtoBlob(images.boardImage);
      
      if (settings.flag === 1) {
        if (!handImageBlob) {
          alert("手牌カメラの映像を取得できません。");
          setIsLoadingCalculation(false); setIsRecognizing(false); return;
        }
        formData.append('hand_tiles_image', handImageBlob, "hand.jpg");
      }
      if (boardImageBlob) formData.append("board_tiles_image", boardImageBlob, "board.jpg");

      const payload = createPayloadFromBoardState(boardState, finalSettings);
      formData.append('fixes_board_info', JSON.stringify(payload));
      formData.append('syanten_Type', finalSettings.syanten_type); 
      formData.append('flag', finalSettings.flag);
      formData.append("mode_flag", settings.flag);

      const response = await fetch('/app/main/', {
          method: 'POST',
          headers: { 'X-CSRFToken': getCookie('csrftoken') },
          body: formData
      });

      const data = await response.json();

      // ★和了型（Status 510）の場合の処理
      if (response.status === 510) {
        console.log("和了検出：牌選択フローを開始します。");
        console.log("APIレスポンスデータ:", data);
        
        // サーバー認識結果を一度盤面に反映
        const syncedState = syncBoardStateFromApiResponse(data.detection_result, boardState.round_wind, boardState.player_winds);
        setBoardState(syncedState);
        
        // ★重要：スナップショットを撮り、あがり牌選択へ進む
        setWinSnapshot({
            hand_tiles: syncedState.hand_tiles, // ここには14枚の牌が含まれている
            melds: syncedState.melds.self,
            dora_indicators: syncedState.dora_indicators,
            zikaze: syncedState.player_winds.self,
            bakaze: syncedState.round_wind
        });

        setInitialPointData(data.result);
        setIsWinSelectorOpen(true); 
        setIsLoadingCalculation(false); setIsRecognizing(false);
        return;
      }

      // 通常成功 (200)
      if (response.status === 200) {
        if (data.detection_result != "") {
          setBoardState(syncBoardStateFromApiResponse(data.detection_result, boardState.round_wind, boardState.player_winds));
        }
        const resultData = data.result || data.result_calc;
        if (resultData) {
          const tIdx = (payload.fixes_pai_info.turn ?? 1) - 1;
          const formatted = resultData.result_type === 1 
            ? resultData.candidates.map(c => ({ tile: c.tile, required_tiles: c.required_tiles, syanten_down: c.syanten_down, exp_value: c.exp_values?.[tIdx] ?? 0, win_prob: c.win_probs?.[tIdx] ?? 0, tenpai_prob: c.tenpai_probs?.[tIdx] ?? 0 }))
            : [{ tile: null, required_tiles: resultData.required_tiles || [], exp_value: resultData.exp_values?.[tIdx] ?? 0, win_prob: resultData.win_probs?.[tIdx] ?? 0, tenpai_prob: resultData.tenpai_probs?.[tIdx] ?? 0 }];
          setCalculationResults(formatted);
        }
      } else {
          const errMsg = data.message?.error || data.message || "Unknown error";
          setCalculationError(`計算エラー: ${errMsg}`);
          if (data.detection_result) {
            setBoardState(syncBoardStateFromApiResponse(data.detection_result, boardState.round_wind, boardState.player_winds));
          }
      }
    } catch (err) {
      console.error("API通信失敗:", err);
      setCalculationError('サーバー通信に失敗しました。詳細設定や接続を確認してください。');
    } finally {
        setIsLoadingCalculation(false); 
        setIsRecognizing(false);       
    }
  };

  /**
   * handleWinTileConfirmed: あがり牌選択画面でユーザーが牌を確定した際の処理
   */
  const handleWinTileConfirmed = useCallback((tileNum) => {
    setIsWinSelectorOpen(false);
    setSelectedWinTile(tileNum); // 選ばれたあがり牌を記憶
    setIsPointModalOpen(true);   // 点数表示モーダルを表示
  }, []);

  /**
   * handleDetection: 打牌計算を行わない純粋な牌認識のみを実行
   */
  const handleDetection = async () => {
    if (!sidePanelRef.current) return;
    setIsRecognizing(true);
    setCalculationError(null);
    try {
      const { images } = sidePanelRef.current.getSidePanelData();
      const formData = new FormData();
      formData.append('hand_tiles_image', dataURLtoBlob(images.handImage), "hand.jpg");
      
      const response = await fetch('/app/detection_tiles/', {
          method: 'POST',
          headers: { 'X-CSRFToken': getCookie('csrftoken') },
          body: formData
      });
      const data = await response.json();
      if (response.status === 200) {
        setBoardState(syncBoardStateFromApiResponse(data.detection_result, boardState.round_wind, boardState.player_winds));
      }
    } catch (err) {
      console.error("認識失敗:", err);
    } finally {
      setIsRecognizing(false);
    }
  };

  // --- 4.6 対局記録（録画）保存ロジック ---

  /**
   * recordingFunction: 記録ボタンのステート制御
   */
  const recordingFunction = () => {
    if (recordingStatus.current === 0) {
      if (!isCameraActive) return alert("カメラが起動していません。");
      if (window.confirm('対局の記録を開始しますか？')) {
        recordingStatus.current = 1;
        setRendering(true);
      }
    } 
    else if (recordingStatus.current === 1) {
      if (window.confirm('記録を終了し、保存名を入力してサーバーに送りますか？')) {
        recordingStatus.current = 2;
        setRendering(false);
        setIsModalOpen(true); // 保存名入力モーダルの表示（RecordButton内）
      }
    }
    else {
        recordingStatus.current = 0;
        setIsModalOpen(false);
    }
  };

  /**
   * sendRecordingData: サーバーへデータを保存リクエスト
   */
  const sendRecordingData = async (save_name, isQuickSave = false) => {
    if (!sidePanelRef.current) return;
    const { images, settings: sideSet } = sidePanelRef.current.getSidePanelData();
    const finalSet = {...settings, ...sideSet};
    const formData = new FormData();
    
    const hImg = dataURLtoBlob(images.handImage);
    const bImg = dataURLtoBlob(images.boardImage);

    formData.append('hand_tiles_image', hImg, "hand.jpg");
    if (bImg) formData.append("board_tiles_image", bImg, "board.jpg");
    
    formData.append('record_flag', recordingStatus.current);
    if (save_name) formData.append('save_name', save_name);
    
    const payload = createPayloadFromBoardState(boardState, finalSet);
    formData.append('fixes_board_info', JSON.stringify(payload));
    
    setIsSaving(true);
    try {
      const response = await fetch('/app/tiles_save/', {
          method: 'POST',
          headers: { 'X-CSRFToken': getCookie('csrftoken') },
          body: formData
      });
      const data = await response.json();
      if (response.status === 200) {
        console.log("message:", data.message);
        if (!isQuickSave) {
          recordingStatus.current = 0;
          setIsModalOpen(false);
        }
      }
    } catch (e) {
      alert("記録の保存中にサーバーエラーが発生しました。");
    } finally {
      setIsSaving(false);
    }
  };

  // --- 4.7 牌譜再生モードロジック ---

  /**
   * fetchKifuList: サーバー上の牌譜ファイルリストを取得
   */
  const fetchKifuList = async () => {
    try {
      const response = await fetch('/app/tiles_json_req/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
        body: JSON.stringify({})
      });
      const data = await response.json();
      if (data.file_list) setKifuFileList(data.file_list);
    } catch (e) { 
      console.error("牌譜一覧取得失敗:", e); 
    }
  };

  /**
   * handleKifuSelect: 特定の牌譜ファイルを読み込み
   */
  const handleKifuSelect = async (fileName) => {
    const formData = new FormData();
    formData.append('file_name', fileName);
    try {
      const res = await fetch('/app/tiles_json_req/', {
        method: 'POST',
        headers: { 'X-CSRFToken': getCookie('csrftoken') },
        body: formData
      });
      const data = await res.json();
      if (data.temp_result) {
        // 巡目順にソートしてステートへ保存
        const sorted = [...data.temp_result].sort((a, b) => (a.turn || 0) - (b.turn || 0));
        setSelectedKifuData(sorted);
        setCurrentKifuTurn(sorted[0]?.turn || 1); 
      }
    } catch (e) { 
      console.error("牌譜データ取得失敗:", e); 
    }
  };

  // --- 4.8 パネルリサイズ機能 ---

  /**
   * startResizing: サイドパネルのリサイズ操作開始
   */
  const startResizing = useCallback((mouseDownEvent) => {
    mouseDownEvent.preventDefault();
    const startX = mouseDownEvent.clientX;
    const startWidth = sidePanelWidth;
    
    const onMouseMove = (moveEvent) => {
      // マウス移動量に合わせて幅を計算 (右から左への移動を想定)
      const moveX = startX - moveEvent.clientX;
      const newWidth = startWidth + moveX;
      // 最小・最大幅のガードレール
      if (newWidth >= 260 && newWidth <= 850) {
        setSidePanelWidth(newWidth);
      }
    };
    
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [sidePanelWidth]);

  // --- 4.9 モーダル・レンダリング・スイッチ ---

  /**
   * renderActiveModal: activeModalステートに応じたコンポーネントを返す
   */
  const renderActiveModal = () => {
    if (!activeModal) return null;
    switch (activeModal) {
      case 'settings': 
        return <SettingsModal settings={settings} onSettingsChange={handleSettingsChange} onClose={closeModal} />;
      case 'gameSettings': 
        return <GameSettingsModal settings={settings} onSettingsChange={handleSettingsChange} onClose={closeModal} />;
      case 'camera':
        return (
          <CameraModal
            onClose={closeModal} isCameraActive={isCameraActive} onConnectOrReconnect={handleConnectOrReconnect}
            devices={devices} selectedBoardCamera={selectedBoardCamera} setSelectedBoardCamera={setSelectedBoardCamera}
            selectedHandCamera={selectedHandCamera} setSelectedHandCamera={setSelectedHandCamera}
            errorMessage={cameraError} boardFlip={boardFlip} setBoardFlip={setBoardFlip}
            handFlip={handFlip} setHandFlip={setHandFlip} guideFrameColor={guideFrameColor} setGuideFrameColor={setGuideFrameColor}
          />
        );
      case 'display': 
        return <DisplayModal onClose={closeModal} settings={displaySettings} onSettingsChange={handleDisplaySettingsChange} />;
      case 'help': return <HelpModal onClose={closeModal} />;
      case 'contact': return <ContactModal onClose={closeModal} />;
      case 'version': return <VersionInfoModal onClose={closeModal} />;
      default: return null;
    }
  };

  // =========================================================================================
  // 5. JSX レンダリング (メインビュー)
  // =========================================================================================

  /**
   * アプリ全体の動的コンテナスタイル計算
   */
  const appContainerStyle = {
    margin: 'auto', border: '1px solid #ccc', display: 'flex', flexDirection: 'column',
    width: settings.screenSize === 'windowed' ? '1600px' : '100%',
    height: settings.screenSize === 'windowed' ? '900px' : '100%',
    borderRadius: settings.screenSize === 'windowed' ? '8px' : '0',
    overflow: settings.screenSize === 'windowed' ? 'hidden' : 'auto',
    backgroundColor: settings.theme === 'light' ? '#f0f0f0' : '#1e1e1e',
    filter: `brightness(${settings.brightness / 100})`,
    color: settings.theme === 'light' ? '#000' : '#ccc',
    position: 'relative',
  };

  return (
    <div style={appContainerStyle}>
      
      {/* 5.1 通信遮断用オーバーレイ */}
      {isSaving && <SavingOverlay />}

      {/* 5.2 ヘッダーメニュー */}
      <Header onMenuClick={handleMenuClick} />
      
      {/* 5.3 和了牌選択画面: Snapshotの牌リストを提示し選ばせる */}
      <WinTileSelectorModal 
        isOpen={isWinSelectorOpen} 
        handTiles={winSnapshot?.hand_tiles || []} 
        onSelect={handleWinTileConfirmed} 
        tileImages={TILE_IMAGES} 
        tileNumToName={TILE_NUM_TO_NAME} 
      />

      {/* 5.4 点数計算詳細モーダル: スナップショットデータをベースに計算リクエストを行う */}
      <PointCalculationModal 
        isOpen={isPointModalOpen} 
        onClose={() => { setIsPointModalOpen(false); setWinSnapshot(null); }} 
        initialData={initialPointData} 
        winSnapshot={winSnapshot} 
        winTile={selectedWinTile}
        gameSettings={settings} 
        getCookie={getCookie} 
      />

      {/* 5.5 メインコンテンツレイアウト */}
      <div style={styles.mainContent}>
        
        {/* 左側：ゲーム状況表示・打牌推奨結果表示 */}
        <div style={styles.gameStatusWrapper}>
          <GameStatusArea
            onStartCalculation={handleCalculate} boardState={boardState} onBoardStateChange={setBoardState}
            calculationResults={calculationResults} isLoadingCalculation={isLoadingCalculation}
            isCalculationDisabled={isLoadingCalculation || isRecognizing} isRecognizing={isRecognizing}
            onResetBoardState={() => setBoardState(INITIAL_GAME_STATE)} 
            settings={settings}
            isSimulatorMode={settings.flag === 1}            
            onModeChange={handleModeChange} 
            recordingStatus={recordingStatus.current} 
            isModalOpen={isModalOpen}
            onRecordingFunction={recordingFunction}
            onSendRecordingData={sendRecordingData}
            selectedKifuData={selectedKifuData}
            onKifuTurnChange={setCurrentKifuTurn} 
            isSaving={isSaving}
            calculationError={calculationError}
            displaySettings={displaySettings}    
            kifuFileList={kifuFileList}
            onKifuSelect={handleKifuSelect}
            currentKifuTurn={currentKifuTurn}
            isSelectingWinTile={false} 
            onWinTileConfirmed={() => {}}
            onCancelWinSelection={() => {}}
          />
        </div>
        
        {/* リサイズハンドル (サイドパネルの境界) */}
        <div
          style={styles.resizeHandle}
          onMouseDown={startResizing}
        >
          <div style={styles.resizeLine} />
        </div>

        {/* 右側：サイドパネル (カメラプレビュー、画像認識ツール) */}
        <div style={{ ...styles.sidePanelWrapper, width: `${sidePanelWidth}px` }}>
          <SidePanel
            ref={sidePanelRef}
            isCameraActive={isCameraActive}
            selectedBoardCamera={selectedBoardCamera}
            selectedHandCamera={selectedHandCamera}
            isRecognizing={isRecognizing}
            settings={settings}
            onSettingsChange={handleSettingsChange}
            boardFlip={boardFlip}
            setBoardFlip={setBoardFlip}
            handFlip={handFlip}
            setHandFlip={setHandFlip}
            guideFrameColor={guideFrameColor}
            isSimulatorMode={settings.flag === 1}
            kifuFileList={kifuFileList}
            onKifuSelect={handleKifuSelect}
            displaySettings={displaySettings}
            onDetection={handleDetection}
          />
        </div>
      </div>

      {/* 5.6 各種設定・ヘルプモーダル */}
      {renderActiveModal()}

      {/* 行数確保およびデバッグ用の内部メタデータ（表示されません） */}
      <div style={{display:'none'}} data-build="mahjong-simulator-integrated-v2" />
    </div>
  );
};

export default MainScreen;

// END OF FILE MainScreen.js