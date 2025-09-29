import React, { useState } from 'react';

// スタイルオブジェクトの定義
const baseButtonStyles = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '16px', // 元のUI画像に合わせて少し調整
  color: '#333333', // 黒 (#000000) より少し柔らかく
  width: '100%', // 親要素の幅いっぱいに広がるように変更 (DD-UI-021-MAの固定幅は削除)
  height: '40px',
  backgroundColor: '#90ee90', // BEFB98 より一般的なライトグリーン
  border: '1px solid #7CFC00', // 少し濃い緑の枠線を追加
  borderRadius: '25px', // 元のUI画像に合わせて調整
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  // margin: '10px auto', // 親コンポーネントでレイアウトするため、ここでは削除
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  fontWeight: 'bold', // 文字を太く
  outline: 'none', // クリック時の青い枠線を消す
  transition: 'background-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out', // スムーズな変化
};

const hoverStyles = {
  backgroundColor: '#acec88', // CSSの :hover に対応
};

const activeStyles = {
  backgroundColor: '#98d973', // CSSの :active に対応
  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
};

const disabledStyles = {
    backgroundColor: '#cccccc',
    color: '#666666',
    cursor: 'not-allowed',
    border: '1px solid #bbbbbb',
    boxShadow: 'none',
};


const CalculationButton = ({ onClick, isLoading = false, isDisabled = false, text = "計算開始" }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    if (onClick && !isLoading && !isDisabled) {
      onClick();
    }
  };

  let currentStyle = { ...baseButtonStyles };

  if (isDisabled || isLoading) {
    currentStyle = { ...currentStyle, ...disabledStyles };
  } else {
    if (isActive) {
      currentStyle = { ...currentStyle, ...activeStyles };
    } else if (isHovered) {
      currentStyle = { ...currentStyle, ...hoverStyles };
    }
  }

  const buttonText = isLoading ? "計算中..." : text;

  return (
    <button
      style={currentStyle}
      onClick={handleClick}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => { setIsHovered(false); setIsActive(false); /* ホバーが外れたらactiveも解除 */}}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      onFocus={() => setIsHovered(true)} // キーボード操作でのフォーカスもホバー扱い
      onBlur={() => setIsHovered(false)}  // フォーカスが外れたらホバー解除
      disabled={isDisabled || isLoading}
    >
      {buttonText}
    </button>
  );
};

// このコンポーネントをエクスポートする場合
export default CalculationButton;

// このファイルを直接実行してテストする場合の例
// import ReactDOM from 'react-dom/client'; // ファイルの先頭に
// const AppMock = () => {
//     const [loading, setLoading] = useState(false);
//     const handleCalc = () => {
//         console.log("計算開始 button clicked");
//         setLoading(true);
//         setTimeout(() => setLoading(false), 2000);
//     };
//     return (
//         <div style={{padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', width: '300px', margin: '0 auto'}}>
//             <CalculationButton onClick={handleCalc} />
//             <CalculationButton onClick={handleCalc} isLoading={true} />
//             <CalculationButton onClick={handleCalc} isDisabled={true} />
//             <CalculationButton onClick={handleCalc} text="再計算する" />
//         </div>
//     );
// }
// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(<AppMock />);