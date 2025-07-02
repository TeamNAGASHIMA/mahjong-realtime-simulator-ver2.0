import React, { useState, useEffect, useRef } from 'react';

const styles = {
  // Global App Styles
  content: {
    padding: '20px',
  },

  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#2a2a2a',
    padding: 0,
    borderRadius: '8px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
    width: '550px',
    maxWidth: '90%',
    color: '#ccc',
    backgroundImage: 
      'linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px)',
    backgroundSize: '20px 20px',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: '#333',
    borderBottom: '1px solid #444',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
  },
  modalHeaderTitle: {
    margin: 0,
    fontSize: '16px',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#ccc',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '0 5px',
  },
  modalBody: {
    padding: '20px',
    maxHeight: '70vh',
    overflowY: 'auto',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '15px 20px',
    borderTop: '1px solid #444',
    marginTop: 'auto',
  },

  // Form & Button Styles
  formGroup: {
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
  },
  formLabel: {
    width: '150px',
    marginRight: '10px',
    flexShrink: 0,
  },
  formInput: {
    flex: 1,
    backgroundColor: '#333',
    border: '1px solid #555',
    color: '#fff',
    padding: '5px',
    borderRadius: '4px',
  },
  radioLabel: {
    width: 'auto',
    margin: '0 15px 0 5px',
  },
  button: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: '10px',
    backgroundColor: '#4a4a4a',
    color: '#ccc',
  },
  uploadButton: {
    marginLeft: '10px',
    background: 'none',
    border: 'none',
    color: '#ccc',
    fontSize: '20px',
    cursor: 'pointer'
  }
};


//================================================================
// 2. MODAL COMPONENT DEFINITIONS
//================================================================

const Settings = ({ onClose }) => (
  <div style={styles.modalOverlay}>
    <div style={styles.modalContent}>
      <div style={styles.modalHeader}>
        <h3 style={styles.modalHeaderTitle}>設定</h3>
        <button onClick={onClose} style={styles.closeButton}>×</button>
      </div>
      <div style={styles.modalBody}>
        <div style={styles.formGroup}><label style={styles.formLabel}>明るさ</label><input type="range" style={styles.formInput} /></div>
        <div style={styles.formGroup}><label style={styles.formLabel}>画面サイズ</label><select style={styles.formInput}><option>フルスクリーン</option></select></div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>テーマ</label>
          <div>
            <input type="radio" id="light" name="theme" defaultChecked /><label htmlFor="light" style={styles.radioLabel}>ライト</label>
            <input type="radio" id="dark" name="theme" /><label htmlFor="dark" style={styles.radioLabel}>ダーク</label>
          </div>
        </div>
        <div style={styles.formGroup}><label style={styles.formLabel}>フォントサイズ</label><select style={styles.formInput}><option>4px</option></select></div>
        <div style={styles.formGroup}><label style={styles.formLabel}>効果音</label></div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>雀卓の背景</label>
          <div>
            <input type="radio" name="table_bg" defaultChecked /><label style={styles.radioLabel}>デフォルト</label>
            <input type="radio" name="table_bg" /><label style={styles.radioLabel}>画像</label>
            <button style={styles.uploadButton}>↑</button>
          </div>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>アプリの背景</label>
          <div>
            <input type="radio" name="app_bg" defaultChecked /><label style={styles.radioLabel}>デフォルト</label>
            <input type="radio" name="app_bg" /><label style={styles.radioLabel}>画像</label>
            <button style={styles.uploadButton}>↑</button>
          </div>
        </div>
      </div>
      <div style={styles.modalFooter}>
        <button style={styles.button}>設定の初期化</button>
        <button style={styles.button}>アプリ終了</button>
      </div>
    </div>
  </div>
);

