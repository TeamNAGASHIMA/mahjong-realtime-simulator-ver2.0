// CameraPreview.js

// ★★★ 修正点: useState をインポートに追加しました ★★★
import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';

// スタイル定義
const styles = {
  cameraPreviewScreen: { width: '100%', backgroundColor: '#D9D9D9', padding: '10px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', borderRadius: '8px', height: '100%', minHeight: 0, },
  contentWrapper: { flex: '1 1 0', minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '12px', color: '#333', flexShrink: 0, fontWeight: 'bold' },
  previewSection: { marginBottom: '15px', },
  previewHeader: { fontSize: '12px', color: '#555', marginBottom: '5px', },
  previewBox: { width: '100%', height: 'auto', aspectRatio: '16 / 9', backgroundColor: '#000000', border: '1px solid #333', borderRadius: '4px', display: 'block', },
  recognitionButton: { width: '100%', padding: '8px', fontSize: '13px', marginTop: '10px', cursor: 'pointer', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px', },
  flipButtonsContainer: { display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '8px', },
  flipButton: { padding: '4px 8px', fontSize: '12px', marginLeft: 0, minWidth: '80px', border: '1px solid #aaa', borderRadius: '4px', backgroundColor: '#f0f0f0', cursor: 'pointer', transition: 'background-color 0.2s, border-color 0.2s', },
  flipButtonActive: { backgroundColor: '#77aaff', color: '#fff', fontWeight: 'bold', borderColor: '#5588dd', },
  buttonHover: { backgroundColor: '#e0e0e0', borderColor: '#888', },
};

const CameraPreview = forwardRef((props, ref) => {
  const { isRecognizing, selectedBoardCamera, selectedHandCamera, boardFlip, setBoardFlip, handFlip, setHandFlip, guideFrameColor } = props;

  const boardVideoRef = useRef(null);
  const handVideoRef = useRef(null);
  
  // ★★★ 修正点: サポートモード削除に伴い、ボタンのホバー状態管理のみ残します ★★★
  const [hoveredButton, setHoveredButton] = useState(null);

  const guideFrameStyle = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', height: '100%', aspectRatio: '1 / 1', border: `3px solid ${guideFrameColor}`, boxSizing: 'border-box', pointerEvents: 'none' };
  
  const handleFlip = (cameraType, axis) => { const setter = cameraType === 'board' ? setBoardFlip : setHandFlip; setter(prev => ({ ...prev, [axis]: !prev[axis] })); };
  const getTransform = (flipState) => `scale(${flipState?.horizontal ? -1 : 1}, ${flipState?.vertical ? -1 : 1})`;

  // カメラ映像取得のロジック
  useEffect(() => {
    let activeStream = null;
    if (selectedBoardCamera) {
      const constraints = {
        video: {
          deviceId: { exact: selectedBoardCamera },
          //width: { ideal: 1920 }, // exact(厳格) <-> ideal(理想値) 
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
          activeStream = stream;
          if (boardVideoRef.current) {
            boardVideoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.error(`盤面カメラ起動失敗:`, err));
    }
    return () => {
      if (activeStream) activeStream.getTracks().forEach(track => track.stop());
      if (boardVideoRef.current) boardVideoRef.current.srcObject = null;
    };
  }, [selectedBoardCamera]);

  useEffect(() => {
    let activeStream = null;
    if (selectedHandCamera) {
      const constraints = {
        video: {
          deviceId: { exact: selectedHandCamera },
          //width: { ideal: 1920 }, // exact(厳格) <-> ideal(理想値)          
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
          activeStream = stream;
          if (handVideoRef.current) {
            handVideoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.error(`手牌カメラ起動失敗:`, err));
    }
    return () => {
      if (activeStream) activeStream.getTracks().forEach(track => track.stop());
      if (handVideoRef.current) handVideoRef.current.srcObject = null;
    };
  }, [selectedHandCamera]);

  // 画像取得関数
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
        return canvas.toDataURL('image/jpeg', 1.0);
      };
      
      const boardImage = captureFrame(boardVideoRef.current, boardFlip);
      const handImage = captureFrame(handVideoRef.current, handFlip);

      return { boardImage, handImage };
    }
  }));

  return (
    <div style={styles.cameraPreviewScreen}>
      <div style={styles.header}>
        <span>カメラプレビュー</span>
      </div>

      <div style={styles.contentWrapper}>
        <div style={styles.previewSection}>
          <div style={styles.previewHeader}>盤面</div>
          <div style={{ position: 'relative', width: '100%' }}>
            <video ref={boardVideoRef} style={{ ...styles.previewBox, transform: getTransform(boardFlip) }} autoPlay playsInline muted></video>
            {guideFrameColor !== 'none' && <div style={guideFrameStyle}></div>}
          </div>
          <div style={styles.flipButtonsContainer}>
            <button style={{ ...styles.flipButton, ...(boardFlip?.horizontal && styles.flipButtonActive), ...(!boardFlip?.horizontal && hoveredButton === 'board_h' && styles.buttonHover) }} onClick={() => handleFlip('board', 'horizontal')} onMouseOver={() => setHoveredButton('board_h')} onMouseOut={() => setHoveredButton(null)}>左右反転</button>
            <button style={{ ...styles.flipButton, ...(boardFlip?.vertical && styles.flipButtonActive), ...(!boardFlip?.vertical && hoveredButton === 'board_v' && styles.buttonHover) }} onClick={() => handleFlip('board', 'vertical')} onMouseOver={() => setHoveredButton('board_v')} onMouseOut={() => setHoveredButton(null)}>上下反転</button>
          </div>
          <button disabled={isRecognizing} style={{...styles.recognitionButton, cursor: isRecognizing ? 'wait' : 'pointer'}}> {isRecognizing ? '認識中...' : '盤面全体を認識 (計算と同時実行)'} </button>
        </div>
        <div style={styles.previewSection}>
          <div style={styles.previewHeader}>手牌</div>
          <video ref={handVideoRef} style={{ ...styles.previewBox, transform: getTransform(handFlip) }} autoPlay playsInline muted></video>
          <div style={styles.flipButtonsContainer}>
            <button style={{ ...styles.flipButton, ...(handFlip?.horizontal && styles.flipButtonActive), ...(!handFlip?.horizontal && hoveredButton === 'hand_h' && styles.buttonHover) }} onClick={() => handleFlip('hand', 'horizontal')} onMouseOver={() => setHoveredButton('hand_h')} onMouseOut={() => setHoveredButton(null)}>左右反転</button>
            <button style={{ ...styles.flipButton, ...(handFlip?.vertical && styles.flipButtonActive), ...(!handFlip?.vertical && hoveredButton === 'hand_v' && styles.buttonHover) }} onClick={() => handleFlip('hand', 'vertical')} onMouseOver={() => setHoveredButton('hand_v')} onMouseOut={() => setHoveredButton(null)}>上下反転</button>
          </div>
          <button disabled={isRecognizing} style={{...styles.recognitionButton, cursor: isRecognizing ? 'wait' : 'pointer'}}> {isRecognizing ? '認識中...' : '自分の手牌を認識 (計算と同時実行)'} </button>
        </div>
      </div>
    </div>
  );
});

export default CameraPreview;