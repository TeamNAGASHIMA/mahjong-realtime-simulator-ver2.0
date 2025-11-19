import React, { useState } from 'react';

// ==============================================================================
// ▼▼▼ スタイル定義 (変更箇所) ▼▼▼
// ==============================================================================

// --- アニメーションのキーフレーム定義 ---
// Reactコンポーネント内に<style>タグを埋め込むことで、このコンポーネント専用のCSSアニメーションを定義します。
const keyframes = `
  @keyframes dot-bounce {
    0%, 80%, 100% {
      transform: translateY(0);
      opacity: 0.6;
    }
    40% {
      transform: translateY(-5px);
      opacity: 1;
    }
  }
`;

// --- ボタンの基本スタイル ---
const baseButtonStyles = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '16px',
  color: '#333333',
  width: '100%',
  height: '40px',
  backgroundColor: '#90ee90',
  border: '1px solid #7CFC00',
  borderRadius: '25px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  fontWeight: 'bold',
  outline: 'none',
  transition: 'background-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
};

const hoverStyles = {
  backgroundColor: '#acec88',
};

const activeStyles = {
  backgroundColor: '#98d973',
  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
};

const disabledStyles = {
  backgroundColor: '#cccccc',
  color: '#666666',
  cursor: 'not-allowed',
  border: '1px solid #bbbbbb',
  boxShadow: 'none',
};

// --- ローディングアニメーションのスタイル ---
const loadingContainerStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const loadingDotsContainerStyles = {
  display: 'flex',
  marginLeft: '8px', // "計算中..."との間隔
};

const loadingDotStyles = {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  backgroundColor: '#666666', // disabled時の文字色に合わせる
  animation: 'dot-bounce 1.4s infinite ease-in-out both',
  margin: '0 2px',
};
// ==============================================================================
// ▲▲▲ スタイル定義 (ここまで) ▲▲▲
// ==============================================================================


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

  return (
    <>
      {/* keyframesをコンポーネント内に注入 */}
      <style>{keyframes}</style>
      <button
        style={currentStyle}
        onClick={handleClick}
        onMouseOver={() => setIsHovered(true)}
        onMouseOut={() => { setIsHovered(false); setIsActive(false); }}
        onMouseDown={() => setIsActive(true)}
        onMouseUp={() => setIsActive(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        disabled={isDisabled || isLoading}
      >
        {isLoading ? (
          // 計算中の表示
          <div style={loadingContainerStyles}>
            <span>計算中</span>
            <div style={loadingDotsContainerStyles}>
              <span style={{ ...loadingDotStyles, animationDelay: '-0.32s' }}></span>
              <span style={{ ...loadingDotStyles, animationDelay: '-0.16s' }}></span>
              <span style={loadingDotStyles}></span>
            </div>
          </div>
        ) : (
          // 通常時の表示
          text
        )}
      </button>
    </>
  );
};

export default CalculationButton;