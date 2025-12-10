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
  onSendRecordingData,
  displaySettings,  
  // ★★★ 追加: MainScreenから渡されるPropsを受け取る
  isSaving,
  calculationError,
  selectedKifuData,
  onKifuTurnChange
}) => {
  return (
    <div style={styles.gameStatusContainer}>
      {/* ★★★ 修正: showStatusがtrueの場合のみ表示 ★★★ */}
      {displaySettings && displaySettings.showStatus && (
        <TileDisplayArea
          boardState={boardState}
          onBoardStateChange={onBoardStateChange}
          onResetBoardState={onResetBoardState} 
          settings={settings}
          use3D={use3D}
          isSimulatorMode={isSimulatorMode}        
          onModeChange={onModeChange}
          calculationError={calculationError}
          selectedKifuData={selectedKifuData}
          onKifuTurnChange={onKifuTurnChange}
        />
      )}

      {/* ボタンエリアは常に表示（または別の設定にする場合はここも条件分岐） */}
      <ButtonContainer
        onCalculationClick={onStartCalculation}
        isLoading={isLoadingCalculation}
        isDisabled={isCalculationDisabled || isRecognizing}
        isSimulatorMode={isSimulatorMode}
        recordingStatus={recordingStatus}
        isModalOpen={isModalOpen}
        onRecordingFunction={onRecordingFunction}
        onSendRecordingData={onSendRecordingData}
        isSaving={isSaving}
      />

      {/* ★★★ 修正: showSimulationがtrueの場合のみ表示 ★★★ */}
      {displaySettings && displaySettings.showSimulation && (
        <CalculationResults
          results={calculationResults}
          isLoading={isLoadingCalculation}
          currentTurn={boardState ? boardState.turn : 1}
          settings={settings}
          displaySettings={displaySettings} // ★★★ 表示件数設定のためここにも渡す
        />
      )}
    </div>
  );
};

export default GameStatusArea;