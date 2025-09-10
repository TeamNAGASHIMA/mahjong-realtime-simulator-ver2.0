// TileDisplayArea.js
import React, { useState, useEffect } from 'react';

// --- 画像リソースのインポート ---
// (変更なし)
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
// (変更なし)
const TILE_IMAGES = {
  M1, M2, M3, M4, M5, RM5, M6, M7, M8, M9, 
  P1, P2, P3, P4, P5, RP5, P6, P7, P8, P9,  
  S1, S2, S3, S4, S5, RS5, S6, S7, S8, S9,  
  Z1, Z2, Z3, Z4, Z5, Z6, Z7,
};
const TILE_NUM_TO_NAME = {
  0: 'M1', 1: 'M2', 2: 'M3', 3: 'M4', 4: 'M5', 5: 'M6', 6: 'M7', 7: 'M8', 8: 'M9',
  9: 'P1', 10: 'P2', 11: 'P3', 12: 'P4', 13: 'P5', 14: 'P6', 15: 'P7', 16: 'P8', 17: 'P9',
  18: 'S1', 19: 'S2', 20: 'S3', 21: 'S4', 22: 'S5', 23: 'S6', 24: 'S7', 25: 'S8', 26: 'S9',
  27: 'Z1', 28: 'Z2', 29: 'Z3', 30: 'Z4', 31: 'Z5', 32: 'Z6', 33: 'Z7', 
  34: 'RM5', 35: 'RP5', 36: 'RS5', 
};
const TILE_NUM_TO_IMAGE_KEY = {
  0: 'M1', 1: 'M2', 2: 'M3', 3: 'M4', 4: 'M5', 5: 'M6', 6: 'M7', 7: 'M8', 8: 'M9',
  9: 'P1', 10: 'P2', 11: 'P3', 12: 'P4', 13: 'P5', 14: 'P6', 15: 'P7', 16: 'P8', 17: 'P9',
  18: 'S1', 19: 'S2', 20: 'S3', 21: 'S4', 22: 'S5', 23: 'S6', 24: 'S7', 25: 'S8', 26: 'S9',
  27: 'Z1', 28: 'Z2', 29: 'Z3', 30: 'Z4', 31: 'Z5', 32: 'Z6', 33: 'Z7', 
  34: 'RM5', 35: 'RP5', 36: 'RS5', 
};

const WIND_NUM_TO_KANJI = { 27: '東', 28: '南', 29: '西', 30: '北' };
const ALL_TILES_IN_POOL = Object.keys(TILE_NUM_TO_IMAGE_KEY).map(Number);

