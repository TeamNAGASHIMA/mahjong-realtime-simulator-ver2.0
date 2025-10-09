import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import CameraPreview from './SidePanel_child/CameraPreview';
import SettingsPanel from './SidePanel_child/SettingsPanel';

const styles = {
  sidePanelContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    flex: '0 1 360px',
    minWidth: '240px',
    maxWidth: '480px', 
  }
};

// 以下、コンポーネントのロジックは変更なし
const SidePanel = forwardRef((props, ref) => {
  const {
    selectedBoardCamera,
    selectedHandCamera,
    // onRecognize プロップは CalculationButton がトリガーになるため不要になる
    // しかし、isRecognizing は CameraPreview のボタンを disabled にするために必要
    isRecognizing,
    settings,
    onSettingsChange,
  } = props;

  const cameraRef = useRef(null);
  const settingsRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getSidePanelData: () => {
      const images = cameraRef.current?.getPreviewImages(); // CameraPreviewから画像を取得
      const panelSettings = settingsRef.current?.getSettings();
      
      return {
        images: images || { boardImage: null, handImage: null },
        settings: panelSettings || { syanten_type: 1, flag: 0 },
      };
    }
  }));

  return (
    <div style={styles.sidePanelContainer}>
      <CameraPreview
        ref={cameraRef}
        boardCameraId={selectedBoardCamera}
        handCameraId={selectedHandCamera}
        onRecognize={() => {}} // ★ダミー関数を渡すか、削除する（ボタンがトリガーではないため）
        isRecognizing={isRecognizing} // CameraPreviewのボタンを無効にするために渡す
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