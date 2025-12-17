// GameStatusArea_child/TurnSelector.js

import React, { useState } from 'react';

const styles = {
  container: {
    width: '100%',     // 親要素(flex: 1)いっぱいに広げる
    height: '40px',    // 他のボタンと高さを揃える
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#8e44ad',
    borderRadius: '25px', // RecordButtonと同じ角丸
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
    position: 'relative', // selectを重ねるため
  },
  // セレクトボックスのスタイル（文字色を白に、背景透明）
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
    appearance: 'none', // ブラウザ標準の矢印を消す
    WebkitAppearance: 'none',
    textOverflow: 'ellipsis',
  },
};

const TurnSelector = ({ currentTurnIndex, kifuData, onTurnChange }) => {
  const [isHovered, setIsHovered] = useState({ left: false, right: false });

  const dataLength = kifuData ? kifuData.length : 0;
  const currentIndex = currentTurnIndex || 1;
  const isDisabled = dataLength === 0;

  const handleDecrement = () => {
    if (currentIndex > 1) {
      onTurnChange(currentIndex - 1);
    }
  };

  const handleIncrement = () => {
    if (currentIndex < dataLength) {
      onTurnChange(currentIndex + 1);
    }
  };

  const handleSelectChange = (e) => {
    onTurnChange(Number(e.target.value));
  };

  const handleMouseOver = (button) => setIsHovered(prev => ({ ...prev, [button]: true }));
  const handleMouseOut = (button) => setIsHovered(prev => ({ ...prev, [button]: false }));

  return (
    <div style={styles.container}>
      <button
        style={{
          ...styles.arrowButton,
          ...(isDisabled || currentIndex <= 1 ? styles.arrowButtonDisabled : {}),
          ...(isHovered.left && !isDisabled && currentIndex > 1 && { backgroundColor: '#a569bd' })
        }}
        onClick={handleDecrement}
        disabled={isDisabled || currentIndex <= 1}
        onMouseOver={() => handleMouseOver('left')}
        onMouseOut={() => handleMouseOut('left')}
      >
        &#x25C0;
      </button>

      <div style={styles.selectContainer}>
        <select
          id="turn-select"
          style={styles.select}
          value={currentIndex}
          onChange={handleSelectChange}
          disabled={isDisabled}
        >
          {kifuData && kifuData.map((item, index) => (
            // optionタグ内の文字色はブラウザによって制御が難しいため黒にするのが無難
            <option key={index} value={index + 1} style={{color: 'black'}}>
              {`${index + 1}手目 (${item.turn}巡)`}
            </option>
          ))}
        </select>
      </div>

      <button
        style={{
          ...styles.arrowButton,
          ...(isDisabled || currentIndex >= dataLength ? styles.arrowButtonDisabled : {}),
          ...(isHovered.right && !isDisabled && currentIndex < dataLength && { backgroundColor: '#a569bd' })
        }}
        onClick={handleIncrement}
        disabled={isDisabled || currentIndex >= dataLength}
        onMouseOver={() => handleMouseOver('right')}
        onMouseOut={() => handleMouseOut('right')}
      >
        &#x25B6;
      </button>
    </div>
  );
};

export default TurnSelector;