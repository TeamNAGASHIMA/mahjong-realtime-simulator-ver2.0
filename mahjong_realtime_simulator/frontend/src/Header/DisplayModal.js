// Header/DisplayModal.js
import React from 'react';
import { styles } from './styles';

// 表示/非表示の選択肢を持つUIをコンポーネント化
const DisplayOption = ({ label, name }) => (
  <div style={styles.formGroup}>
    <label style={styles.formLabel}>{label}</label>
    <div>
      <input type="radio" id={`${name}_show`} name={name} defaultChecked />
      <label htmlFor={`${name}_show`} style={styles.radioLabel}>表示</label>
      <input type="radio" id={`${name}_hide`} name={name} />
      <label htmlFor={`${name}_hide`} style={styles.radioLabel}>非表示</label>
    </div>
  </div>
);

export const DisplayModal = ({ onClose }) => {
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
            <select style={styles.formInput} defaultValue="1">
              {[...Array(14)].map((_, i) => (
                <option key={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>
          <h4 style={{ marginTop: '30px', borderTop: '1px solid #444', paddingTop: '20px' }}>
            UIの項目表示非表示設定
          </h4>
          <DisplayOption label="状況" name="status" />
          <DisplayOption label="シミュレーション結果" name="simulation" />
          <DisplayOption label="カメラプレビュー" name="camera_preview" />
          <DisplayOption label="設定" name="settings_ui" />
        </div>
      </div>
    </div>
  );
};