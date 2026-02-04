// WinTileSelectorModal.js
import React from 'react';

const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 20000 },
    content: { backgroundColor: '#2c3e50', padding: '30px', borderRadius: '15px', textAlign: 'center', color: 'white', boxShadow: '0 0 20px rgba(0,0,0,0.5)', maxWidth: '90%' },
    tileContainer: { display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: '20px', marginBottom: '30px', padding: '15px', backgroundColor: '#1a252f', borderRadius: '10px' },
    tileWrapper: { cursor: 'pointer', transition: 'transform 0.2s', border: '2px solid transparent', borderRadius: '4px' },
    instruction: { fontSize: '20px', fontWeight: 'bold', color: '#f1c40f' },
    tileImg: { width: '50px', height: '75px', display: 'block', borderRadius: '4px', backgroundColor: '#2c3e50' } // 画像がない場合の背景色を追加
};

export const WinTileSelectorModal = ({ isOpen, handTiles, tsumoTile, onSelect, tileImages, tileNumToName }) => {
    if (!isOpen) return null;

    // --- 修正箇所 1 & 2: データのクリーニング ---
    // 配列を展開
    let allTiles = [...(handTiles || [])];

    // tsumoTile が null でも undefined でもない場合のみ追加
    if (tsumoTile !== null && tsumoTile !== undefined) {
        allTiles.push(tsumoTile);
    }

    // null や undefined が混入していないかフィルタリング（これが15枚目の空白牌を消します）
    allTiles = allTiles.filter(tile => tile !== null && tile !== undefined);

    const handleTileClick = (tileNum) => {
        if (window.confirm('この牌を和了牌として確定しますか？')) {
            onSelect(tileNum);
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.content}>
                <div style={styles.instruction}>和了型を検出しました！</div>
                <div style={{ marginTop: '10px' }}>あがり牌（最後に引いた牌、またはロンした牌）を以下から選んでください。</div>
                
                <div style={styles.tileContainer}>
                    {allTiles.map((tileNum, index) => {
                        // --- 修正箇所 3: 画像表示の安全策 ---
                        const imgKey = tileNumToName ? tileNumToName[tileNum] : null;
                        const src = (tileImages && imgKey) ? tileImages[imgKey] : null;

                        // 画像が見つからない場合はレンダリングしない、またはプレースホルダーを表示
                        if (!src) return null;

                        return (
                            <div 
                                key={index} 
                                style={styles.tileWrapper} 
                                onClick={() => handleTileClick(tileNum)}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <img src={src} alt={`tile-${tileNum}`} style={styles.tileImg} />
                            </div>
                        );
                    })}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>※牌をクリックすると確定します。</div>
            </div>
        </div>
    );
};