const Camera = ({ onClose }) => {
  const localStyles = {
    previewContainer: { display: 'flex', justifyContent: 'space-around', marginBottom: '20px', textAlign: 'center' },
    previewBox: { width: '150px', height: '100px', backgroundColor: '#000', border: '1px solid red', margin: '5px auto' },
    previewBoxTall: { width: '200px', height: '50px', backgroundColor: '#000', border: '1px solid red', margin: '5px auto' },
    assignmentContainer: { marginTop: '30px', borderTop: '1px solid #444', paddingTop: '20px' },
  };
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}><h3 style={styles.modalHeaderTitle}>カメラ</h3><button onClick={onClose} style={styles.closeButton}>×</button></div>
        <div style={styles.modalBody}>
          <h4>撮影ガイド</h4>
          <div style={localStyles.previewContainer}>
            <div><p>盤面</p><div style={localStyles.previewBox}></div></div>
            <div><p>手牌</p><div style={localStyles.previewBoxTall}></div></div>
          </div>
          <div style={localStyles.assignmentContainer}>
            <h4>カメラ割り当て設定</h4>
            <div style={styles.formGroup}><label style={styles.formLabel}>盤面</label><select style={styles.formInput} defaultValue="camera1"><option value="camera1">スマホカメラ1</option><option value="camera2">スマホカメラ2</option></select></div>
            <div style={styles.formGroup}><label style={styles.formLabel}>手牌</label><select style={styles.formInput} defaultValue="camera2"><option value="camera1">スマホカメラ1</option><option value="camera2">スマホカメラ2</option></select></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Display = ({ onClose }) => {
  const DisplayOption = ({ label, name }) => (
    <div style={styles.formGroup}>
      <label style={styles.formLabel}>{label}</label>
      <div>
        <input type="radio" id={`${name}_show`} name={name} defaultChecked /><label htmlFor={`${name}_show`} style={styles.radioLabel}>表示</label>
        <input type="radio" id={`${name}_hide`} name={name} /><label htmlFor={`${name}_hide`} style={styles.radioLabel}>非表示</label>
      </div>
    </div>
  );
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}><h3 style={styles.modalHeaderTitle}>表示</h3><button onClick={onClose} style={styles.closeButton}>×</button></div>
        <div style={styles.modalBody}>
          <div style={styles.formGroup}><label style={styles.formLabel}>シミュレーション結果の表示件数</label><select style={styles.formInput} defaultValue="1"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>5</option><option>5</option><option>6</option><option>7</option><option>8</option><option>9</option><option>10</option><option>11</option><option>12</option><option>13</option><option>14</option></select></div>
          <h4 style={{ marginTop: '30px', borderTop: '1px solid #444', paddingTop: '20px' }}>UIの項目表示非表示設定</h4>
          <DisplayOption label="状況" name="status" />
          <DisplayOption label="シミュレーション結果" name="simulation" />
          <DisplayOption label="カメラプレビュー" name="camera_preview" />
          <DisplayOption label="設定" name="settings_ui" />
        </div>
      </div>
    </div>
  );
};

const Help = ({ onClose }) => {
  const [hovered, setHovered] = useState(null);
  const localStyles = {
    button: { ...styles.button, display: 'block', width: '100%', padding: '15px', marginBottom: '15px', fontSize: '16px', textAlign: 'center', marginLeft: 0 },
    buttonHover: { backgroundColor: '#5a5a5a'}
  };
  return (
    <div style={styles.modalOverlay}>
      <div style={{ ...styles.modalContent, width: '400px' }}>
        <div style={styles.modalHeader}><h3 style={styles.modalHeaderTitle}>ヘルプ</h3><button onClick={onClose} style={styles.closeButton}>×</button></div>
        <div style={styles.modalBody}>
          <button style={hovered === 'flow' ? { ...localStyles.button, ...localStyles.buttonHover } : localStyles.button} onMouseOver={() => setHovered('flow')} onMouseOut={() => setHovered(null)}>操作の流れ</button>
          <button style={hovered === 'func' ? { ...localStyles.button, ...localStyles.buttonHover } : localStyles.button} onMouseOver={() => setHovered('func')} onMouseOut={() => setHovered(null)}>機能説明</button>
          <button style={hovered === 'cam' ? { ...localStyles.button, ...localStyles.buttonHover } : localStyles.button} onMouseOver={() => setHovered('cam')} onMouseOut={() => setHovered(null)}>カメラ説明</button>
        </div>
      </div>
    </div>
  );
};

