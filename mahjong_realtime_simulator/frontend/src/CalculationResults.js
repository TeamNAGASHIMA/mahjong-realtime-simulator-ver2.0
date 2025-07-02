import React from 'react';

// Tileコンポーネントをインポートまたはこのファイル内で定義
// ここでは、以前作成したTileコンポーネントが利用可能であると仮定します。
import Tile from './Tile';


// スタイルオブジェクトの定義
const styles = {
  calculationScreen: {
    // width: '910px', // DD-UI-022-MA -> 親(GameStatusArea)の幅に追従
    // height: '260px', // DD-UI-022-MA -> 内容に応じて高さを自動調整
    minHeight: '260px', // 最小高さは維持
    backgroundColor: '#f0f0f0', // DD-UI-022-MA -> 元のUI全体に合わせて調整
    padding: '10px', // 元のUI全体に合わせて調整 (元は20px)
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '8px', // 全体UIに合わせて角丸
  },
  tableContainer: {
    width: '100%', // 親 (calculationScreen) の幅いっぱいに
    // height: '220px', // DD-UI-023-MA -> 内容に応じて高さを自動調整
    minHeight: '220px', // 最小高さは維持
    backgroundColor: '#FFFFFF', // DD-UI-023-MA
    border: '1px solid #B0B0B0',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'scroll', // テーブルがはみ出た場合にスクロールではなく隠す (または hidden)
  },
  tableHeader: {
    minHeight: '30px', // DD-UI-024-MA (20px) -> 元のUIに合わせて調整
    backgroundColor: '#D9D9D9', // DD-UI-024-MA
    display: 'flex',
    alignItems: 'center',
    fontSize: '13px', // ヘッダーのフォントサイズ (元は10px) -> 元のUIに合わせて調整
    fontWeight: 'normal', // 元のUIでは太字ではない
    color: '#333',
    borderBottom: '1px solid #B0B0B0',
  },
  headerCell: {
    padding: '5px 5px', // 上下にもパディング (元は0 5px)
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    borderRight: '1px solid #E0E0E0',
    height: '100%',
    flexGrow: 1, // 基本は均等割り
  },
  dataCell: {
    padding: '5px 5px', // 上下にもパディング
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    borderRight: '1px solid #E0E0E0',
    minHeight: '35px', // データ行の最小高さ
    flexGrow: 1, // 基本は均等割り
  },
  // lastChild のためのスタイルはJSで適用するか、各セルに個別スタイル指定
  // borderRightNone: { borderRight: 'none' }, // ヘルパースタイル

  effectiveTileCellHeader: { // ヘッダーの「有効牌」セル
    flex: 1.5,
    justifyContent: 'center', // ヘッダーは中央揃え
  },
  effectiveTileCellData: { // データの「有効牌」セル
    flex: 1.5,
    justifyContent: 'center', // データも中央揃えが良いか、左揃えか (元のUI画像参考)
    // paddingLeft: '10px', // 左揃えの場合
  },
  valueCell: { // 期待値
    flex: 1,
    justifyContent: 'flex-end', // 数値は右揃え
    paddingRight: '10px',
  },
  probCell: { // 確率
    flex: 1,
    justifyContent: 'flex-end', // 数値は右揃え
    paddingRight: '10px',
  },
  tableRow: {
    // flexGrow: 1, // 各行が均等に高さを分けるのではなく、内容に合わせる
    display: 'flex',
    borderBottom: '1px solid #EAEAEA',
    fontSize: '13px', // データセルのフォントサイズ (元は14px) -> 元のUIに合わせて調整
    backgroundColor: 'white', // 行の背景色
  },
  // tableRowLastChild: { borderBottom: 'none' }, // ヘルパースタイル

  tileWrapperInCell: { // 有効牌のTileコンポーネント用
    margin: '0 1px',
  },
  emptyCellSpan: { // 空セルのためのspan (高さを維持)
    display: 'inline-block', // これで高さが確保される
    minHeight: '1em', // フォントサイズに基づく最小高さ
  }
};

