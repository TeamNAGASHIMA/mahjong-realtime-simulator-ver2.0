// MainScreen.js
import React, { useState, useEffect, useRef } from 'react';

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

// スタイル定義
const styles = {
  mainContent: {
    display: 'flex',
    flexGrow: 1,
    padding: '15px',
    gap: '15px',
    overflow: 'hidden',
  },
  gameStatusWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  sidePanelWrapper: {
    display: 'flex',
    flexDirection: 'column',
  }
};

// ヘルパー関数 (省略)
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

  const [settings, setSettings] = useState({
    brightness: 100, screenSize: 'fullscreen', theme: 'dark', fontSize: '14px',
    soundEffects: true, tableBg: 'default', tableBgImage: null, appBg: 'default',
    appBgImage: null, syanten_type: 1, 
    flag: 1 // ★★★ 修正箇所1: デフォルトを1 (リアルタイムシミュレーター) に設定
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

  // --- 関数定義 ---
  const handleMenuClick = (modalName) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);
  const handleSettingsChange = (newSettings) => setSettings(prev => ({...prev, ...newSettings}));

  // ★★★ 修正箇所2: モード切替用のハンドラを追加 ★★★
  const handleModeChange = () => {
    const newFlag = settings.flag === 1 ? 0 : 1; // 1なら0に、0なら1に切り替え
    handleSettingsChange({ flag: newFlag });
    console.log(`モードが ${newFlag === 1 ? 'リアルタイムシミュレーター' : '牌譜'} に切り替わりました。`);
  };
  const handleDisplayChange = (newDisplaySettings) => {
    if (newDisplaySettings.use3D !== undefined) {
      setUse3DDisplay(newDisplaySettings.use3D);
    }
  };

  const handleConnectOrReconnect = async () => {
    // (省略...変更なし)
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
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
    // (省略...変更なし)
    if (!sidePanelRef.current) return;
    setIsLoadingCalculation(true); 
    setIsRecognizing(true);       
    setCalculationResults([]);    
    try {
      const { images, settings: sidePanelSettings } = sidePanelRef.current.getSidePanelData();
      const finalSettings = {...settings, ...sidePanelSettings};
      const formData = new FormData();
      const handImageBlob = dataURLtoBlob(images.handImage);
      const boardImageBlob = dataURLtoBlob(images.boardImage);
      if (!handImageBlob || handImageBlob.size === 0) {
        alert("手牌カメラの映像が取得できませんでした。カメラが正しく接続・認識されているか確認してください。");
        setIsLoadingCalculation(false); 
        setIsRecognizing(false); 
        return; 
      }
      formData.append('hand_tiles_image', handImageBlob, "hand_tiles_image.jpg");
      if (boardImageBlob) formData.append("board_tiles_image", boardImageBlob, "board_tiles_image.jpg");
      const { fixes_pai_info, fixes_river_tiles } = createPayloadFromBoardState(boardState, finalSettings);
      const fixes_board_info = { fixes_pai_info, fixes_river_tiles };
      formData.append('fixes_board_info', JSON.stringify(fixes_board_info));
      formData.append('syanten_Type', finalSettings.syanten_type); 
      formData.append('flag', finalSettings.flag);
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
                alert("APIが手牌を認識できませんでした。(0枚検出) 手牌の画像が鮮明か、角度が適切か確認してください。");
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
            alert("計算結果の形式が正しくないか、不明な形式です。");
          }
        } else {
          alert("計算結果が返されませんでした。");
        }
      } else {
          const errorMessage = data.message?.error || data.message || "Unknown error";
          if (response.status === 420) { 
              alert(`計算できませんでした: ${errorMessage}`);
          } else { 
              alert(`エラーが発生しました (Status: ${response.status}): ${errorMessage}`);
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
      alert('通信に失敗しました。詳細はコンソールを確認してください。');
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
      
    case 'display': return <DisplayModal onClose={closeModal} />;
    case 'help': return <HelpModal onClose={closeModal} />;
    case 'contact': return <ContactModal onClose={closeModal} />;
    case 'version': return <VersionInfoModal onClose={closeModal} />;
    default: return null;
  }
};

  const handleResetBoardState = () => {
    setBoardState(INITIAL_GAME_STATE);
    setCalculationResults([]);
    setIsLoadingCalculation(false);
    setIsRecognizing(false);
  };

  const isSimulatorMode = settings.flag === 1;

  return (
    <div style={appContainerStyle}>
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
            isSimulatorMode={isSimulatorMode}            
            onModeChange={handleModeChange} // ★★★ 修正箇所3: モード切替関数を渡す
          />
        </div>
        
        <div style={styles.sidePanelWrapper}>
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
            isSimulatorMode={isSimulatorMode}
          />
        </div>
      </div>
      {renderModal()}
    </div>
  );
};

export default MainScreen;