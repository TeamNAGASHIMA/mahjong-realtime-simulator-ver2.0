// ButtonContainer.js

import React from 'react';
import CalculationButton from './ButtonContainer_child/CalculationButton'; // 元の計算開始ボタン
import RecordButton from './ButtonContainer_child/RecordButton';           // 新しく作成した記録ボタン
import TurnSelector from './TurnSelector';

const containerStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px', // ボタン間の隙間
};

const recordButtonWrapperStyles = {
  // 横幅を全体の約4分の1に設定
  flex: 1, // flex-grow, flex-shrink, flex-basis を一括指定
};

const calculationButtonWrapperStyles = {
  // 横幅を全体の約4分の3に設定
  flex: 3,
};


const ButtonContainer = ({
  onCalculationClick,
  isLoading,
  isDisabled,
  calculationText,
  isSimulatorMode,
  recordingStatus,
  isModalOpen,
  onRecordingFunction,
  onSendRecordingData,
  isSaving
}) => {
  return (
    <div style={containerStyles}>
      <div style={recordButtonWrapperStyles}>
        {isSimulatorMode ? (
          <RecordButton 
            recordingStatus={recordingStatus}
            isModalOpen={isModalOpen}
            onRecordingFunction={onRecordingFunction}
            onSendRecordingData={onSendRecordingData}
            isSaving={isSaving}
          />
        ) : <TurnSelector />}
      </div>
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