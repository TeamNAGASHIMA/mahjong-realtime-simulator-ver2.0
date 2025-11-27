// Header/styles.js
// 複数のコンポーネントで共通して使用されるスタイル定義です。

export const styles = {
  // モーダル全体
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
    zIndex: 1000 
  },
  modalContent: { 
    backgroundColor: '#2a2a2a', 
    padding: 0, 
    borderRadius: '8px', 
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)', 
    width: '550px', 
    maxWidth: '90%',  
    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px)', 
    backgroundSize: '20px 20px', 
    display: 'flex', 
    flexDirection: 'column', 
    color: '#ccc' 
  },
  modalHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '10px 20px', 
    backgroundColor: '#333', 
    borderBottom: '1px solid #444', 
    borderTopLeftRadius: '8px', 
    borderTopRightRadius: '8px' 
  },
  modalHeaderTitle: { 
    margin: 0, 
    fontSize: '16px' 
  },
  closeButton: { 
    background: 'none', 
    border: 'none', 
    color: '#ccc', 
    fontSize: '24px', 
    cursor: 'pointer', 
    padding: '0 5px' 
  },
  modalBody: { 
    padding: '20px', 
    maxHeight: '70vh', 
    overflowY: 'auto' 
  },
  modalFooter: { 
    display: 'flex', 
    justifyContent: 'flex-end', 
    padding: '15px 20px', 
    borderTop: '1px solid #444', 
    marginTop: 'auto' 
  },
  
  // フォーム関連
  formGroup: { 
    marginBottom: '15px', 
    display: 'flex', 
    alignItems: 'center' 
  },
  formLabel: { 
    width: '150px', 
    marginRight: '10px', 
    flexShrink: 0 
  },
  formInput: { 
    flex: 1, 
    backgroundColor: '#333', 
    border: '1px solid #555', 
    color: '#fff', 
    padding: '8px', 
    borderRadius: '4px' 
  },
  radioLabel: { 
    width: 'auto', 
    margin: '0 15px 0 5px' 
  },
  
  // ボタン関連
  button: { 
    padding: '8px 16px', 
    border: 'none', 
    borderRadius: '4px', 
    cursor: 'pointer', 
    marginLeft: '10px', 
    backgroundColor: '#4a4a4a', 
    color: '#ccc', 
    transition: 'background-color 0.2s ease', 
  },
  buttonHover: { 
    backgroundColor: '#6a6a6a', 
  },
  uploadButton: { 
    marginLeft: '10px', 
    background: 'transparent', 
    border: 'none', 
    color: '#ccc', 
    fontSize: '20px', 
    cursor: 'pointer', 
    padding: '0 5px', 
    borderRadius: '4px', 
    transition: 'background-color 0.2s ease, color 0.2s ease', 
  },
  uploadButtonHover: { 
    backgroundColor: '#555', 
    color: '#fff', 
  },
};