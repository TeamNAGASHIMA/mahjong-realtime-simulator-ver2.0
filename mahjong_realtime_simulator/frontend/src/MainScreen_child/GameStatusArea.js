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
  isSimulatorMode,  
  onModeChange,
  recordingStatus, 
  isModalOpen,
  onRecordingFunction,
  onSendRecordingData
}) => {
  return (
    <div style={styles.gameStatusContainer}>
      <TileDisplayArea
        boardState={boardState}
        onBoardStateChange={onBoardStateChange}
        onResetBoardState={onResetBoardState} 
        settings={settings}
        use3D={use3D}
        isSimulatorMode={isSimulatorMode}        
        onModeChange={onModeChange}
        calculationError={calculationError} // ★★★ 追加4: TileDisplayAreaに渡す
        selectedKifuData={selectedKifuData} // ★★★ 追加5: TileDisplayAreaに渡す
        onKifuTurnChange={onKifuTurnChange} // ★★★ 追加6: TileDisplayAreaに渡す
      />

      <ButtonContainer
        onCalculationClick={onStartCalculation}
        isLoading={isLoadingCalculation}
        isDisabled={isCalculationDisabled || isRecognizing}
        isSimulatorMode={isSimulatorMode}
        recordingStatus={recordingStatus}
        isModalOpen={isModalOpen}
        onRecordingFunction={onRecordingFunction}
        onSendRecordingData={onSendRecordingData}
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