import React from 'react';
import TileDisplayArea from './TileDisplayArea';
import CalculationButton from './CalculationButton';
import CalculationResults from './CalculationResults';

const styles = {
  gameStatusContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 2.5,
    gap: '15px',
    minWidth: 0,
  }
};

const GameStatusArea = ({
  gameState,
  calculationResults,
  isLoadingCalculation,
  onStartCalculation,
  isCalculationDisabled,
  isRecognizing,
}) => {

  const handleTileChange = async (logPayload) => {
    // -----------------------------------------------------
    // 既存のコンソール出力処理（修正箇所）
    // -----------------------------------------------------
    const { timestamp, changeInfo, boardState } = logPayload;
    const { from, to, location: changeLocation } = changeInfo;

    let locationDescription = '';
    const playerNames = { self: '自分', shimocha: '下家', toimen: '対面', kamicha: '上家' };

    switch (changeLocation.type) {
      case 'hand': locationDescription = `自分の手牌 (${changeLocation.index + 1}番目)`; break;
      case 'tsumo': locationDescription = '自分のツモ牌'; break;
      case 'dora': locationDescription = `ドラ表示牌 (${changeLocation.index + 1}番目)`; break;
      case 'discard':
        const playerName = playerNames[changeLocation.playerKey] || '不明';
        locationDescription = `${playerName}の捨て牌 (${changeLocation.index + 1}番目)`;
        break;
      default: locationDescription = '不明な場所'; break;
    }

    console.groupCollapsed(`[牌譜ログ] ${new Date(timestamp).toLocaleTimeString()}｜${locationDescription}: ${from.name} → ${to.name}`);
    console.group('変更内容');
    console.log(`場所: %c${locationDescription}`, 'color: #00aaff; font-weight: bold;');
    console.log(`変更前: ${from.name}`);
    console.log(`変更後: %c${to.name}`, 'color: #aaff00; font-weight: bold;');
    console.groupEnd();
    console.group('盤面全体の状態 (スナップショット)');
    console.log('巡目:', boardState.turn);
    console.log('手牌:', boardState.hand_tiles);
    console.log('ドラ表示牌:', boardState.dora_indicators);
    console.log('各プレイヤーの捨て牌:', boardState.player_discards);
    console.log('各プレイヤーの風:', boardState.player_winds);
    console.groupEnd();
    console.log('詳細オブジェクト:', logPayload);
    console.groupEnd();

    // -----------------------------------------------------
    // サーバーへの送信処理（変更なし）
    // -----------------------------------------------------
    try {
      const dataToSend = {
        ...gameState,
        ...boardState, // logPayload.boardState を直接参照してもOK
      };

      const response = await fetch('/app/main/', { //バックエンドがある位置を書く
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error(`サーバーへのデータ送信に失敗しました。 Status: ${response.status}`);
      }

      const result = await response.json();
      console.log('サーバーへのデータ送信成功:', result);

    } catch (error) {
      console.error('サーバーへのデータ送信中にエラーが発生しました:', error);
    }
  };

  return (
    <div style={styles.gameStatusContainer}>
      <TileDisplayArea onTileChange={handleTileChange} />

      <CalculationButton
        onClick={onStartCalculation}
        isLoading={isLoadingCalculation}
        isDisabled={isCalculationDisabled || isRecognizing}
      />

      <CalculationResults
        results={calculationResults}
        isLoading={isLoadingCalculation}
        currentTurn={gameState ? gameState.turn : 1}
      />
    </div>
  );
};

export default GameStatusArea;