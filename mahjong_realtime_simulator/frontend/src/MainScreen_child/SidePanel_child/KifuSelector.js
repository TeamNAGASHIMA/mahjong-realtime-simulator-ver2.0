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

// ★★★ 変更点1: propsで `kifuFileList` と `onKifuSelect` を受け取る ★★★
const KifuSelector = ({ kifuFileList, onKifuSelect }) => {
  const [selectedKifuId, setSelectedKifuId] = useState(null);

  const handleSelect = (file) => {
    setSelectedKifuId(file.file_name); // 視覚的な選択状態を更新
    onKifuSelect(file.file_name);     // ★★★ 親コンポーネントの関数を呼び出す
  };

  // ★★★ 変更点2: kifuFileListが空の場合の表示を追加 ★★★
  if (!kifuFileList || kifuFileList.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>記録データ選択</div>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          利用可能な牌譜データがありません。
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>記録データ選択</div>
      <ul style={styles.list}>
        {/* ★★★ 変更点3: dummyKifuDataの代わりにkifuFileListをmapする ★★★ */}
        {kifuFileList.map(file => (
          <li
            key={file.file_name}
            style={
              selectedKifuId === file.file_name
                ? { ...styles.listItem, ...styles.selectedItem }
                : styles.listItem
            }
            onClick={() => handleSelect(file)}
            onMouseOver={(e) => { if (selectedKifuId !== file.file_name) e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
            onMouseOut={(e) => { if (selectedKifuId !== file.file_name) e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            {/* ファイル名と日付を表示 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{file.file_name}</span>
              <span style={{ fontSize: '0.8em', color: selectedKifuId === file.file_name ? '#fff' : '#888' }}>
                {new Date(file.date).toLocaleString()}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default KifuSelector;