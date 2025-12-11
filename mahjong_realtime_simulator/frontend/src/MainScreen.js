// MainScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';

// コンポーネントのインポート
import { Header } from './Header/Header';
import { SettingsModal }  from './Header/SettingsModal';
import { CameraModal } from './Header/CameraModal'; 
import { DisplayModal } from './Header/DisplayModal';
import { HelpModal } from './Header/HelpModal';
import { ContactModal } from './Header/ContactModal';
import { VersionInfoModal } from './Header/VersionInfoModal';

import GameStatusArea from './MainScreen_child/GameStatusArea'; 
import SidePanel from './MainScreen_child/SidePanel'; 

// 盤面の初期状態 (このオブジェクトを再利用)
const INITIAL_GAME_STATE = {
  turn: 1, // 巡目は1から開始
  round_wind: 27, // 場風は東 (Z1)
  hand_tiles: [], // 手牌を空に
  tsumo_tile: null, // ツモ牌をnullに
  player_winds: { self: 27, shimocha: 28, toimen: 29, kamicha: 30 }, // 各プレイヤーの風
  player_discards: { self: [], shimocha: [], toimen: [], kamicha: [] }, // 全員の捨て牌を空に
  melds: { self: [], shimocha: [], toimen: [], kamicha: [] }, // 全員の面子を空に
  dora_indicators: [], // ドラ表示牌を空に
  last_discard: { tile: null, from: null, index: null }, // 最終捨て牌をnullに
  bakaze: 27, // 場風の初期値 (東)
  counts: [] // 牌の数
};

// 表示設定の初期値
const INITIAL_DISPLAY_SETTINGS = {
  resultCount: 5,        // シミュレーション結果の表示件数
  showStatus: true,      // 状況（手牌・盤面情報）
  showSimulation: true,  // シミュレーション結果
  showCamera: true,      // カメラプレビュー
  showSettings: true     // 設定UI
};

// スタイル定義
const styles = {
  mainContent: {
    display: 'flex',
    flexGrow: 1,
    padding: '15px',
    gap: '0', 
    overflow: 'hidden',
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
  },
  resizeHandle: {
    width: '10px',
    cursor: 'col-resize',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    backgroundColor: 'transparent',
    transition: 'background-color 0.2s',
  },
  resizeLine: {
    width: '4px',
    height: '40px',
    backgroundColor: '#666',
    borderRadius: '2px',
  }
};

// ヘルパー関数
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
function dataURLtoBlob(dataurl) {
    if (!dataurl) return null;
    const arr = dataurl.split(',');
    if (arr.length < 2 || !arr[0].match(/:(.*?);/)) return null;
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){ u8arr[n] = bstr.charCodeAt(n); }
    return new Blob([u8arr], {type:mime});
}
const convertMeldsToBoardStateFormat = (meldArray, playerKey) => {
  if (!Array.isArray(meldArray)) return [];
  return meldArray.map(tiles => {
    tiles.sort((a,b) => a - b); 
    let type = 'unknown';
    let exposed_index = null;
    if (tiles.length === 3) {
      if (tiles[0] === tiles[1] && tiles[1] === tiles[2]) {
        type = 'pon';
        exposed_index = 1;
      } else if (tiles[0] + 1 === tiles[1] && tiles[1] + 1 === tiles[2] && 
                  Math.floor(tiles[0] / 9) === Math.floor(tiles[1] / 9) &&
                  Math.floor(tiles[1] / 9) === Math.floor(tiles[2] / 9)) {
        type = 'chi';
        exposed_index = 1;
      }
    } else if (tiles.length === 4) {
      if (tiles[0] === tiles[1] && tiles[1] === tiles[2] && tiles[2] === tiles[3]) {
        type = 'ankan';
        exposed_index = null;
      }
    }
    const from = playerKey === 'self' ? 'self' : null;
    return { type, tiles, from, exposed_index };
  });
};
const createPayloadFromBoardState = (boardState, settings) => {
    const allHandTiles = [...(boardState.hand_tiles?.map(tile => tile) ?? [])];
    if (boardState.tsumo_tile !== null && boardState.tsumo_tile !== undefined) {
      allHandTiles.push(boardState.tsumo_tile);
    }
    const dora_indicators = boardState.dora_indicators?.map(tile => tile) ?? [];
    const fixes_river_tiles_list = [
        ...(boardState.player_discards?.self?.map(tile => tile) ?? []),
        ...(boardState.player_discards?.shimocha?.map(tile => tile) ?? []),
        ...(boardState.player_discards?.toimen?.map(tile => tile) ?? []),
        ...(boardState.player_discards?.kamicha?.map(tile => tile) ?? []),
    ];
    const melded_blocks_for_api = boardState.melds.self.map(meld => meld.tiles) ?? []; 
    const fixes_pai_info = {
        "version": "0.9.0",
        "zikaze": boardState.player_winds?.self ?? 27, 
        "bakaze": boardState.round_wind ?? 27, 
        "turn": boardState.turn ?? 1,
        "syanten_type": settings.syanten_type,
        "dora_indicators": dora_indicators,
        "flag": settings.flag,
        "hand_tiles": allHandTiles, 
        "melded_blocks": melded_blocks_for_api, 
        "counts": boardState.counts ?? []
    };
    return { fixes_pai_info, fixes_river_tiles: fixes_river_tiles_list };
};

