import React, { useState } from 'react';

// --- 画像リソースのインポート ---
import paiback from './img/b.png';
import M1 from './img/M1.png';
import M2 from './img/M2.png';
import M3 from './img/M3.png';
import M4 from './img/M4.png';
import M5 from './img/M5.png';
import M6 from './img/M6.png';
import M7 from './img/M7.png';
import M8 from './img/M8.png';
import M9 from './img/M9.png';
import RM5 from './img/RM5.png';
import P1 from './img/P1.png';
import P2 from './img/P2.png';
import P3 from './img/P3.png';
import P4 from './img/P4.png';
import P5 from './img/P5.png';
import P6 from './img/P6.png';
import P7 from './img/P7.png';
import P8 from './img/P8.png';
import P9 from './img/P9.png';
import RP5 from './img/RP5.png';
import S1 from './img/S1.png';
import S2 from './img/S2.png';
import S3 from './img/S3.png';
import S4 from './img/S4.png';
import S5 from './img/S5.png';
import S6 from './img/S6.png';
import S7 from './img/S7.png';
import S8 from './img/S8.png';
import S9 from './img/S9.png';
import RS5 from './img/RS5.png';
import Z1 from './img/Z1.png';
import Z2 from './img/Z2.png';
import Z3 from './img/Z3.png';
import Z4 from './img/Z4.png';
import Z5 from './img/Z5.png';
import Z6 from './img/Z6.png';
import Z7 from './img/Z7.png';

// --- データマッピング ---
const TILE_IMAGES = {
  b: paiback, 
  M1, M2, M3, M4, M5, RM5, M6, M7, M8, M9, 
  P1, P2, P3, P4, P5, RP5, P6, P7, P8, P9,  
  S1, S2, S3, S4, S5, RS5, S6, S7, S8, S9,  
  Z1, Z2, Z3, Z4, Z5, Z6, Z7,
};
// 新しい仕様に基づいた牌の数値と名前のマッピング
const TILE_NUM_TO_NAME = {
  0: 'M1', 1: 'M2', 2: 'M3', 3: 'M4', 4: 'M5', 5: 'M6', 6: 'M7', 7: 'M8', 8: 'M9',
  9: 'P1', 10: 'P2', 11: 'P3', 12: 'P4', 13: 'P5', 14: 'P6', 15: 'P7', 16: 'P8', 17: 'P9',
  18: 'S1', 19: 'S2', 20: 'S3', 21: 'S4', 22: 'S5', 23: 'S6', 24: 'S7', 25: 'S8', 26: 'S9',
  27: 'Z1', 28: 'Z2', 29: 'Z3', 30: 'Z4', 31: 'Z5', 32: 'Z6', 33: 'Z7', 
  34: 'RM5', 35: 'RP5', 36: 'RS5', 37: 'b' 
};

// 新しい仕様に基づいた牌の数値と画像キーのマッピング
const TILE_NUM_TO_IMAGE_KEY = {
  0: 'M1', 1: 'M2', 2: 'M3', 3: 'M4', 4: 'M5', 5: 'M6', 6: 'M7', 7: 'M8', 8: 'M9',
  9: 'P1', 10: 'P2', 11: 'P3', 12: 'P4', 13: 'P5', 14: 'P6', 15: 'P7', 16: 'P8', 17: 'P9',
  18: 'S1', 19: 'S2', 20: 'S3', 21: 'S4', 22: 'S5', 23: 'S6', 24: 'S7', 25: 'S8', 26: 'S9',
  27: 'Z1', 28: 'Z2', 29: 'Z3', 30: 'Z4', 31: 'Z5', 32: 'Z6', 33: 'Z7', 
  34: 'RM5', 35: 'RP5', 36: 'RS5', 37: 'b' 
};

const WIND_NUM_TO_KANJI = { 
  27: '東', 28: '南', 29: '西', 30: '北' 
};
const ALL_TILES_IN_POOL = Object.keys(TILE_NUM_TO_IMAGE_KEY).map(Number);