// CalculationResults コンポーネント (旧 ResultsTable)
// results, isLoading, currentTurn props を受け取る
const CalculationResults = ({ results, isLoading, currentTurn }) => {
  const headers = [
    { name: '有効牌', styleKey: 'effectiveTileCellHeader' },
    { name: '期待値', styleKey: 'valueCell' }, // ヘッダーも右揃えにするなら styleKey を valueCell に
    { name: '和了確率', styleKey: 'probCell' },
    { name: '聴牌確率', styleKey: 'probCell' },
  ];

  let displayData = [];
  const numRowsToDisplay = 4; // 表示する行数

  if (isLoading) {
    displayData = Array(numRowsToDisplay).fill({}).map((_, i) => ({
      key: `loading-${i}`,
      dapai: undefined, // 打牌列がないので削除
      yukoHai: [],
      kitaiValue: '---',
      horaRate: '---',
      tenpaiRate: '---',
    }));
  } else if (results && results.length > 0 && results[0].tile !== -1) { // tile === -1 はエラー表示用
    displayData = results.map((row, i) => ({
      key: `result-${i}`,
      // dapai: row.tile, // 打牌の情報は元のCSSにはない
      yukoHai: (row.required_tiles || []).map(rt => ({ tileNum: rt.tile, count: rt.count })),
      kitaiValue: row.exp_values && row.exp_values[currentTurn - 1] !== undefined ? `${Math.round(row.exp_values[currentTurn - 1])}点` : '',
      horaRate: row.win_probs && row.win_probs[currentTurn - 1] !== undefined ? `${(row.win_probs[currentTurn - 1] * 100).toFixed(2)}%` : '',
      tenpaiRate: row.tenpai_probs && row.tenpai_probs[currentTurn - 1] !== undefined ? `${(row.tenpai_probs[currentTurn - 1] * 100).toFixed(2)}%` : '',
      // isSyantenDown: row.syanten_down, // このUIでは向聴戻しを特別扱いしていない
    }));
  } else if (results && results.length > 0 && results[0].tile === -1) { // エラー表示
    displayData = [{ key: 'error-0', yukoHai: [], kitaiValue: 'エラー', horaRate: '発生', tenpaiRate: '' }];
  }

  // 表示行数まで空の行で埋める
  while (displayData.length < numRowsToDisplay) {
    displayData.push({
      key: `empty-${displayData.length}`,
      yukoHai: [], kitaiValue: '', horaRate: '', tenpaiRate: '',
    });
  }
  // 初期状態でダミーデータを表示したい場合 (results === null の時など)
  if (results === null && displayData.length >= 1) {
      displayData[0] = {
          key: 'initial-0',
          yukoHai: [{tileNum: 4, count:3}, {tileNum: 7, count:3}], // ダミーの牌
          kitaiValue: '9999点',
          horaRate: '99.99%',
          tenpaiRate: '99.99%',
      };
  }


  return (
    <div style={styles.calculationScreen}>
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          {headers.map((header, index) => (
            <div
              key={header.name}
              style={{
                ...styles.headerCell,
                ...(styles[header.styleKey] || {}), // 各ヘッダー固有のスタイル
                ...(index === headers.length - 1 ? { borderRight: 'none' } : {}) // 最後のセルは右枠線なし
              }}
            >
              {header.name}
              {header.name === '有効牌' && <span style={{fontSize:'10px', marginLeft:'2px', color:'#666'}}>↕</span>} {/* ソートアイコン仮 */}
            </div>
          ))}
        </div>
        {displayData.map((row, rowIndex) => (
          <div
            key={row.key}
            style={{
              ...styles.tableRow,
              ...(rowIndex === displayData.length - 1 ? { borderBottom: 'none' } : {}) // 最後の行は下枠線なし
            }}
          >
            <div style={{ ...styles.dataCell, ...styles.effectiveTileCellData, borderRight: '1px solid #E0E0E0' /* 明示的に枠線 */ }}>
              {row.yukoHai.length > 0 ? (
                row.yukoHai.map((tileInfo, i) => (
                  <div key={i} style={styles.tileWrapperInCell}>
                    <Tile type="smallResult" tileNum={tileInfo.tileNum} />
                    {/* (tileInfo.count) の表示は元のUI画像にはないため省略 */}
                  </div>
                ))
              ) : (
                <span style={styles.emptyCellSpan}> </span>
              )}
            </div>
            <div style={{ ...styles.dataCell, ...styles.valueCell, borderRight: '1px solid #E0E0E0' }}>
              {row.kitaiValue || <span style={styles.emptyCellSpan}> </span>}
            </div>
            <div style={{ ...styles.dataCell, ...styles.probCell, borderRight: '1px solid #E0E0E0' }}>
              {row.horaRate || <span style={styles.emptyCellSpan}> </span>}
            </div>
            <div style={{ ...styles.dataCell, ...styles.probCell, borderRight: 'none' }}> {/* 最後のセル */}
              {row.tenpaiRate || <span style={styles.emptyCellSpan}> </span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// このコンポーネントをエクスポートする場合
export default CalculationResults;

// このファイルを直接実行してテストする場合の例
// import ReactDOM from 'react-dom/client'; // ファイルの先頭に
// const mockResultsData = [
//     { tile: 0, required_tiles: [{tile:1, count:3}, {tile:4, count:2}], exp_values: [9999], win_probs: [0.9999], tenpai_probs: [0.9999] },
//     { tile: 1, required_tiles: [{tile:2, count:1}], exp_values: [8000], win_probs: [0.80], tenpai_probs: [0.90] },
// ];
// const AppMock = () => {
//     const [loading, setLoading] = useState(true);
//     const [res, setRes] = useState(null);

//     React.useEffect(() => {
//         setTimeout(() => {
//             setLoading(false);
//             setRes(mockResultsData);
//         }, 1500);
//     }, []);

//     return (
//         <div style={{ padding: '20px', backgroundColor: '#e0e0e0', display: 'flex', justifyContent: 'center' }}>
//             <CalculationResults results={res} isLoading={loading} currentTurn={1} />
//         </div>
//     );
// }
// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(<AppMock />);