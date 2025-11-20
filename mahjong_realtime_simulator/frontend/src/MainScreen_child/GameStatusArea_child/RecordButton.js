// RecordButton.js (修正版)

import React, { useState } from 'react';
import ConfirmModal from './ButtonContainer_child/ConfirmModal'; // 作成したモーダルをインポート

// スタイル定義は変更ありません
const baseButtonStyles = { fontFamily: "'Inter', sans-serif", fontSize: '16px', color: '#ffffff', width: '100%', height: '40px', border: 'none', borderRadius: '25px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontWeight: 'bold', outline: 'none', transition: 'background-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out' };
const recordStartStyles = { backgroundColor: '#3498db' };
const recordStartHoverStyles = { backgroundColor: '#5dade2' };
const recordStartActiveStyles = { backgroundColor: '#2e86c1', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)' };
const recordEndStyles = { backgroundColor: '#e74c3c' };
const recordEndHoverStyles = { backgroundColor: '#ec7063' };
const recordEndActiveStyles = { backgroundColor: '#cb4335', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)' };

const getFormattedDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
};

// ★★★ 変更点1: propsでisRecording, onRecordStart, onRecordStopを受け取る ★★★
const RecordButton = ({ isRecording, onRecordStart, onRecordStop }) => {
  // isRecording stateは削除。代わりにpropsを使う。
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRecordStartClick = () => {
    if (window.confirm('記録を開始しますか？')) {
      onRecordStart(); // ★★★ 親コンポーネントの関数を呼び出す
    }
  };

  const handleRecordEndClick = () => {
    if (window.confirm('記録を終了しますか？')) {
      setIsModalOpen(true);
    }
  };
  
  // ★★★ 変更点2: 保存確定時に親の onRecordStop をファイル名付きで呼び出す ★★★
  const handleConfirmSave = (fileName) => {
    onRecordStop(fileName); // 親にファイル名を渡して保存処理を依頼
    setIsModalOpen(false);
  };

  // ★★★ 変更点3: キャンセル時にも親の onRecordStop をnullで呼び出す ★★★
  const handleCancelSave = () => {
    onRecordStop(null); // 親にnullを渡して「保存しない終了」を伝える
    setIsModalOpen(false);
  };

  let currentStyle = { ...baseButtonStyles };
  if (isRecording) {
    currentStyle = { ...currentStyle, ...recordEndStyles };
    if (isActive) { currentStyle = { ...currentStyle, ...recordEndActiveStyles }; } 
    else if (isHovered) { currentStyle = { ...currentStyle, ...recordEndHoverStyles }; }
  } else {
    currentStyle = { ...currentStyle, ...recordStartStyles };
    if (isActive) { currentStyle = { ...currentStyle, ...recordStartActiveStyles }; }
    else if (isHovered) { currentStyle = { ...currentStyle, ...recordStartHoverStyles }; }
  }

  return (
    <>
      <button
        style={currentStyle}
        // ★★★ 変更点4: クリック時のハンドラをisRecording(props)に応じて切り替え ★★★
        onClick={isRecording ? handleRecordEndClick : handleRecordStartClick}
        onMouseOver={() => setIsHovered(true)}
        onMouseOut={() => { setIsHovered(false); setIsActive(false); }}
        onMouseDown={() => setIsActive(true)}
        onMouseUp={() => setIsActive(false)}
      >
        {isRecording ? '記録終了' : '記録開始'}
      </button>
      
      <ConfirmModal
        show={isModalOpen}
        title="記録を保存しますか？"
        defaultFileName={`recording_${getFormattedDateTime()}.txt`}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
      />
    </>
  );
};

export default RecordButton;