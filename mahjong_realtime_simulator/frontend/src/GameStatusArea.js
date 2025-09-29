// GameStatusArea.js
import React from 'react';
import TileDisplayArea from './TileDisplayArea';
import CalculationButton from './CalculationButton';
import CalculationResults from './CalculationResults';

const styles = { /* ... (変更なし) ... */ };

const GameStatusArea = ({
  boardState,
  calculationResults,
  isLoadingCalculation,
  onStartCalculation,
  isCalculationDisabled,
  isRecognizing,
  onBoardStateChange, // 親から受け取るonBoardStateChange
}) => {
  // TileDisplayAreaが直接onBoardStateChangeを呼び出すため、
  // GameStatusArea内でhandleTileChange関数を定義する必要はなくなりました。

  return (
    <div style={styles.gameStatusContainer}>
      <TileDisplayArea
        boardState={boardState}
        onBoardStateChange={onBoardStateChange} // TileDisplayAreaがboardStateを変更したときに親に通知するため、直接渡します
      />

      <CalculationButton
        onClick={onStartCalculation}
        isLoading={isLoadingCalculation}
        isDisabled={isCalculationDisabled || isRecognizing}
      />

      <CalculationResults
        results={calculationResults}
        isLoading={isLoadingCalculation}
        currentTurn={boardState ? boardState.turn : 1}
      />
    </div>
  );
};

export default GameStatusArea;