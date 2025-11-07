// ButtonContainer.js

import React from 'react';
import CalculationButton from './CalculationButton'; // 元の計算開始ボタン
import RecordButton from './RecordButton';           // 新しく作成した記録ボタン

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


const ButtonContainer = ({ onCalculationClick, isLoading, isDisabled, calculationText }) => {
  return (
    <div style={containerStyles}>
      <div style={recordButtonWrapperStyles}>
        <RecordButton />
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