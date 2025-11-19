// CameraPreview.js (スタイル修正版)

import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';

// スタイル定義
const styles = {
  // ★★★ このコンテナのスタイルを修正 ★★★
  cameraPreviewScreen: { 
    width: '100%', 
    backgroundColor: '#D9D9D9', 
    padding: '10px', 
    boxSizing: 'border-box', 
    display: 'flex',         // flexレイアウトを有効化
    flexDirection: 'column', // 子要素を縦に並べる
    borderRadius: '8px', 
    height: '100%',          // 親要素(topSection)の高さに合わせる
    minHeight: 0,            // はみ出し防止
  },
  contentWrapper: {
    flex: '1 1 0', // 利用可能なスペースを埋める
    minHeight: 0,
    overflowY: 'auto', // コンテンツが多い場合はスクロール
    display: 'flex',
    flexDirection: 'column',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '12px', color: '#333', flexShrink: 0 },
  toggleButton: { fontFamily: "'Inter', sans-serif", fontSize: '12px', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', border: '1px solid #eda040', transition: 'background-color 0.2s, color 0.2s', color: '#000000', backgroundColor: '#E39C40', whiteSpace: 'nowrap', },
  previewSection: { marginBottom: '15px', },
  previewHeader: { fontSize: '12px', color: '#555', marginBottom: '5px', },
  previewBox: { width: '100%', height: 'auto', aspectRatio: '16 / 9', backgroundColor: '#000000', border: '1px solid #333', borderRadius: '4px', display: 'block', },
  recognitionButton: { width: '100%', padding: '8px', fontSize: '13px', marginTop: '10px', cursor: 'pointer', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px', },
  flipButtonsContainer: { display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '8px', },
  flipButton: { padding: '4px 8px', fontSize: '12px', marginLeft: 0, minWidth: '80px', border: '1px solid #aaa', borderRadius: '4px', backgroundColor: '#f0f0f0', cursor: 'pointer', transition: 'background-color 0.2s, border-color 0.2s', },
  flipButtonActive: { backgroundColor: '#77aaff', color: '#fff', fontWeight: 'bold', borderColor: '#5588dd', },
  buttonHover: { backgroundColor: '#e0e0e0', borderColor: '#888', }
};

const CameraPreview = forwardRef(({
  // ... (propsは変更なし)
  isRecognizing, boardCameraId, handCameraId, boardFlip, setBoardFlip, handFlip, setHandFlip, guideFrameColor
}, ref) => {
  // ... (コンポーネント内のロジックは変更なし)
  const [isSupportMode, setIsSupportMode] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);
  const boardVideoRef = useRef(null);
  const handVideoRef = useRef(null);
  const guideFrameStyle = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', height: '100%', aspectRatio: '1 / 1', border: `3px solid ${guideFrameColor}`, boxSizing: 'border-box', pointerEvents: 'none' };
  useEffect(() => { /* ... */ }, [boardCameraId]);
  useEffect(() => { /* ... */ }, [handCameraId]);
  useImperativeHandle(ref, () => ({ /* ... */ }));
  const handleFlip = (cameraType, axis) => { const setter = cameraType === 'board' ? setBoardFlip : setHandFlip; setter(prev => ({ ...prev, [axis]: !prev[axis] })); };
  const getTransform = (flipState) => `scale(${flipState.horizontal ? -1 : 1}, ${flipState.vertical ? -1 : 1})`;
  const handleToggle = () => setIsSupportMode(prev => !prev);


  return (
    <div style={styles.cameraPreviewScreen}>
      <div style={styles.header}>
        <span>{isSupportMode ? 'サポート' : 'カメラプレビュー'}</span>
        <button style={styles.toggleButton} onClick={handleToggle}> {isSupportMode ? 'カメラプレビュー' : 'サポート'} </button>
      </div>

      <div style={{ display: isSupportMode ? 'flex' : 'none', flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>
        <p>サポート情報はこちらに表示されます。</p>
      </div>

      {/* ★★★ プレビュー部分をスクロール可能なコンテナで囲む ★★★ */}
      <div style={{ ...styles.contentWrapper, display: isSupportMode ? 'none' : 'flex' }}>
        <div style={styles.previewSection}>
          <div style={styles.previewHeader}>盤面</div>
          <div style={{ position: 'relative', width: '100%' }}>
            <video ref={boardVideoRef} style={{ ...styles.previewBox, transform: getTransform(boardFlip) }} autoPlay playsInline muted></video>
            {guideFrameColor !== 'none' && <div style={guideFrameStyle}></div>}
          </div>
          <div style={styles.flipButtonsContainer}>
            <button style={{ ...styles.flipButton, ...(boardFlip.horizontal && styles.flipButtonActive), ...(!boardFlip.horizontal && hoveredButton === 'board_h' && styles.buttonHover) }} onClick={() => handleFlip('board', 'horizontal')} onMouseOver={() => setHoveredButton('board_h')} onMouseOut={() => setHoveredButton(null)}>左右反転</button>
            <button style={{ ...styles.flipButton, ...(boardFlip.vertical && styles.flipButtonActive), ...(!boardFlip.vertical && hoveredButton === 'board_v' && styles.buttonHover) }} onClick={() => handleFlip('board', 'vertical')} onMouseOver={() => setHoveredButton('board_v')} onMouseOut={() => setHoveredButton(null)}>上下反転</button>
          </div>
          <button disabled={isRecognizing} style={{...styles.recognitionButton, cursor: isRecognizing ? 'wait' : 'pointer'}}> {isRecognizing ? '認識中...' : '盤面全体を認識 (計算と同時実行)'} </button>
        </div>
        <div style={styles.previewSection}>
          <div style={styles.previewHeader}>手牌</div>
          <video ref={handVideoRef} style={{ ...styles.previewBox, transform: getTransform(handFlip) }} autoPlay playsInline muted></video>
          <div style={styles.flipButtonsContainer}>
            <button style={{ ...styles.flipButton, ...(handFlip.horizontal && styles.flipButtonActive), ...(!handFlip.horizontal && hoveredButton === 'hand_h' && styles.buttonHover) }} onClick={() => handleFlip('hand', 'horizontal')} onMouseOver={() => setHoveredButton('hand_h')} onMouseOut={() => setHoveredButton(null)}>左右反転</button>
            <button style={{ ...styles.flipButton, ...(handFlip.vertical && styles.flipButtonActive), ...(!handFlip.vertical && hoveredButton === 'hand_v' && styles.buttonHover) }} onClick={() => handleFlip('hand', 'vertical')} onMouseOver={() => setHoveredButton('hand_v')} onMouseOut={() => setHoveredButton(null)}>上下反転</button>
          </div>
          <button disabled={isRecognizing} style={{...styles.recognitionButton, cursor: isRecognizing ? 'wait' : 'pointer'}}> {isRecognizing ? '認識中...' : '自分の手牌を認識 (計算と同時実行)'} </button>
        </div>
      </div>
    </div>
  );
});

export default CameraPreview;