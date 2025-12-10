// RecordButton.js (修正版)

import React, { useState } from 'react';
import ConfirmModal from './ConfirmModal'; // 作成したモーダルをインポート

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

const RecordButton = ({
  onRecordingFunction,
  recordingStatus,
  isModalOpen,
  onSendRecordingData,
  // ★★★ 追加: isSavingを受け取る
  isSaving
}) => {
  const [isRecordingStyle, setIsRecordingStyle] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  
  const handleConfirmSave = (fileName) => {
    console.log(`ファイル名「${fileName}」で保存処理を実行します。`);
    // ここではまだスタイルを戻さない（保存処理完了後に戻る、またはOverlayが出るため）
    // setIsRecordingStyle(false); // コメントアウト、またはオーバーレイが出るので即時実行でも可
    setIsRecordingStyle(false);
    onSendRecordingData(fileName);
  };

  const handleCancelSave = () => {
    console.log('保存はキャンセルされました。記録を終了します。');
    setIsRecordingStyle(false);
    onRecordingFunction();
    console.log('記録を終了しました。');
  };

  // スタイル決定ロジック（変更なし）
  let currentStyle = { ...baseButtonStyles };
  if (isRecordingStyle) {
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
        onClick={
          () => onRecordingFunction()
        }
        onMouseOver={() => setIsHovered(true)}
        onMouseOut={() => { setIsHovered(false); setIsActive(false); }}
        onMouseDown={() => setIsActive(true)}
        onMouseUp={() => setIsActive(false)}
        // ★★★ 追加: 保存中はボタンを押せなくする
        disabled={isSaving}
      >
        {recordingStatus === 0 ? '記録開始' : '記録終了'}
      </button>
      
      <ConfirmModal
        show={isModalOpen}
        title="記録を保存しますか？" 
        defaultFileName={`recording_${getFormattedDateTime()}`}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
        // ★★★ 追加: ConfirmModalがisLoadingプロップに対応している場合ここで渡す
        isLoading={isSaving}
      />
    </>
  );
};

export default RecordButton;