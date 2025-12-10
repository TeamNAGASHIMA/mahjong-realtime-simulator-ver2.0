// ConfirmModal.js (新規作成)

import React, { useState, useEffect, useRef } from 'react';

// スタイル定義
const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#2c3e50',
    padding: '25px',
    borderRadius: '8px',
    width: '400px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
    border: '1px solid #444',
  },
  modalHeader: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#ecf0f1',
  },
  modalBody: {
    marginBottom: '25px',
  },
  formInput: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #777',
    backgroundColor: '#34495e',
    color: '#ecf0f1',
    boxSizing: 'border-box', // paddingを含めてwidth 100%にする
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  button: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
  },
  confirmButton: {
    backgroundColor: '#3498db',
    color: 'white',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
    color: 'white',
  },
};

const ConfirmModal = ({ 
  show,
  title,
  defaultFileName,
  onConfirm,
  onCancel
}) => {
  const [fileName, setFileName] = useState(defaultFileName);
  const inputRef = useRef(null);

  // モーダルが表示されたときに、デフォルトファイル名をセットし直し、入力欄にフォーカスする
  useEffect(() => {
    if (show) {
      setFileName(defaultFileName);
      // 少し遅延させてからフォーカスを当てる
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [show, defaultFileName]);

  if (!show) {
    return null;
  }

  const handleConfirm = () => {
    let trimmedFileName = fileName.trim() === '' ? defaultFileName : fileName;
    onConfirm(trimmedFileName);
  };

  return (
    <div style={styles.modalOverlay} onClick={onCancel}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.modalHeader}>{title}</h3>
        <div style={styles.modalBody}>
          <input
            ref={inputRef}
            type="text"
            style={styles.formInput}
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
          />
        </div>
        <div style={styles.modalFooter}>
          <button style={{ ...styles.button, ...styles.cancelButton }} onClick={onCancel}>
            キャンセル
          </button>
          <button style={{ ...styles.button, ...styles.confirmButton }} onClick={handleConfirm}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;