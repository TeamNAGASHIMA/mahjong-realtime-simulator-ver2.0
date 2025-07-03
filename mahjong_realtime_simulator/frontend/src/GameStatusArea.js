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
  onBoardStateChange,
}) => {

  const handleTileChange = async (logPayload) => {
    // ... (コンソール出力処理は変更なし) ...
    
    if (onBoardStateChange) {
      // ▼▼▼【変更点】logPayloadから更新後のboardStateを取得して親に渡す ▼▼▼
      onBoardStateChange(logPayload.boardState);
    }
  };

  return (
    <div style={styles.gameStatusContainer}>
      <TileDisplayArea
        boardState={boardState}
        onTileChange={handleTileChange} 
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