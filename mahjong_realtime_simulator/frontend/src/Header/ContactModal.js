// Header/ContactModal.js
import React, {useEffect} from  'react';
import { styles } from './styles';

export const ContactModal = ({ onClose }) => {
  const formUrl = "https://forms.gle/o8KCFMgCu9Gd5VnFA";

  // ★ここから追加: Escapeキーでモーダルを閉じるための処理
  useEffect(() => {
    // キーが押されたときに実行される関数
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose(); // Escapeキーが押されたらonClose関数を呼び出す
      }
    };              
    // グローバルなkeydownイベントリスナーを追加      
    window.addEventListener('keydown', handleKeyDown);

    // クリーンアップ関数: コンポーネントがアンマウントされるときにイベントリスナーを削除
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };   
  }, [onClose]); // 依存配列にonCloseを含め、onCloseが変更された場合に再設定する
  // ★ここまで追加 
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