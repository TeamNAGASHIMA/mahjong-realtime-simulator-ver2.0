// GameStatusArea.js
import React from 'react';
import TileDisplayArea from './GameStatusArea_child/TileDisplayArea';
import ButtonContainer from './GameStatusArea_child/ButtonContainer';
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
  onResetBoardState,
  settings,
  use3D,
  onModeChange, // ★★★ 修正箇所1: onModeChangeプロップを受け取る
}) => {
  return (
    <div style={styles.gameStatusContainer}>
      <TileDisplayArea
        boardState={boardState}
        onBoardStateChange={onBoardStateChange}
        onResetBoardState={onResetBoardState} 
        settings={settings}
        use3D={use3D}
        onModeChange={onModeChange} // ★★★ 修正箇所2: 受け取ったonModeChangeをTileDisplayAreaに渡す
      />

      <ButtonContainer
        onCalculationClick={onStartCalculation}
        isLoading={isLoadingCalculation}
        isDisabled={isCalculationDisabled || isRecognizing}
      />

      <CalculationResults
        results={calculationResults}
        isLoading={isLoadingCalculation}
        currentTurn={boardState ? boardState.turn : 1}
        settings={settings}
      />
    </div>
  );
};

export default GameStatusArea;