// --- CSS定義 ---
const styles = `
  body { background-color: #222; margin: 0; }
  .tile-pool { 
  display: flex; 
  flex-wrap: wrap; 
  justify-content: center; 
  gap: 8px; 
  padding: 20px; 
  background-color: #005522; 
  border-radius: 5px;  
  margin: 10px 
  }
  .selection-status { 
  margin-top: 25px; 
  font-size: 1.2em; 
  font-weight: bold; 
  color: #aaddff; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  gap: 10px; 
  min-height: 50px; 
  }
  .selection-status img { 
  height: 35px; 
  width: auto; 
  vertical-align: middle; 
  }
  .tile-wrapper { 
  transition: all 0.2s ease-in-out; 
  cursor: pointer; 
  }
  .tile-wrapper:hover { 
  transform: translateY(-5px); 
  }
  .tile-img { 
  display: block; 
  background-color: #f0ead6; 
  border-radius: 4px; 
  box-shadow: 0 2px 2px rgba(0,0,0,0.3); 
  }
  .tile-wrapper.selected { 
  transform: translateY(-12px); 
  }
  .tile-wrapper.selected .tile-img { 
  border: 3px solid #00aaff; 
  box-shadow: 0 8px 15px rgba(50, 150, 255, 0.5); 
  }
  .tile-pool .tile-wrapper:hover { 
  transform: scale(1.1); 
  }
  .tile-display-container { 
  background-color: #005522; 
  padding: 10px; 
  box-sizing: border-box; 
  border-radius: 8px; 
  margin: 10px; 
  }
  .upper-game-area { 
  display: flex; 
  justify-content: flex-start; 
  gap: 10px; 
  margin-bottom: 10px; 
  align-items: flex-start; 
  }
  .player-display {
    background-color: #4f739e; 
    padding: 8px; 
    border-radius: 6px; 
    box-sizing: border-box; 
    display: flex; 
    flex-direction: column; 
    flex-basis: 0; 
    flex-grow: 1;
  }
  .player-label-container { 
  display: flex; 
  justify-content: center; 
  align-items: baseline; 
  gap: 8px; 
  margin-bottom: 8px; 
  min-height: 20px; 
  }
  .player-label { 
  font-size: 16px; 
  color: #FFFFFF; 
  font-weight: bold; 
  }
  .player-sub-label { 
  font-size: 14px; 
  color: #DDDDDD; 
  }
  .discard-area { 
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(25px, 1fr));
    gap: 2px;
    width: 100%;
    min-height: 64px;
  }
  .discard-tile { 
  width: 100%; 
  padding-bottom: 150%; 
  position: relative; 
  }
  .discard-tile .tile-wrapper { 
  position: absolute; 
  top: 0; 
  left: 0; 
  right: 0; 
  bottom: 0; 
  }
  .discard-tile .tile-wrapper .tile-img {
  width: 100%; 
  height: 100%; 
  }
  .dora-indicator-area { 
    margin: 15px ;
    display: flex;
    justify-content: start;
  }
  .dora-indicator-grid {
    display: grid;
    grid-template-columns: repeat(5, 26px);
    grid-template-rows: 38px;
    gap: 3px;
    justify-content: flex-start;
    background-color: rgba(0,0,0,0.1);
    padding: 4px;
    border-radius: 4px;
  }
  .dora-slot {
    width: 26px; height: 38px;
    background-color: rgba(0,0,0,0.2); border: 1px dashed rgba(255,255,255,0.3);
    border-radius: 3px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }
  .dora-slot .tile-img { width: 100%; height: 100%; }

  .own-hand-area { 
  display: flex; 
  align-items: flex-end; 
  justify-content: flex-start; 
  padding: 10px; 
  min-height: 85px; 
  width: 100%; 
  background-color: #4f739e; 
  border-radius: 6px; 
  box-sizing: border-box; 
  margin-top: 10px; 
  }
  .own-wind { 
  font-size: 24px; 
  color: #FFFFFF; 
  font-weight: bold; 
  margin-right: 20px; 
  min-width: 40px; 
  text-align: center; 
  padding-bottom: 20px; 
  }
  .hand-tiles-container { 
  display: flex; 
  align-items: flex-end;
  flex-grow: 1;
  flex-wrap: wrap;
  }
  .hand-tile { 
  margin-right: 2px; 
  }
  .tsumo-tile { 
  margin-left: 10px; 
  }
`;

