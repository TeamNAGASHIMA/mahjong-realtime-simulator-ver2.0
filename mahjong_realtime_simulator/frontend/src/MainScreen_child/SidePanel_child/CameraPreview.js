// CameraPreview.js

import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';

// スタイル定義
const styles = {
  cameraPreviewScreen: { width: '100%', backgroundColor: '#D9D9D9', padding: '10px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', borderRadius: '8px', },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '12px', color: '#333', },
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
  isRecognizing,
  boardCameraId,
  handCameraId,
  // ▼▼▼ 親(SidePanel経由でMainScreen)から反転状態と更新関数を受け取ります ▼▼▼
  boardFlip,
  setBoardFlip,
  handFlip,
  setHandFlip
}, ref) => {
  const [isSupportMode, setIsSupportMode] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);
  const boardVideoRef = useRef(null);
  const handVideoRef = useRef(null);

  // 盤面カメラの映像を表示するuseEffect
  useEffect(() => {
    let activeStream = null;
    if (boardCameraId) {
      const constraints = { video: { deviceId: { exact: boardCameraId } } };
      navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => { activeStream = stream; if (boardVideoRef.current) { boardVideoRef.current.srcObject = stream; } })
        .catch(err => console.error(`プレビュー - 盤面カメラ(ID: ${boardCameraId})起動失敗:`, err));
    }
    return () => {
      if (activeStream) activeStream.getTracks().forEach(track => track.stop());
      if (boardVideoRef.current) boardVideoRef.current.srcObject = null;
    };
  }, [boardCameraId]);

  // 手牌カメラの映像を表示するuseEffect
  useEffect(() => {
    let activeStream = null;
    if (handCameraId) {
      const constraints = { video: { deviceId: { exact: handCameraId } } };
      navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => { activeStream = stream; if (handVideoRef.current) { handVideoRef.current.srcObject = stream; } })
        .catch(err => console.error(`プレビュー - 手牌カメラ(ID: ${handCameraId})起動失敗:`, err));
    }
    return () => {
      if (activeStream) activeStream.getTracks().forEach(track => track.stop());
      if (handVideoRef.current) handVideoRef.current.srcObject = null;
    };
  }, [handCameraId]);

  // 親に画像データを渡すための関数
  useImperativeHandle(ref, () => ({
    getPreviewImages: () => {
      const captureFrame = (videoElement, flipState) => {
        if (!videoElement || !videoElement.srcObject || videoElement.videoWidth === 0) return null;
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext('2d');
        const scaleX = flipState.horizontal ? -1 : 1; const scaleY = flipState.vertical ? -1 : 1;
        const translateX = flipState.horizontal ? canvas.width : 0; const translateY = flipState.vertical ? canvas.height : 0;
        ctx.translate(translateX, translateY); ctx.scale(scaleX, scaleY);
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg');
      };
      const boardImage = captureFrame(boardVideoRef.current, boardFlip);
      const handImage = captureFrame(handVideoRef.current, handFlip);
      return { boardImage, handImage };
    }
  }));
  
  // 親(MainScreen)のstateを更新する関数
  const handleFlip = (cameraType, axis) => {
    const setter = cameraType === 'board' ? setBoardFlip : setHandFlip;
    setter(prev => ({ ...prev, [axis]: !prev[axis] }));
  };

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

      <div style={{ display: isSupportMode ? 'none' : 'block' }}>
        <div style={styles.previewSection}>
          <div style={styles.previewHeader}>盤面</div>
          <video ref={boardVideoRef} style={{ ...styles.previewBox, transform: getTransform(boardFlip) }} autoPlay playsInline muted></video>
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