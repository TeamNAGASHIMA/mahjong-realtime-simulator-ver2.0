import React, { useState, useEffect, useRef } from 'react';

// コンポーネントのインポート
import { Header, Settings, Camera, Display, Help, Contact, VersionInfo } from './Header';
import GameStatusArea from './GameStatusArea'; 
import SidePanel from './SidePanel'; 

// 盤面の初期状態
const INITIAL_GAME_STATE = {
  turn: 1,
  hand_tiles: [0, 1, 2, 13, 14, 16, 18, 27, 28, 29, 31, 31, 32, 4],
  player_winds: { self: 27, shimocha: 28, toimen: 29, kamicha: 30 },
  player_discards: { self: [3, 4, 5, 6, 7, 8, 9, 10], shimocha: [10, 11, 12, 13, 14, 15, 16], toimen: [18, 19, 20, 21, 22, 23, 24], kamicha: [32, 33, 30, 29, 28, 34] },
  dora_indicators: [4],
  melded_blocks: [],
  counts: []
};

// スタイル定義
const styles = {
  appContainer: {
    width: '100%',
    height: '100%',
    margin: '0 auto',
    border: '1px solid #ccc',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    transition: 'background-color 0.3s, color 0.3s, filter 0.3s',
  },
  mainContent: {
    display: 'flex',
    flexGrow: 1,
    padding: '15px',
    gap: '15px',
    overflow: 'hidden',
  },
  gameStatusWrapper: {
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  sidePanelWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: '350px',
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

const createPayloadFromBoardState = (boardState, settings) => {
    const hand_tiles = boardState.hand_tiles?.map(tile => tile) ?? [];
    const dora_indicators = boardState.dora_indicators?.map(tile => tile) ?? [];
    const fixes_river_tiles = [
        ...(boardState.player_discards?.self?.map(tile => tile) ?? []),
        ...(boardState.player_discards?.shimocha?.map(tile => tile) ?? []),
        ...(boardState.player_discards?.toimen?.map(tile => tile) ?? []),
        ...(boardState.player_discards?.kamicha?.map(tile => tile) ?? []),
    ];
    const fixes_pai_info = {
        "version": "0.9.0",
        "zikaze": boardState.player_winds?.self ?? 27, 
        "bakaze": boardState.bakaze ?? 27,
        "turn": boardState.turn ?? 1,
        "syanten_type": settings.syanten_type,
        "dora_indicators": dora_indicators,
        "flag": settings.flag,
        "hand_tiles": hand_tiles,
        "melded_blocks": boardState.melded_blocks ?? [],
        "counts": boardState.counts ?? []
    };
    return { fixes_pai_info, fixes_river_tiles };
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

  // --- 状態管理 (全機能統合) ---
  const [boardState, setBoardState] = useState(INITIAL_GAME_STATE);
  const [activeModal, setActiveModal] = useState(null);
  const [settings, setSettings] = useState({
    brightness: 100, screenSize: 'fullscreen', theme: 'dark', fontSize: '14px',
    soundEffects: true, tableBg: 'default', tableBgImage: null, appBg: 'default',
    appBgImage: null, syanten_type: 1, flag: 0 
  });
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedBoardCamera, setSelectedBoardCamera] = useState('');
  const [selectedHandCamera, setSelectedHandCamera] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [calculationResults, setCalculationResults] = useState([]);
  const [isLoadingCalculation, setIsLoadingCalculation] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const sidePanelRef = useRef(null);

  // --- 関数定義 ---
  const handleMenuClick = (modalName) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);
  const handleSettingsChange = (newSettings) => setSettings(prev => ({...prev, ...newSettings}));

  const handleConnectOrReconnect = async () => {
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
    if (!sidePanelRef.current) return;

    setIsLoadingCalculation(true);
    setCalculationResults([]);

    try {
      const { images, settings: sidePanelSettings } = sidePanelRef.current.getSidePanelData();
      const finalSettings = {...settings, ...sidePanelSettings};
      const formData = new FormData();

      const handImageBlob = dataURLtoBlob(images.handImage);
      const boardImageBlob = dataURLtoBlob(images.boardImage);

      if (handImageBlob) formData.append('hand_tiles_image', handImageBlob, "hand_tiles_image.jpg");
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
        let resultsArray = null;
      if (data.result_calc && Array.isArray(data.result_calc.candidates)) {
          resultsArray = data.result_calc.candidates; 
      } else if (data && Array.isArray(data.result_calc)) {
          resultsArray = data.result_calc;
      } else if (data?.response && Array.isArray(data.response.candidates)) {
          resultsArray = data.response.candidates; 
      } else if (Array.isArray(data)) {
          resultsArray = data;
      }

        if (resultsArray) {
          if (resultsArray.length > 0) {
              console.log("Inspecting first candidate from API:", resultsArray[0]);
          }
          const turnIndex = (fixes_pai_info.turn ?? 1) - 1;
          const formattedResults = resultsArray.map(candidate => ({
            tile: candidate.tile, 
            required_tiles: candidate.required_tiles, 
            syanten_down: candidate.syanten_down,
            exp_value: candidate.exp_values?.[turnIndex] ?? 0, 
            win_prob: candidate.win_probs?.[turnIndex] ?? 0,
            tenpai_prob: candidate.tenpai_probs?.[turnIndex] ?? 0,
          }));
          setCalculationResults(formattedResults);
        } else {
          console.error("Could not find a valid results array in the API response.", data);
          alert("計算結果の形式が正しくありません。");
        }
      } else {
          alert("Calculation failed: " + (data.error || "Unknown error"));
      }

    } catch (err) {
      console.error('Sending failed:', err);
      alert('通信に失敗しました。詳細はコンソールを確認してください。');
    } finally {
        setIsLoadingCalculation(false);
    }
  };

  const appContainerStyle = {
    ...styles.appContainer,
    backgroundColor: settings.theme === 'light' ? '#f0f0f0' : '#1e1e1e',
    backgroundImage: settings.appBg === 'image' && settings.appBgImage ? `url(${settings.appBgImage})` : 'none',
    backgroundSize: 'cover', backgroundPosition: 'center',
    color: settings.theme === 'light' ? '#000000' : '#ccc',
    fontSize: settings.fontSize,
    filter: `brightness(${settings.brightness / 100})`,
  };

  const renderModal = () => {
    switch (activeModal) {
      // settingsは統合された新しいコンポーネントを、他は詳細な管理機能を持つ方のコンポーネントを使う
      case 'settings': return <Settings settings={settings} onSettingsChange={handleSettingsChange} onClose={closeModal} />;
      case 'camera':
        return (
          <Camera
            onClose={closeModal} isCameraActive={isCameraActive} onConnectOrReconnect={handleConnectOrReconnect}
            devices={devices} selectedBoardCamera={selectedBoardCamera} setSelectedBoardCamera={setSelectedBoardCamera}
            selectedHandCamera={selectedHandCamera} setSelectedHandCamera={setSelectedHandCamera} errorMessage={cameraError}
          />
        );
      case 'display': return <Display onClose={closeModal} />;
      case 'help': return <Help onClose={closeModal} />;
      case 'contact': return <Contact onClose={closeModal} />;
      case 'version': return <VersionInfo onClose={closeModal} />;
      default: return null;
    }
  };

  return (
    <div style={appContainerStyle}>
      <Header onMenuClick={handleMenuClick} />
      
      <div style={styles.mainContent}>
        <div style={styles.gameStatusWrapper}>
          <GameStatusArea
            onStartCalculation={handleCalculate}
            boardState={boardState}
            onBoardStateChange={setBoardState}
            calculationResults={calculationResults}
            isLoadingCalculation={isLoadingCalculation}
            isCalculationDisabled={isLoadingCalculation || isRecognizing}
            isRecognizing={isRecognizing}
          />
        </div>
        
        <div style={styles.sidePanelWrapper}>
          <SidePanel
            ref={sidePanelRef}
            isCameraActive={isCameraActive}
            selectedBoardCamera={selectedBoardCamera}
            selectedHandCamera={selectedHandCamera}
            onRecognize={() => {}}
            isRecognizing={isRecognizing}
            settings={settings}
            onSettingsChange={handleSettingsChange}
          />
        </div>
      </div>

      {renderModal()}
    </div>
  );
};

export default MainScreen;