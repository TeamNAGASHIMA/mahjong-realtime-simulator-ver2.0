// CameraPreview.js

import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';

// スタイルオブジェクト
const styles = {
  // cameraPreviewScreenから固定の高さを削除
  cameraPreviewScreen: {
    width: '100%',
    // height: '120%', // 削除
    // minHeight: '320px', // 削除
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
  // previewBox のスタイルをアスペクト比固定に変更
  previewBox: {
    width: '100%',
    height: 'auto',         // 変更: 高さを自動に
    aspectRatio: '16 / 9',  // 追加: アスペクト比を16:9に固定
    backgroundColor: '#000000',
    border: '1px solid #333',
    borderRadius: '4px',
    transform: 'scaleX(-1)', // 鏡のように左右反転させる
    display: 'block',        // 追加: レイアウトの安定化
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
  onRecognize, // このプロップは使われなくなるが、互換性のために残す
  isRecognizing,
  boardCameraId,
  handCameraId
}, ref) => {
  const [isSupportMode, setIsSupportMode] = useState(false);

  const boardVideoRef = useRef(null);
  const handVideoRef = useRef(null);

  // 盤面カメラのストリーム管理 (ロジックは元のままでOK)
  useEffect(() => {
    if (!boardCameraId) {
        // ストリームをクリアする処理
        if (boardVideoRef.current && boardVideoRef.current.srcObject) {
            boardVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
            boardVideoRef.current.srcObject = null;
        }
        return;
    }
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

  // 手牌カメラのストリーム管理 (ロジックは元のままでOK)
  useEffect(() => {
    if (!handCameraId) {
        if (handVideoRef.current && handVideoRef.current.srcObject) {
            handVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
            handVideoRef.current.srcObject = null;
        }
        return;
    }
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
          {/* videoタグのstyleはstyles.previewBoxを直接参照するだけでOK */}
          <video ref={boardVideoRef} style={styles.previewBox} autoPlay playsInline muted></video>
          {/* onRecognize の呼び出しを削除。isRecognizing のみでボタン無効化 */}
          <button disabled={isRecognizing} style={{...styles.recognitionButton, cursor: isRecognizing ? 'wait' : 'pointer'}}>
              {isRecognizing ? '認識中...' : '盤面全体を認識 (計算と同時実行)'}
          </button>
        </div>
        <div style={styles.previewSection}>
          <div style={styles.previewHeader}>手牌</div>
          <video ref={handVideoRef} style={styles.previewBox} autoPlay playsInline muted></video>
          {/* onRecognize の呼び出しを削除。isRecognizing のみでボタン無効化 */}
          <button disabled={isRecognizing} style={{...styles.recognitionButton, cursor: isRecognizing ? 'wait' : 'pointer'}}>
              {isRecognizing ? '認識中...' : '自分の手牌を認識 (計算と同時実行)'}
          </button>
        </div>
      </div>
    </div>
  );
});

export default CameraPreviewPanel;