import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';

// スタイルオブジェクト
const styles = {
  cameraPreviewScreen: {
    width: '100%',
    height: '120%',
    minHeight: '320px',
    backgroundColor: '#D9D9D9',
    padding: '10px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '8px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    fontSize: '12px',
    color: '#333',
  },
  toggleButton: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    padding: '4px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    border: '1px solid #eda040',
    transition: 'background-color 0.2s, color 0.2s',
    color: '#000000',
    backgroundColor: '#E39C40',
    whiteSpace: 'nowrap',
  },
  previewSection: {
    marginBottom: '15px',
  },
  previewHeader: {
    fontSize: '12px',
    color: '#555',
    marginBottom: '5px',
  },
  previewBox: { // videoタグに適用されるスタイル
    width: '100%',
    height: '150px',
    backgroundColor: '#000000',
    border: '1px solid #333',
    borderRadius: '4px',
    transform: 'scaleX(-1)', // 鏡のように左右反転させる
  },
  recognitionButton: {
    width: '100%',
    padding: '8px',
    fontSize: '13px',
    marginTop: '10px',
    cursor: 'pointer',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ccc',
    borderRadius: '4px',
  }
};

const CameraPreviewPanel = forwardRef(({
  onRecognize,
  isRecognizing,
  boardCameraId,
  handCameraId
}, ref) => {
  const [isSupportMode, setIsSupportMode] = useState(false);

  const boardVideoRef = useRef(null);
  const handVideoRef = useRef(null);

  // 盤面カメラのストリームを管理するuseEffect
  useEffect(() => {
    // カメラIDが指定されていない場合は何もしない
    if (!boardCameraId) return;

    const constraints = { video: { deviceId: { exact: boardCameraId } } };
    let stream;

    // 指定されたIDでカメラを取得
    navigator.mediaDevices.getUserMedia(constraints)
      .then(s => {
        stream = s;
        if (boardVideoRef.current) {
          boardVideoRef.current.srcObject = stream;
        }
      })
      .catch(err => console.error(`盤面カメラ(ID: ${boardCameraId})の起動に失敗 (CameraPreview):`, err));

    // クリーンアップ関数: コンポーネントがアンマウントされる時にストリームを停止
    return () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };
  }, [boardCameraId]); // boardCameraId propが変更された時のみ、このeffectを再実行

  // 手牌カメラのストリームを管理するuseEffect
  useEffect(() => {
    // 手牌カメラのIDが指定されていない場合は何もしない
    if (!handCameraId) return;

    const constraints = { video: { deviceId: { exact: handCameraId } } };
    let stream;

    // 指定されたIDでカメラを取得
    navigator.mediaDevices.getUserMedia(constraints)
      .then(s => {
        stream = s;
        if (handVideoRef.current) {
          handVideoRef.current.srcObject = stream;
        }
      })
      .catch(err => console.error(`手牌カメラ(ID: ${handCameraId})の起動に失敗 (CameraPreview):`, err));

    // クリーンアップ関数
    return () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };
  }, [handCameraId]); // handCameraId propが変更された時のみ、このeffectを再実行

  // 親コンポーネントに公開するメソッド（画像キャプチャ用）
  useImperativeHandle(ref, () => ({
    getPreviewImages: () => {
      const captureFrame = (videoElement) => {
        if (!videoElement || !videoElement.srcObject) return null; // 映像がなければnullを返す
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext('2d');
        // 映像は左右反転して表示しているので、キャプチャ時も反転させる
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg');
      };

      const boardImage = captureFrame(boardVideoRef.current);
      const handImage = captureFrame(handVideoRef.current);

      return { boardImage, handImage };
    }
  }));

  const handleToggle = () => setIsSupportMode(prev => !prev);

  // レンダリング部分
  return (
    <div style={styles.cameraPreviewScreen}>
      <div style={styles.header}>
        <span>{isSupportMode ? 'サポート' : 'カメラプレビュー'}</span>
        <button style={styles.toggleButton} onClick={handleToggle}>
          {isSupportMode ? 'カメラプレビュー' : 'サポート'}
        </button>
      </div>

      {/* サポート画面エリア */}
      {/* isSupportModeがtrueの時だけ表示 (display: 'flex') */}
      <div style={{
          display: isSupportMode ? 'flex' : 'none',
          flexGrow: 1,
          alignItems: 'center',
          justifyContent: 'center'
      }}>
        <p>サポート情報はこちらに表示されます。</p>
      </div>

      {/* カメラプレビューエリア */}
      {/* isSupportModeがfalseの時だけ表示 (display: 'block') */}
      <div style={{ display: isSupportMode ? 'none' : 'block' }}>
        <div style={styles.previewSection}>
          <div style={styles.previewHeader}>盤面</div>
          <video ref={boardVideoRef} style={styles.previewBox} autoPlay playsInline muted></video>
          {onRecognize && (
              <button onClick={() => onRecognize('board')} disabled={isRecognizing} style={{...styles.recognitionButton, cursor: isRecognizing ? 'wait' : 'pointer'}}>
                  {isRecognizing ? '認識中...' : '盤面全体を認識'}
              </button>
          )}
        </div>
        <div style={styles.previewSection}>
          <div style={styles.previewHeader}>手牌</div>
          <video ref={handVideoRef} style={styles.previewBox} autoPlay playsInline muted></video>
          {onRecognize && (
              <button onClick={() => onRecognize('hand')} disabled={isRecognizing} style={{...styles.recognitionButton, cursor: isRecognizing ? 'wait' : 'pointer'}}>
                  {isRecognizing ? '認識中...' : '自分の手牌を認識'}
              </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default CameraPreviewPanel;