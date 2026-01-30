// GameStatusArea_child/TurnSelector.js

import React, { useState } from 'react';

const styles = {
  container: {
    width: '100%',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#8e44ad',
    borderRadius: '25px',
    padding: '0 5px',
    boxSizing: 'border-box',
    color: 'white',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  arrowButton: {
    backgroundColor: '#9b59b6',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '30px', 
    height: '30px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: '1',
    flexShrink: 0, 
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
    minWidth: 0, 
    margin: '0 5px',
    position: 'relative',
  },
  select: {
    backgroundColor: 'transparent',
    color: 'white',
    border: 'none',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    outline: 'none',
    width: '100%',
    textAlign: 'center',
    appearance: 'none',
    WebkitAppearance: 'none',
    textOverflow: 'ellipsis',
  },
};

// ★★★ 修正: Propsを currentIndex (何手目か) と onIndexChange に変更 ★★★
// 親コンポーネントでは、stateとして「現在のインデックス(0始まり)」を管理してください。
const TurnSelector = ({ currentIndex, kifuData, onIndexChange }) => {
  const [isHovered, setIsHovered] = useState({ left: false, right: false });

  const isDisabled = !kifuData || kifuData.length === 0;

  // ★★★ 修正: findIndexは不要。propsのcurrentIndexをそのまま信用する ★★★
  // const currentIndex = isDisabled ? -1 : kifuData.findIndex(item => item.turn === currentTurn);

  const handleDecrement = () => {
    // ★★★ 修正: インデックスを減らす ★★★
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  };

  const handleIncrement = () => {
    // ★★★ 修正: インデックスを増やす ★★★
    if (currentIndex < kifuData.length - 1) {
      onIndexChange(currentIndex + 1);
    }
  };

  const handleSelectChange = (e) => {
    // ★★★ 修正: 選択されたインデックスを渡す ★★★
    onIndexChange(Number(e.target.value));
  };

  const handleMouseOver = (button) => setIsHovered(prev => ({ ...prev, [button]: true }));
  const handleMouseOut = (button) => setIsHovered(prev => ({ ...prev, [button]: false }));

  return (
    <div style={styles.container}>
      <button
        style={{
          ...styles.arrowButton,
          ...(isDisabled || currentIndex <= 0 ? styles.arrowButtonDisabled : {}),
          ...(isHovered.left && !isDisabled && currentIndex > 0 && { backgroundColor: '#a569bd' })
        }}
        onClick={handleDecrement}
        disabled={isDisabled || currentIndex <= 0}
        onMouseOver={() => handleMouseOver('left')}
        onMouseOut={() => handleMouseOut('left')}
      >
        &#x25C0;
      </button>

      <div style={styles.selectContainer}>
        <select
          id="turn-select"
          style={styles.select}
          // ★★★ 修正: valueにはインデックスを使用 ★★★
          value={currentIndex}
          onChange={handleSelectChange}
          disabled={isDisabled}
        >
          {kifuData && kifuData.map((item, index) => (
            // ★★★ 修正: valueにindex(一意な値)を設定 ★★★
            <option key={index} value={index} style={{color: 'black'}}>
              {`${index + 1}手目 (${item.turn}巡)`}
            </option>
          ))}
        </select>
      </div>

      <button
        style={{
          ...styles.arrowButton,
          // ★★★ 修正: インデックスで判定 ★★★
          ...(isDisabled || currentIndex >= kifuData.length - 1 ? styles.arrowButtonDisabled : {}),
          ...(isHovered.right && !isDisabled && currentIndex < kifuData.length - 1 && { backgroundColor: '#a569bd' })
        }}
        onClick={handleIncrement}
        disabled={isDisabled || currentIndex >= kifuData.length - 1}
        onMouseOver={() => handleMouseOver('right')}
        onMouseOut={() => handleMouseOut('right')}
      >
        &#x25B6;
      </button>
    </div>
  );
};

export default TurnSelector;