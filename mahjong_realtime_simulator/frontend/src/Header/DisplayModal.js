// Header/DisplayModal.js
import React from 'react';
import { styles } from './styles';

// 表示/非表示の選択肢を持つUI
// propsとして現在の値(checked)と変更ハンドラ(onChange)を受け取るように修正
const DisplayOption = ({ label, name, checked, onChange }) => (
  <div style={styles.formGroup}>
    <label style={styles.formLabel}>{label}</label>
    <div>
      <input 
        type="radio" 
        id={`${name}_show`} 
        name={name} 
        checked={checked === true} 
        onChange={() => onChange(true)} 
      />
      <label htmlFor={`${name}_show`} style={styles.radioLabel}>表示</label>
      
      <input 
        type="radio" 
        id={`${name}_hide`} 
        name={name} 
        checked={checked === false} 
        onChange={() => onChange(false)} 
      />
      <label htmlFor={`${name}_hide`} style={styles.radioLabel}>非表示</label>
    </div>
  </div>
);

export const DisplayModal = ({ onClose, settings, onSettingsChange }) => {
  // settingsがまだロードされていない場合の安全策
  const currentSettings = settings || {
    resultCount: 5,
    showStatus: true,
    showSimulation: true,
    showCamera: true,
    showSettings: true
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalHeaderTitle}>表示</h3>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </div>
        <div style={styles.modalBody}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>シミュレーション結果の表示件数</label>
            <select 
              style={styles.formInput} 
              value={currentSettings.resultCount}
              onChange={(e) => onSettingsChange('resultCount', parseInt(e.target.value, 10))}
            >
              {[...Array(14)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>
          <h4 style={{ marginTop: '30px', borderTop: '1px solid #444', paddingTop: '20px' }}>
            UIの項目表示非表示設定
          </h4>
          <DisplayOption 
            label="状況" 
            name="status" 
            checked={currentSettings.showStatus} 
            onChange={(val) => onSettingsChange('showStatus', val)} 
          />
          <DisplayOption 
            label="シミュレーション結果" 
            name="simulation" 
            checked={currentSettings.showSimulation} 
            onChange={(val) => onSettingsChange('showSimulation', val)} 
          />
          <DisplayOption 
            label="カメラプレビュー" 
            name="camera_preview" 
            checked={currentSettings.showCamera} 
            onChange={(val) => onSettingsChange('showCamera', val)} 
          />
          <DisplayOption 
            label="設定" 
            name="settings_ui" 
            checked={currentSettings.showSettings} 
            onChange={(val) => onSettingsChange('showSettings', val)} 
          />
        </div>
      </div>
    </div>
  );
};