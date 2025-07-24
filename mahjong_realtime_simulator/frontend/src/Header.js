import React, { useState, useEffect, useRef } from 'react';

// スタイル定義 (ファイル内で共通して使用)
const styles = {
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#2a2a2a', padding: 0, borderRadius: '8px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', width: '550px', maxWidth: '90%',  backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px)', backgroundSize: '20px 20px', display: 'flex', flexDirection: 'column', color: '#ccc' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: '#333', borderBottom: '1px solid #444', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' },
  modalHeaderTitle: { margin: 0, fontSize: '16px' },
  closeButton: { background: 'none', border: 'none', color: '#ccc', fontSize: '24px', cursor: 'pointer', padding: '0 5px' },
  modalBody: { padding: '20px', maxHeight: '70vh', overflowY: 'auto' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', padding: '15px 20px', borderTop: '1px solid #444', marginTop: 'auto' },
  formGroup: { marginBottom: '15px', display: 'flex', alignItems: 'center' },
  formLabel: { width: '150px', marginRight: '10px', flexShrink: 0 },
  formInput: { flex: 1, backgroundColor: '#333', border: '1px solid #555', color: '#fff', padding: '8px', borderRadius: '4px' },
  radioLabel: { width: 'auto', margin: '0 15px 0 5px' },
  button: { padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '10px', backgroundColor: '#4a4a4a', color: '#ccc' },
  uploadButton: { marginLeft: '10px', background: 'none', border: 'none', color: '#ccc', fontSize: '20px', cursor: 'pointer' }
};

//================================================================
// 1. HEADER COMPONENT
//================================================================

export const Header = ({ onMenuClick }) => {
  const [isOtherMenuOpen, setOtherMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOtherMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const localStyles = {
    headerBackground: { height: '40px', backgroundColor: '#333333', display: 'flex', alignItems: 'center', padding: '0 10px', borderBottom: '1px solid #444444', flexShrink: 0 },
    headerButton: { fontFamily: "'Inter', 'Meiryo', sans-serif", fontSize: '14px', color: 'lightgray', background: 'none', border: 'none', padding: '5px 10px', cursor: 'pointer', marginRight: '5px' },
    otherMenuContainer: { position: 'relative' },
    dropdownMenu: { position: 'absolute', top: '35px', left: '0', backgroundColor: '#3c3c3c', border: '1px solid #555', borderRadius: '4px', padding: '5px 0', minWidth: '150px', display: 'flex', flexDirection: 'column', zIndex: 1001 },
    dropdownItem: { color: 'lightgray', padding: '8px 15px', background: 'none', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' },
  };

  const menuItems = [{ label: '設定', key: 'settings' }, { label: 'カメラ', key: 'camera' }, { label: '表示', key: 'display' }];
  const otherMenuItems = [{ label: 'ヘルプ', key: 'help' }, { label: '問い合わせ', key: 'contact' }, { label: 'バージョン情報', key: 'version' }];

  return (
    <div style={localStyles.headerBackground}>
      {menuItems.map(item => <button key={item.key} style={localStyles.headerButton} onClick={() => onMenuClick(item.key)}>{item.label}</button>)}
      <div style={localStyles.otherMenuContainer} ref={menuRef}>
        <button style={localStyles.headerButton} onClick={() => setOtherMenuOpen(!isOtherMenuOpen)}>その他 ▼</button>
        {isOtherMenuOpen && <div style={localStyles.dropdownMenu}>{otherMenuItems.map(item => <button key={item.key} style={localStyles.dropdownItem} onClick={() => { onMenuClick(item.key); setOtherMenuOpen(false); }}>{item.label}</button>)}</div>}
      </div>
    </div>
  );
};

//================================================================
// 2. MODAL COMPONENTS
//================================================================

export const Settings = ({ settings, onSettingsChange, onClose }) => {
  const appBgInputRef = useRef(null);
  const tableBgInputRef = useRef(null);
  const initialSettings = { brightness: 100, screenSize: 'fullscreen', theme: 'dark', fontSize: '14px', soundEffects: true, tableBg: 'default', tableBgImage: null, appBg: 'default', appBgImage: null };
  const handleChange = (e) => { const { name, value, type } = e.target; onSettingsChange({ ...settings, [name]: type === 'range' ? parseFloat(value) : value }); };
  const handleRadioChange = (name, value) => { onSettingsChange({ ...settings, [name]: value }); };
  const handleFileChange = (e, bgType) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { onSettingsChange({ ...settings, [`${bgType}Image`]: reader.result, [bgType]: 'image' }); }; reader.readAsDataURL(file); } };
  const resetSettings = () => { onSettingsChange(initialSettings); };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}><h3 style={styles.modalHeaderTitle}>設定</h3><button onClick={onClose} style={styles.closeButton}>×</button></div>
        <div style={styles.modalBody}>
          <div style={styles.formGroup}><label style={styles.formLabel}>明るさ</label><input type="range" name="brightness" min="50" max="150" value={settings.brightness} onChange={handleChange} style={styles.formInput} /></div>
          <div style={styles.formGroup}><label style={styles.formLabel}>画面サイズ</label><select name="screenSize" value={settings.screenSize} onChange={handleChange} style={styles.formInput}><option value="fullscreen">フルスクリーン</option><option value="windowed">ウィンドウ</option></select></div>
          <div style={styles.formGroup}><label style={styles.formLabel}>テーマ</label><div><input type="radio" id="light" name="theme_radio" checked={settings.theme === 'light'} onChange={() => handleRadioChange('theme', 'light')} /><label htmlFor="light" style={styles.radioLabel}>ライト</label><input type="radio" id="dark" name="theme_radio" checked={settings.theme === 'dark'} onChange={() => handleRadioChange('theme', 'dark')} /><label htmlFor="dark" style={styles.radioLabel}>ダーク</label></div></div>
          <div style={styles.formGroup}><label style={styles.formLabel}>フォントサイズ</label><select name="fontSize" value={settings.fontSize} onChange={handleChange} style={styles.formInput}><option value="12px">小</option><option value="14px">中 (デフォルト)</option><option value="16px">大</option><option value="18px">特大</option></select></div>
          <div style={styles.formGroup}><label style={styles.formLabel}>効果音</label></div>
          <div style={styles.formGroup}><label style={styles.formLabel}>雀卓の背景</label><div><input type="radio" name="table_bg_radio" checked={settings.tableBg === 'default'} onChange={() => handleRadioChange('tableBg', 'default')} /><label style={styles.radioLabel}>デフォルト</label><input type="radio" name="table_bg_radio" checked={settings.tableBg === 'image'} onChange={() => tableBgInputRef.current.click()} /><label style={styles.radioLabel}>画像</label><input type="file" ref={tableBgInputRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileChange(e, 'tableBg')} /><button style={styles.uploadButton} onClick={() => tableBgInputRef.current.click()}>↑</button></div></div>
          <div style={styles.formGroup}><label style={styles.formLabel}>アプリの背景</label><div><input type="radio" name="app_bg_radio" checked={settings.appBg === 'default'} onChange={() => handleRadioChange('appBg', 'default')} /><label style={styles.radioLabel}>デフォルト</label><input type="radio" name="app_bg_radio" checked={settings.appBg === 'image'} onChange={() => appBgInputRef.current.click()} /><label style={styles.radioLabel}>画像</label><input type="file" ref={appBgInputRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileChange(e, 'appBg')} /><button style={styles.uploadButton} onClick={() => appBgInputRef.current.click()}>↑</button></div></div>
        </div>
        <div style={styles.modalFooter}><button style={styles.button} onClick={resetSettings}>設定の初期化</button><button style={styles.button}>アプリ終了</button></div>
      </div>
    </div>
  );
};

