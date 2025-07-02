import React, { useRef, useState, useEffect } from 'react';

import Header from './Header';
import GameStatusArea from './GameStatusArea'; 
import SidePanel from './SidePanel'; 

const styles = {
  appContainer: { width: '100%', height: '100%', backgroundColor: '#FFFFFF', margin: '0 auto', border: '1px solid #ccc', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
  mainContent: { display: 'flex', flexGrow: 1, padding: '15px', gap: '15px', overflow: 'hidden' }
};

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}

function dataURLtoBlob(dataurl) {
    if (!dataurl) return null;
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){ u8arr[n] = bstr.charCodeAt(n); }
    return new Blob([u8arr], {type:mime});
}

const MainScreen = () => {
  // useEffectは画面初期化時のみ使用
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif";
    document.body.style.webkitFontSmoothing = 'antialiased';
    document.body.style.mozOsxFontSmoothing = 'grayscale';
    document.body.style.backgroundColor = '#282c34';
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.style.height = '100vh';
      rootElement.style.display = 'flex';
      rootElement.style.justifyContent = 'center';
      rootElement.style.alignItems = 'center';
    }
    return () => {
      document.body.style.backgroundColor = '';
      if (rootElement) {
        rootElement.style.height = '';
        rootElement.style.display = '';
        rootElement.style.justifyContent = '';
        rootElement.style.alignItems = '';
      }
    };
  }, []);

  // 牌変更時にGameStatusAreaから呼び出されるコールバック関数
  const handleBoardChange = (newBoardState) => {
    // 変更された盤面情報(newBoardState)を引数に、handleCalculateを直接呼び出す
    handleCalculate(newBoardState);
  };

  const sidePanelRef = useRef(null);

  // 計算ボタンクリック時と、牌変更時の両方から呼び出される統一された送信関数
  const handleCalculate = async (boardState = null) => {
    if (!sidePanelRef.current) return;

    try {
      const { images, settings } = sidePanelRef.current.getSidePanelData();
      const formData = new FormData();

      const handImageBlob = dataURLtoBlob(images.handImage);
      const boardImageBlob = dataURLtoBlob(images.boardImage);

      formData.append('hand_tiles_image', handImageBlob, "hand_tiles_image.jpg");
      if (boardImageBlob) formData.append("board_tiles_image", boardImageBlob, "board_tiles_image.jpg");
      
      let fixes_board_info;

      // boardStateが引数として渡された場合（牌変更時）
      if (boardState) {



        fixes_board_info = {
          "fixes_pai_info": {
            "turn": boardState.turn,
            "dora_indicators": boardState.dora_indicators,
            "hand_tiles": boardState.hand_tiles,
            "melded_blocks": boardState.melded_blocks || [],
            "zikaze": boardState.player_winds ? boardState.player_winds.self : 27,
            "bakaze": 27, // 仮
          },
          "fixes_river_tiles": Object.values(boardState.player_discards).flat(),  
        };
      }
      // boardStateが渡されなかった場合（計算ボタンクリック時）
      else {
        fixes_board_info = {
          "fixes_pai_info": {
              "version": "0.9.0",
              "zikaze": 27,
              "bakaze": 27,
              "turn": 3,
              "syanten_type": settings.syanten_type,
              "dora_indicators": [27],
              "flag": settings.flag,
              "hand_tiles": [],
              "melded_blocks": [],
              "counts": []
          },
          "fixes_river_tiles": []
        };
      }
      
      formData.append('fixes_board_info', JSON.stringify(fixes_board_info));
      formData.append('syanten_Type', JSON.stringify(settings.syanten_type || 1));
      formData.append('flag', JSON.stringify(settings.flag || 0));

      const response = await fetch('/app/main/', {
          method: 'POST',
          headers: {
              'X-CSRFToken': getCookie('csrftoken')
          },
          body: formData
      });
      
      const data = await response.json();

      console.log('message: ', data.message);
      console.log('status:', response.status);

      if (response.status === 200) {
          console.log('計算結果:', data.result_calc);
          // ここにバックエンドから受け取った計算結果をUIに反映させる処理を記述します
          // 例: setCalculationResults(data.result_calc);
      } else {
          alert("Could not calculate");
      }

    } catch (err) {
      alert('Sending failed. ' + err);
      console.log("message: Sending failed.");
    }
  };

  return (
    <div style={styles.appContainer}>
      <Header />
      <div style={styles.mainContent}>
        <GameStatusArea
          onStartCalculation={handleCalculate} // 計算ボタン用
          onBoardChange={handleBoardChange}   // 牌変更用
          gameState={null}
          calculationResults={[]}
          isLoadingCalculation={false}
          isCalculationDisabled={false}
          isRecognizing={false}
        />
        <SidePanel
          ref={sidePanelRef}
          onRecognize={() => {}}
          isRecognizing={false}
          settings={{}}
          onSettingsChange={() => {}}
        />
      </div>
    </div>
  );
};

export default MainScreen;