// GameStatusArea.js
import React from 'react';
import TileDisplayArea from './GameStatusArea_child/TileDisplayArea';
import CalculationButton from './GameStatusArea_child/CalculationButton';
import CalculationResults from './GameStatusArea_child/CalculationResults';

const styles = { 
  gameStatusContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    flexGrow: 1,
  }
};

const GameStatusArea = ({
  boardState,
  calculationResults,
  isLoadingCalculation,
  onStartCalculation,
  isCalculationDisabled,
  isRecognizing,
  onBoardStateChange,
  onResetBoardState, // ★★★ 追加: 新しいプロップを受け取る ★★★
}) => {
  return (
    <div style={styles.gameStatusContainer}>
      <TileDisplayArea
        boardState={boardState}
        onBoardStateChange={onBoardStateChange}
        onResetBoardState={onResetBoardState} 
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