// --- CSS定義 ---
// (変更なし - 見やすくするため、変更なしの箇所も含まれます)
const styles = `
  body { background-color: #222; margin: 0; font-family: sans-serif; }
  .tile-pool { 
    display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; 
    padding: 20px; background-color: #005522; border-radius: 5px; margin: 10px 
  }
  .tile-wrapper { 
    transition: all 0.2s ease-in-out; cursor: pointer; 
  }
  .tile-wrapper:hover { transform: translateY(-5px); }
  .tile-img { 
    display: block; background-color: #f0ead6; border-radius: 4px; 
    box-shadow: 0 2px 2px rgba(0,0,0,0.3); 
  }
  .tile-wrapper.selected { transform: translateY(-12px); }
  .tile-wrapper.selected .tile-img { 
    border: 3px solid #00aaff; 
    box-shadow: 0 8px 15px rgba(50, 150, 255, 0.5); 
  }
  .tile-pool .tile-wrapper:hover { transform: scale(1.1); }
  .tile-display-container { 
    background-color: #005522; padding: 10px; box-sizing: border-box; 
    border-radius: 8px; margin: 10px; 
  }
  .upper-game-area { 
    display: flex; justify-content: flex-start; gap: 10px; 
    margin-bottom: 10px; align-items: flex-start; 
  }
  .player-display {
    background-color: #4f739e; padding: 8px; border-radius: 6px; 
    box-sizing: border-box; display: flex; flex-direction: column; 
    flex-basis: 0; flex-grow: 1;
  }
  .player-label-container { 
    display: flex; justify-content: center; align-items: baseline; gap: 8px; 
    margin-bottom: 8px; min-height: 20px; 
  }
  .player-label { font-size: 16px; color: #FFFFFF; font-weight: bold; }
  .player-sub-label { font-size: 14px; color: #DDDDDD; }
  .other-player-melds-area {
    display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 5px;
    min-height: 45px; margin-bottom: 8px; padding-right: 5px;
  }
  .other-player-meld-set { display: flex; align-items: flex-end; }
  .other-player-meld-set .tile-wrapper { margin-left: -1px; }
  .other-player-meld-set .tile-img { width: 26px; height: 38px; }
  .other-player-meld-set .meld-tile-exposed .tile-img { transform: rotate(-90deg) translateY(6px); }
  .discard-area { 
    display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;
    width: 100%; cursor: pointer; box-sizing: border-box;
    background-color: rgba(0, 0, 0, 0.15); padding: 5px; border-radius: 4px;
    min-height: 42px;
  }
  .discard-slot {
    width: 100%; padding-bottom: 150%; position: relative; 
    background-color: rgba(0,0,0,0.2); border: 1px dashed rgba(255,255,255,0.3);
    border-radius: 3px; cursor: pointer;
  }
  .discard-slot .tile-wrapper { position: absolute; top: 0; left: 0; right: 0; bottom: 0; }
  .discard-slot .tile-wrapper .tile-img { width: 100%; height: 100%; }
  .dora-indicator-area { 
    margin: 15px ; display: flex; justify-content: start;
  }
  .dora-indicator-grid {
    display: grid; grid-template-columns: repeat(5, 26px); grid-template-rows: 38px;
    gap: 3px; justify-content: flex-start; background-color: rgba(0,0,0,0.1);
    padding: 4px; border-radius: 4px;
  }
  .dora-slot {
    width: 26px; height: 38px; background-color: rgba(0,0,0,0.2); 
    border: 1px dashed rgba(255,255,255,0.3); border-radius: 3px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }
  .dora-slot .tile-img { width: 100%; height: 100%; }
  .own-hand-area { 
    display: flex; align-items: flex-end; justify-content: flex-start; 
    padding: 10px; min-height: 85px; width: 100%; background-color: #4f739e; 
    border-radius: 6px; box-sizing: border-box; margin-top: 10px; 
  }
  .hand-controls {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; margin-right: 20px; min-width: 60px;
    align-self: center;
  }
  .own-wind { 
    font-size: 24px; color: #FFFFFF; font-weight: bold; text-align: center;
    cursor: pointer; user-select: none; transition: color 0.2s;
  }
  .own-wind:hover { color: #ffff99; }
  .meld-button {
    font-size: 14px; font-weight: bold; color: #fff; background-color: #4CAF50;
    border: none; border-radius: 4px; padding: 6px 12px; margin-top: 8px;
    cursor: pointer; transition: background-color 0.2s;
  }
  .meld-button:hover:not(:disabled) { background-color: #45a049; }
  .meld-button:disabled { background-color: #666; color: #aaa; cursor: not-allowed; }
  .hand-and-melds-container {
    display: flex; align-items: flex-end; flex-grow: 1; justify-content: flex-start;
  }
  .own-melds-area { display: flex; align-items: flex-end; gap: 10px; margin-left: 15px; }
  .own-meld-set { display: flex; align-items: flex-end; }
  .own-meld-set .tile-wrapper { margin-right: -1px; }
  .own-meld-set .tile-wrapper.meld-tile-exposed { transform: rotate(-90deg) translateX(10px) translateY(-10px); }
  .own-meld-set .tile-wrapper:hover { transform: translateY(-5px); }
  .own-meld-set .tile-wrapper.selected { transform: translateY(-12px); }
  .own-meld-set .tile-wrapper.selected.meld-tile-exposed { transform: rotate(-90deg) translateX(10px) translateY(-22px); }
  .hand-tiles-container { display: flex; align-items: flex-end; flex-grow: 1; flex-wrap: wrap; }
  .hand-tile { margin-right: 2px; }
  .tsumo-tile { margin-left: 10px; }
  .empty-slot {
    width: 45px; height: 65px; background-color: rgba(0,0,0,0.2);
    border: 1px dashed rgba(255,255,255,0.3); border-radius: 4px;
    cursor: pointer; box-sizing: border-box; display: flex;
    align-items: center; justify-content: center;
  }
  .selection-highlight {
    width: 90%; height: 90%; border: 2px solid #00aaff; border-radius: 3px; box-sizing: border-box;
  }
  .clickable-text {
    cursor: pointer; text-decoration: underline; user-select: none;
    padding: 0 2px; border-radius: 3px; transition: background-color 0.2s;
  }
  .clickable-text:hover { background-color: rgba(255, 255, 255, 0.15); }
  
  .modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex; justify-content: center; align-items: center; z-index: 1000;
  }
  .modal-content {
    background-color: #2c3e50; padding: 20px; border-radius: 8px;
    width: 640px; max-width: 90%;
  }
  .modal-header {
    color: #ecf0f1; font-size: 1.2em; font-weight: bold;
    margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #34495e;
  }
  .modal-tabs {
    display: flex; border-bottom: 2px solid #34495e; margin-bottom: 20px;
  }
  .modal-tab-button {
    background: none; border: none; color: #95a5a6; font-size: 16px; font-weight: bold;
    padding: 10px 20px; cursor: pointer; transition: all 0.2s;
    border-bottom: 3px solid transparent; text-transform: uppercase;
  }
  .modal-tab-button.active { color: #ecf0f1; border-bottom-color: #3498db; }
  .modal-tab-button:disabled { color: #7f8c8d; cursor: not-allowed; }
  .meld-candidate-list {
    display: flex; flex-wrap: wrap; gap: 15px; min-height: 80px;
  }
  .meld-candidate-item {
    background-color: #34495e; border-radius: 5px; padding: 10px;
    cursor: pointer; display: flex; align-items: center; transition: background-color 0.2s;
  }
  .meld-candidate-item:hover { background-color: #4a627a; }
  .meld-candidate-item .tile-wrapper { margin-right: -2px; }
  .meld-candidate-item .tile-img { width: 30px; height: 44px; }
  .meld-candidate-item .kan-type-label {
      width: auto; height: auto; background: none; box-shadow: none;
      color: #ecf0f1; font-size: 12px; font-weight: bold; margin-left: 8px;
      display: flex; align-items: center;
  }
  .modal-actions { margin-top: 20px; text-align: right; }
  .modal-cancel-button {
    background-color: #e74c3c; color: white; border: none;
    padding: 8px 16px; border-radius: 4px; cursor: pointer;
    transition: background-color 0.2s;
  }
  .modal-cancel-button:hover { background-color: #c0392b; }
`;

// --- 子コンポーネント定義 ---
const StatusHeader = ({ title }) => {
  const [isSimulatorMode, setIsSimulatorMode] = useState(false);
  const handleToggleClick = () => setIsSimulatorMode(prevMode => !prevMode);
  const buttonText = isSimulatorMode ? 'リアルタイムシミュレーター' : '牌譜';
  const buttonStyle = {
    fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#ffffff',
    backgroundColor: '#E39C40', border: `1px solid #eda040`,
    padding: '4px 12px', borderRadius: '4px', cursor: 'pointer',
    whiteSpace: 'nowrap', transition: 'all 0.3s ease',
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0 15px 0' }}>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: '#FFFFFF', fontWeight: 'bold' }}>{title}</span>
      <button style={buttonStyle} onClick={handleToggleClick}>{buttonText}</button>
    </div>
  );
};

