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
    width: '100%', 
    height: '100%',
  },
  topSection: {
    flex: '1 1 0',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  fullHeightSection: {
    flex: '1 1 auto', 
    height: '100%',
  }
};

const SidePanel = forwardRef((props, ref) => {
  const { displaySettings, isSimulatorMode, settings } = props;

  const cameraRef = useRef(null);
  const settingsRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getSidePanelData: () => {
      const panelSettings = settingsRef.current?.getSettings();
      const images = cameraRef.current?.getPreviewImages();

      if (!isSimulatorMode) {
        return {
          images: { boardImage: null, handImage: null },
          settings: panelSettings || { syanten_type: props.settings?.syanten_type ?? 1, flag: 0 },
        };
      }
      
      return {
        images: images || { boardImage: null, handImage: null },
        settings: panelSettings || { syanten_type: props.settings?.syanten_type ?? 1, flag: 1 },
      };
    }
  }));

  const showCamera = displaySettings ? displaySettings.showCamera : true;
  const showSettingsUI = displaySettings ? displaySettings.showSettings : true;

  return (
    <div style={styles.sidePanelContainer}>
      {showCamera && (
        <div style={styles.topSection}>
          {isSimulatorMode ? (
            <CameraPreview 
              ref={cameraRef} 
              {...props}
              // ★★★ 追加: onDetectionを明示的に渡す
              onDetection={props.onDetection} 
            />
          ) : (
            <KifuSelector 
              kifuFileList={props.kifuFileList}
              onKifuSelect={props.onKifuSelect}
            />
          )}
        </div>
      )}
      
      {showSettingsUI && (
        <SettingsPanel ref={settingsRef} settings={settings} />
      )}
    </div>
  );
});

export default SidePanel;