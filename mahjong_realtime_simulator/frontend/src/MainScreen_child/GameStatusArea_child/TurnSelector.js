// TurnSelector.js (import文とuseStateを修正した完全版)

import React, { useState, useEffect } from 'react'; // ★★★ 修正点1: useStateとuseEffectをインポート ★★★

// スタイル定義
const styles = {
  container: {
    width: '100%',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#8e44ad',
    borderRadius: '25px',
    padding: '0 10px',
    boxSizing: 'border-box',
    color: 'white',
    fontFamily: "'Inter', sans-serif",
    fontSize: '16px',
    fontWeight: 'bold',
  },
  arrowButton: {
    backgroundColor: '#9b59b6',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: '1',
    paddingBottom: '2px',
    boxSizing: 'border-box',
    transition: 'background-color 0.2s',
  },
  arrowButtonDisabled: {
    backgroundColor: '#71368a',
    color: '#a982bd',
    cursor: 'not-allowed',
  },
  selectContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  label: {
    marginRight: '10px',
  },
  select: {
    backgroundColor: '#9b59b6',
    color: 'white',
    border: '1px solid #8e44ad',
    borderRadius: '5px',
    padding: '5px 8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    outline: 'none',
  },
};

const TurnSelector = ({ selectedKifuData, onTurnChange }) => {
  const [selectedTurn, setSelectedTurn] = useState(1);
  // ★★★ 修正点2: isHoveredのuseState定義を復活 ★★★
  const [isHovered, setIsHovered] = useState({ left: false, right: false });

  const MAX_TURN = selectedKifuData?.length || 1;
  const MIN_TURN = 1;
  const isDisabled = !selectedKifuData || selectedKifuData.length === 0;

  useEffect(() => {
    // 牌譜データが変更されたら、巡目を1に戻す
    if (selectedKifuData && selectedKifuData.length > 0) {
      updateTurn(1);
    }
  }, [selectedKifuData]);

  const updateTurn = (newTurn) => {
    setSelectedTurn(newTurn);
    if(onTurnChange) { // onTurnChangeが存在するか確認
      onTurnChange(newTurn);
    }
    console.log(`巡目が ${newTurn} に変更されました。`);
  };

  const handleTurnChange = (e) => {
    updateTurn(Number(e.target.value));
  };

  const handleDecrement = () => {
    if (selectedTurn > MIN_TURN) {
      updateTurn(selectedTurn - 1);
    }
  };

  const handleIncrement = () => {
    if (selectedTurn < MAX_TURN) {
      updateTurn(selectedTurn + 1);
    }
  };
  
  // ★★★ 修正点3: マウスホバー処理を復活 ★★★
  const handleMouseOver = (button) => setIsHovered(prev => ({ ...prev, [button]: true }));
  const handleMouseOut = (button) => setIsHovered(prev => ({ ...prev, [button]: false }));


  return (
    <div style={styles.container}>
      <button
        style={{
          ...styles.arrowButton,
          ...(isDisabled || selectedTurn <= MIN_TURN ? styles.arrowButtonDisabled : {}),
          ...(isHovered.left && !isDisabled && selectedTurn > MIN_TURN && { backgroundColor: '#a569bd' })
        }}
        onClick={handleDecrement}
        disabled={isDisabled || selectedTurn <= MIN_TURN}
        onMouseOver={() => handleMouseOver('left')}
        onMouseOut={() => handleMouseOut('left')}
      >
        &#x25C0;
      </button>

      <div style={styles.selectContainer}>
        <label htmlFor="turn-select" style={styles.label}>巡目:</label>
        <select
          id="turn-select"
          style={styles.select}
          value={selectedTurn}
          onChange={handleTurnChange}
          disabled={isDisabled}
        >
          {[...Array(MAX_TURN > 0 ? MAX_TURN : 1)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
      </div>

      <button
        style={{
          ...styles.arrowButton,
          ...(isDisabled || selectedTurn >= MAX_TURN ? styles.arrowButtonDisabled : {}),
          ...(isHovered.right && !isDisabled && selectedTurn < MAX_TURN && { backgroundColor: '#a569bd' })
        }}
        onClick={handleIncrement}
        disabled={isDisabled || selectedTurn >= MAX_TURN}
        onMouseOver={() => handleMouseOver('right')}
        onMouseOut={() => handleMouseOut('right')}
      >
        &#x25B6;
      </button>
    </div>
  );
};

export default TurnSelector;