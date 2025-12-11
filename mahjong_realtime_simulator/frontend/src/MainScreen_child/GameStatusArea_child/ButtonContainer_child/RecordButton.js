// RecordButton.js

import React, { useState } from 'react';
import ConfirmModal from './ConfirmModal'; // 作成したモーダルをインポート

// スタイル定義
const baseButtonStyles = { fontFamily: "'Inter', sans-serif", fontSize: '16px', color: '#ffffff', width: '100%', height: '40px', border: 'none', borderRadius: '25px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontWeight: 'bold', outline: 'none', transition: 'background-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out' };
const recordStartStyles = { backgroundColor: '#3498db' };
const recordStartHoverStyles = { backgroundColor: '#5dade2' };
const recordStartActiveStyles = { backgroundColor: '#2e86c1', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)' };
const recordEndStyles = { backgroundColor: '#e74c3c' };
const recordEndHoverStyles = { backgroundColor: '#ec7063' };
const recordEndActiveStyles = { backgroundColor: '#cb4335', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)' };

// クイック保存ボタン用スタイル
const quickSaveStyles = { backgroundColor: '#27ae60' };
const quickSaveHoverStyles = { backgroundColor: '#2ecc71' };
const quickSaveActiveStyles = { backgroundColor: '#219150', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)' };

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

const RecordButton = ({
  onRecordingFunction,
  recordingStatus,
  isModalOpen,
  onSendRecordingData,
  isSaving
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  
  // クイック保存ボタン用のState
  const [isQuickHovered, setIsQuickHovered] = useState(false);
  const [isQuickActive, setIsQuickActive] = useState(false);

  const handleConfirmSave = (fileName) => {
    onSendRecordingData(fileName);
  };

  const handleCancelSave = () => {
    console.log('保存はキャンセルされました。記録を終了します。');
    onRecordingFunction();
  };

  // クイック保存処理
  const handleQuickSave = () => {
    // 記録終了ボタンが押された後(recordingStatus===2)や、保存処理中(isSaving)は押せない
    if (recordingStatus !== 1 || isSaving) return;

    const fileName = `QuickSave_${getFormattedDateTime()}`;
    // 第二引数 true でクイック保存であることを通知
    onSendRecordingData(fileName, true);
  };

  // メインボタン（開始/終了）のスタイル決定ロジック
  let currentStyle = { ...baseButtonStyles };
  if (recordingStatus === 1) { // 記録中 -> 終了ボタン（赤）
    currentStyle = { ...currentStyle, ...recordEndStyles };
    if (isActive) { currentStyle = { ...currentStyle, ...recordEndActiveStyles }; } 
    else if (isHovered) { currentStyle = { ...currentStyle, ...recordEndHoverStyles }; }
  } else { // 停止中 -> 開始ボタン（青）
    currentStyle = { ...currentStyle, ...recordStartStyles };
    if (isActive) { currentStyle = { ...currentStyle, ...recordStartActiveStyles }; }
    else if (isHovered) { currentStyle = { ...currentStyle, ...recordStartHoverStyles }; }
  }

  // クイック保存ボタンのスタイル決定ロジック
  let currentQuickSaveStyle = { ...baseButtonStyles, fontSize: '14px' };
  currentQuickSaveStyle = { ...currentQuickSaveStyle, ...quickSaveStyles };
  if (isQuickActive) { currentQuickSaveStyle = { ...currentQuickSaveStyle, ...quickSaveActiveStyles }; }
  else if (isQuickHovered) { currentQuickSaveStyle = { ...currentQuickSaveStyle, ...quickSaveHoverStyles }; }
  
  // 保存中は薄くして押せないように見せる
  if (isSaving) {
      currentQuickSaveStyle.opacity = 0.6;
      currentQuickSaveStyle.cursor = 'not-allowed';
      currentStyle.opacity = 0.6;
      currentStyle.cursor = 'not-allowed';
  }

  return (
    <>
      <div style={{ display: 'flex', width: '100%', gap: '8px' }}>
        {/* メインの記録開始・終了ボタン */}
        <button
          style={currentStyle}
          onClick={() => onRecordingFunction()}
          onMouseOver={() => setIsHovered(true)}
          onMouseOut={() => { setIsHovered(false); setIsActive(false); }}
          onMouseDown={() => setIsActive(true)}
          onMouseUp={() => setIsActive(false)}
          disabled={isSaving} // 保存中は操作不可
        >
          {recordingStatus === 0 ? '記録開始' : '記録終了'}
        </button>

        {/* クイック保存ボタン (記録中のみ表示) */}
        {recordingStatus === 1 && (
          <button
            style={currentQuickSaveStyle}
            onClick={handleQuickSave}
            onMouseOver={() => setIsQuickHovered(true)}
            onMouseOut={() => { setIsQuickHovered(false); setIsQuickActive(false); }}
            onMouseDown={() => setIsQuickActive(true)}
            onMouseUp={() => setIsQuickActive(false)}
            disabled={isSaving} // 保存中は操作不可
            title="現在の状態を保存します（記録は継続されます）"
          >
            クイック保存
          </button>
        )}
      </div>
      
      <ConfirmModal
        show={isModalOpen}
        title="記録を保存しますか？" 
        defaultFileName={`recording_${getFormattedDateTime()}`}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
        isLoading={isSaving}
      />
    </>
  );
};

export default RecordButton;