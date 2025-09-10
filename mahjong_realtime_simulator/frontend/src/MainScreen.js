// MainScreen.js
import React, { useState, useEffect, useRef } from 'react';

// コンポーネントのインポート
import { Header, Settings, Camera, Display, Help, Contact, VersionInfo } from './Header';
import GameStatusArea from './GameStatusArea'; 
import SidePanel from './SidePanel'; 

// 盤面の初期状態
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
  // APIレスポンスに必要ないかもしれないが、現在のboardStateオブジェクトの構造に合わせる
  bakaze: 27, // 場風の初期値 (東)
  melded_blocks: [], // 鳴きブロック（既存のmeldsと重複する可能性あり。APIの出力に合わせる）
  counts: [] // 牌の数
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
  // isRecognizingは、カメラ認識中と計算中全体をカバーするように変更
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

  /**
   * カメラ認識と計算をまとめて実行する関数
   * CalculationButton の onClick ハンドラとして使用
   */
  const handleCalculate = async () => {
    if (!sidePanelRef.current) return;

    setIsLoadingCalculation(true); // 計算ローディングを開始
    setIsRecognizing(true);       // 認識も開始 (両方が true になる)
    setCalculationResults([]);    // 計算結果をクリア

    try {
      const { images, settings: sidePanelSettings } = sidePanelRef.current.getSidePanelData();
      const finalSettings = {...settings, ...sidePanelSettings};
      const formData = new FormData();

      const boardImageBlob = dataURLtoBlob(images.boardImage);
      const handImageBlob = dataURLtoBlob(images.handImage);

      // --- 1. カメラ画像の送信と認識処理 ---
      // /app/main/ は hand_tiles_image が必須なので、どちらの認識ターゲットでも送信
      if (!handImageBlob) {
        formData.append('hand_tiles_image', new Blob(["dummy"]), 'dummy_hand.txt');
        console.warn("手牌画像がないためダミーを送信しました。");
      } else {
        formData.append('hand_tiles_image', handImageBlob, 'hand_tiles_image.jpg');
      }

      if (boardImageBlob) {
        formData.append('board_tiles_image', boardImageBlob, 'board_tiles_image.jpg');
      } else {
        // 盤面画像がなければ、views.pyのmain関数ではnp_board_tiles_image = np.array([])で処理されるため、送らなくてもよい
      }
      
      // /app/main/ ビューは計算設定も要求するため、常に送信
      formData.append('syanten_Type', finalSettings.syanten_type); 
      formData.append('flag', finalSettings.flag);

      // fixes_board_info が空の場合に物体検知が走るため、空のJSONオブジェクトを文字列化して送信
      formData.append('fixes_board_info', JSON.stringify({}));

      // ★★★ 既存の /app/main/ エンドポイントを利用して認識と計算を実行 ★★★
      const recognitionResponse = await fetch('/app/main/', { 
          method: 'POST',
          headers: { 'X-CSRFToken': getCookie('csrftoken') }, 
          body: formData
      });
      
      if (!recognitionResponse.ok) {
        const errorText = await recognitionResponse.text(); 
        console.error(`認識APIエラー (${recognitionResponse.status}):`, errorText);
        alert(`牌の認識に失敗しました: サーバーエラー (ステータス: ${recognitionResponse.status})。詳細をコンソールで確認してください。`);
        return; // エラーが発生した場合はここで処理を中断
      }

      const recognitionData = await recognitionResponse.json(); 
      console.log("Recognition via /app/main/ message: " + recognitionData.message);
      console.log("Recognition via /app/main/ status: " + recognitionResponse.status);

      let updatedBoardState = { ...INITIAL_GAME_STATE }; // 更新される盤面状態
      
      if (recognitionData.detection_result) {
        const detectedResult = recognitionData.detection_result;
        console.log("Detected board state from /app/main/:", detectedResult);

        let recognizedHandTiles = detectedResult.hand_tiles ?? [];
        let recognizedTsumoTile = null;

        if (recognizedHandTiles.length === 14) {
            recognizedTsumoTile = recognizedHandTiles[recognizedHandTiles.length - 1];
            recognizedHandTiles = recognizedHandTiles.slice(0, recognizedHandTiles.length - 1);
        } else if (recognizedHandTiles.length > 14) {
            console.warn(`検出された手牌が14枚を超えています (${recognizedHandTiles.length}枚)。最初の13枚を通常手牌、次の1枚をツモ牌として扱います。`);
            recognizedTsumoTile = recognizedHandTiles[13];
            recognizedHandTiles = recognizedHandTiles.slice(0, 13);
        }
        
        updatedBoardState = {
            ...INITIAL_GAME_STATE, 
            turn: detectedResult.turn ?? 1,
            round_wind: detectedResult.bakaze ?? detectedResult.round_wind ?? 27, 
            hand_tiles: recognizedHandTiles, 
            tsumo_tile: recognizedTsumoTile, 
            dora_indicators: detectedResult.dora_indicators ?? [], 

            player_discards: {
                self: detectedResult.discard_tiles?.discard_tiles_bottom ?? [], 
                shimocha: detectedResult.discard_tiles?.discard_tiles_right ?? [],
                toimen: detectedResult.discard_tiles?.discard_tiles_top ?? [],
                kamicha: detectedResult.discard_tiles?.discard_tiles_left ?? []
            },
            melds: {
                self: detectedResult.melded_blocks ?? [], 
                shimocha: [], toimen: [], kamicha: [] 
            },
            player_winds: {
                self: detectedResult.zikaze ?? 27,
                shimocha: (detectedResult.zikaze ?? 27) % 4 === 27 ? 28 : ((detectedResult.zikaze ?? 27) - 27 + 1) % 4 + 27,
                toimen: (detectedResult.zikaze ?? 27) % 4 === 27 ? 29 : ((detectedResult.zikaze ?? 27) - 27 + 2) % 4 + 27,
                kamicha: (detectedResult.zikaze ?? 27) % 4 === 27 ? 30 : ((detectedResult.zikaze ?? 27) - 27 + 3) % 4 + 27,
            },
            last_discard: { tile: null, from: null, index: null }, 
            bakaze: detectedResult.bakaze ?? 27,
            melded_blocks: detectedResult.melded_blocks ?? [], 
            counts: [] 
        };
        setBoardState(updatedBoardState); // まず認識結果で盤面を更新

      } else {
        console.warn("APIレスポンスに 'detection_result' が見つかりませんでした。", recognitionData);
        alert("牌の認識は成功しましたが、盤面情報が返されませんでした。");
        // 盤面情報がなければ、これ以降の計算はできないか、意味がないためここで中断
        return; 
      }

      // --- 2. 認識結果に基づいた計算処理 ---
      // (この部分は /app/main/ から 'result_calc' が返されることを期待)
      // views.pyのmain関数は、detection_resultと共にresult_calcも返すので、
      // 認識APIのレスポンスから直接計算結果も取得できる
      if (recognitionData.result_calc) {
        const resultData = recognitionData.result_calc;
        const turnIndex = (updatedBoardState.turn ?? 1) - 1;

        let formattedResults = []; 

        if (resultData.result_type === 1 && Array.isArray(resultData.candidates)) {
          console.log("Processing 14-tile hand response (with candidates).");
          formattedResults = resultData.candidates.map(candidate => ({
            tile: candidate.tile, 
            required_tiles: candidate.required_tiles, 
            syanten_down: candidate.syanten_down,
            exp_value: candidate.exp_values?.[turnIndex] ?? 0, 
            win_prob: candidate.win_probs?.[turnIndex] ?? 0,
            tenpai_prob: candidate.tenpai_probs?.[turnIndex] ?? 0,
          }));
        } else if (resultData.result_type === 0) {
          console.log("Processing 13-tile hand response (overall evaluation).");
          const singleResult = {
            tile: null, 
            required_tiles: resultData.required_tiles || [], 
            syanten_down: false, 
            exp_value: resultData.exp_values?.[turnIndex] ?? 0, 
            win_prob: resultData.win_probs?.[turnIndex] ?? 0,
            tenpai_prob: resultData.tenpai_probs?.[turnIndex] ?? 0,
          };
          formattedResults = [singleResult]; 
        }

        if (formattedResults.length > 0) {
          setCalculationResults(formattedResults);
        } else {
          console.error("計算結果の形式が正しくないか、不明な形式です。", recognitionData);
          alert("計算結果の形式が正しくないか、不明な形式です。");
        }
      } else {
        console.warn("APIレスポンスに 'result_calc' が見つかりませんでした。", recognitionData);
        alert("牌の認識は成功しましたが、計算結果が返されませんでした。");
      }

    } catch (err) {
      console.error('認識または計算の実行に失敗しました:', err);
      alert('通信またはデータ処理に失敗しました。詳細はコンソールを確認してください。');
    } finally {
        setIsLoadingCalculation(false); // 計算ローディングを終了
        setIsRecognizing(false);       // 認識も終了
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
            onStartCalculation={handleCalculate} // CalculationButtonのトリガーはこれ
            boardState={boardState}
            onBoardStateChange={setBoardState}
            calculationResults={calculationResults}
            isLoadingCalculation={isLoadingCalculation}
            isCalculationDisabled={isLoadingCalculation || isRecognizing} // 認識中もボタンを無効にする
            isRecognizing={isRecognizing} // CameraPreviewのボタンを無効にするために渡す
          />
        </div>
        
        <div style={styles.sidePanelWrapper}>
          <SidePanel
            ref={sidePanelRef}
            isCameraActive={isCameraActive}
            selectedBoardCamera={selectedBoardCamera}
            selectedHandCamera={selectedHandCamera}
            onRecognize={() => { /* 何もしない、または認識開始を促すメッセージ */ }} // CameraPreviewのボタンはトリガーではないためダミー関数に
            isRecognizing={isRecognizing} // CameraPreviewのボタンを無効にするために渡す
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