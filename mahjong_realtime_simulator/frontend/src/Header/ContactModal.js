// Header/ContactModal.js
import React from 'react';
import { styles } from './styles';

export const ContactModal = ({ onClose }) => {
  const formUrl = "https://forms.gle/o8KCFMgCu9Gd5VnFA";

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={{ ...styles.modalContent, width: '700px', height: '80vh', maxHeight: '600px' }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalHeaderTitle}>お問い合わせ</h3>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </div>
        <div style={{ ...styles.modalBody, padding: 0, flex: 1 }}>
          <iframe
            src={formUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="お問い合わせフォーム"
          >
            読み込んでいます…
          </iframe>
        </div>
      </div>
    </div>
  );
};