// --- 子コンポーネント定義 ---
//トグルボタン
const StatusHeader = ({ title = "状況" }) => {
  // ボタンのモード（false: 牌譜, true: シミュレーター）を管理するstate
  const [isSimulatorMode, setIsSimulatorMode] = useState(false);

  // ボタンクリックでモードを切り替える関数
  const handleToggleClick = () => {
    setIsSimulatorMode(prevMode => !prevMode);
    // ここにモードが切り替わった際のロジックを追加できます
  };

  // モードに応じてボタンのテキストとスタイルを動的に決定
  const buttonText = isSimulatorMode ? 'リアルタイムシミュレーター' : '牌譜';
  const buttonStyle = {
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    color: isSimulatorMode ? '#ffffff' : '#503000',
    backgroundColor: isSimulatorMode ? '#E39C40' : '#E39C40', // シミュレーターモードは青系、牌譜モードはオレンジ系
    border: `1px solid ${isSimulatorMode ? '#eda040' : '#eda040'}`,
    padding: '4px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.3s ease', // スムーズな切り替えアニメーション
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0 15px 0', boxSizing: 'border-box' }}>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: '#FFFFFF', fontWeight: 'bold' }}>{title}</span>
      {/* クリックイベントと動的なスタイル・テキストを適用したボタン */}
      <button style={buttonStyle} onClick={handleToggleClick}>
        {buttonText}
      </button>
    </div>
  );
};

const Tile = ({ tileNum, size = 'hand', onClick, isSelected = false }) => {
  const imageKey = TILE_NUM_TO_IMAGE_KEY[tileNum] || 'b';
  const src = TILE_IMAGES[imageKey];
  const alt = TILE_NUM_TO_NAME[tileNum] || '裏';
  const sizeStyles = {
    hand: { width: '45px', height: '65px' },
    tsumo: { width: '45px', height: '65px' },
    discard: { width: '100%', height: '100%' },
    pool: { width: '45px', height: '65px' },
    dora: { width: '100%', height: '100%' }
  };
  return <div className={`tile-wrapper ${isSelected ? 'selected' : ''}`} onClick={onClick}><img src={src} alt={alt} style={sizeStyles[size]} className="tile-img" /></div>;
};

const DoraIndicatorArea = ({ indicators, onIndicatorClick, selection }) => {
  const slots = Array(5).fill(null);
  indicators.forEach((tileNum, index) => {
    slots[index] = tileNum;
  });
  return (
    <div className="dora-indicator-area">
      <div className="dora-indicator-grid">
        {slots.map((tileNum, index) => (
          <div key={index} className="dora-slot" onClick={() => onIndicatorClick(index)}>
            {tileNum !== null ? <Tile tileNum={tileNum} size="dora" isSelected={selection.type === 'dora' && selection.index === index} /> : (selection.type === 'dora' && selection.index === index && <div style={{ width: '90%', height: '90%', border: '2px solid #00aaff', borderRadius: '3px' }}></div>)}
          </div>
        ))}
      </div>
    </div>
  );
};

const SelfPlayerDisplay = ({ label, subLabel, discards, selection, onTileClick }) => (
  <div className="player-display">
    <div className="player-label-container"><span className="player-label">{label}</span>{subLabel && <span className="player-sub-label">{subLabel}</span>}</div>
    <div className="discard-area">{discards.map((tileNum, i) => <div key={`${label}-${i}`} className="discard-tile"><Tile tileNum={tileNum} size="discard" onClick={() => onTileClick('discard', i, 'self')} isSelected={selection.type === 'discard' && selection.playerKey === 'self' && selection.index === i}/></div>)}</div>
  </div>
);

