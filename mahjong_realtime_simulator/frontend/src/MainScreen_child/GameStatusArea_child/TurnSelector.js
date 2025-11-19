// TurnSelector.js (矢印ボタン追加版)

import React, { useState } from 'react';

// スタイル定義
const styles = {
  container: {
    width: '100%',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between', // 要素を均等に配置
    backgroundColor: '#8e44ad',
    borderRadius: '25px',
    padding: '0 10px', // 左右のパディングを少し調整
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
    borderRadius: '50%', // 円形にする
    width: '28px',       // サイズ指定
    height: '28px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: '1',     // テキストの垂直位置を調整
    paddingBottom: '2px', // 見た目の微調整
    boxSizing: 'border-box',
    transition: 'background-color 0.2s',
  },
  arrowButtonDisabled: { // 無効化時のスタイル
    backgroundColor: '#71368a',
    color: '#a982bd',
    cursor: 'not-allowed',
  },
  selectContainer: { // 中央のselect要素をFlexboxで中央揃えにする
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1, // 利用可能なスペースを埋める
  },
  label: {
    marginRight: '10px',
  },
  select: {
    backgroundColor: '#9b59b6',
    color: 'white',
    border: '1px solid #8e44ad',
    borderRadius: '5px',
    padding: '5px 8px', // パディング調整
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    outline: 'none',
  },
};

const TurnSelector = () => {
  const [selectedTurn, setSelectedTurn] = useState(1);
  const [isHovered, setIsHovered] = useState({ left: false, right: false });

  const MAX_TURN = 18;
  const MIN_TURN = 1;

  // ドロップダウンで変更されたときのハンドラ
  const handleTurnChange = (e) => {
    const newTurn = Number(e.target.value);
    setSelectedTurn(newTurn);
    console.log(`巡目が ${newTurn} に変更されました。`);
    // ここで選択された巡目に応じた処理を呼び出す
  };

  // 左矢印ボタンのハンドラ
  const handleDecrement = () => {
    if (selectedTurn > MIN_TURN) {
      const newTurn = selectedTurn - 1;
      setSelectedTurn(newTurn);
      console.log(`巡目が ${newTurn} に変更されました。`);
      // ここで選択された巡目に応じた処理を呼び出す
    }
  };

  // 右矢印ボタンのハンドラ
  const handleIncrement = () => {
    if (selectedTurn < MAX_TURN) {
      const newTurn = selectedTurn + 1;
      setSelectedTurn(newTurn);
      console.log(`巡目が ${newTurn} に変更されました。`);
      // ここで選択された巡目に応じた処理を呼び出す
    }
  };
  
  // マウスホバー処理
  const handleMouseOver = (button) => setIsHovered(prev => ({ ...prev, [button]: true }));
  const handleMouseOut = (button) => setIsHovered(prev => ({ ...prev, [button]: false }));


  return (
    <div style={styles.container}>
      {/* 左矢印ボタン */}
      <button
        style={{
          ...styles.arrowButton,
          ...(selectedTurn <= MIN_TURN && styles.arrowButtonDisabled),
          ...(isHovered.left && selectedTurn > MIN_TURN && { backgroundColor: '#a569bd' }) // ホバー効果
        }}
        onClick={handleDecrement}
        disabled={selectedTurn <= MIN_TURN}
        onMouseOver={() => handleMouseOver('left')}
        onMouseOut={() => handleMouseOut('left')}
      >
        &#x25C0; {/* 左向きの黒三角 */}
      </button>

      {/* 中央の巡目選択 */}
      <div style={styles.selectContainer}>
        <label htmlFor="turn-select" style={styles.label}>巡目:</label>
        <select
          id="turn-select"
          style={styles.select}
          value={selectedTurn}
          onChange={handleTurnChange}
        >
          {[...Array(MAX_TURN)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
      </div>

      {/* 右矢印ボタン */}
      <button
        style={{
          ...styles.arrowButton,
          ...(selectedTurn >= MAX_TURN && styles.arrowButtonDisabled),
          ...(isHovered.right && selectedTurn < MAX_TURN && { backgroundColor: '#a569bd' }) // ホバー効果
        }}
        onClick={handleIncrement}
        disabled={selectedTurn >= MAX_TURN}
        onMouseOver={() => handleMouseOver('right')}
        onMouseOut={() => handleMouseOut('right')}
      >
        &#x25B6; {/* 右向きの黒三角 */}
      </button>
    </div>
  );
};

export default TurnSelector;