const Tile = ({ tileNum, size = 'hand', onClick, isSelected = false }) => {
  if (tileNum === 'b') {
    const sizeStyles = {
        hand: { width: '45px', height: '65px' },
        meld: { width: '45px', height: '65px' },
        other_meld: { width: '26px', height: '38px' },
    };
    return (
      <div className={`tile-wrapper ${isSelected ? 'selected' : ''}`} onClick={onClick}>
        <div style={{...sizeStyles[size], backgroundColor: '#005936', border: '2px solid #f0ead6', borderRadius: '4px', boxSizing: 'border-box'}} className="tile-img" />
      </div>
    );
  }
  const imageKey = TILE_NUM_TO_IMAGE_KEY[tileNum] || 'b';
  const src = TILE_IMAGES[imageKey];
  const alt = TILE_NUM_TO_NAME[tileNum] || '不明';
  
  // ★★★ ここを修正しました (文字列からオブジェクトへ) ★★★
  const sizeStyles = {
    hand: { width: '45px', height: '65px' },
    tsumo: { width: '45px', height: '65px' },
    discard: { width: '100%', height: '100%' },
    pool: { width: '45px', height: '65px' }, 
    dora: { width: '100%', height: '100%' },
    meld: { width: '45px', height: '65px' },
    other_meld: { width: '26px', height: '38px' }
  };
  
  return (
    <div className={`tile-wrapper ${isSelected ? 'selected' : ''}`} onClick={onClick}>
        <img src={src} alt={alt} style={sizeStyles[size]} className="tile-img" />
    </div>
  );
};

