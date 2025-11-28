// Header/SettingsModal.js
import React, { useState, useRef } from 'react';
import { styles } from './styles';

export const SettingsModal = ({ settings, onSettingsChange, onClose }) => {
  const [hoveredButton, setHoveredButton] = useState(null);
  const appBgInputRef = useRef(null);
  const tableBgInputRef = useRef(null);
  
  const initialSettings = { 
    brightness: 100, 
    screenSize: 'fullscreen', 
    theme: 'dark', 
    fontSize: '14px', 
    soundEffects: true, 
    tableBg: 'default', 
    tableBgImage: null, 
    appBg: 'default', 
    appBgImage: null 
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    onSettingsChange({ ...settings, [name]: type === 'range' ? parseFloat(value) : value });
  };

  const handleRadioChange = (name, value) => {
    onSettingsChange({ ...settings, [name]: value });
  };

  const handleFileChange = (e, bgType) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSettingsChange({ ...settings, [`${bgType}Image`]: reader.result, [bgType]: 'image' });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetSettings = () => {
    onSettingsChange(initialSettings);
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalHeaderTitle}>設定</h3>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </div>
        <div style={styles.modalBody}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>明るさ</label>
            <input type="range" name="brightness" min="50" max="150" value={settings.brightness} onChange={handleChange} style={styles.formInput} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>画面サイズ</label>
            <select name="screenSize" value={settings.screenSize} onChange={handleChange} style={styles.formInput}>
              <option value="fullscreen">フルスクリーン</option>
              <option value="windowed">ウィンドウ</option>
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>テーマ</label>
            <div>
              <input type="radio" id="light" name="theme_radio" checked={settings.theme === 'light'} onChange={() => handleRadioChange('theme', 'light')} />
              <label htmlFor="light" style={styles.radioLabel}>ライト</label>
              <input type="radio" id="dark" name="theme_radio" checked={settings.theme === 'dark'} onChange={() => handleRadioChange('theme', 'dark')} />
              <label htmlFor="dark" style={styles.radioLabel}>ダーク</label>
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>フォントサイズ</label>
            <select name="fontSize" value={settings.fontSize} onChange={handleChange} style={styles.formInput}>
              <option value="12px">小</option>
              <option value="14px">中 (デフォルト)</option>
              <option value="16px">大</option>
              <option value="18px">特大</option>
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>効果音</label>
            {/* 効果音のUIは未実装のため空 */}
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>雀卓の背景</label>
            <div>
              <input type="radio" name="table_bg_radio" checked={settings.tableBg === 'default'} onChange={() => handleRadioChange('tableBg', 'default')} />
              <label style={styles.radioLabel}>デフォルト</label>
              <input type="radio" name="table_bg_radio" checked={settings.tableBg === 'image'} onChange={() => tableBgInputRef.current.click()} />
              <label style={styles.radioLabel}>画像</label>
              <input type="file" ref={tableBgInputRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileChange(e, 'tableBg')} />
              <button style={{ ...styles.uploadButton, ...(hoveredButton === 'uploadTable' && styles.uploadButtonHover) }} onClick={() => tableBgInputRef.current.click()} onMouseOver={() => setHoveredButton('uploadTable')} onMouseOut={() => setHoveredButton(null)}>↑</button>
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>アプリの背景</label>
            <div>
              <input type="radio" name="app_bg_radio" checked={settings.appBg === 'default'} onChange={() => handleRadioChange('appBg', 'default')} />
              <label style={styles.radioLabel}>デフォルト</label>
              <input type="radio" name="app_bg_radio" checked={settings.appBg === 'image'} onChange={() => appBgInputRef.current.click()} />
              <label style={styles.radioLabel}>画像</label>
              <input type="file" ref={appBgInputRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileChange(e, 'appBg')} />
              <button style={{ ...styles.uploadButton, ...(hoveredButton === 'uploadApp' && styles.uploadButtonHover) }} onClick={() => appBgInputRef.current.click()} onMouseOver={() => setHoveredButton('uploadApp')} onMouseOut={() => setHoveredButton(null)}>↑</button>
            </div>
          </div>
        </div>
        <div style={styles.modalFooter}>
          <button style={{ ...styles.button, ...(hoveredButton === 'reset' && styles.buttonHover) }} onClick={resetSettings} onMouseOver={() => setHoveredButton('reset')} onMouseOut={() => setHoveredButton(null)}>設定の初期化</button>
          <button style={{ ...styles.button, ...(hoveredButton === 'exit' && styles.buttonHover) }} onMouseOver={() => setHoveredButton('exit')} onMouseOut={() => setHoveredButton(null)}>アプリ終了</button>
        </div>
      </div>
    </div>
  );
};