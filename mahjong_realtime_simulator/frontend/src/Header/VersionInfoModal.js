// Header/VersionInfoModal.js
import React from 'react';
import { styles } from './styles';

export const VersionInfoModal = ({ onClose }) => {
  const localStyles = {
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '10px 0',
      fontSize: '14px',
      borderBottom: '1px solid #3a3a3a'
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={{ ...styles.modalContent, width: '400px' }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalHeaderTitle}>バージョン情報</h3>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </div>
        <div style={styles.modalBody}>
          <div style={localStyles.infoRow}>
            <span>現在のバージョン</span>
            <span>1.0.0</span>
          </div>
          <div style={localStyles.infoRow}>
            <span>最新のバージョン</span>
            <span>1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};