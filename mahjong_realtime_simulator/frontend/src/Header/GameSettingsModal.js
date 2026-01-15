// Header/GameSettingsModal.js
import React from 'react';

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 },
  content: { backgroundColor: '#2c3e50', padding: '25px', borderRadius: '8px', width: '400px', color: '#ecf0f1', border: '1px solid #444' },
  header: { fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', borderBottom: '1px solid #34495e', paddingBottom: '10px' },
  formGroup: { marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '14px', fontWeight: 'bold' },
  select: { padding: '8px', borderRadius: '4px', backgroundColor: '#34495e', color: 'white', border: '1px solid #555' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', padding: '5px 0' },
  footer: { marginTop: '20px', textAlign: 'right' },
  button: { padding: '8px 20px', backgroundColor: '#3498db', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }
};

export const GameSettingsModal = ({ settings, onSettingsChange, onClose }) => {
  const handleChange = (key, value) => {
    onSettingsChange({ [key]: value });
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.content} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>ゲームルール設定</div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>数え役満の扱い</label>
          <select 
            style={styles.select}
            value={settings.kazoe_limit}
            onChange={(e) => handleChange('kazoe_limit', parseInt(e.target.value))}
          >
            <option value={0}>なし（三倍満止まり）</option>
            <option value={1}>役満（13翻〜）</option>
            <option value={2}>ダブル役満（26翻〜）</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          {/* ここにあった赤ドラ設定を削除しました */}
          
          <label style={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              checked={settings.has_open_tanyao}
              onChange={(e) => handleChange('has_open_tanyao', e.target.checked)}
            />
            喰いタンあり
          </label>

          <label style={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              checked={settings.kiriage}
              onChange={(e) => handleChange('kiriage', e.target.checked)}
            />
            切り上げ満貫あり（30符4翻/60符3翻を1万2千/8千点とする）
          </label>
        </div>

        <div style={styles.footer}>
          <button style={styles.button} onClick={onClose}>確定</button>
        </div>
      </div>
    </div>
  );
};