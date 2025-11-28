// Header/MahjongRulesPage.js
import React from 'react';

import score from '../img/score.png'; // パスはあなたの環境に合わせてください
import yakuList1 from '../img/yaku-list-1.png';
import yakuList2 from '../img/yaku-list-2.png';

export const MahjongRulesPage = () => {
  // スタイルを定義
  const styles = {
    // コンテナ：縦に長くなりすぎたらスクロールできるようにする
    container: {
      maxHeight: '70vh', // 画面の高さの70%を上限にする
      overflowY: 'auto', // 縦方向にスクロール可能にする
      paddingRight: '10px', // スクロールバーのための余白
    },
    // 画像：コンテナの横幅いっぱいに広がるようにする
    image: {
      width: '100%',
      height: 'auto',
      marginBottom: '15px', // 画像間の余白
      display: 'block', // 画像が中央揃えなどになりやすくする
    },
  };

  return (
    <div style={styles.container}>
      <img src={yakuList1} style={styles.image} alt="役一覧1" />
      <img src={yakuList2} style={styles.image} alt="役一覧2" />
      <img src={score} style={styles.image} alt="点数表" />
    </div>
  );
};

export default MahjongRulesPage;