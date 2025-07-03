import React from 'react';

// --- src/img/ から画像をすべてインポート ---
import M1 from './img/M1.png';
import M2 from './img/M2.png';
import M3 from './img/M3.png';
import M4 from './img/M4.png';
import M5 from './img/M5.png';
import M6 from './img/M6.png';
import M7 from './img/M7.png';
import M8 from './img/M8.png';
import M9 from './img/M9.png';

import P1 from './img/P1.png';
import P2 from './img/P2.png';
import P3 from './img/P3.png';
import P4 from './img/P4.png';
import P5 from './img/P5.png';
import P6 from './img/P6.png';
import P7 from './img/P7.png';
import P8 from './img/P8.png';
import P9 from './img/P9.png';

import S1 from './img/S1.png';
import S2 from './img/S2.png';
import S3 from './img/S3.png';
import S4 from './img/S4.png';
import S5 from './img/S5.png';
import S6 from './img/S6.png';
import S7 from './img/S7.png';
import S8 from './img/S8.png';
import S9 from './img/S9.png';

import Z1 from './img/Z1.png'; // 東
import Z2 from './img/Z2.png'; // 南
import Z3 from './img/Z3.png'; // 西
import Z4 from './img/Z4.png'; // 北
import Z5 from './img/Z5.png'; // 白
import Z6 from './img/Z6.png'; // 發
import Z7 from './img/Z7.png'; // 中

import RM5 from './img/RM5.png'; // 赤五萬
import RP5 from './img/RP5.png'; // 赤五筒
import RS5 from './img/RS5.png'; // 赤五索

// 牌の数値とインポートした画像オブジェクトを対応付ける
const tileImageMap = {
  0: M1, 1: M2, 2: M3, 3: M4, 4: M5, 5: M6, 6: M7, 7: M8, 8: M9,
  9: P1, 10: P2, 11: P3, 12: P4, 13: P5, 14: P6, 15: P7, 16: P8, 17: P9,
  18: S1, 19: S2, 20: S3, 21: S4, 22: S5, 23: S6, 24: S7, 25: S8, 26: S9,
  27: Z1, 28: Z2, 29: Z3, 30: Z4, 31: Z5, 32: Z6, 33: Z7,
  34: RM5, 35: RP5, 36: RS5
};

/**
 * 牌の画像を表示するコンポーネント
 * @param {object} props
 * @param {'smallResult' | string} props.type - スタイルの種類
 * @param {number} props.tileNum - 表示する牌の番号 (0-36)
 */
const MahjongTile = ({ type, tileNum }) => {
  const imageUrl = tileImageMap[tileNum]; // マップから画像を取得
  if (!imageUrl) return null; // 不正な牌番号の場合は何も表示しない

  const styles = {
    // CalculationResultsで使う小さい牌のスタイル
    smallResult: {
      width: '22px',
      height: 'auto',
      verticalAlign: 'middle',
      boxShadow: '1px 1px 2px rgba(0,0,0,0.2)',
      borderRadius: '2px',
    },
  };

  const style = styles[type] || styles.smallResult;

  return <img src={imageUrl} alt={`牌 ${tileNum}`} style={style} />;
};

export default MahjongTile;