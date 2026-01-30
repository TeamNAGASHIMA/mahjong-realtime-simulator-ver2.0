// GameStatusArea_child/ButtonContainer.js

import React from 'react';
// ★★★ パスを修正: ボタン類はサブフォルダにある ★★★
import CalculationButton from './ButtonContainer_child/CalculationButton'; 
import RecordButton from './ButtonContainer_child/RecordButton';           
import TurnSelector from './TurnSelector'; // 同階層にあると仮定

const containerStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px', // ボタン間の隙間
};

const recordButtonWrapperStyles = {
  // 横幅を全体の約4分の1に設定
  flex: 1, 
  display: 'flex', // 中身（TurnSelector）を広げるために追加
  minWidth: 0,     // フレックスアイテムのはみ出し防止
};

const calculationButtonWrapperStyles = {
  // 横幅を全体の約4分の3に設定
  flex: 3,
};

const ButtonContainer = ({
  onCalculationClick,
  isLoading,
  isDisabled,
  calculationText = "計算開始",
  isSimulatorMode,
  recordingStatus,
  isModalOpen,
  onRecordingFunction,
  onSendRecordingData,
  isSaving,
  // ★★★ TurnSelector用のProps ★★★
  selectedKifuData,
  currentKifuTurn,
  onKifuTurnChange
}) => {

  // 牌譜モード かつ データがある場合にターンセレクターを表示する
  // データがない場合は、ボタンを表示しないか、あるいは無効なRecordButtonを表示するかになりますが、
  // ここでは「シミュレーターモード以外でデータがあればセレクター」とします。
  const showTurnSelector = !isSimulatorMode && selectedKifuData && selectedKifuData.length > 0;

  return (
    <div style={containerStyles}>
      
      {/* 左側エリア: 記録ボタン または ターンセレクター */}
      <div style={recordButtonWrapperStyles}>
        {showTurnSelector ? (
          /* 牌譜モード: ターンセレクターを表示 */
          <TurnSelector 
            currentTurn={currentKifuTurn}
            kifuData={selectedKifuData}
            onTurnChange={onKifuTurnChange}
          />
        ) : (
          /* シミュレーターモード: 記録ボタンを表示 */
          /* ※牌譜モードでもデータがない場合はここに来ますが、その場合はRecordButtonが表示されます。
             もし牌譜モードでデータがない場合に何も表示したくない場合は isSimulatorMode && ... で囲ってください */
          <RecordButton 
            recordingStatus={recordingStatus}
            isModalOpen={isModalOpen}
            onRecordingFunction={onRecordingFunction}
            onSendRecordingData={onSendRecordingData}
            isSaving={isSaving}
          />
        )}
      </div>

      {/* 右側エリア: 計算開始ボタン (UI変更なし) */}
      <div style={calculationButtonWrapperStyles}>
        <CalculationButton
          onClick={onCalculationClick}
          isLoading={isLoading}
          isDisabled={isDisabled}
          text={calculationText}
        />
      </div>
    </div>
  );
};

export default ButtonContainer;