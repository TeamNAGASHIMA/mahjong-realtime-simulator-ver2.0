import React from 'react';

// 親コンポーネントから onShowRules 関数を受け取る
export const ReferenceLinks = ({ onShowRules }) => {
  const localStyles = {
    linkList: { listStyle: 'none', padding: 0 },
    linkItem: { marginBottom: '15px', padding: '15px', backgroundColor: '#3a3a3a', borderRadius: '4px', transition: 'background-color 0.2s ease' },
    linkAnchor: { color: '#8ab4f8', textDecoration: 'none', fontSize: '16px', fontWeight: 'bold', display: 'block' },
    // クリック可能な要素のためのスタイルを追加
    clickableTitle: { color: '#8ab4f8', textDecoration: 'none', fontSize: '16px', fontWeight: 'bold', display: 'block', cursor: 'pointer' },
    linkDescription: { color: '#ccc', fontSize: '14px', marginTop: '8px' },
  };

  const handleMouseOver = (e) => { e.currentTarget.style.backgroundColor = '#4a4a4a'; };
  const handleMouseOut = (e) => { e.currentTarget.style.backgroundColor = '#3a3a3a'; };

  const links = [
    { 
      type: 'external', // 外部リンク
      url: 'https://pystyle.info/apps/mahjong-nanikiru-simulator/', 
      title: '計算実行プログラム', 
      description: '本アプリケーションの基本的な使い方や機能について詳しく解説しています。' 
    },
    { 
      type: 'external', // 外部リンク
      url: 'https://universe.roboflow.com/mahjong-rep95/mahjong-ma2nf/model/4', 
      title: 'AIモデルの学習データ', 
      description: '本アプリケーションで使用しているAIモデルの学習データセットです。' 
    },
    {
      type: 'internal', // 内部遷移
      action: onShowRules, // 親から渡された関数
      title: '麻雀の基本ルール',
      description: '麻雀のルールがわからない方向けの、基本的なルール解説ページです。'
    },
  ];

  return (
    <ul style={localStyles.linkList}>
      {links.map((link, index) => (
        <li key={index} style={localStyles.linkItem} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
          {link.type === 'external' ? (
            // 外部リンクの場合は <a> タグ
            <a href={link.url} target="_blank" rel="noopener noreferrer" style={localStyles.linkAnchor}>
              {link.title}
            </a>
          ) : (
            // 内部遷移の場合は onClick を持つ <div>
            <div onClick={link.action} style={localStyles.clickableTitle}>
              {link.title}
            </div>
          )}
          {link.description && <p style={localStyles.linkDescription}>{link.description}</p>}
        </li>
      ))}
    </ul>
  );
};

export default ReferenceLinks;
