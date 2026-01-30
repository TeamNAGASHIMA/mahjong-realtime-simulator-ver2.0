// Header/CameraModal.js (1080p固定・厳格モード)

import React, { useState, useEffect, useRef } from 'react';
import { styles } from './styles';

export const CameraModal = ({
  onClose, isCameraActive, onConnectOrReconnect, devices,
  selectedBoardCamera, setSelectedBoardCamera,
  selectedHandCamera, setSelectedHandCamera, errorMessage,
  boardFlip, setBoardFlip, handFlip, setHandFlip,
  guideFrameColor, setGuideFrameColor
}) => {
  const [hoveredButton, setHoveredButton] = useState(null);
  const boardVideoRef = useRef(null);
  const handVideoRef = useRef(null);

  useEffect(() => {
    let activeStream = null;
    if (isCameraActive && selectedBoardCamera) {
      // ★★★ 1920x1080 を exact で要求 ★★★
      const constraints = {
        video: {
          deviceId: { exact: selectedBoardCamera },
          //width: { ideal: 1920 }, // exact(厳格) <-> ideal(理想値)          
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      console.log(`[CameraModal] 盤面カメラに1920x1080を要求します...`);
      navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
          console.log(`[CameraModal] 盤面カメラ 1920x1080 での起動に成功。`);
          activeStream = stream;
          if (boardVideoRef.current) {
            boardVideoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          // ★★★ エラーをコンソールに明確に表示 ★★★
          console.error(`[CameraModal] 盤面カメラを1920x1080で起動できませんでした。カメラがこの解像度に対応しているか確認してください。`, err.name);
          // エラーが発生した場合、プレビューをクリアする
          if (boardVideoRef.current) boardVideoRef.current.srcObject = null;
        });
    }
    return () => {
      if (activeStream) activeStream.getTracks().forEach(track => track.stop());
      if (boardVideoRef.current) boardVideoRef.current.srcObject = null;
    };
  }, [selectedBoardCamera, isCameraActive]);

  useEffect(() => {
    let activeStream = null;
    if (isCameraActive && selectedHandCamera) {
      // ★★★ 1920x1080 を exact で要求 ★★★
      const constraints = {
        video: {
          deviceId: { exact: selectedHandCamera },
          //width: { ideal: 1920 }, // exact(厳格) <-> ideal(理想値)          
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      
      console.log(`[CameraModal] 手牌カメラに1920x1080を要求します...`);
      navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
          console.log(`[CameraModal] 手牌カメラ 1920x1080 での起動に成功。`);
          activeStream = stream;
          if (handVideoRef.current) {
            handVideoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error(`[CameraModal] 手牌カメラを1920x1080で起動できませんでした。カメラがこの解像度に対応しているか確認してください。`, err.name);
          if (handVideoRef.current) handVideoRef.current.srcObject = null;
        });
    }
    return () => {
      if (activeStream) activeStream.getTracks().forEach(track => track.stop());
      if (handVideoRef.current) handVideoRef.current.srcObject = null;
    };
  }, [selectedHandCamera, isCameraActive]);

  // ... (以降のコードは変更なし。省略せずに展開します)
  const handleFlip = (cameraType, axis) => { const setter = cameraType === 'board' ? setBoardFlip : setHandFlip; setter(prev => ({ ...prev, [axis]: !prev[axis] })); };
  const getTransform = (flipState) => `scale(${flipState.horizontal ? -1 : 1}, ${flipState.vertical ? -1 : 1})`;
  const localStyles = { connectButton: { ...styles.button, width: '100%', marginBottom: '15px', marginLeft: 0 }, previewContainer: { display: 'flex', justifyContent: 'space-around', marginBottom: '20px', textAlign: 'center' }, previewBox: { position: 'relative', width: '200px', height: '112px', backgroundColor: '#000', border: '1px solid #555', margin: '5px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '14px' }, videoPreview: { width: '100%', height: '100%', objectFit: 'cover' }, assignmentContainer: { marginTop: '30px', borderTop: '1px solid #444', paddingTop: '20px' }, errorMessage: { color: '#ff6b6b', textAlign: 'center', marginBottom: '15px' }, flipButtonsContainer: { display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '8px' }, flipButton: { ...styles.button, padding: '4px 8px', fontSize: '12px', marginLeft: 0, minWidth: '80px' }, flipButtonActive: { backgroundColor: '#6ca7ff', color: '#fff', fontWeight: 'bold' }, };
  const guideFrameStyle = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '112px', height: '112px', border: `3px solid ${guideFrameColor}`, boxSizing: 'border-box', pointerEvents: 'none' };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalHeaderTitle}>カメラ設定</h3>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </div>
        <div style={styles.modalBody}>
          <button onClick={onConnectOrReconnect} style={{ ...localStyles.connectButton, ...(hoveredButton === 'connect' && styles.buttonHover) }} onMouseOver={() => setHoveredButton('connect')} onMouseOut={() => setHoveredButton(null)}>
            {isCameraActive ? 'カメラ再接続 / 更新' : 'カメラ接続'}
          </button>
          {errorMessage && <p style={localStyles.errorMessage}>{errorMessage}</p>}
          <h4>カメラプレビュー</h4>
          <div style={localStyles.previewContainer}>
            <div>
              <p>盤面カメラ</p>
              <div style={localStyles.previewBox}>
                <video ref={boardVideoRef} style={{ ...localStyles.videoPreview, transform: getTransform(boardFlip) }} autoPlay playsInline muted />
                {guideFrameColor && guideFrameColor !== 'none' && <div style={guideFrameStyle}></div>}
              </div>
              <div style={localStyles.flipButtonsContainer}>
                <button style={{ ...localStyles.flipButton, ...(boardFlip.horizontal && styles.flipButtonActive), ...(!boardFlip.horizontal && hoveredButton === 'board_h' && styles.buttonHover) }} onClick={() => handleFlip('board', 'horizontal')} onMouseOver={() => setHoveredButton('board_h')} onMouseOut={() => setHoveredButton(null)}>左右反転</button>
                <button style={{ ...localStyles.flipButton, ...(boardFlip.vertical && styles.flipButtonActive), ...(!boardFlip.vertical && hoveredButton === 'board_v' && styles.buttonHover) }} onClick={() => handleFlip('board', 'vertical')} onMouseOver={() => setHoveredButton('board_v')} onMouseOut={() => setHoveredButton(null)}>上下反転</button>
              </div>
            </div>
            <div>
              <p>手牌カメラ</p>
              <div style={localStyles.previewBox}>
                <video ref={handVideoRef} style={{ ...localStyles.videoPreview, transform: getTransform(handFlip) }} autoPlay playsInline muted />
              </div>
              <div style={localStyles.flipButtonsContainer}>
                <button style={{ ...localStyles.flipButton, ...(handFlip.horizontal && styles.flipButtonActive), ...(!handFlip.horizontal && hoveredButton === 'hand_h' && styles.buttonHover) }} onClick={() => handleFlip('hand', 'horizontal')} onMouseOver={() => setHoveredButton('hand_h')} onMouseOut={() => setHoveredButton(null)}>左右反転</button>
                <button style={{ ...localStyles.flipButton, ...(handFlip.vertical && styles.flipButtonActive), ...(!handFlip.vertical && hoveredButton === 'hand_v' && styles.buttonHover) }} onClick={() => handleFlip('hand', 'vertical')} onMouseOver={() => setHoveredButton('hand_v')} onMouseOut={() => setHoveredButton(null)}>上下反転</button>
              </div>
            </div>
          </div>
          <div style={localStyles.assignmentContainer}>
            <h4>カメラ割り当て設定</h4>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>盤面</label>
              <select style={styles.formInput} disabled={!isCameraActive} value={selectedBoardCamera} onChange={(e) => setSelectedBoardCamera(e.target.value)}>
                {devices.map(device => (<option key={device.deviceId} value={device.deviceId}>{device.label || `カメラ ${device.deviceId.substring(0, 8)}`}</option>))}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>手牌</label>
              <select style={styles.formInput} disabled={!isCameraActive} value={selectedHandCamera} onChange={(e) => setSelectedHandCamera(e.target.value)}>
                {devices.map(device => (<option key={device.deviceId} value={device.deviceId}>{device.label || `カメラ ${device.deviceId.substring(0, 8)}`}</option>))}
              </select>
            </div>
          </div>
          <div style={{ marginTop: '20px', borderTop: '1px solid #444', paddingTop: '20px' }}>
            <h4>盤面カメラ ガイド枠設定</h4>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>線の色</label>
              <select style={styles.formInput} value={guideFrameColor} onChange={(e) => setGuideFrameColor(e.target.value)}><option value="none">なし</option><option value="black">黒</option><option value="white">白</option><option value="red">赤</option></select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};