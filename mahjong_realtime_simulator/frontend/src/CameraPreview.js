import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react'; 

// スタイルオブジェクトを定義
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

const CameraPreviewPanel = forwardRef(({ onRecognize, isRecognizing }, ref) => {
  const [isSupportMode, setIsSupportMode] = useState(false);
  
  // video要素とカメラのストリームへの参照を作成
  const boardVideoRef = useRef(null);
  const handVideoRef = useRef(null);
  const streamRef = useRef(null); // カメラストリームを保持

  // コンポーネントがマウントされた時にカメラを起動する
  useEffect(() => {
    // カメラを起動する非同期関数
    const startCamera = async () => {
      try {
        // ユーザーにカメラへのアクセス許可を求める
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream; // 後で停止するためにストリームを保存

        // 両方のvideo要素に同じストリームを設定
        if (boardVideoRef.current) {
          boardVideoRef.current.srcObject = stream;
        }
        if (handVideoRef.current) {
          handVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("カメラへのアクセスに失敗しました:", err);
        // ここでエラーメッセージを画面に表示するなどの処理も可能
      }
    };
    
    startCamera();

    // コンポーネントがアンマウントされる時にカメラを停止するクリーンアップ関数
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // 空の依存配列なので、初回マウント時に一度だけ実行される

  // 親コンポーネントに公開するメソッドを定義
  useImperativeHandle(ref, () => ({
    getPreviewImages: () => {
      const captureFrame = (videoElement) => {
        if (!videoElement) return null;
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext('2d');
        // 映像は左右反転して表示しているので、キャプチャ時も反転させる
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/png');
      };
      
      const boardImage = captureFrame(boardVideoRef.current);
      const handImage = captureFrame(handVideoRef.current);
      
      return { boardImage, handImage };
    }
  }));

  const handleToggle = () => setIsSupportMode(prev => !prev);

  return (
    <div style={styles.cameraPreviewScreen}>
      <div style={styles.header}>
        <span>{isSupportMode ? 'サポート' : 'カメラプレビュー'}</span>
        <button style={styles.toggleButton} onClick={handleToggle}>
          {isSupportMode ? 'カメラプレビュー' : 'サポート'}
        </button>
      </div>
      {isSupportMode ? (
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>サポート情報はこちらに表示されます。</p>
        </div>
      ) : (
        <>
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
            <div style={styles.previewHeader}>手配</div>
            <video ref={handVideoRef} style={styles.previewBox} autoPlay playsInline muted></video>
            {onRecognize && (
                <button onClick={() => onRecognize('hand')} disabled={isRecognizing} style={{...styles.recognitionButton, cursor: isRecognizing ? 'wait' : 'pointer'}}>
                    {isRecognizing ? '認識中...' : '自分の手牌を認識'}
                </button>
            )}
          </div>
        </>
      )}
    </div>
  );
});

export default CameraPreviewPanel;