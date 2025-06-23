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
    onRecognize,
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
      <CameraPreview
        ref={cameraRef}
        onRecognize={onRecognize}
        isRecognizing={isRecognizing}
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

// このファイルを直接実行してテストする場合の例
// import ReactDOM from 'react-dom/client'; // ファイルの先頭に
// const AppMock = () => {
//     const [rec, setRec] = useState(false);
//     const [appSettings, setAppSettings] = useState({
//         shantenType: '一般手',
//         koryoItems: { shantenOtoshi: false, tegawari: true, horaMax: true }
//     });
//     return (
//         <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', backgroundColor: '#f0f0f0', height: 'calc(100vh - 40px)' }}>
//             <SidePanel
//                 onRecognize={(type) => { console.log('Recognize:', type); setRec(true); setTimeout(()=>setRec(false), 1000);}}
//                 isRecognizing={rec}
//                 settings={appSettings}
//                 onSettingsChange={setAppSettings}
//             />
//         </div>
//     );
// }
// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(<AppMock />);