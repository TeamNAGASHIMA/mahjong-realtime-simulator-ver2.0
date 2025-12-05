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
    // 固定幅(390px)を廃止し、親要素に合わせて広げる
    width: '100%', 
    height: '100%',
  },
  topSection: {
    flex: '1 1 0',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column', // 子要素の配置安定のため追加推奨
  },
  // 設定パネルを非表示にした場合に上部セクションを最大化するためのスタイル調整用
  fullHeightSection: {
    flex: '1 1 auto', 
    height: '100%',
  }
};

const SidePanel = forwardRef((props, ref) => {
  // displaySettings を受け取る
  const { displaySettings, isSimulatorMode } = props;

  const cameraRef = useRef(null);
  const settingsRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getSidePanelData: () => {
      // settingsRefが存在しない（非表示の）場合は、props.settingsなどのデフォルト値を使うか
      // あるいは内部状態を保持する必要がありますが、ここではref経由の取得を試みます。
      // 非表示の場合 ref.current は null になる可能性があるため、オプショナルチェーン (?.) を使用
      const panelSettings = settingsRef.current?.getSettings();
      
      // カメラが非表示の場合でも、裏で動いていれば画像取得できる可能性がありますが、
      // 完全にマウント解除されている場合は null になります。
      const images = cameraRef.current?.getPreviewImages();

      if (!isSimulatorMode) {
        return {
          images: { boardImage: null, handImage: null },
          // パネルから設定が取れない場合は props.settings をフォールバックとして使う等の対策が必要かもしれません
          // ここではシンプルに既存ロジックを踏襲しつつ安全策を入れています
          settings: panelSettings || { syanten_type: props.settings?.syanten_type ?? 1, flag: 0 },
        };
      }
      
      return {
        images: images || { boardImage: null, handImage: null },
        settings: panelSettings || { syanten_type: props.settings?.syanten_type ?? 1, flag: 1 },
      };
    }
  }));

  // 表示設定の安全な参照
  const showCamera = displaySettings ? displaySettings.showCamera : true;
  const showSettingsUI = displaySettings ? displaySettings.showSettings : true;

  return (
    <div style={styles.sidePanelContainer}>
      {/* 
        showCamera が true の場合のみ上部セクションを表示
        設定パネルが非表示の場合は、上部セクションをフルハイトにするなどの調整が可能ですが、
        styles.topSection の flex: 1 1 0 により自動的に広がるはずです。
      */}
      {showCamera && (
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
      )}
      
      {/* showSettingsUI が true の場合のみ設定パネルを表示 */}
      {showSettingsUI && (
        <SettingsPanel ref={settingsRef} {...props} />
      )}
    </div>
  );
});

export default SidePanel;