import React, { useState } from 'react';

// 牌の画像URLを返すヘルパー関数
const getTileSrc = (tileId) =>
    `./img/${tileId.toUpperCase()}.png`;

// Tileコンポーネント
function Tile({ tileId, onClick, disabled = false, isInHand = false }) {
    const [isHovered, setIsHovered] = useState(false);

    // --- スタイル定義 ---
    const baseStyle = {
        width: '40px',
        height: '60px',
        border: '1px solid #999',
        borderRadius: '4px',
        backgroundColor: 'white',
        boxShadow: '1px 1px 3px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.1s ease',
        cursor: 'pointer',
        userSelect: 'none',
    };

    const hoverStyle = {
        transform: 'scale(1.05)',
        boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.3)',
    };
    
    // 手牌にある牌がホバーされた時の追加スタイル
    const handHoverStyle = {
        position: 'relative',
        bottom: '5px',
    };

    const disabledStyle = {
        opacity: 0.4,
        cursor: 'not-allowed',
        filter: 'grayscale(90%)',
    };

    // 状態に応じて最終的なスタイルを組み立てる
    let finalStyle = { ...baseStyle };
    if (isHovered && !disabled) {
        finalStyle = { ...finalStyle, ...hoverStyle };
        if (isInHand) {
            finalStyle = { ...finalStyle, ...handHoverStyle };
        }
    }
    if (disabled) {
        finalStyle = { ...finalStyle, ...disabledStyle };
    }

    return (
        <img
            src={getTileSrc(tileId)}
            style={finalStyle}
            onClick={() => !disabled && onClick()}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            alt={tileId}
        />
    );
}

export default Tile;