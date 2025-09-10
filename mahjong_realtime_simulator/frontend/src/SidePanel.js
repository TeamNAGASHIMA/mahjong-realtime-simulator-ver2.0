// SidePanel.js
import React, { useRef, useImperativeHandle, forwardRef } from 'react';

import CameraPreview from './CameraPreview'; 
import SettingsPanel from './SettingsPanel';

const styles = {
  sidePanelContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    flex: 1,
    minWidth: '280px',
  }
};

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

  // 子コンポーネントへの参照を内部で作成
  const cameraRef = useRef(null);
  const settingsRef = useRef(null);

  // 親コンポーネント(MainScreen)に公開するメソッドを定義
  useImperativeHandle(ref, () => ({
    // このメソッド一つで、SidePanel配下の全てのデータを取得できるようにする
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