const Contact = ({ onClose }) => (
  <div style={styles.modalOverlay}>
    <div style={{ ...styles.modalContent, backgroundImage: 'none', backgroundColor: 'transparent', width: '700px', boxShadow: 'none' }}>
      <div style={{ ...styles.modalHeader, backgroundColor: '#2a2a2a' }}><h3 style={styles.modalHeaderTitle}>問い合わせ (Google Form)</h3><button onClick={onClose} style={styles.closeButton}>×</button></div>
      <div style={{ ...styles.modalBody, padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', backgroundColor: '#fff' }}>
          <p style={{ fontSize: '48px', color: '#3c4043' }}>GoogleForm</p>
        </div>
      </div>
    </div>
  </div>
);

const VersionInfo = ({ onClose }) => {
  const localStyles = { infoRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '14px', borderBottom: '1px solid #3a3a3a' } };
  return (
    <div style={styles.modalOverlay}>
      <div style={{...styles.modalContent, width: '400px'}}>
        <div style={styles.modalHeader}><h3 style={styles.modalHeaderTitle}>バージョン情報</h3><button onClick={onClose} style={styles.closeButton}>×</button></div>
        <div style={styles.modalBody}>
          <div style={localStyles.infoRow}><span>現在のバージョン</span><span>1.0.0</span></div>
          <div style={localStyles.infoRow}><span>最新のバージョン</span><span>1.0.0</span></div>
        </div>
      </div>
    </div>
  );
};


//================================================================
// 3. HEADER COMPONENT
//================================================================

const Header = ({ onMenuClick }) => {
  const [hoveredButton, setHoveredButton] = useState(null);
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
    headerBackground: { height: '40px', backgroundColor: '#333333', display: 'flex', alignItems: 'center', padding: '0 10px', borderBottom: '1px solid #444444' },
    headerButton: { fontFamily: "'Inter', 'Meiryo', sans-serif", fontSize: '14px', color: 'lightgray', background: 'none', border: 'none', padding: '5px 10px', cursor: 'pointer', marginRight: '5px' },
    headerButtonHover: { color: 'white' },
    otherMenuContainer: { position: 'relative' },
    dropdownMenu: { position: 'absolute', top: '30px', left: '0', backgroundColor: '#3c3c3c', border: '1px solid #555', borderRadius: '4px', padding: '5px 0', minWidth: '150px', display: 'flex', flexDirection: 'column' },
    dropdownItem: { color: 'lightgray', padding: '8px 15px', background: '#3c3c3c', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' },
    // ▼▼▼ 修正箇所 ▼▼▼
    dropdownItemHover: { backgroundColor: '#555', color: 'white' }
    // ▲▲▲ 修正箇所 ▲▲▲
  };

  const menuItems = ['設定', 'カメラ', '表示'];
  const otherMenuItems = [{ label: 'ヘルプ', key: 'help' }, { label: '問い合わせ', key: 'contact' }, { label: 'バージョン情報', key: 'version' }];

  return (
    <div style={localStyles.headerBackground}>
      {menuItems.map(item => (
        <button key={item} style={hoveredButton === item ? { ...localStyles.headerButton, ...localStyles.headerButtonHover } : localStyles.headerButton}
          onMouseOver={() => setHoveredButton(item)} onMouseOut={() => setHoveredButton(null)}
          onClick={() => onMenuClick(item === '設定' ? 'settings' : item === 'カメラ' ? 'camera' : 'display')}>
          {item}
        </button>
      ))}
      <div style={localStyles.otherMenuContainer} ref={menuRef}>
        <button style={hoveredButton === 'その他' ? { ...localStyles.headerButton, ...localStyles.headerButtonHover } : localStyles.headerButton}
          onMouseOver={() => setHoveredButton('その他')} onMouseOut={() => setHoveredButton(null)} onClick={() => setOtherMenuOpen(!isOtherMenuOpen)}>
          その他
        </button>
        {isOtherMenuOpen && (
          <div style={localStyles.dropdownMenu}>
            {otherMenuItems.map(item => (
              <button key={item.key} style={hoveredButton === item.label ? { ...localStyles.dropdownItem, ...localStyles.dropdownItemHover } : localStyles.dropdownItem}
                onMouseOver={() => setHoveredButton(item.label)} onMouseOut={() => setHoveredButton(null)}
                onClick={() => { onMenuClick(item.key); setOtherMenuOpen(false); }}>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

//================================================================
// 4. MAIN APP COMPONENT
//================================================================

function App() {
  const [activeModal, setActiveModal] = useState(null); // 'settings', 'camera', null など

  const handleMenuClick = (modalName) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);

  const renderModal = () => {
    switch (activeModal) {
      case 'settings': return <Settings onClose={closeModal} />;
      case 'camera': return <Camera onClose={closeModal} />;
      case 'display': return <Display onClose={closeModal} />;
      case 'help': return <Help onClose={closeModal} />;
      case 'contact': return <Contact onClose={closeModal} />;
      case 'version': return <VersionInfo onClose={closeModal} />;
      default: return null;
    }
  };

  return (
    <div style={styles.appContainer}>
      <Header onMenuClick={handleMenuClick} />
      {renderModal()}
    </div>
  );
}

export default App;