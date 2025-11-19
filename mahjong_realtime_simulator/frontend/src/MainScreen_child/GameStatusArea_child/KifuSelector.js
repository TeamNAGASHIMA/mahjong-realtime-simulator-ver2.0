// KifuSelector.js (スタイル修正版)

import React, { useState } from 'react';

const styles = {
  container: {
    width: '100%',
    flexGrow: 1, // ★★★ 変更: 高さを自動調整するように
    minHeight: 0, // ★★★ 追加: flexコンテナ内での縮小問題を防止
    backgroundColor: '#D9D9D9',
    padding: '10px',
    boxSizing: 'border-box',
    display: 'flex', // ★★★ 追加: flexレイアウトを有効化
    flexDirection: 'column', // ★★★ 追加: 子要素を縦に並べる
    borderRadius: '8px',
    color: '#333',
  },
  header: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '10px',
    paddingBottom: '5px',
    borderBottom: '1px solid #ccc',
    flexShrink: 0, // ヘッダーは縮まないようにする
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    overflowY: 'auto', // データが多い場合にスクロール
    flexGrow: 1, // 残りのスペースを埋める
  },
  listItem: {
    padding: '10px',
    cursor: 'pointer',
    borderBottom: '1px solid #eee',
    transition: 'background-color 0.2s',
  },
  selectedItem: {
    backgroundColor: '#77aaff',
    color: 'white',
    fontWeight: 'bold',
  }
};

// ダミーデータ
const dummyKifuData = [
  { id: 1, name: '2023-11-01_14-30.txt' },
  { id: 2, name: '2023-11-01_15-00.txt' },
  { id: 3, name: '2023-11-02_10-00.txt' },
];

const KifuSelector = () => {
  const [selectedKifu, setSelectedKifu] = useState(null);

  const handleSelect = (kifu) => {
    setSelectedKifu(kifu.id);
    console.log(`記録データ「${kifu.name}」が選択されました。`);
    // ここで選択されたデータを読み込む処理を呼び出す
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>記録データ選択</div>
      <ul style={styles.list}>
        {dummyKifuData.map(kifu => (
          <li
            key={kifu.id}
            style={
              selectedKifu === kifu.id
                ? { ...styles.listItem, ...styles.selectedItem }
                : styles.listItem
            }
            onClick={() => handleSelect(kifu)}
            onMouseOver={(e) => { if (selectedKifu !== kifu.id) e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
            onMouseOut={(e) => { if (selectedKifu !== kifu.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            {kifu.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default KifuSelector;