// MainScreen.js
import React, { useState, useEffect, useRef } from 'react';

// コンポーネントのインポート
import { Header, Settings, Camera, Display, Help, Contact, VersionInfo } from './Header';
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
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0, // この設定はflexアイテムが縮小する際に重要なので残す
  },
  sidePanelWrapper: {
    display: 'flex',
    flexDirection: 'column',
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

// createPayloadFromBoardState: Djangoバックエンドのviews.pyが期待する形式でペイロードを構築
const createPayloadFromBoardState = (boardState, settings) => {
    // boardState.hand_tiles と boardState.tsumo_tile を結合して hand_tiles にする
    const allHandTiles = [...(boardState.hand_tiles?.map(tile => tile) ?? [])];
    if (boardState.tsumo_tile !== null && boardState.tsumo_tile !== undefined) {
      allHandTiles.push(boardState.tsumo_tile);
    }
    
    const dora_indicators = boardState.dora_indicators?.map(tile => tile) ?? [];
    
    // fixes_river_tiles を単一のリストとして構築する (calc.pyが期待する形式)
    const fixes_river_tiles_list = [
        ...(boardState.player_discards?.self?.map(tile => tile) ?? []),
        ...(boardState.player_discards?.shimocha?.map(tile => tile) ?? []),
        ...(boardState.player_discards?.toimen?.map(tile => tile) ?? []),
        ...(boardState.player_discards?.kamicha?.map(tile => tile) ?? []),
    ];

    // melds.selfを直接使用 (meld.tilesが牌の配列)
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

    /**
   * カメラ認識と計算をまとめて実行する関数
   * CalculationButton の onClick ハンドラとして使用
   */
  const handleCalculate = async () => {
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
        console.log("Recognition via /app/main/ message: " + data.message);
        console.log("Recognition via /app/main/ status: 200"); 

        let updatedBoardState = { ...INITIAL_GAME_STATE }; 
        let detectedResult = data.detection_result; 

        console.log("Detected board state from /app/main/:", detectedResult);

        // ★★★ 修正: detectedResult.discard_tiles が単一リストの場合に、各プレイヤーのオブジェクト形式に再構築 ★★★
        if (detectedResult && Array.isArray(detectedResult.discard_tiles)) {
            console.warn("API returned discard_tiles as a single array. Attempting to re-distribute for display.");
            const singleDiscardList = detectedResult.discard_tiles;
            
            const reDistributedDiscards = {
                discard_tiles_bottom: [],
                discard_tiles_right: [],
                discard_tiles_top: [],
                discard_tiles_left: [],
            };

            let playerIndex = 0;
            const playerKeys = ['discard_tiles_bottom', 'discard_tiles_right', 'discard_tiles_top', 'discard_tiles_left'];
            for (let i = 0; i < singleDiscardList.length; i++) {
                reDistributedDiscards[playerKeys[playerIndex]].push(singleDiscardList[i]);
                playerIndex = (playerIndex + 1) % playerKeys.length;
            }
            detectedResult.discard_tiles = reDistributedDiscards; 
            console.log("Re-distributed discard_tiles:", detectedResult.discard_tiles);
        }
        // ★★★ 修正ここまで ★★★

        let recognizedHandTiles = detectedResult.hand_tiles ?? [];
        let recognizedTsumoTile = null;

        // APIからのhand_tilesが14枚の場合は、最後の1枚をツモ牌とする
        if (recognizedHandTiles.length === 14) {
          recognizedTsumoTile = recognizedHandTiles.pop(); 
        } else if (recognizedHandTiles.length === 0) { // APIが手牌を認識できなかった場合
            // ここでUIに表示されている手動入力された牌を優先するか、API認識を優先するかポリシーが必要
            // 現在のフローではAPI認識結果がUIに反映されるため、手牌が0枚で返されたらUIも0枚になる
            // しかし、今回の問題は「画像あるのに認識されない」ため、APIが空を返すと次のチェックで弾かれる
            // そのため、手牌枚数の事前チェックがUIの boardState を見ている現在のロジックと衝突する。
            // API認識結果で手牌が0枚の場合は、手動入力された `boardState.hand_tiles` の値を保持する、というロジックに変更する
            console.warn("API returned 0 hand tiles. Retaining manually entered hand tiles if any.");
            recognizedHandTiles = boardState.hand_tiles;
            recognizedTsumoTile = boardState.tsumo_tile;
        }


        // ★★★ getMeldsForPlayer, getDiscardsForPlayer ヘルパー関数を定義し直す ★★★
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
        
        // detectedResult.discard_tiles が既にオブジェクト形式に変換されていることを前提とする
        const getDiscardsForPlayer = (playerKey, discardData) => {
            if (playerKey === 'self') return discardData?.discard_tiles_bottom ?? [];
            if (playerKey === 'shimocha') return discardData?.discard_tiles_right ?? [];
            if (playerKey === 'toimen') return discardData?.discard_tiles_top ?? [];
            if (playerKey === 'kamicha') return discardData?.discard_tiles_left ?? [];
            return [];
        };


        const apiMeldsSource = detectedResult.melded_blocks || detectedResult.melded_tiles;
        const selfMelds = convertMeldsToBoardStateFormat(getMeldsForPlayer(apiMeldsSource, 'self'), 'self');
        const shimochaMelds = convertMeldsToBoardStateFormat(getMeldsForPlayer(apiMeldsSource, 'shimocha'), 'shimocha');
        const toimenMelds = convertMeldsToBoardStateFormat(getMeldsForPlayer(apiMeldsSource, 'toimen'), 'toimen');
        const kamichaMelds = convertMeldsToBoardStateFormat(getMeldsForPlayer(apiMeldsSource, 'kamicha'), 'kamicha');

        updatedBoardState = {
            ...INITIAL_GAME_STATE, 
            turn: detectedResult.turn ?? 1,
            round_wind: boardState.round_wind, 
            hand_tiles: recognizedHandTiles, // APIの認識結果
            tsumo_tile: recognizedTsumoTile, // APIの認識結果
            dora_indicators: detectedResult.dora_indicators ?? [], 

            player_discards: {
                self: getDiscardsForPlayer('self', detectedResult.discard_tiles), 
                shimocha: getDiscardsForPlayer('shimocha', detectedResult.discard_tiles),
                toimen: getDiscardsForPlayer('toimen', detectedResult.discard_tiles),
                kamicha: getDiscardsForPlayer('kamicha', detectedResult.discard_tiles)
            },
            melds: { 
                self: selfMelds, 
                shimocha: shimochaMelds, 
                toimen: toimenMelds, 
                kamicha: kamichaMelds 
            },
            player_winds: boardState.player_winds, 
            
            last_discard: { tile: null, from: null, index: null }, 
            bakaze: boardState.round_wind, 
            counts: [] 
        };
        setBoardState(updatedBoardState); 

        // ★★★ 修正: `handTileCount` のチェックを `setBoardState` の後にも行うか、ロジックを変更する ★★★
        // ここに到達した時点で `updatedBoardState` にAPI認識結果が反映されているため、
        // もしAPIが手牌を認識できなかった場合 (hand_tiles: [])、ここで再度手牌枚数チェックを行うと「0枚」で弾かれる
        // ユーザーが手動で牌を入力していない限り、APIが手牌を認識できないと、このアラートが再度出てしまう。
        // このアラートは、初期の「手牌がありません」を指しているため、API認識の結果が空だった場合は別のメッセージを出すべき。
        // 一旦、この後の `handTileCount` チェックは削除し、APIレスポンスの `hand_tiles` が空だった場合の扱いは別の機会に検討。
        // 現在の問題は「画像あるのに認識されない」という入り口の段階なので、APIからの手牌認識が空だった場合のハンドリングは後回しにする。


        const resultData = data.result || data.result_calc;

        let formattedResults = []; 

        if (resultData) {
          const turnIndex = (fixes_pai_info.turn ?? 1) - 1;

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
          else if (resultData.result_type === 0) {
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
            console.log("Inspecting first candidate from processed data:", formattedResults[0]);
            setCalculationResults(formattedResults);
          } else {
            console.error("Could not parse API response or format is unknown.", data);
            alert("計算結果の形式が正しくないか、不明な形式です。");
          }

        } else {
          console.error("Could not find 'result' object in the API response.", data);
          alert("計算結果が返されませんでした。");
        }
      } else {
          const errorMessage = data.message?.error || data.message || "Unknown error";
          
          if (response.status === 420) { 
              alert(`計算できませんでした: ${errorMessage}`);
          } else { 
              alert(`エラーが発生しました (Status: ${response.status}): ${errorMessage}`);
          }
          console.log("API response status:", response.status, "message:", data.message);

          // エラー時にもdetection_resultが存在する場合は盤面を更新 (これにより、UIはAPIの認識結果を反映する)
          if (data.detection_result) {
            let detectedResultError = data.detection_result; 
            // ★★★ 修正: エラー時にも単一リストの捨て牌を再構築する ★★★
            if (detectedResultError && Array.isArray(detectedResultError.discard_tiles)) {
                console.warn("API returned discard_tiles as a single array during error. Attempting to re-distribute for display.");
                const singleDiscardList = detectedResultError.discard_tiles;
                const reDistributedDiscards = {
                    discard_tiles_bottom: [],
                    discard_tiles_right: [],
                    discard_tiles_top: [],
                    discard_tiles_left: [],
                };
                let playerIndex = 0;
                const playerKeys = ['discard_tiles_bottom', 'discard_tiles_right', 'discard_tiles_top', 'discard_tiles_left'];
                for (let i = 0; i < singleDiscardList.length; i++) {
                    reDistributedDiscards[playerKeys[playerIndex]].push(singleDiscardList[i]);
                    playerIndex = (playerIndex + 1) % playerKeys.length;
                }
                detectedResultError.discard_tiles = reDistributedDiscards;
            }
            // ★★★ 修正ここまで ★★★
            
            let recognizedHandTiles = detectedResultError.hand_tiles ?? [];
            let recognizedTsumoTile = null;
            if (recognizedHandTiles.length === 14) {
              recognizedTsumoTile = recognizedHandTiles.pop();
            } else if (recognizedHandTiles.length === 0) { // APIが手牌を認識できなかった場合
                console.warn("API returned 0 hand tiles on error. Retaining manually entered hand tiles if any.");
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
            // 簡素化された getDiscardsForPlayer を使用
            const simplifiedGetDiscardsForPlayer = (playerKey, discardData) => {
                if (playerKey === 'self') return discardData?.discard_tiles_bottom ?? [];
                if (playerKey === 'shimocha') return discardData?.discard_tiles_right ?? [];
                if (playerKey === 'toimen') return discardData?.discard_tiles_top ?? [];
                if (playerKey === 'kamicha') return discardData?.discard_tiles_left ?? [];
                return [];
            };

            const apiMeldsSource = detectedResultError.melded_blocks || detectedResultError.melded_tiles;
            const selfMelds = convertMeldsToBoardStateFormat(getMeldsForPlayer(apiMeldsSource, 'self'), 'self');
            const shimochaMelds = convertMeldsToBoardStateFormat(getMeldsForPlayer(apiMeldsSource, 'shimocha'), 'shimocha');
            const toimenMelds = convertMeldsToBoardStateFormat(getMeldsForPlayer(apiMeldsSource, 'toimen'), 'toimen');
            const kamichaMelds = convertMeldsToBoardStateFormat(getMeldsForPlayer(apiMeldsSource, 'kamicha'), 'kamicha');

            setBoardState({
                ...INITIAL_GAME_STATE,
                turn: detectedResultError.turn ?? 1,
                round_wind: boardState.round_wind, 
                hand_tiles: recognizedHandTiles,
                tsumo_tile: recognizedTsumoTile,
                dora_indicators: detectedResultError.dora_indicators ?? [],
                player_discards: {
                    self: simplifiedGetDiscardsForPlayer('self', detectedResultError.discard_tiles),
                    shimocha: simplifiedGetDiscardsForPlayer('shimocha', detectedResultError.discard_tiles),
                    toimen: simplifiedGetDiscardsForPlayer('toimen', detectedResultError.discard_tiles),
                    kamicha: simplifiedGetDiscardsForPlayer('kamicha', detectedResultError.discard_tiles)
                },
                melds: {
                    self: selfMelds, shimocha: shimochaMelds, toimen: toimenMelds, kamicha: kamichaMelds
                },
                player_winds: boardState.player_winds, 
                bakaze: boardState.round_wind, 
                counts: []
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

  // アプリ全体のスタイル (変更なし)
  const appContainerStyle = {
    ...styles.appContainer,
    backgroundColor: settings.theme === 'light' ? '#f0f0f0' : '#1e1e1e',
    backgroundImage: settings.appBg === 'image' && settings.appBgImage ? `url(${settings.appBgImage})` : 'none',
    backgroundSize: 'cover', backgroundPosition: 'center',
    color: settings.theme === 'light' ? '#000000' : '#ccc',
    fontSize: settings.fontSize,
    filter: `brightness(${settings.brightness / 100})`,
  };

  // モーダルのレンダリング (変更なし)
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

  // ★★★ 追加: リセット関数 ★★★
  const handleResetBoardState = () => {
    setBoardState(INITIAL_GAME_STATE); // 初期状態に戻す
    setCalculationResults([]); // 計算結果もクリア
    setIsLoadingCalculation(false); // ローディング状態もリセット
    setIsRecognizing(false); // 認識中状態もリセット
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
            onResetBoardState={handleResetBoardState} 
          />
        </div>
        
        <div style={styles.sidePanelWrapper}>
          <SidePanel
            ref={sidePanelRef}
            isCameraActive={isCameraActive}
            selectedBoardCamera={selectedBoardCamera}
            selectedHandCamera={selectedHandCamera}
            onRecognize={() => { /* 何もしない、または認識開始を促すメッセージ */ }}
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