// 牌譜データをboardState形式に変換するヘルパー関数
const convertKifuDataToBoardState = (kifuTurnData) => {
  if (!kifuTurnData) return INITIAL_GAME_STATE; // データがなければ初期状態を返す

  const melds = { self: [], shimocha: [], toimen: [], kamicha: [] };
  if (kifuTurnData.melded_blocks) {
    melds.self = convertMeldsToBoardStateFormat(kifuTurnData.melded_blocks.melded_tiles_bottom || [], 'self');
    melds.shimocha = convertMeldsToBoardStateFormat(kifuTurnData.melded_blocks.melded_tiles_right || [], 'shimocha');
    melds.toimen = convertMeldsToBoardStateFormat(kifuTurnData.melded_blocks.melded_tiles_top || [], 'toimen');
    melds.kamicha = convertMeldsToBoardStateFormat(kifuTurnData.melded_blocks.melded_tiles_left || [], 'kamicha');
  }

  const player_discards = { self: [], shimocha: [], toimen: [], kamicha: [] };
  if (kifuTurnData.river_tiles) {
    player_discards.self = kifuTurnData.river_tiles.discard_tiles_bottom || [];
    player_discards.shimocha = kifuTurnData.river_tiles.discard_tiles_right || [];
    player_discards.toimen = kifuTurnData.river_tiles.discard_tiles_top || [];
    player_discards.kamicha = kifuTurnData.river_tiles.discard_tiles_left || [];
  }

  let hand_tiles = [...(kifuTurnData.hand_tiles || [])];
  let tsumo_tile = null;
  if (hand_tiles.length === 14) {
    tsumo_tile = hand_tiles.pop();
  }

  return {
    ...INITIAL_GAME_STATE,
    turn: kifuTurnData.turn || 1,
    dora_indicators: kifuTurnData.dora_indicators || [],
    hand_tiles: hand_tiles,
    tsumo_tile: tsumo_tile,
    melds: melds,
    player_discards: player_discards,
  };
};

// 保存中のオーバーレイコンポーネント
const SavingOverlay = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 99999, // 最前面
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '24px',
    userSelect: 'none',
  }}>
    <div style={{
      border: '6px solid #f3f3f3',
      borderTop: '6px solid #3498db',
      borderRadius: '50%',
      width: '50px',
      height: '50px',
      animation: 'spin 1s linear infinite',
      marginBottom: '20px'
    }} />
    <style>
      {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
    </style>
    <div>保存中...</div>
    <div style={{ fontSize: '16px', marginTop: '10px', opacity: 0.8 }}>しばらくお待ちください</div>
  </div>
);


