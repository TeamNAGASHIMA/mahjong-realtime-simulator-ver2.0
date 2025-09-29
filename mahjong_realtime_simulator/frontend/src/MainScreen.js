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
  // melded_blocks: [], // 鳴きブロック（既存のmeldsと重複する可能性あり。APIの出力に合わせる） // <-- 削除
  counts: [] // 牌の数
};

// スタイル定義
const styles = {
  appContainer: {
    width: '100%',
    height: '100%',
    margin: '0 auto',
    // border: '1px solid #ccc', // 開発中は境界線があるとレイアウトが分かりやすい
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
    // 変更: 'flex: 2' から 'flex: 1' へ。これが残りのスペースを全て埋める役割を担う
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0, // この設定はflexアイテムが縮小する際に重要なので残す
  },
  sidePanelWrapper: {
    // 変更: flex と minWidth を削除し、中身のサイズに合わせる
    // flex: 1, // 削除
    display: 'flex',
    flexDirection: 'column',
    // minWidth: '350px', // 削除
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

// 面子配列から面子オブジェクトへの変換ヘルパー関数
const convertMeldsToBoardStateFormat = (meldArray, playerKey) => {
  if (!Array.isArray(meldArray)) return [];
  return meldArray.map(tiles => {
    // 牌をソートして処理しやすくする (赤ドラを考慮しない単純なソート)
    tiles.sort((a,b) => a - b); 
    let type = 'unknown'; // 推測できない場合はunknown
    let exposed_index = null; // デフォルトは不明

    if (tiles.length === 3) {
      if (tiles[0] === tiles[1] && tiles[1] === tiles[2]) {
        type = 'pon';
        exposed_index = 1; // ポンの場合は中央の牌を横向きと仮定
      } else if (tiles[0] + 1 === tiles[1] && tiles[1] + 1 === tiles[2] && 
                 Math.floor(tiles[0] / 9) === Math.floor(tiles[1] / 9) && // 同じ数牌の種類
                 Math.floor(tiles[1] / 9) === Math.floor(tiles[2] / 9)) {
        type = 'chi';
        exposed_index = 1; // チーの場合は中央の牌を横向きと仮定
      }
    } else if (tiles.length === 4) {
      if (tiles[0] === tiles[1] && tiles[1] === tiles[2] && tiles[2] === tiles[3]) {
        // APIから暗槓か明槓かを直接区別できないため、ここでは一旦明槓と仮定
        // 暗槓の場合は表示で裏返る牌があるため、`exposed_index` はnullか、特別な処理が必要
        // UI側では`type: 'ankan'`であれば裏返して表示するロジックがあるため、
        // ここでは便宜的に`minkan`として`exposed_index`を設定するか、`ankan`として`exposed_index`をnullにする
        // 今回のUIは`ankan`では`exposed_index`を使わないため`ankan`として処理
        type = 'ankan'; // 4枚同じ牌であれば暗槓と仮定 (表示ロジックはUI側で対応)
        exposed_index = null; // 暗槓は明示的な晒し牌なし
      }
    }
    
    // fromフィールドは、自家の面子以外は不明とする
    const from = playerKey === 'self' ? 'self' : null;

    return {
      type: type,
      tiles: tiles,
      from: from,
      exposed_index: exposed_index,
    };
  });
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
        console.log("message: " + data.message)
        console.log("status: " + response.status)

        let updatedBoardState = { ...INITIAL_GAME_STATE }; // 更新される盤面状態

        const detectedResult = data.detection_result;
        console.log("Detected board state from /app/main/:", detectedResult);

        let recognizedHandTiles = detectedResult.hand_tiles ?? [];
        let recognizedTsumoTile = null;

        // APIからのhand_tilesが14枚の場合は、最後の1枚をツモ牌とする (今回のJSONは13枚なので処理なし)
        if (recognizedHandTiles.length === 14) {
          recognizedTsumoTile = recognizedHandTiles.pop(); // 最後の要素をツモ牌として取り出す
        }


        // ★★★ `detection_result.melded_tiles` を `boardState.melds` に変換 ★★★
        const selfMelds = convertMeldsToBoardStateFormat(detectedResult.melded_tiles?.melded_tiles_bottom, 'self');
        const shimochaMelds = convertMeldsToBoardStateFormat(detectedResult.melded_tiles?.melded_tiles_right, 'shimocha');
        const toimenMelds = convertMeldsToBoardStateFormat(detectedResult.melded_tiles?.melded_tiles_top, 'toimen');
        const kamichaMelds = convertMeldsToBoardStateFormat(detectedResult.melded_tiles?.melded_tiles_left, 'kamicha');


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
            melds: { // ★★★ 変換した面子をセット ★★★
                self: selfMelds, 
                shimocha: shimochaMelds, 
                toimen: toimenMelds, 
                kamicha: kamichaMelds 
            },
            player_winds: {
                self: detectedResult.zikaze ?? 27, // APIにzikazeがないためデフォルト値を保持
                shimocha: (detectedResult.zikaze ?? 27) % 4 === 27 ? 28 : ((detectedResult.zikaze ?? 27) - 27 + 1) % 4 + 27,
                toimen: (detectedResult.zikaze ?? 27) % 4 === 27 ? 29 : ((detectedResult.zikaze ?? 27) - 27 + 2) % 4 + 27,
                kamicha: (detectedResult.zikaze ?? 27) % 4 === 27 ? 30 : ((detectedResult.zikaze ?? 27) - 27 + 3) % 4 + 27,
            },
            last_discard: { tile: null, from: null, index: null }, 
            bakaze: detectedResult.bakaze ?? 27,
            // melded_blocks: detectedResult.melded_blocks ?? [], // <-- 削除
            counts: [] 
        };
        setBoardState(updatedBoardState); // まず認識結果で盤面を更新

        const resultData = data.result || data.result_calc;

        // 最終的にstateにセットする整形済みデータの配列
        let formattedResults = []; 

        if (resultData) {
          const turnIndex = (fixes_pai_info.turn ?? 1) - 1;

          // --- 14枚手牌の場合 (打牌候補のリスト) ---
          // 'candidates' 配列が存在し、result_typeが1の場合
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
          } 
          // --- 13枚手牌の場合 (手牌全体の評価) ---
          // result_typeが0の場合
          else if (resultData.result_type === 0) {
            console.log("Processing 13-tile hand response (overall evaluation).");
            // 13枚の場合は打牌候補がないため、手牌全体の評価を一つの要素として配列に入れる
            const singleResult = {
              tile: null, // 打牌候補ではないので null や -1 などを設定
              required_tiles: resultData.required_tiles || [], // 有効牌のリスト
              syanten_down: false, // 該当する概念がないためfalseに設定
              exp_value: resultData.exp_values?.[turnIndex] ?? 0, 
              win_prob: resultData.win_probs?.[turnIndex] ?? 0,
              tenpai_prob: resultData.tenpai_probs?.[turnIndex] ?? 0,
            };
            formattedResults = [singleResult]; // 要素が1つの配列を作成
          }

          // formattedResultsにデータが正常に格納されたかチェック
          if (formattedResults.length > 0) {
            console.log("Inspecting first candidate from processed data:", formattedResults[0]);
            setCalculationResults(formattedResults);
          } else {
            console.error("Could not parse API response or format is unknown.", data);
            alert("計算結果の形式が正しくないか、不明な形式です。");
          }

        } else {
          console.error("Could not find 'result' object in the API response.", data);
          alert("計算結果の形式が正しくありません。");
        }
      } else {
          alert("Calculation failed: " + (data.error || "Unknown error"));
          console.log("message: " + data.message)
          console.log("status: " + response.status)
      }
    } catch (err) {
      console.error('Sending failed:', err);
      alert('通信に失敗しました。詳細はコンソールを確認してください。');
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