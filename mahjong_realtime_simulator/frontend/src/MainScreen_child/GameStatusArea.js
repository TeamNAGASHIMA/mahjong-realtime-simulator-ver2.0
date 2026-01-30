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
  isSaving,
  calculationError,
  // ★★★ 修正: 親から受け取るProps名を変更 (Turn -> Index) ★★★
  selectedKifuData,
  currentKifuIndex,    // 旧: currentKifuTurn
  onKifuIndexChange    // 旧: onKifuTurnChange
}) => {

  return (
    <div style={styles.gameStatusContainer}>
      
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
          // ★★★ 修正: TileDisplayAreaへ渡す名前も変更 ★★★
          // 注意: TileDisplayArea.js側でも props を currentKifuIndex として受け取る修正が必要です
          currentKifuIndex={currentKifuIndex} 
          onKifuIndexChange={onKifuIndexChange}
        />
      )}

      {/* ButtonContainerに必要なデータを全て渡す */}
      <ButtonContainer
        onCalculationClick={onStartCalculation}
        isLoading={isLoadingCalculation}
        isDisabled={isCalculationDisabled || isRecognizing}
        // 計算ボタンのテキスト制御
        calculationText={isLoadingCalculation ? "計算中..." : "計算開始"}
        
        isSimulatorMode={isSimulatorMode}
        recordingStatus={recordingStatus}
        isModalOpen={isModalOpen}
        onRecordingFunction={onRecordingFunction}
        onSendRecordingData={onSendRecordingData}
        isSaving={isSaving}
        
        // ★★★ 修正: Indexを渡すように変更 ★★★
        selectedKifuData={selectedKifuData}
        currentKifuIndex={currentKifuIndex} // 旧: currentKifuTurn
        onKifuIndexChange={onKifuIndexChange} // 旧: onKifuTurnChange
      />

      {displaySettings && displaySettings.showSimulation && (
        <CalculationResults
          results={calculationResults}
          isLoading={isLoadingCalculation}
          currentTurn={boardState ? boardState.turn : 1}
          settings={settings}
          displaySettings={displaySettings}
        />
      )}
    </div>
  );
};

export default GameStatusArea;