const DoraIndicatorArea = ({ indicators, onSlotClick, selection }) => {
  const slots = Array(5).fill(null);
  // indicatorsが配列であることを保証しているので、安全にforEachを呼び出せる
  indicators.forEach((tileNum, index) => { 
    if (index < 5) slots[index] = tileNum; 
  });
  return (
    <div className="dora-indicator-area">
      <div className="dora-indicator-grid">
        {slots.map((tileNum, index) => (
          <div key={index} className="dora-slot" onClick={() => onSlotClick(index)}>
            {tileNum !== null ? (
                <Tile tileNum={tileNum} size="dora" isSelected={selection.type === 'dora' && selection.index === index} />
            ) : (
                selection.type === 'add_dora' && selection.index === index && <div className="selection-highlight"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const PlayerDisplay = ({ playerKey, label, subLabel, discards, melds, selection, onTileClick, onAddSlotClick, onMeldTileClick }) => {
    const maxDiscards = 21; 
    const slots = Array(maxDiscards).fill(null);
    // discardsが配列であることを保証しているので、安全にforEachを呼び出せる
    discards.forEach((tileNum, index) => {
        if (index < maxDiscards) slots[index] = tileNum;
    });

    return (
        <div className="player-display">
            <div className="player-label-container">
                <span className="player-label">{label}</span>
                {subLabel && <span className="player-sub-label">{subLabel}</span>}
            </div>
            <div className="other-player-melds-area">
              {melds.map((meld, meldIndex) => (
                <div key={meldIndex} className="other-player-meld-set">
                  {meld.tiles.map((tileNum, tileIndex) => {
                    const isAnkan = meld.type === 'ankan';
                    const isClosed = isAnkan && (tileIndex === 0 || tileIndex === 3);
                    const isExposed = !isAnkan && tileIndex === meld.exposed_index;
                    const finalTileNum = isClosed ? 'b' : tileNum;
                    const isSelected = selection.type === 'meld' && selection.playerKey === playerKey && selection.meldIndex === meldIndex && selection.tileIndex === tileIndex;

                    return (
                        <div key={tileIndex} className={`tile-wrapper ${isExposed ? 'meld-tile-exposed' : ''} ${isSelected ? 'selected' : ''}`}
                            onClick={(e) => { e.stopPropagation(); onMeldTileClick(playerKey, meldIndex, tileIndex); }}>
                          <Tile tileNum={finalTileNum} size="other_meld" />
                        </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="discard-area">
                {slots.map((tileNum, i) => (
                    <div key={`${playerKey}-discard-${i}`} className="discard-slot" onClick={() => onAddSlotClick(playerKey)}>
                        {tileNum !== null ? (
                            <div onClick={(e) => { e.stopPropagation(); onTileClick(playerKey, i); }}>
                                <Tile
                                    tileNum={tileNum} size="discard"
                                    // isSelectedの判定から'last_discard'を削除
                                    isSelected={selection.type === 'discard' && selection.playerKey === playerKey && selection.index === i}
                                />
                            </div>
                        ) : ( selection.type === 'add_discard' && selection.playerKey === playerKey && <div className="selection-highlight"></div>)}
                    </div>
                ))}
            </div>
        </div>
    );
};

const OwnMeldArea = ({ melds, onMeldTileClick, selection }) => {
  return (
    <div className="own-melds-area">
      {melds.map((meld, meldIndex) => (
        <div key={meldIndex} className="own-meld-set">
          {meld.tiles.map((tileNum, tileIndex) => {
            const isAnkan = meld.type === 'ankan';
            const isClosed = isAnkan && (tileIndex === 0 || tileIndex === 3);
            const isExposed = !isAnkan && meld.exposed_index === tileIndex;
            const finalTileNum = isClosed ? 'b' : tileNum;
            const isSelected = selection.type === 'meld' && selection.playerKey === 'self' && selection.meldIndex === meldIndex && selection.tileIndex === tileIndex;
            return (
              <div key={tileIndex} className={`tile-wrapper ${isExposed ? 'meld-tile-exposed' : ''} ${isSelected ? 'selected' : ''}`} 
                  onClick={(e) => { e.stopPropagation(); onMeldTileClick('self', meldIndex, tileIndex); }}>
                <Tile tileNum={finalTileNum} size="meld" />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const MeldSelectionModal = ({ isOpen, candidates, onSelect, onClose }) => {
  const [selectedMeldType, setSelectedMeldType] = useState('pon');
  
  const ponCandidates = candidates.filter(c => c.type === 'pon');
  const chiCandidates = candidates.filter(c => c.type === 'chi');
  const kanCandidates = candidates.filter(c => ['ankan', 'daiminkan', 'kakan'].includes(c.type));

  const KAN_TYPE_LABELS = { ankan: '暗槓', daiminkan: '大明槓', kakan: '加槓'};

  useEffect(() => {
    if (isOpen) {
      if (ponCandidates.length > 0) setSelectedMeldType('pon');
      else if (chiCandidates.length > 0) setSelectedMeldType('chi');
      else if (kanCandidates.length > 0) setSelectedMeldType('kan');
      else setSelectedMeldType('pon'); // デフォルトはポンに設定 (候補がなくてもタブは表示される)
    }
  }, [isOpen, ponCandidates.length, chiCandidates.length, kanCandidates.length]); 

  if (!isOpen) return null;
  
  const displayedCandidates = 
    selectedMeldType === 'pon' ? ponCandidates :
    selectedMeldType === 'chi' ? chiCandidates :
    kanCandidates;

  const getMeldDisplayTiles = (candidate) => {
      // 鳴き候補の表示は、手牌から使う牌か、完成形かによって分ける
      // ここでは、hand_tilesがあればそれを使い、なければtilesを使う
      // また、他家からの鳴きでは捨てられた牌も表示に含める
      if (candidate.from && candidate.called_tile !== undefined) {
          return [...(candidate.hand_tiles || candidate.tiles), candidate.called_tile];
      }
      return candidate.hand_tiles || candidate.tiles;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">鳴きを選択</div>
        <div className="modal-tabs">
          <button 
            className={`modal-tab-button ${selectedMeldType === 'pon' ? 'active' : ''}`}
            onClick={() => setSelectedMeldType('pon')}
            disabled={ponCandidates.length === 0}
          >
            ポン ({ponCandidates.length})
          </button>
          <button 
            className={`modal-tab-button ${selectedMeldType === 'chi' ? 'active' : ''}`}
            onClick={() => setSelectedMeldType('chi')}
            disabled={chiCandidates.length === 0}
          >
            チー ({chiCandidates.length})
          </button>
          <button 
            className={`modal-tab-button ${selectedMeldType === 'kan' ? 'active' : ''}`}
            onClick={() => setSelectedMeldType('kan')}
            disabled={kanCandidates.length === 0}
          >
            カン ({kanCandidates.length})
          </button>
        </div>
        <div className="meld-candidate-list">
          {displayedCandidates.map((candidate, index) => (
            <div key={index} className="meld-candidate-item" onClick={() => onSelect(candidate)}>
              <div style={{display: 'flex'}}>
                {getMeldDisplayTiles(candidate).sort((a,b) => a - b).map((tileNum, tileIndex) => (
                      <Tile key={tileIndex} tileNum={tileNum} size="hand" />
                ))}
              </div>
              {selectedMeldType === 'kan' && <span className="kan-type-label">{KAN_TYPE_LABELS[candidate.type]}</span>}
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button className="modal-cancel-button" onClick={onClose}>キャンセル</button>
        </div>
      </div>
    </div>
  );
};


const TileDisplayArea = ({ boardState, onBoardStateChange }) => { // propsとしてboardStateとonBoardStateChangeを受け取る
  const AKA_DORA_NUMS = [34, 35, 36];
  const NORMAL_TO_RED_MAP = { 4: 34, 13: 35, 22: 36 };
  const RED_TO_NORMAL_MAP = { 34: 4, 35: 13, 36: 22 };
  
  const normalize = (n) => n === null ? null : RED_TO_NORMAL_MAP[n] ?? n;

  const getCombinations = (array, size) => {
    const result = [];
    const f = (prefix, arr) => {
        if (prefix.length === size) {
            result.push(prefix);
            return;
        }
        for (let i = 0; i < arr.length; i++) {
            f(prefix.concat(arr[i]), arr.slice(i + 1));
        }
    };
    f([], array);
    return result;
  };
  
  const isMeldValid = (type, tiles) => {
    if (!tiles || tiles.some(t => t === null || t === undefined)) return false;
    const normalizedTiles = tiles.map(normalize).sort((a, b) => a - b);
    if (type === 'pon' || type.includes('kan') || type.includes('minkan')) {
      return normalizedTiles.every(t => t === normalizedTiles[0]);
    }
    if (type === 'chi') {
      if (tiles.length !== 3) return false;
      const isNumberTile = (n) => n >= 0 && n <= 26;
      if (!normalizedTiles.every(isNumberTile)) return false;
      const getSuit = (n) => Math.floor(n / 9);
      if (new Set(normalizedTiles.map(getSuit)).size > 1) return false;
      return normalizedTiles[0] + 1 === normalizedTiles[1] && normalizedTiles[1] + 1 === normalizedTiles[2];
    }
    return true;
  };

  const [selection, setSelection] = useState({ type: null });
  const [isMeldModalOpen, setIsMeldModalOpen] = useState(false);

  const findMeldCandidates = (currentBoardState) => {
    const { hand_tiles: hand, tsumo_tile: tsumoTile, melds: { self: selfMelds }, last_discard: lastDiscard } = currentBoardState;

    const candidates = [];
    const fullHand = [...hand, tsumoTile].filter(t => t !== null);
    const normalizedGroups = {};
    fullHand.forEach(tile => {
        const norm = normalize(tile);
        if (!normalizedGroups[norm]) normalizedGroups[norm] = [];
        normalizedGroups[norm].push(tile);
    });

    if (lastDiscard && lastDiscard.tile !== null) {
        const discardedTile = lastDiscard.tile;
        const normDiscarded = normalize(discardedTile);
        
        // ポン
        if (normalizedGroups[normDiscarded] && normalizedGroups[normDiscarded].length >= 2) {
            getCombinations(normalizedGroups[normDiscarded], 2).forEach(combo => {
                candidates.push({ type: 'pon', hand_tiles: combo, from: lastDiscard.from, called_tile: discardedTile });
            });
        }
        // 大明槓
        if (normalizedGroups[normDiscarded] && normalizedGroups[normDiscarded].length >= 3) {
            getCombinations(normalizedGroups[normDiscarded], 3).forEach(combo => {
                candidates.push({ type: 'daiminkan', hand_tiles: combo, from: lastDiscard.from, called_tile: discardedTile });
            });
        }
        // チー (上家からのみ)
        if (lastDiscard.from === 'kamicha' && discardedTile !== undefined && discardedTile !== null && discardedTile < 27) { // 字牌はチーできない
            const n = normalize(discardedTile);
            const suit = Math.floor(n / 9);

            const checkChiPattern = (t1, t2) => {
                if (t1 >= 0 && t1 < 27 && Math.floor(t1 / 9) === suit &&
                    t2 >= 0 && t2 < 27 && Math.floor(t2 / 9) === suit &&
                    normalizedGroups[t1] && normalizedGroups[t2]) {
                    
                    normalizedGroups[t1].forEach(tile1 => {
                        normalizedGroups[t2].forEach(tile2 => {
                            candidates.push({ type: 'chi', hand_tiles: [tile1, tile2], from: 'kamicha', called_tile: discardedTile });
                        });
                    });
                }
            };
            
            // n-2, n-1, (n)
            if (n >= 2) checkChiPattern(n - 2, n - 1);
            // n-1, (n), n+1
            if (n >= 1 && n <= 7) checkChiPattern(n - 1, n + 1);
            // (n), n+1, n+2
            if (n <= 6) checkChiPattern(n + 1, n + 2);
        }
    } else { // ツモ牌があるか、手牌内での鳴き（暗槓・加槓・オープンなポンチー）
        // 暗槓
        for (const norm in normalizedGroups) {
            if (normalizedGroups[norm].length === 4) {
                candidates.push({ type: 'ankan', tiles: normalizedGroups[norm] });
            }
        }
        
        // 加槓
        selfMelds.forEach((meld, meldIndex) => {
            if (meld.type === 'pon') {
                const norm = normalize(meld.tiles[0]);
                if (normalizedGroups[norm] && normalizedGroups[norm].length > 0) {
                    normalizedGroups[norm].forEach(tileInHand => {
                        candidates.push({ type: 'kakan', tiles: [tileInHand], from_meld_index: meldIndex });
                    });
                }
            }
        });
        
        // 手牌内でのポン・チー（ツモアガリ時など） - UI上で選択して行うものなのでここでは生成しない。
        // モーダルでは他家からの鳴きか暗槓・加槓を表示する方針のため、手牌内のポン・チーは含めない
        // ポン候補は手牌内に同じ牌が3枚あれば理論上可能だが、鳴きモーダルでは他家からの鳴きを優先。
        // 暗槓以外に手牌からカンできるのは大明槓・加槓だけなので、暗槓のみ考慮。
    }
    
    const uniqueCandidates = [];
    const signatures = new Set();
    candidates.forEach(c => {
        const tilesToSort = c.hand_tiles || c.tiles;
        const signature = c.type + ':' + (c.from_meld_index ?? '') + ':' + (c.called_tile ?? '') + ':' + [...tilesToSort].sort((a,b)=>a-b).join(',');
        if (!signatures.has(signature)) {
            signatures.add(signature);
            uniqueCandidates.push(c);
        }
    });

    return uniqueCandidates;
  };
  
  const handleSelectMeld = (meldToMake) => {
    const newBoardState = JSON.parse(JSON.stringify(boardState)); // boardState のディープコピー
        let hand = newBoardState.hand_tiles;
        let tsumo = newBoardState.tsumo_tile;

        const removeTilesFromHand = (tilesToRemove) => {
            for (const tile of tilesToRemove) {
                const indexInHand = hand.findIndex(h => h === tile);
                if (indexInHand > -1) {
                    hand.splice(indexInHand, 1);
                } else if (tsumo === tile) {
                    tsumo = null;
                } else {
                    return false; // 牌が見つからない場合は失敗
                }
            }
            return true;
        }

        if (meldToMake.type === 'kakan') {
            const meldToUpdate = newBoardState.melds.self[meldToMake.from_meld_index];
            if(removeTilesFromHand(meldToMake.tiles)) {
                meldToUpdate.type = 'minkan'; // 加槓後は明槓扱い
                meldToUpdate.tiles.push(meldToMake.tiles[0]);
                meldToUpdate.tiles.sort((a, b) => a - b);
            }
        } else if (meldToMake.type === 'ankan') {
            if(removeTilesFromHand(meldToMake.tiles)) {
                newBoardState.melds.self.push({ type: 'ankan', tiles: meldToMake.tiles, from: 'self' });
            }
        } else if (meldToMake.from) { // 他家からの鳴き (ポン、チー、大明槓)
            const fromPlayer = meldToMake.from;
            const calledTile = meldToMake.called_tile; // last_discard.tileから取得

            if (removeTilesFromHand(meldToMake.hand_tiles)) {
                const discardPile = newBoardState.player_discards[fromPlayer];
                const discardIndex = discardPile.lastIndexOf(calledTile); // 最新の捨て牌を対象
                if(discardIndex > -1) discardPile.splice(discardIndex, 1);

                const meldTiles = [...meldToMake.hand_tiles, calledTile].sort((a,b)=>a-b);
                let exposed_index;
                if (meldToMake.type === 'chi') {
                    exposed_index = meldTiles.findIndex(t => t === calledTile);
                } else { // ポン, 大明槓
                    // どの位置に捨て牌がくるかは、誰から鳴いたかによる
                    if (fromPlayer === 'kamicha') exposed_index = 0; // 上家からなら左端
                    else if (fromPlayer === 'toimen') exposed_index = 1; // 対面からなら真ん中
                    else if (fromPlayer === 'shimocha') exposed_index = 2; // 下家からなら右端
                    else exposed_index = 0; // デフォルト
                }

                const meldType = meldToMake.type === 'daiminkan' ? 'minkan' : meldToMake.type;
                newBoardState.melds.self.push({ type: meldType, tiles: meldTiles, from: fromPlayer, exposed_index });
            }
        }
        
        newBoardState.hand_tiles = hand.sort((a, b) => a - b);
        newBoardState.tsumo_tile = tsumo;
        newBoardState.last_discard = { tile: null, from: null, index: null }; 
    onBoardStateChange(newBoardState); // 親の状態更新関数を呼び出す
    setSelection({type: null});
    setIsMeldModalOpen(false);
  };
  
  // 状態更新は全て onBoardStateChange を経由するように変更
  const handleTurnChange = () => onBoardStateChange({ ...boardState, turn: (typeof boardState.turn === 'number' && boardState.turn < 22) ? boardState.turn + 1 : 1 });
  const handleRoundWindChange = () => onBoardStateChange({ ...boardState, round_wind: boardState.round_wind === 27 ? 28 : 27 });

  const handlePlayerWindChange = () => {
    onBoardStateChange(prevBoardState => {
      const WIND_ORDER = [27, 28, 29, 30];
      const currentIndex = WIND_ORDER.indexOf(prevBoardState.player_winds.self);
      const nextIndex = (currentIndex + 1) % 4;
      return { ...prevBoardState, player_winds: { self: WIND_ORDER[nextIndex], shimocha: WIND_ORDER[(nextIndex + 1) % 4], toimen: WIND_ORDER[(nextIndex + 2) % 4], kamicha: WIND_ORDER[(nextIndex + 3) % 4] } };
    });
  };
  
  const handlePoolTileClick = (newTileNum) => {
    if (!selection.type) return;
    
    const newBoardState = JSON.parse(JSON.stringify(boardState)); // boardState のディープコピー
    const sortedHand = [...newBoardState.hand_tiles].sort((a, b) => a - b);
    
    const getSelectedTileNum = () => {
        if (!selection || !selection.type) return null;
        switch (selection.type) {
            case 'hand': return sortedHand[selection.index];
            case 'tsumo': return newBoardState.tsumo_tile;
            case 'discard': return newBoardState.player_discards[selection.playerKey]?.[selection.index];
            case 'dora': return newBoardState.dora_indicators[selection.index];
            case 'meld': return newBoardState.melds[selection.playerKey]?.[selection.meldIndex]?.tiles[selection.tileIndex];
            default: return null;
        }
    };
    
    const originalTileNum = getSelectedTileNum();
    
    const allTilesOnBoard = [
        ...newBoardState.hand_tiles, newBoardState.tsumo_tile, 
        ...Object.values(newBoardState.player_discards).flat(),
        ...Object.values(newBoardState.melds).flatMap(p => p.flatMap(m => m.tiles)),
        ...newBoardState.dora_indicators,
    ].filter(t => t !== null && t !== undefined);

    let tempBoard = [...allTilesOnBoard];
    // 変更対象の牌を一時的にボードから削除して枚数チェックを行う
    if (originalTileNum !== null && originalTileNum !== undefined) {
      const indexToRemove = tempBoard.indexOf(originalTileNum);
      if (indexToRemove > -1) tempBoard.splice(indexToRemove, 1);
    }
    
    const countInBoard = (tile) => tempBoard.filter(t => t === tile).length;
    
    // 赤ドラ（赤5萬, 赤5筒, 赤5索）を追加しようとしている場合
    if (AKA_DORA_NUMS.includes(newTileNum)) {
        // ルール1: 赤ドラは各種1枚まで
        if (countInBoard(newTileNum) >= 1) {
            alert("赤ドラは各種1枚までしか使用できません。");
            return;
        }
        // ルール2(補完): 通常の5と合わせて4枚まで
        const normalVersion = RED_TO_NORMAL_MAP[newTileNum];
        if (countInBoard(newTileNum) + countInBoard(normalVersion) >= 4) {
            alert("同じ牌（赤含む）は4枚までしか使用できません。");
            return;
        }
    }
    // 通常の5（5萬, 5筒, 5索）を追加しようとしている場合
    else if (NORMAL_TO_RED_MAP[newTileNum]) {
        // ルール3: 通常の5は3枚まで
        if (countInBoard(newTileNum) >= 3) {
            alert(`通常の${TILE_NUM_TO_NAME[newTileNum]}は3枚までしか使用できません。`);
            return;
        }
        // ルール2(補完): 赤ドラと合わせて4枚まで
        const redVersion = NORMAL_TO_RED_MAP[newTileNum];
        if (countInBoard(newTileNum) + countInBoard(redVersion) >= 4) {
            alert("同じ牌（赤含む）は4枚までしか使用できません。");
            return;
        }
    }
    // 上記以外の牌（1-4, 6-9の数牌、字牌）を追加しようとしている場合
    else {
        // ルール2: 通常の牌は4枚まで
        if (countInBoard(newTileNum) >= 4) {
            alert(`${TILE_NUM_TO_NAME[newTileNum]} は4枚までしか使用できません。`);
            return;
        }
    }
    
    switch (selection.type) {
        case 'add_hand':
            newBoardState.hand_tiles.push(newTileNum);
            break;
        case 'add_tsumo':
            newBoardState.tsumo_tile = newTileNum;
            break;
        case 'add_discard':
            newBoardState.player_discards[selection.playerKey].push(newTileNum);
            break;
        case 'add_dora':
            newBoardState.dora_indicators.push(newTileNum);
            break;
        case 'hand': {
            const tileToReplace = sortedHand[selection.index];
            const originalIndexInHand = newBoardState.hand_tiles.findIndex(t => t === tileToReplace);
            if(originalIndexInHand > -1){
              newBoardState.hand_tiles[originalIndexInHand] = newTileNum;
            }
            break;
        }
        case 'tsumo':
            newBoardState.tsumo_tile = newTileNum;
            break;
        case 'discard':
            newBoardState.player_discards[selection.playerKey][selection.index] = newTileNum;
            // 捨て牌の変更時はlast_discardも更新する
            if (selection.playerKey !== 'self' && newBoardState.last_discard.from === selection.playerKey && newBoardState.last_discard.index === selection.index) {
                newBoardState.last_discard = { tile: newTileNum, from: selection.playerKey, index: selection.index };
            }
            break;
        case 'dora':
            newBoardState.dora_indicators[selection.index] = newTileNum;
            break;
        case 'meld': {
            const meld = newBoardState.melds[selection.playerKey][selection.meldIndex];
            const tempTiles = [...meld.tiles];
            const oldTile = tempTiles[selection.tileIndex];
            tempTiles[selection.tileIndex] = newTileNum;
            
            // 面子の有効性を確認（鳴き面子を構成する牌は変更できないようにするが、ここでは許可）
            // ポン・チー・カンは特定の形の牌の組み合わせなので、安易な変更は面子を壊す可能性が高い。
            // ユーザーの操作性を優先し、壊れても良いという前提で実装。
            if (selection.playerKey === 'self') {
                meld.tiles = tempTiles.sort((a, b) => a - b);
                // 面子が有効でなくなった場合、壊す警告などは出さない。
                // 厳密には面子の種類のバリデーションが必要だが、ここでは簡略化。
            } else {
                // 他家の面子は変更不可とするか、手牌に戻すか。今回は変更を許可。
                meld.tiles = tempTiles.sort((a, b) => a - b);
            }
            break;
        }
        default: break;
    }
    
    newBoardState.hand_tiles.sort((a,b) => a - b);
    onBoardStateChange(newBoardState); // 親の状態更新関数を呼び出す
    setSelection({ type: null }); // 牌プールから選択後は選択解除
  };
  
  const handleTileClick = (type, index, playerKey = 'self', options = {}) => {
      const newSelection = {type, index, playerKey, ...options};
      
      // 全く同じ要素がクリックされたかを判定
      const isSameTile = selection.type === newSelection.type &&
                          selection.index === newSelection.index &&
                          selection.playerKey === newSelection.playerKey &&
                          selection.meldIndex === newSelection.meldIndex; // meldIndexは面子の牌にのみ適用

      // 自分の鳴き面子の場合、牌が違っても同じ面子なら「同じ」とみなす
      // (これは面子全体を再クリックで崩すロジックのための判定)
      const isSameMeld = selection.type === 'meld' && selection.playerKey === 'self' &&
                          newSelection.type === 'meld' && newSelection.playerKey === 'self' &&
                          selection.meldIndex === newSelection.meldIndex;

      // 同じ牌 or 同じ自分の鳴き面子がクリックされた場合 -> 選択解除
      if (isSameTile || isSameMeld) {
          if (isSameMeld) {
              // 自分の鳴き面子が再度クリックされた場合に、崩す処理を実行
              onBoardStateChange(prevBoardState => { // 親の状態更新関数を呼び出す
                  const newBoardState = JSON.parse(JSON.stringify(prevBoardState));
                  const meldToBreak = newBoardState.melds.self[selection.meldIndex];
                  if (meldToBreak) {
                      newBoardState.hand_tiles.push(...meldToBreak.tiles);
                      newBoardState.melds.self.splice(selection.meldIndex, 1);
                      newBoardState.hand_tiles.sort((a, b) => a - b);
                  }
                  return newBoardState;
              });
          }
          setSelection({ type: null }); // 選択解除

      } else { // 異なる要素がクリックされた場合 -> 新しい要素を選択
          setSelection(newSelection);

          // もしクリックされたのが他家の捨て牌なら、last_discard も更新する
          if (newSelection.type === 'discard' && newSelection.playerKey !== 'self') {
              onBoardStateChange(prevBoardState => ({ // 親の状態更新関数を呼び出す
                  ...prevBoardState,
                  last_discard: {
                      tile: prevBoardState.player_discards[newSelection.playerKey][newSelection.index],
                      from: newSelection.playerKey,
                      index: newSelection.index
                  }
              }));
          } else {
              // 他の要素が選択された場合 (手牌、自摸牌、自分の捨て牌、ドラなど) は last_discard をクリアする
              // これにより、鳴き候補は直近の他家捨て牌にのみ反応するようになる
              onBoardStateChange(prevBoardState => ({ // 親の状態更新関数を呼び出す
                  ...prevBoardState,
                  last_discard: { tile: null, from: null, index: null }
              }));
          }
      }
  }
  
  const sortedHand = [...boardState.hand_tiles].sort((a,b) => a - b);
  const meldCandidates = findMeldCandidates(boardState); // boardStateを直接渡す

  const playerWindNames = { self: WIND_NUM_TO_KANJI[boardState.player_winds.self] || '東', shimocha: WIND_NUM_TO_KANJI[boardState.player_winds.shimocha] || '南', toimen: WIND_NUM_TO_KANJI[boardState.player_winds.toimen] || '西', kamicha: WIND_NUM_TO_KANJI[boardState.player_winds.kamicha] || '北' };
  const roundWindKanji = WIND_NUM_TO_KANJI[boardState.round_wind] || '東';
  const headerTitle = <>状況 (巡目:<span className="clickable-text" onClick={handleTurnChange}>{boardState?.turn || '未'}</span> 場風:<span className="clickable-text" onClick={handleRoundWindChange}>{roundWindKanji}</span>)</>;
  
  const MAX_HAND_SLOTS = 13;
  const numMelds = boardState.melds.self.length;
  
  return (
    <>
      <style>{styles}</style>
      <MeldSelectionModal
        isOpen={isMeldModalOpen}
        candidates={meldCandidates}
        onSelect={handleSelectMeld}
        onClose={() => setIsMeldModalOpen(false)}
      />
      <div className="tile-display-container">
        {selection.type && <div className="tile-pool">{ALL_TILES_IN_POOL.map(tileNum => <Tile key={`pool-${tileNum}`} tileNum={tileNum} size="pool" onClick={() => handlePoolTileClick(tileNum)} />)}</div>}
        <div onClick={(e) => { e.stopPropagation(); setSelection({type: null}); }}>
          <div onClick={e => e.stopPropagation()}>
            <StatusHeader title={headerTitle} />
            <DoraIndicatorArea indicators={boardState.dora_indicators} onSlotClick={(index) => handleTileClick(boardState.dora_indicators[index] !== undefined ? 'dora' : 'add_dora', index)} selection={selection} />
            <div className="upper-game-area">
              {/* 各プレイヤーのonTileClickをhandleTileClickに統一 */}
              <PlayerDisplay playerKey="self" label="自" subLabel={playerWindNames.self} discards={boardState.player_discards.self} melds={boardState.melds.self} selection={selection} onTileClick={(playerKey, index) => handleTileClick('discard', index, playerKey)} onAddSlotClick={() => setSelection({type: 'add_discard', playerKey: 'self'})} onMeldTileClick={(playerKey, meldIndex, tileIndex) => handleTileClick('meld', tileIndex, playerKey, { meldIndex })}/>
              <PlayerDisplay playerKey="shimocha" label="下家" subLabel={playerWindNames.shimocha} discards={boardState.player_discards.shimocha} melds={boardState.melds.shimocha} selection={selection} onTileClick={(playerKey, index) => handleTileClick('discard', index, playerKey)} onAddSlotClick={() => setSelection({type: 'add_discard', playerKey: 'shimocha'})} onMeldTileClick={(playerKey, meldIndex, tileIndex) => handleTileClick('meld', tileIndex, playerKey, { meldIndex })}/>
              <PlayerDisplay playerKey="toimen" label="対面" subLabel={playerWindNames.toimen} discards={boardState.player_discards.toimen} melds={boardState.melds.toimen} selection={selection} onTileClick={(playerKey, index) => handleTileClick('discard', index, playerKey)} onAddSlotClick={() => setSelection({type: 'add_discard', playerKey: 'toimen'})} onMeldTileClick={(playerKey, meldIndex, tileIndex) => handleTileClick('meld', tileIndex, playerKey, { meldIndex })}/>
              <PlayerDisplay playerKey="kamicha" label="上家" subLabel={playerWindNames.kamicha} discards={boardState.player_discards.kamicha} melds={boardState.melds.kamicha} selection={selection} onTileClick={(playerKey, index) => handleTileClick('discard', index, playerKey)} onAddSlotClick={() => setSelection({type: 'add_discard', playerKey: 'kamicha'})} onMeldTileClick={(playerKey, meldIndex, tileIndex) => handleTileClick('meld', tileIndex, playerKey, { meldIndex })}/>
            </div>
            <div className="own-hand-area">
              <div className="hand-controls">
                  <div className="own-wind" onClick={handlePlayerWindChange} title="クリックして自風を切り替え">
                      {playerWindNames.self}
                  </div>
                  <button
                      className="meld-button"
                      onClick={() => setIsMeldModalOpen(true)}
                      disabled={meldCandidates.length === 0}
                      title={meldCandidates.length > 0 ? "鳴き候補を選択" : "鳴ける牌がありません"}
                  >
                      鳴く
                  </button>
              </div>
              <div className="hand-and-melds-container">
                <div className="hand-tiles-container">
                  {[...Array(MAX_HAND_SLOTS - numMelds * 3)].map((_, i) => (
                    <div key={i} className="hand-tile" onClick={() => (sortedHand[i] === undefined) && setSelection({ type: 'add_hand' })}>
                      {sortedHand[i] !== undefined ? ( // 存在する手牌
                        <div onClick={() => handleTileClick('hand', i)}>
                          <Tile tileNum={sortedHand[i]} size="hand" isSelected={selection.type === 'hand' && selection.index === i} />
                        </div>
                      ) : ( // 空のスロット
                        <div className="empty-slot">
                          {selection.type === 'add_hand' && <div className="selection-highlight"></div>}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="tsumo-tile">
                    {boardState.tsumo_tile !== null ? (
                      <div onClick={() => handleTileClick('tsumo')} style={{cursor: 'pointer'}}>
                        <Tile tileNum={boardState.tsumo_tile} size="tsumo" isSelected={selection.type === 'tsumo'} />
                      </div>
                    ) : (
                      (sortedHand.length + numMelds * 3) < 14 && // 手牌と面子の合計が14枚未満の場合のみツモ牌スロットを表示
                      <div className="empty-slot" onClick={() => setSelection({ type: 'add_tsumo' })}>
                        {selection.type === 'add_tsumo' && <div className="selection-highlight"></div>}
                      </div>
                    )}
                  </div>
                </div>
                <OwnMeldArea melds={boardState.melds.self} onMeldTileClick={(playerKey, meldIndex, tileIndex) => handleTileClick('meld', tileIndex, playerKey, { meldIndex })} selection={selection}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TileDisplayArea;