export const Camera = ({ onClose, isCameraActive, onConnectOrReconnect, devices, selectedBoardCamera, setSelectedBoardCamera, selectedHandCamera, setSelectedHandCamera, errorMessage }) => {
  const boardVideoRef = useRef(null);
  const handVideoRef = useRef(null);

  // ▼▼▼ 盤面カメラ用のuseEffect (変更なし) ▼▼▼
  useEffect(() => {
    // アクティブでない、またはカメラが選択されていない場合はストリームをクリア
    if (!isCameraActive || !selectedBoardCamera) {
      if (boardVideoRef.current) boardVideoRef.current.srcObject = null;
      return;
    }
    
    const constraints = { video: { deviceId: { exact: selectedBoardCamera } } };
    let stream;
    
    navigator.mediaDevices.getUserMedia(constraints)
      .then(s => {
        stream = s;
        if (boardVideoRef.current) {
          boardVideoRef.current.srcObject = stream;
        }
      })
      .catch(err => console.error('盤面カメラのプレビュー起動に失敗:', err));
      
    // クリーンアップ関数
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedBoardCamera, isCameraActive]);

  // ▼▼▼ 手牌カメラ用のuseEffect (ここを修正) ▼▼▼
  useEffect(() => {
    // アクティブでない、またはカメラが選択されていない場合はストリームをクリア
    if (!isCameraActive || !selectedHandCamera) {
      if (handVideoRef.current) handVideoRef.current.srcObject = null;
      return;
    }
    
    // 盤面カメラと同じかどうかをチェックするロジックを削除し、常に自身のIDでストリームを取得する
    const constraints = { video: { deviceId: { exact: selectedHandCamera } } };
    let stream;
    
    navigator.mediaDevices.getUserMedia(constraints)
      .then(s => {
        stream = s;
        if (handVideoRef.current) {
          handVideoRef.current.srcObject = stream;
        }
      })
      .catch(err => console.error('手牌カメラのプレビュー起動に失敗:', err));
      
    // 独立したクリーンアップ関数
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  // 依存配列から selectedBoardCamera を削除し、完全に独立させる
  }, [selectedHandCamera, isCameraActive]);
  // ▲▲▲ 修正ここまで ▲▲▲

  const localStyles = {
    connectButton: { ...styles.button, width: '100%', marginBottom: '15px', marginLeft: 0 },
    previewContainer: { display: 'flex', justifyContent: 'space-around', marginBottom: '20px', textAlign: 'center' },
    previewBox: { width: '200px', height: '112px', backgroundColor: '#000', border: '1px solid #555', margin: '5px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '14px' },
    videoPreview: { width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' },
    assignmentContainer: { marginTop: '30px', borderTop: '1px solid #444', paddingTop: '20px' },
    errorMessage: { color: '#ff6b6b', textAlign: 'center', marginBottom: '15px' },
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}><h3 style={styles.modalHeaderTitle}>カメラ設定</h3><button onClick={onClose} style={styles.closeButton}>×</button></div>
        <div style={styles.modalBody}>
          <button onClick={onConnectOrReconnect} style={localStyles.connectButton}>{isCameraActive ? 'カメラ再接続 / 更新' : 'カメラ接続'}</button>
          {errorMessage && <p style={localStyles.errorMessage}>{errorMessage}</p>}
          <h4>カメラプレビュー</h4>
          <div style={localStyles.previewContainer}>
            <div><p>盤面カメラ</p><div style={localStyles.previewBox}><video ref={boardVideoRef} style={localStyles.videoPreview} autoPlay playsInline muted /></div></div>
            <div><p>手牌カメラ</p><div style={localStyles.previewBox}><video ref={handVideoRef} style={localStyles.videoPreview} autoPlay playsInline muted /></div></div>
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
        </div>
      </div>
    </div>
  );
};

export const Display = ({ onClose }) => {
  const DisplayOption = ({ label, name }) => (<div style={styles.formGroup}><label style={styles.formLabel}>{label}</label><div><input type="radio" id={`${name}_show`} name={name} defaultChecked /><label htmlFor={`${name}_show`} style={styles.radioLabel}>表示</label><input type="radio" id={`${name}_hide`} name={name} /><label htmlFor={`${name}_hide`} style={styles.radioLabel}>非表示</label></div></div>);
  return <div style={styles.modalOverlay}><div style={styles.modalContent}><div style={styles.modalHeader}><h3 style={styles.modalHeaderTitle}>表示</h3><button onClick={onClose} style={styles.closeButton}>×</button></div><div style={styles.modalBody}><div style={styles.formGroup}><label style={styles.formLabel}>シミュレーション結果の表示件数</label><select style={styles.formInput} defaultValue="1"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option><option>9</option><option>10</option><option>11</option><option>12</option><option>13</option><option>14</option></select></div><h4 style={{ marginTop: '30px', borderTop: '1px solid #444', paddingTop: '20px' }}>UIの項目表示非表示設定</h4><DisplayOption label="状況" name="status" /><DisplayOption label="シミュレーション結果" name="simulation" /><DisplayOption label="カメラプレビュー" name="camera_preview" /><DisplayOption label="設定" name="settings_ui" /></div></div></div>;
};

export const Help = ({ onClose }) => {
  const [view, setView] = useState('menu');
  const localStyles = { 
    button: { ...styles.button, display: 'block', width: '100%', padding: '15px', marginBottom: '15px', fontSize: '16px', textAlign: 'center', marginLeft: 0 },
  };
  const modalWidth = view === 'reference' ? '550px' : '400px';
  const renderMenu = () => (
    <>
      <button style={localStyles.button} onClick={() => setView('workflow')}>操作の流れ</button>
      <button style={localStyles.button} onClick={() => setView('features')}>機能説明</button>
      <button style={localStyles.button} onClick={() => setView('camera')}>カメラ説明</button>
      <button style={localStyles.button} onClick={() => setView('reference')}>参考URL</button>
    </>
  );
  const renderContent = () => {
    if (view === 'menu') return renderMenu();
    const pageMap = {
      workflow: { title: '操作の流れ', content: null },
      features: { title: '機能説明', content: null },
      camera: { title: 'カメラ説明', content: null },
      reference: { title: '参考URL', content: <ReferenceLinks /> },
    };
    const currentPage = pageMap[view];
    return <HelpContentPage title={currentPage.title} onBack={() => setView('menu')}>{currentPage.content}</HelpContentPage>;
  };
  return (
    <div style={styles.modalOverlay}>
      <div style={{ ...styles.modalContent, width: modalWidth, transition: 'width 0.3s ease' }}>
        <div style={styles.modalHeader}><h3 style={styles.modalHeaderTitle}>ヘルプ</h3><button onClick={onClose} style={styles.closeButton}>×</button></div>
        <div style={styles.modalBody}>{renderContent()}</div>
      </div>
    </div>
  );
};

export const Contact = ({ onClose }) => (<div style={styles.modalOverlay}><div style={{ ...styles.modalContent, backgroundImage: 'none', backgroundColor: 'transparent', width: '700px', boxShadow: 'none' }}><div style={{ ...styles.modalHeader, backgroundColor: '#2a2a2a' }}><h3 style={styles.modalHeaderTitle}>問い合わせ (Google Form)</h3><button onClick={onClose} style={styles.closeButton}>×</button></div><div style={{ ...styles.modalBody, padding: 0 }}><div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', backgroundColor: '#fff' }}><p style={{ fontSize: '48px', color: '#3c4043' }}>GoogleForm</p></div></div></div></div>);

export const VersionInfo = ({ onClose }) => {
  const localStyles = { infoRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '14px', borderBottom: '1px solid #3a3a3a' } };
  return <div style={styles.modalOverlay}><div style={{ ...styles.modalContent, width: '400px' }}><div style={styles.modalHeader}><h3 style={styles.modalHeaderTitle}>バージョン情報</h3><button onClick={onClose} style={styles.closeButton}>×</button></div><div style={styles.modalBody}><div style={localStyles.infoRow}><span>現在のバージョン</span><span>1.0.0</span></div><div style={localStyles.infoRow}><span>最新のバージョン</span><span>1.0.0</span></div></div></div></div>;
};

//================================================================
// 3. HELP-RELATED SUB-COMPONENTS
//================================================================

const HelpContentPage = ({ title, onBack, children }) => {
    const localStyles = {
        contentHeader: { display: 'flex', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #444', paddingBottom: '15px' },
        backButton: { ...styles.button, padding: '5px 10px', marginRight: '15px', marginLeft: 0, fontSize: '14px' },
        contentTitle: { margin: 0, fontSize: '18px' },
        contentBody: { color: '#ccc', lineHeight: '1.6' }
    };
    return (
        <div>
            <div style={localStyles.contentHeader}>
                <button onClick={onBack} style={localStyles.backButton}>← 戻る</button>
                <h4 style={localStyles.contentTitle}>{title}</h4>
            </div>
            <div style={localStyles.contentBody}>{children || <p>{title}のコンテンツは準備中です。</p>}</div>
        </div>
    );
};

export const ReferenceLinks = () => {
  const localStyles = {
    linkList: { listStyle: 'none', padding: 0 },
    linkItem: { marginBottom: '15px', padding: '15px', backgroundColor: '#3a3a3a', borderRadius: '4px', transition: 'background-color 0.2s ease' },
    linkAnchor: { color: '#8ab4f8', textDecoration: 'none', fontSize: '16px', fontWeight: 'bold', display: 'block' },
    linkDescription: { color: '#ccc', fontSize: '14px', marginTop: '8px' },
  };
  const handleMouseOver = (e) => { e.currentTarget.style.backgroundColor = '#4a4a4a'; };
  const handleMouseOut = (e) => { e.currentTarget.style.backgroundColor = '#3a3a3a'; };
  const links = [
    { url: 'https://pystyle.info/apps/mahjong-nanikiru-simulator/', title: '計算実行プログラム', description: '本アプリケーションの基本的な使い方や機能について詳しく解説しています。' },
    { url: '#', title: 'よくある質問 (FAQ)', description: 'ユーザーから多く寄せられる質問とその回答をまとめています。問題が発生した際はこちらを最初にご確認ください。' },
    { url: '#', title: 'コミュニティフォーラム', description: '他のユーザーと情報交換をしたり、質問をしたりすることができます。' },
    { url: '#', title: '麻雀の基本ルール', description: '麻雀のルールがわからない方向けの、基本的なルール解説ページです。' },
  ];
  return (
    <ul style={localStyles.linkList}>
      {links.map((link, index) => (
        <li key={index} style={localStyles.linkItem} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
          <a href={link.url} target="_blank" rel="noopener noreferrer" style={localStyles.linkAnchor}>{link.title}</a>
          <p style={localStyles.linkDescription}>{link.description}</p>
        </li>
      ))}
    </ul>
  );
};