const PlayerDisplay = ({ playerKey, label, subLabel, discards, selection, onTileClick }) => (
  <div className="player-display">
    <div className="player-label-container"><span className="player-label">{label}</span>{subLabel && <span className="player-sub-label">{subLabel}</span>}</div>
    <div className="discard-area">{discards.map((tileNum, i) => <div key={`${label}-${i}`} className="discard-tile"><Tile tileNum={tileNum} size="discard" onClick={() => onTileClick('discard', i, playerKey)} isSelected={selection.type === 'discard' && selection.playerKey === playerKey && selection.index === i}/></div>)}</div>
  </div>
);

// propsで onTileChange を受け取る
const TileDisplayArea = ({ onTileChange }) => {
  // 赤ドラ牌の数値IDを定数として定義 (RM5: 5, RP5: 15, RS5: 25)
  const AKA_DORA_TILES = [5, 15, 25];

  const [gameState, setGameState] = useState({
    turn: 1,
    hand_tiles: [0, 1, 2, 13, 14, 16, 18, 27, 28, 29, 31, 31, 32, 4],
    player_winds: { self: 27, shimocha: 28, toimen: 29, kamicha: 30 },
    player_discards: { self: [3, 4, 5, 6, 7, 8, 9, 10], shimocha: [10, 11, 12, 13, 14, 15, 16], toimen: [18, 19, 20, 21, 22, 23, 24], kamicha: [32, 33, 30, 29, 28, 34], },
    dora_indicators: [37, 4, 37, 37, 37],
  });

  const [selection, setSelection] = useState({ type: null, index: null, playerKey: null });
  const [history, setHistory] = useState([]);

  const isSelectionMode = selection.type !== null;

  const handleDoraClick = (index) => {
    const currentSelection = { type: 'dora', index, playerKey: 'self' };
    if (isSelectionMode && JSON.stringify(selection) === JSON.stringify(currentSelection)) setSelection({ type: null, index: null, playerKey: null });
    else setSelection(currentSelection);
  };

  const handleSelectableTileClick = (type, index, playerKey = null) => {
    const currentSelection = { type, index, playerKey };
    if (isSelectionMode && JSON.stringify(selection) === JSON.stringify(currentSelection)) setSelection({ type: null, index: null, playerKey: null });
    else setSelection(currentSelection);
  };
  
  const handlePoolTileClick = (newTileNum) => {
    if (!isSelectionMode) return;

    const originalTileNum = getSelectedTileNum();
    if (originalTileNum === null) return;

    //赤ドラ牌の重複チェック
    if (AKA_DORA_TILES.includes(newTileNum)) {
      if (originalTileNum === newTileNum) {
        setSelection({ type: null, index: null, playerKey: null });
        return;
      }
      
      const allTilesOnBoard = [
        ...gameState.hand_tiles,
        ...Object.values(gameState.player_discards).flat(),
        ...gameState.dora_indicators,
      ];

      if (allTilesOnBoard.includes(newTileNum)) {
        return;
      }
    }

    const newGameState = JSON.parse(JSON.stringify(gameState));

    if (selection.type === 'hand' || selection.type === 'tsumo') {
      newGameState.hand_tiles[selection.index] = newTileNum;
      const hand = newGameState.hand_tiles.slice(0, 13).sort((a, b) => a - b);
      newGameState.hand_tiles = [...hand, newGameState.hand_tiles[13]];
    } else if (selection.type === 'discard') {
      newGameState.player_discards[selection.playerKey][selection.index] = newTileNum;
    } else if (selection.type === 'dora') {
      const newIndicators = [...newGameState.dora_indicators];
      while (newIndicators.length <= selection.index) {
          newIndicators.push(null);
      }
      newIndicators[selection.index] = newTileNum;
      newGameState.dora_indicators = newIndicators.filter(t => t !== null && t !== undefined);
    }
    
    setGameState(newGameState);

    const logPayload = {
      timestamp: new Date().toISOString(),
      // 変更の差分情報
      changeInfo: {
        location: { ...selection },
        from: {
          num: originalTileNum,
          name: TILE_NUM_TO_NAME[originalTileNum] || '不明'
        },
        to: {
          num: newTileNum,
          name: TILE_NUM_TO_NAME[newTileNum] || '不明'
        }
      },
      // 変更後の盤面全体の情報
      boardState: newGameState
    };

    // onTileChange プロップスが関数として渡されていれば実行する
    if (typeof onTileChange === 'function') {
      onTileChange(logPayload);
    }

    const newHistoryEntry = {
      timestamp: new Date(),
      selectionInfo: { ...selection },
      fromTile: originalTileNum,
      toTile: newTileNum,
    };
    setHistory(prevHistory => [...prevHistory, newHistoryEntry]);

    setSelection({ type: null, index: null, playerKey: null });
  };

  const tsumoTileNum = gameState.hand_tiles.length === 14 ? gameState.hand_tiles[13] : undefined;
  const handTiles = tsumoTileNum !== undefined ? gameState.hand_tiles.slice(0, 13) : gameState.hand_tiles;
  const playerWindNames = { self: WIND_NUM_TO_KANJI[gameState.player_winds.self] || '東', shimocha: WIND_NUM_TO_KANJI[gameState.player_winds.shimocha] || '南', toimen: WIND_NUM_TO_KANJI[gameState.player_winds.toimen] || '西', kamicha: WIND_NUM_TO_KANJI[gameState.player_winds.kamicha] || '北', };
  
  const getSelectedTileNum = () => {
    if (!selection || selection.type === null) return null;
    switch(selection.type) { 
      case 'hand': 
      case 'tsumo': 
        return gameState.hand_tiles[selection.index]; 
      case 'discard': 
        return gameState.player_discards[selection.playerKey]?.[selection.index]; 
      case 'dora': 
        return gameState.dora_indicators[selection.index]; 
      default: 
        return null; 
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="tile-display-container">
        {isSelectionMode && <div className="tile-pool">{ALL_TILES_IN_POOL.map(tileNum => <Tile key={`pool-${tileNum}`} tileNum={tileNum} size="pool" onClick={() => handlePoolTileClick(tileNum)} />)}</div>}
        <div>
          <StatusHeader title={`状況 (巡目: ${gameState?.turn || '未'})`} />
          <DoraIndicatorArea
            indicators={gameState.dora_indicators}
            onIndicatorClick={handleDoraClick}
            selection={selection}
          />
          <div className="upper-game-area">
            <SelfPlayerDisplay
              label="自"
              subLabel={playerWindNames.self}
              discards={gameState.player_discards.self}
              selection={selection}
              onTileClick={handleSelectableTileClick}
            />
            <PlayerDisplay playerKey="shimocha" label="下家" subLabel={playerWindNames.shimocha} discards={gameState.player_discards.shimocha} selection={selection} onTileClick={handleSelectableTileClick} />
            <PlayerDisplay playerKey="toimen" label="対面" subLabel={playerWindNames.toimen} discards={gameState.player_discards.toimen} selection={selection} onTileClick={handleSelectableTileClick} />
            <PlayerDisplay playerKey="kamicha" label="上家" subLabel={playerWindNames.kamicha} discards={gameState.player_discards.kamicha} selection={selection} onTileClick={handleSelectableTileClick} />
          </div>
          <div className="own-hand-area">
            <div className="own-wind">{playerWindNames.self}</div>
            <div className="hand-tiles-container">
              {handTiles.map((tileNum, i) => <div key={`hand-${i}`} className="hand-tile"><Tile tileNum={tileNum} size="hand" onClick={() => handleSelectableTileClick('hand', i)} isSelected={selection.type === 'hand' && selection.index === i} /></div>)}
              {tsumoTileNum !== undefined && <div className="tsumo-tile"><Tile tileNum={tsumoTileNum} size="tsumo" onClick={() => handleSelectableTileClick('tsumo', 13)} isSelected={selection.type === 'tsumo'} /></div>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TileDisplayArea;