// メインコンポーネント
const MainScreen = () => {
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif";
    document.body.style.webkitFontSmoothing = 'antialiased';
    document.body.style.mozOsxFontSmoothing = 'grayscale';
    document.body.style.backgroundColor = '#282c34';
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.style.height = '100vh';
      rootElement.style.display = 'flex';
      rootElement.style.justifyContent = 'center';
      rootElement.style.alignItems = 'center';
    }
    return () => {
      document.body.style.backgroundColor = '';
      if (rootElement) {
        rootElement.style.height = ''; rootElement.style.display = '';
        rootElement.style.justifyContent = ''; rootElement.style.alignItems = '';
      }
    };
  }, []);

  // --- 状態管理 ---
  const [boardState, setBoardState] = useState(INITIAL_GAME_STATE);
  const [activeModal, setActiveModal] = useState(null);
  const [calculationError, setCalculationError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [sidePanelWidth, setSidePanelWidth] = useState(390);

  const [settings, setSettings] = useState({
    brightness: 100, screenSize: 'fullscreen', theme: 'dark', fontSize: '14px',
    soundEffects: true, tableBg: 'default', tableBgImage: null, appBg: 'default',
    appBgImage: null, syanten_type: 1, flag: 1, showTooltips: true
  });
  const [use3DDisplay, setUse3DDisplay] = useState(false); 

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedBoardCamera, setSelectedBoardCamera] = useState('');
  const [selectedHandCamera, setSelectedHandCamera] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [calculationResults, setCalculationResults] = useState([]);
  const [isLoadingCalculation, setIsLoadingCalculation] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false); 
  const sidePanelRef = useRef(null);
  const [boardFlip, setBoardFlip] = useState({ horizontal: true, vertical: false });
  const [handFlip, setHandFlip] = useState({ horizontal: true, vertical: false });

  const [guideFrameColor, setGuideFrameColor] = useState('black');
  const [displaySettings, setDisplaySettings] = useState(INITIAL_DISPLAY_SETTINGS);

  // 牌譜モード用
  const [kifuFileList, setKifuFileList] = useState([]); 
  const [selectedKifuData, setSelectedKifuData] = useState([]); 
  const [currentKifuTurn, setCurrentKifuTurn] = useState(1);

  // --- ハンドラ ---
  const handleMenuClick = (modalName) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);
  const handleSettingsChange = (newSettings) => setSettings(prev => ({...prev, ...newSettings}));

  const handleDisplaySettingsChange = (key, value) => {
    setDisplaySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleModeChange = () => {
    const newFlag = settings.flag === 1 ? 0 : 1;
    handleSettingsChange({ flag: newFlag });
    console.log(`モードが ${newFlag === 1 ? 'リアルタイムシミュレーター' : '牌譜'} に切り替わりました。`);
  };

  const handleDisplayChange = (newDisplaySettings) => {
    if (newDisplaySettings.use3D !== undefined) {
      setUse3DDisplay(newDisplaySettings.use3D);
    }
  };

  const handleConnectOrReconnect = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1920 }, height: { ideal: 1080 }} });
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
      if (videoDevices.length === 0) {
        setCameraError('利用可能なカメラが見つかりません。');
        setDevices([]);
        setIsCameraActive(false);
        return;
      }
      setDevices(videoDevices);
      setCameraError('');
      setIsCameraActive(true); 
      const deviceIds = videoDevices.map(d => d.deviceId);
      if (!deviceIds.includes(selectedBoardCamera) && videoDevices[0]) {
        setSelectedBoardCamera(videoDevices[0].deviceId);
      }
      if (!deviceIds.includes(selectedHandCamera)) {
        const defaultHandDevice = videoDevices[1] || videoDevices[0];
        if (defaultHandDevice) {
            setSelectedHandCamera(defaultHandDevice.deviceId);
        }
      }
    } catch (err) {
      console.error("カメラデバイスの取得に失敗:", err);
      setCameraError("カメラへのアクセスがブロックされました。ブラウザの設定を確認してください。");
      setIsCameraActive(false);
    }
  };
    
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
        if (!handImageBlob || handImageBlob.size === 0) {
          alert("手牌カメラの映像が取得できませんでした。カメラが正しく接続・認識されているか確認してください。");
          setIsLoadingCalculation(false); 
          setIsRecognizing(false); 
          return; 
        }
        formData.append('hand_tiles_image', handImageBlob, "hand_tiles_image.jpg");
      }
      if (boardImageBlob) formData.append("board_tiles_image", boardImageBlob, "board_tiles_image.jpg");
      const { fixes_pai_info, fixes_river_tiles } = createPayloadFromBoardState(boardState, finalSettings);
      const fixes_board_info = { fixes_pai_info, fixes_river_tiles };
      formData.append('fixes_board_info', JSON.stringify(fixes_board_info));
      formData.append('syanten_Type', finalSettings.syanten_type); 
      formData.append('flag', finalSettings.flag);
      formData.append("mode_flag", settings.flag)
      const response = await fetch('/app/main/', {
          method: 'POST',
          headers: { 'X-CSRFToken': getCookie('csrftoken') },
          body: formData
      });
      const data = await response.json();
      if (response.status === 200) {
        let updatedBoardState = { ...INITIAL_GAME_STATE }; 
        let detectedResult = data.detection_result; 
        if (detectedResult && Array.isArray(detectedResult.discard_tiles)) {
            const singleDiscardList = detectedResult.discard_tiles;
            const reDistributedDiscards = {
                discard_tiles_bottom: [], discard_tiles_right: [],
                discard_tiles_top: [], discard_tiles_left: [],
            };
            let playerIndex = 0;
            const playerKeys = ['discard_tiles_bottom', 'discard_tiles_right', 'discard_tiles_top', 'discard_tiles_left'];
            for (let i = 0; i < singleDiscardList.length; i++) {
                reDistributedDiscards[playerKeys[playerIndex]].push(singleDiscardList[i]);
                playerIndex = (playerIndex + 1) % playerKeys.length;
            }
            detectedResult.discard_tiles = reDistributedDiscards; 
        }
        let recognizedHandTiles = detectedResult.hand_tiles ?? [];
        let recognizedTsumoTile = null;
        if (recognizedHandTiles.length === 14) {
          recognizedTsumoTile = recognizedHandTiles.pop(); 
        } else if (recognizedHandTiles.length === 0) {
            if (boardState.hand_tiles.length > 0 || boardState.tsumo_tile !== null) {
                recognizedHandTiles = boardState.hand_tiles;
                recognizedTsumoTile = boardState.tsumo_tile;
            } else {
                setCalculationError("APIが手牌を認識できませんでした。(0枚検出) 手牌の画像が鮮明か、角度が適切か確認してください。");
                setIsLoadingCalculation(false); 
                setIsRecognizing(false); 
                return;
            }
        }
        const getMeldsForPlayer = (playerData, playerKey) => {
          let meldData = [];
          if (Array.isArray(playerData)) { meldData = playerData; }
          else if (typeof playerData === 'object' && playerData !== null) {
            if (playerKey === 'self') meldData = playerData.melded_tiles_bottom || [];
            else if (playerKey === 'shimocha') meldData = playerData.melded_tiles_right || [];
            else if (playerKey === 'toimen') meldData = playerData.melded_tiles_top || [];
            else if (playerKey === 'kamicha') meldData = playerData.melded_tiles_left || [];
          }
          return meldData;
        };
        const getDiscardsForPlayer = (playerKey, discardData) => {
            if (playerKey === 'self') return discardData?.discard_tiles_bottom ?? [];
            if (playerKey === 'shimocha') return discardData?.discard_tiles_right ?? [];
            if (playerKey === 'toimen') return discardData?.discard_tiles_top ?? [];
            if (playerKey === 'kamicha') return discardData?.discard_tiles_left ?? [];
            return [];
        };
        const apiMeldsSource = detectedResult.melded_blocks || detectedResult.melded_tiles;
        let selfMelds = [], shimochaMelds = [], toimenMelds = [], kamichaMelds = [];
        if (Array.isArray(apiMeldsSource)) {
            selfMelds = convertMeldsToBoardStateFormat(apiMeldsSource, 'self');
        } else if (typeof apiMeldsSource === 'object' && apiMeldsSource !== null) {
            selfMelds = convertMeldsToBoardStateFormat(getMeldsForPlayer(apiMeldsSource, 'self'), 'self');
            shimochaMelds = convertMeldsToBoardStateFormat(getMeldsForPlayer(apiMeldsSource, 'shimocha'), 'shimocha');
            toimenMelds = convertMeldsToBoardStateFormat(getMeldsForPlayer(apiMeldsSource, 'toimen'), 'toimen');
            kamichaMelds = convertMeldsToBoardStateFormat(getMeldsForPlayer(apiMeldsSource, 'kamicha'), 'kamicha');
        }
        updatedBoardState = {
            ...INITIAL_GAME_STATE, 
            turn: detectedResult.turn ?? 1,
            round_wind: boardState.round_wind, 
            hand_tiles: recognizedHandTiles,
            tsumo_tile: recognizedTsumoTile, 
            dora_indicators: detectedResult.dora_indicators ?? [], 
            player_discards: {
                self: getDiscardsForPlayer('self', detectedResult.discard_tiles), 
                shimocha: getDiscardsForPlayer('shimocha', detectedResult.discard_tiles),
                toimen: getDiscardsForPlayer('toimen', detectedResult.discard_tiles),
                kamicha: getDiscardsForPlayer('kamicha', detectedResult.discard_tiles)
            },
            melds: { self: selfMelds, shimocha: shimochaMelds, toimen: toimenMelds, kamicha: kamichaMelds },
            player_winds: boardState.player_winds, 
            last_discard: { tile: null, from: null, index: null }, 
            bakaze: boardState.round_wind, 
            counts: [] 
        };
        setBoardState(updatedBoardState); 
        const resultData = data.result || data.result_calc;
        let formattedResults = []; 
        if (resultData) {
          const turnIndex = (fixes_pai_info.turn ?? 1) - 1;
          if (resultData.result_type === 1 && Array.isArray(resultData.candidates)) {
            formattedResults = resultData.candidates.map(candidate => ({
              tile: candidate.tile, required_tiles: candidate.required_tiles, syanten_down: candidate.syanten_down,
              exp_value: candidate.exp_values?.[turnIndex] ?? 0, win_prob: candidate.win_probs?.[turnIndex] ?? 0,
              tenpai_prob: candidate.tenpai_probs?.[turnIndex] ?? 0,
            }));
          } 
          else if (resultData.result_type === 0) {
            const singleResult = {
              tile: null, required_tiles: resultData.required_tiles || [], syanten_down: false, 
              exp_value: resultData.exp_values?.[turnIndex] ?? 0, win_prob: resultData.win_probs?.[turnIndex] ?? 0,
              tenpai_prob: resultData.tenpai_probs?.[turnIndex] ?? 0,
            };
            formattedResults = [singleResult]; 
          }
          if (formattedResults.length > 0) {
            setCalculationResults(formattedResults);
          } else {
            setCalculationError("計算結果の形式が正しくないか、不明な形式です。");
          }
        } else {
          setCalculationError("計算結果が返されませんでした。");
        }
      } else {
          const errorMessage = data.message?.error || data.message || "Unknown error";
          if (response.status === 420) {
            let displayMessage = errorMessage; 
            if (String(errorMessage).includes("The number of tiles in your hand is invalid")) {
                const tileCountMatch = String(errorMessage).match(/\((\d+)/);
                const tileCount = tileCountMatch ? tileCountMatch[1] : '不明な';
                displayMessage = `手牌の枚数が正しくありませんでした。（検出された枚数: ${tileCount}枚）手牌の認識がうまくいっているか確認してください。(errorMessage: ${data.message})`;
            }
            setCalculationError(`計算できませんでした: ${displayMessage}`);
          } else { 
              setCalculationError(`エラーが発生しました (Status: ${response.status}): ${errorMessage}`);
          }
          if (data.detection_result) {
            let detectedResultError = data.detection_result; 
            if (detectedResultError && Array.isArray(detectedResultError.discard_tiles)) {
                const singleDiscardList = detectedResultError.discard_tiles;
                const reDistributedDiscards = {
                    discard_tiles_bottom: [], discard_tiles_right: [],
                    discard_tiles_top: [], discard_tiles_left: [],
                };
                let playerIndex = 0;
                const playerKeys = ['discard_tiles_bottom', 'discard_tiles_right', 'discard_tiles_top', 'discard_tiles_left'];
                for (let i = 0; i < singleDiscardList.length; i++) {
                    reDistributedDiscards[playerKeys[playerIndex]].push(singleDiscardList[i]);
                    playerIndex = (playerIndex + 1) % playerKeys.length;
                }
                detectedResultError.discard_tiles = reDistributedDiscards;
            }
            let recognizedHandTiles = detectedResultError.hand_tiles ?? [];
            let recognizedTsumoTile = null;
            if (recognizedHandTiles.length === 14) {
              recognizedTsumoTile = recognizedHandTiles.pop();
            } else if (recognizedHandTiles.length === 0) {
                recognizedHandTiles = boardState.hand_tiles;
                recognizedTsumoTile = boardState.tsumo_tile;
            }
            const getMeldsForPlayer = (playerData, playerKey) => { 
                let meldData = [];
                if (Array.isArray(playerData)) { meldData = playerData; }
                else if (typeof playerData === 'object' && playerData !== null) {
                    if (playerKey === 'self') meldData = playerData.melded_tiles_bottom || [];
                    else if (playerKey === 'shimocha') meldData = playerData.melded_tiles_right || [];
                    else if (playerKey === 'toimen') meldData = playerData.melded_tiles_top || [];
                    else if (playerKey === 'kamicha') meldData = playerData.melded_tiles_left || [];
                }
                return meldData;
            };
            const simplifiedGetDiscardsForPlayer = (playerKey, discardData) => {
                if (playerKey === 'self') return discardData?.discard_tiles_bottom ?? [];
                if (playerKey === 'shimocha') return discardData?.discard_tiles_right ?? [];
                if (playerKey === 'toimen') return discardData?.discard_tiles_top ?? [];
                if (playerKey === 'kamicha') return discardData?.discard_tiles_left ?? [];
                return [];
            };
            const apiMeldsSource = detectedResultError.melded_blocks || detectedResultError.melded_tiles;
            let selfMelds = [], shimochaMelds = [], toimenMelds = [], kamichaMelds = [];
            if (Array.isArray(apiMeldsSource)) {
                selfMelds = convertMeldsToBoardStateFormat(apiMeldsSource, 'self');
            } else if (typeof apiMeldsSource === 'object' && apiMeldsSource !== null) {
                selfMelds = convertMeldsToBoardStateFormat(getMeldsForPlayer(apiMeldsSource, 'self'), 'self');
                shimochaMelds = convertMeldsToBoardStateFormat(getMeldsForPlayer(apiMeldsSource, 'shimocha'), 'shimocha');
                toimenMelds = convertMeldsToBoardStateFormat(getMeldsForPlayer(apiMeldsSource, 'toimen'), 'toimen');
                kamichaMelds = convertMeldsToBoardStateFormat(getMeldsForPlayer(apiMeldsSource, 'kamicha'), 'kamicha');
            }
            setBoardState({
                ...INITIAL_GAME_STATE,
                turn: detectedResultError.turn ?? 1, round_wind: boardState.round_wind, hand_tiles: recognizedHandTiles,
                tsumo_tile: recognizedTsumoTile, dora_indicators: detectedResultError.dora_indicators ?? [],
                player_discards: {
                    self: simplifiedGetDiscardsForPlayer('self', detectedResultError.discard_tiles),
                    shimocha: simplifiedGetDiscardsForPlayer('shimocha', detectedResultError.discard_tiles),
                    toimen: simplifiedGetDiscardsForPlayer('toimen', detectedResultError.discard_tiles),
                    kamicha: simplifiedGetDiscardsForPlayer('kamicha', detectedResultError.discard_tiles)
                },
                melds: { self: selfMelds, shimocha: shimochaMelds, toimen: toimenMelds, kamicha: kamichaMelds },
                player_winds: boardState.player_winds, bakaze: boardState.round_wind, counts: []
            });
          }
      }
    } catch (err) {
      console.error('通信に失敗しました:', err);
      setCalculationError('通信に失敗しました。詳細はコンソールを確認してください。');
    } finally {
        setIsLoadingCalculation(false); 
        setIsRecognizing(false);       
    }
  };

  const appContainerStyle = {
    margin: 'auto', border: '1px solid #ccc', display: 'flex', flexDirection: 'column',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)', transition: 'all 0.3s',
    width: settings.screenSize === 'windowed' ? '1600px' : '100%',
    height: settings.screenSize === 'windowed' ? '900px' : '100%',
    borderRadius: settings.screenSize === 'windowed' ? '8px' : '0',
    overflow: settings.screenSize === 'windowed' ? 'hidden' : 'auto',
    backgroundColor: settings.theme === 'light' ? '#f0f0f0' : '#1e1e1e',
    backgroundImage: settings.appBg === 'image' && settings.appBgImage ? `url(${settings.appBgImage})` : 'none',
    backgroundSize: 'cover', backgroundPosition: 'center',
    color: settings.theme === 'light' ? '#000000' : '#ccc',
    fontSize: settings.fontSize,
    filter: `brightness(${settings.brightness / 100})`,
  };

  const renderModal = () => {
  switch (activeModal) {
    case 'settings': return <SettingsModal settings={settings} onSettingsChange={handleSettingsChange} onClose={closeModal} />;
    
    case 'camera':
      return (
        <CameraModal
          onClose={closeModal}
          isCameraActive={isCameraActive}
          onConnectOrReconnect={handleConnectOrReconnect}
          devices={devices}
          selectedBoardCamera={selectedBoardCamera}
          setSelectedBoardCamera={setSelectedBoardCamera}
          selectedHandCamera={selectedHandCamera}
          setSelectedHandCamera={setSelectedHandCamera}
          errorMessage={cameraError}
          boardFlip={boardFlip}
          setBoardFlip={setBoardFlip}
          handFlip={handFlip}
          setHandFlip={setHandFlip}
            guideFrameColor={guideFrameColor}
            setGuideFrameColor={setGuideFrameColor}          
        />
      );
    case 'display': 
      return (
        <DisplayModal 
          onClose={closeModal} 
          settings={displaySettings}
          onSettingsChange={handleDisplaySettingsChange}
        />
      );
    case 'help': return <HelpModal onClose={closeModal} />;
    case 'contact': return <ContactModal onClose={closeModal} />;
    case 'version': return <VersionInfoModal onClose={closeModal} />;
    default: return null;
  }
};

  const recordingStatus = useRef(0); // 0: 非記録中, 1: 記録中, 2: 保存待ち
  const [rendering, setRendering] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // レコーディング処理全体の制御関数
  const recordingFunction = () => {
    // 記録開始のフロー
    if (recordingStatus.current === 0) {
      if (!isCameraActive) {
        alert("カメラが起動していないため、記録に失敗しました。");
        return; 
      }

      if (window.confirm('記録を開始しますか？')){
        console.log('記録を開始しました。')
        recordingStatus.current = 1;
        setRendering(true);
      }
    } 
    // 記録終了のフロー
    else if (recordingStatus.current === 1 && window.confirm('記録を終了しますか？')){
      recordingStatus.current = 2;
      setRendering(false);
      setIsModalOpen(true);
    } 
    // 保存キャンセルのフロー
    else if (recordingStatus.current === 2) {
      console.log('保存をキャンセルしました。');
      recordingStatus.current = 0;
      setIsModalOpen(false);
    };
  };

  // /tiles_save/ への記録データ送信関数
  // isQuickSave 引数を追加
  const tilesSaveEndpointConnecting = async (formData, isQuickSave = false) => {
    console.log("バックエンド通信：", recordingStatus.current);
    
    // 保存処理（終了時の保存、またはクイック保存）の場合、ローディング表示を開始
    const isSaveAction = (recordingStatus.current === 2 && isModalOpen) || isQuickSave;
    if (isSaveAction) {
      setIsSaving(true);
    }

    if (!formData.has('hand_tiles_image')) {
      if (sidePanelRef.current) {
        const { images } = sidePanelRef.current.getSidePanelData();
        const handImageBlob = dataURLtoBlob(images.handImage);
        const boardImageBlob = dataURLtoBlob(images.boardImage);
        if (!handImageBlob || handImageBlob.size === 0) {
          console.error("手牌カメラの映像が取得できませんでした。");
        }
        formData.append('hand_tiles_image', handImageBlob, "hand_tiles_image.jpg");
        if (boardImageBlob) formData.append("board_tiles_image", boardImageBlob, "board_tiles_image.jpg");
      }
    }
    try {
      const response = await fetch('/app/tiles_save/', {
          method: 'POST',
          headers: { 'X-CSRFToken': getCookie('csrftoken') },
          body: formData
      });
  
      const data = await response.json();
  
      if (response.status === 200) {
        if (isQuickSave) {
          console.log("クイック保存しました:", data.file_name);
        } else if (recordingStatus.current === 1) {
          console.log("記録データを送信しました:", data.message);
        } else if (recordingStatus.current === 2 && isModalOpen) {
          alert(`記録を保存しました: ${data.file_name}`);
          console.log("記録を保存しました:", data);
          recordingStatus.current = 0; // 保存後は非記録状態に戻す
          setIsModalOpen(false);
        }
      } else {
        const errorMessage = data.message || "記録データの送信に失敗しました。";
        console.error(errorMessage);
        if (recordingStatus.current !== 1 && !isQuickSave) alert(errorMessage);
        if (isQuickSave) alert("クイック保存に失敗しました: " + errorMessage);
      }
    } catch (err) {
      console.error('記録APIとの通信に失敗しました:', err);
      if (recordingStatus.current !== 1 && !isQuickSave) alert('通信エラーが発生しました。');
      if (isQuickSave) alert('クイック保存中に通信エラーが発生しました。');
    } finally {
      // 保存処理が終わったらローディング表示を終了
      if (isSaveAction) {
        setIsSaving(false);
      }
    }
  };

  // 記録保存ボタンが押されたときの処理
  // isQuickSave 引数を追加
  const sendRecordingData = async (save_name, isQuickSave = false) => {
    console.log(`sendRecordingData called with recordingStatus: ${recordingStatus.current}`);
    if (!sidePanelRef.current) {
      console.error("sidePanelRef is not available.");
      return;
    }

    const { images, settings: sidePanelSettings } = sidePanelRef.current.getSidePanelData();
    const finalSettings = {...settings, ...sidePanelSettings};
    const formData = new FormData();
    const handImageBlob = dataURLtoBlob(images.handImage);
    const boardImageBlob = dataURLtoBlob(images.boardImage);
  
    if (!handImageBlob || handImageBlob.size === 0) {
      console.error("手牌カメラの映像が取得できませんでした。");
    }
  
    formData.append('hand_tiles_image', handImageBlob, "hand_tiles_image.jpg");
    if (boardImageBlob) formData.append("board_tiles_image", boardImageBlob, "board_tiles_image.jpg");

    formData.append('syanten_Type', finalSettings.syanten_type); 
    formData.append('flag', finalSettings.flag);
    
    const { fixes_pai_info, fixes_river_tiles } = createPayloadFromBoardState(boardState, finalSettings);
    const fixes_board_info = { fixes_pai_info, fixes_river_tiles };
    formData.append('fixes_board_info', JSON.stringify(fixes_board_info));
  
    formData.append('record_flag', recordingStatus.current);

    if (save_name) {
      formData.append('save_name', save_name);
    }
  
    tilesSaveEndpointConnecting(formData, isQuickSave);
  };

  const handleResetBoardState = () => {
    setBoardState(INITIAL_GAME_STATE);
    setCalculationResults([]);
    setIsLoadingCalculation(false);
    setIsRecognizing(false);
    setCalculationError(null);
  };

  useEffect(() => {
    if (settings.flag === 0) {
      fetchKifuList();
    } else {
      setKifuFileList([]);
      setSelectedKifuData([]);
    }
  }, [settings.flag]);

  useEffect(() => {
    if (selectedKifuData.length > 0 && currentKifuTurn >= 1 && currentKifuTurn <= selectedKifuData.length) {
      const currentTurnData = selectedKifuData[currentKifuTurn - 1];
      setBoardState(convertKifuDataToBoardState(currentTurnData));
    }
  }, [selectedKifuData, currentKifuTurn]);


  const fetchKifuList = async () => {
    try {
      const response = await fetch('/app/tiles_json_req/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({}) // 空のPOSTリクエスト
      });
      const data = await response.json();
      if (response.status === 200 && data.file_list) {
        setKifuFileList(data.file_list);
        console.log("牌譜リストを取得しました:", data.file_list);
      } else {
        alert(data.message || "牌譜リストの取得に失敗しました。");
      }
    } catch (err) {
      console.error("牌譜リスト取得APIとの通信に失敗:", err);
      alert("牌譜リスト取得APIとの通信に失敗しました。");
    }
  };

  const handleKifuSelect = async (fileName) => {
    try {
      const formData = new FormData();
      formData.append('file_name', fileName);

      const response = await fetch('/app/tiles_json_req/', {
        method: 'POST',
        headers: { 'X-CSRFToken': getCookie('csrftoken') },
        body: formData
      });
      const data = await response.json();
      if (data.status === 200 && data.temp_result) {
        setSelectedKifuData(data.temp_result);
        setCurrentKifuTurn(1); // 最初の巡目にリセット
        console.log(`牌譜「${fileName}」を読み込みました。`);
      } else {
        alert(data.message || `牌譜「${fileName}」の読み込みに失敗しました。`);
      }
    } catch (err) {
      console.error("牌譜データ取得APIとの通信に失敗:", err);
      alert("牌譜データ取得APIとの通信に失敗しました。");
    }
  };

  const startResizing = useCallback((mouseDownEvent) => {
    mouseDownEvent.preventDefault();
    
    const startX = mouseDownEvent.clientX;
    const startWidth = sidePanelWidth;

    const onMouseMove = (mouseMoveEvent) => {
      const moveX = startX - mouseMoveEvent.clientX;
      const newWidth = startWidth + moveX;

      if (newWidth >= 260 && newWidth <= 800) {
        setSidePanelWidth(newWidth);
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'col-resize';
  }, [sidePanelWidth]);


  return (
    <div style={appContainerStyle}>
      {/* 保存処理中のオーバーレイ */}
      {isSaving && <SavingOverlay />}

      <Header onMenuClick={handleMenuClick} />
      <div style={styles.mainContent}>
        <div style={styles.gameStatusWrapper}>
          <GameStatusArea
            onStartCalculation={handleCalculate} boardState={boardState} onBoardStateChange={setBoardState}
            calculationResults={calculationResults} isLoadingCalculation={isLoadingCalculation}
            isCalculationDisabled={isLoadingCalculation || isRecognizing} isRecognizing={isRecognizing}
            onResetBoardState={handleResetBoardState} 
            use3D={use3DDisplay}
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
          />
        </div>
        
        <div
          style={styles.resizeHandle}
          onMouseDown={startResizing}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <div style={styles.resizeLine} />
        </div>

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
          />
        </div>
      </div>
      {renderModal()}
    </div>
  );
};

export default MainScreen;