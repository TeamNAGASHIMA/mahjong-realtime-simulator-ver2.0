// SidePanel.js

import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import CameraPreview from './SidePanel_child/CameraPreview';
import SettingsPanel from './SidePanel_child/SettingsPanel';

const styles = {
  sidePanelContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px', // MainScreenに合わせて調整
    width: '260px',
    flexShrink: 0,
  }
};

const SidePanel = forwardRef((props, ref) => {
  // MainScreenから渡される全てのpropsを分割代入で受け取る
  const {
    selectedBoardCamera,
    selectedHandCamera,
    isRecognizing,
    settings,
    onSettingsChange,
    // ▼▼▼ MainScreenから反転設定のpropsを受け取ります ▼▼▼
    boardFlip,
    setBoardFlip,
    handFlip,
    setHandFlip,
    guideFrameColor,
  } = props;

  const cameraRef = useRef(null);
  const settingsRef = useRef(null);

  // 親コンポーネント(MainScreen)がこのコンポーネントの関数を呼び出せるように設定
  useImperativeHandle(ref, () => ({
    getSidePanelData: () => {
      const images = cameraRef.current?.getPreviewImages();
      const panelSettings = settingsRef.current?.getSettings();
      return {
        images: images || { boardImage: null, handImage: null },
        settings: panelSettings || { syanten_type: 1, flag: 0 },
      };
    }
  }));

  return (
    <div style={styles.sidePanelContainer}>
      {/* CameraPreviewコンポーネントに必要なpropsをすべて渡す */}
      <CameraPreview
        ref={cameraRef}
        boardCameraId={selectedBoardCamera}
        handCameraId={selectedHandCamera}
        isRecognizing={isRecognizing}
        // ▼▼▼ 受け取った反転設定のpropsをそのままCameraPreviewに渡します ▼▼▼
        boardFlip={boardFlip}
        setBoardFlip={setBoardFlip}
        handFlip={handFlip}
        setHandFlip={setHandFlip}
        guideFrameColor={guideFrameColor}
      />
      <SettingsPanel
        ref={settingsRef}
        settings={settings}
        onSettingsChange={onSettingsChange}
      />
    </div>
  );
});

export default SidePanel;