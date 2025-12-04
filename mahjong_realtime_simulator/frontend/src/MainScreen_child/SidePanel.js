// SidePanel.js

import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import CameraPreview from './SidePanel_child/CameraPreview';
import SettingsPanel from './SidePanel_child/SettingsPanel';
import KifuSelector from './SidePanel_child/KifuSelector';

const styles = {
  sidePanelContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    // ★★★ 変更: 固定幅(390px)を廃止し、親要素に合わせて広げる ★★★
    width: '100%', 
    height: '100%',
  },
  topSection: {
    flex: '1 1 0',
    minHeight: 0,
    display: 'flex',
  },
};

const SidePanel = forwardRef((props, ref) => {
  const { isSimulatorMode } = props;

  const cameraRef = useRef(null);
  const settingsRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getSidePanelData: () => {
      const panelSettings = settingsRef.current?.getSettings();
      if (!isSimulatorMode) {
        return {
          images: { boardImage: null, handImage: null },
          settings: panelSettings || { syanten_type: 1, flag: 0 },
        };
      }
      const images = cameraRef.current?.getPreviewImages();
      return {
        images: images || { boardImage: null, handImage: null },
        settings: panelSettings || { syanten_type: 1, flag: 1 },
      };
    }
  }));

  return (
    <div style={styles.sidePanelContainer}>
      <div style={styles.topSection}>
        {isSimulatorMode ? (
          <CameraPreview ref={cameraRef} {...props} />
        ) : (
          <KifuSelector 
            kifuFileList={props.kifuFileList}
            onKifuSelect={props.onKifuSelect}
          />
        )}
      </div>
      
      <SettingsPanel ref={settingsRef} {...props} />
    </div>
  );
});

export default SidePanel;