// Header/ReferenceLinks.js
import React from 'react';

export const ReferenceLinks = () => {
  const localStyles = {
    linkList: { listStyle: 'none', padding: 0 },
    linkItem: { marginBottom: '15px', padding: '15px', backgroundColor: '#3a3a3a', borderRadius: '4px', transition: 'background-color 0.2s ease' },
    linkAnchor: { color: '#8ab4f8', textDecoration: 'none', fontSize: '16px', fontWeight: 'bold', display: 'block' },
    linkDescription: { color: '#ccc', fontSize: '14px', marginTop: '8px' },
  };

  const handleMouseOver = (e) => { e.currentTarget.style.backgroundColor = '#4a4a4a'; };
  const handleMouseOut = (e) => { e.currentTarget.style.backgroundColor = '#3a3a3a'; };

  const links = [
    { url: 'https://pystyle.info/apps/mahjong-nanikiru-simulator/', title: '計算実行プログラム', description: '本アプリケーションの基本的な使い方や機能について詳しく解説しています。' },
    { url: '#', title: 'よくある質問 (FAQ)', description: 'ユーザーから多く寄せられる質問とその回答をまとめています。問題が発生した際はこちらを最初にご確認ください。' },
    { url: '#', title: 'コミュニティフォーラム', description: '他のユーザーと情報交換をしたり、質問をしたりすることができます。' },
    { url: '#', title: '麻雀の基本ルール', description: '麻雀のルールがわからない方向けの、基本的なルール解説ページです。' },
  ];

  return (
    <ul style={localStyles.linkList}>
      {links.map((link, index) => (
        <li key={index} style={localStyles.linkItem} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
          <a href={link.url} target="_blank" rel="noopener noreferrer" style={localStyles.linkAnchor}>{link.title}</a>
          <p style={localStyles.linkDescription}>{link.description}</p>
        </li>
      ))}
    </ul>
  );
};