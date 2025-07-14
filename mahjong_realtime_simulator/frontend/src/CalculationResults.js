import React, { useState, useMemo, useRef, useLayoutEffect } from 'react';
import MahjongTile from './MahjongTile';

// スタイル定義 (変更なし)
const styles = {
  calculationScreen: {
    minHeight: '260px',
    maxHeight: '400px',
    backgroundColor: '#f0f0f0',
    padding: '10px',
    boxSizing: 'border-box',
    display: 'flex',
    borderRadius: '8px',
  },
  tableContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    border: '1px solid #ddd',
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  tableHeader: {
    backgroundColor: '#f7f7f7',
    display: 'flex',
    fontSize: '13px',
    fontWeight: '600',
    color: '#333',
    borderBottom: '1px solid #ddd',
    flexShrink: 0,
    boxSizing: 'border-box',
  },
  tableBody: {
    overflowY: 'scroll',
    flexGrow: 1,
  },
  headerCell: {
    padding: '8px 5px',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    borderRight: '1px solid #ddd',
    flexShrink: 0,
  },
  sortableHeader: {
    cursor: 'pointer',
    userSelect: 'none',
  },
  dataCell: {
    padding: '5px',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    borderRight: '1px solid #ddd',
    flexShrink: 0,
  },
  dapaiColumn:   { flexBasis: '70px', flexGrow: 0 },
  yukoHaiColumn: { flexBasis: '0', flexGrow: 2.5 },
  valueColumn:   { flexBasis: '100px', flexGrow: 0 },
  probColumn:    { flexBasis: '100px', flexGrow: 0 },
  yukoHaiData: {
    justifyContent: 'flex-start',
    paddingLeft: '10px',
    gap: '4px',
    flexWrap: 'wrap',
  },
  numericData: {
    justifyContent: 'flex-end',
    paddingRight: '10px',
    fontVariantNumeric: 'tabular-nums',
  },
  tableRow: {
    display: 'flex',
    borderBottom: '1px solid #eee',
    fontSize: '14px',
    backgroundColor: 'white',
    alignItems: 'center',
    minHeight: '42px',
  },
  emptyCellSpan: {
    display: 'inline-block',
    width: '100%',
    color: '#a0a0a0',
  },
  thirteenViewContainer: {
    padding: '20px',
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    overflowY: 'auto',
  },
  thirteenViewItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  thirteenViewLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#444',
  },
  thirteenViewValue: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#222',
  },
  thirteenViewTilesContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  },
};

/**
 * 手牌13枚の場合の専用表示コンポーネント
 */
const ThirteenTileView = ({ data }) => {
  return (
    <div style={styles.calculationScreen}>
      <div style={styles.tableContainer}>
        <div style={styles.thirteenViewContainer}>
          <div style={styles.thirteenViewItem}>
            <span style={styles.thirteenViewLabel}>有効牌</span>
            <div style={{ ...styles.thirteenViewValue, ...styles.thirteenViewTilesContainer }}>
              {data.required_tiles && data.required_tiles.length > 0 ? (
                data.required_tiles.map((tileInfo, i) => (
                  <MahjongTile key={`${tileInfo.tile}-${i}`} type="smallResult" tileNum={tileInfo.tile} />
                ))
              ) : (
                <span>なし</span>
              )}
            </div>
          </div>
          <div style={styles.thirteenViewItem}>
            <span style={styles.thirteenViewLabel}>期待値</span>
            <span style={styles.thirteenViewValue}>{Math.round(data.exp_value)}点</span>
          </div>
          <div style={styles.thirteenViewItem}>
            <span style={styles.thirteenViewLabel}>和了確率</span>
            <span style={styles.thirteenViewValue}>{(data.win_prob * 100).toFixed(2)}%</span>
          </div>
          <div style={styles.thirteenViewItem}>
            <span style={styles.thirteenViewLabel}>聴牌確率</span>
            <span style={styles.thirteenViewValue}>{(data.tenpai_prob * 100).toFixed(2)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};


/**
 * メインの計算結果表示コンポーネント
 */
const CalculationResults = ({ results, isLoading }) => {
  // ▼▼▼ すべてのフックをここに集める ▼▼▼
  const [sortConfig, setSortConfig] = useState({ key: 'exp_value', direction: 'descending' });
  const [scrollbarWidth, setScrollbarWidth] = useState(0);
  const tableBodyRef = useRef(null);

  useLayoutEffect(() => {
    if (tableBodyRef.current) {
      const width = tableBodyRef.current.offsetWidth - tableBodyRef.current.clientWidth;
      setScrollbarWidth(width);
    }
  }, [results, isLoading]);

  const isThirteenTileView = useMemo(() => 
    !isLoading && results && results.length === 1 && results[0]?.tile === null,
    [results, isLoading]
  );
  
  // ★★★ 修正点 ★★★
  // このuseMemoを条件分岐の前に移動
  const sortedResults = useMemo(() => {
    if (!results || results.length === 0) return [];
    let sortableItems = [...results];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key] ?? -Infinity;
        const valB = b[sortConfig.key] ?? -Infinity;
        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [results, sortConfig]);
  // ▲▲▲ ここまでがフックの呼び出し ▲▲▲


  // ▼▼▼ フック呼び出しの後で、条件分岐を行う ▼▼▼
  if (isThirteenTileView) {
    return <ThirteenTileView data={results[0]} />;
  }


  // 以下は14枚手牌の場合（または初期表示・ローディング時）のロジック
  const requestSort = (key) => {
    let direction = 'descending';
    if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = 'ascending';
    }
    setSortConfig({ key, direction });
  };

  const headers = [
    { name: '打牌', key: null, style: styles.dapaiColumn },
    { name: '有効牌', key: null, style: styles.yukoHaiColumn },
    { name: '期待値', key: 'exp_value', style: styles.valueColumn },
    { name: '和了確率', key: 'win_prob', style: styles.probColumn },
    { name: '聴牌確率', key: 'tenpai_prob', style: styles.probColumn },
  ];
  
  const minRowsToDisplay = 4;
  let displayData = [];

  if (isLoading) {
    displayData = Array(minRowsToDisplay).fill({}).map((_, i) => ({
      key: `loading-${i}`, dapai: '...', yukoHai: [], kitaiValue: '---', horaRate: '---', tenpaiRate: '---',
    }));
  } else if (sortedResults && sortedResults.length > 0) {
    displayData = sortedResults.map((row, i) => ({
      key: `result-${i}`, dapai: row.tile, yukoHai: row.required_tiles || [],
      kitaiValue: row.exp_value !== undefined ? `${Math.round(row.exp_value)}点` : '-',
      horaRate: row.win_prob !== undefined ? `${(row.win_prob * 100).toFixed(2)}%` : '-',
      tenpaiRate: row.tenpai_prob !== undefined ? `${(row.tenpai_prob * 100).toFixed(2)}%` : '-',
    }));
  }

  const emptyRowCount = minRowsToDisplay - displayData.length;
  if (emptyRowCount > 0) {
    for (let i = 0; i < emptyRowCount; i++) {
      displayData.push({
        key: `empty-${i}`, dapai: null, yukoHai: [], kitaiValue: '', horaRate: '', tenpaiRate: '',
      });
    }
  }
  
  if (!isLoading && (!results || results.length === 0)) {
    displayData = Array(minRowsToDisplay).fill(null).map((_, i) => ({
        key: `initial-empty-${i}`, dapai: null, yukoHai: [], kitaiValue: '', horaRate: '', tenpaiRate: ''
    }));
    displayData[0] = { ...displayData[0], key: 'initial-message', dapai: "「計算」ボタンを押してください", isMessage: true };
  }

  return (
    <div style={styles.calculationScreen}>
      <div style={styles.tableContainer}>
        <div style={{...styles.tableHeader, paddingRight: scrollbarWidth}}>
          {headers.map((header, index) => {
            const isSortable = header.key !== null;
            return (
              <div 
                key={header.name} 
                style={{
                  ...styles.headerCell, ...header.style,
                  ...(isSortable ? styles.sortableHeader : {}),
                  ...(index === headers.length - 1 ? { borderRight: 'none' } : {})
                }}
                onClick={isSortable ? () => requestSort(header.key) : undefined}
              >
                {header.name}
                {isSortable && (
                  <span style={{ marginLeft: '4px', width: '1em' }}>
                    {sortConfig.key === header.key ? (sortConfig.direction === 'descending' ? '▼' : '▲') : ''}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div ref={tableBodyRef} style={styles.tableBody}>
          {displayData.map((row, rowIndex) => (
            <div key={row.key} style={{
                ...styles.tableRow,
                ...(rowIndex === displayData.length - 1 ? { borderBottom: 'none' } : {})
            }}>
              <div style={{...styles.dataCell, ...styles.dapaiColumn}}>
                {row.dapai !== null ? 
                  (row.isMessage ? <span style={styles.emptyCellSpan}>{row.dapai}</span> : <MahjongTile type="smallResult" tileNum={row.dapai} />)
                  : <span style={styles.emptyCellSpan}> </span>
                }
              </div>
              <div style={{ ...styles.dataCell, ...styles.yukoHaiColumn, ...styles.yukoHaiData }}>
                {row.yukoHai.length > 0 ? (
                  row.yukoHai.map((tileInfo, i) => (
                    <MahjongTile key={`${tileInfo.tile}-${i}`} type="smallResult" tileNum={tileInfo.tile} />
                  ))
                ) : <span style={styles.emptyCellSpan}> </span>}
              </div>
              <div style={{ ...styles.dataCell, ...styles.valueColumn, ...styles.numericData }}>
                {row.kitaiValue || <span style={styles.emptyCellSpan}> </span>}
              </div>
              <div style={{ ...styles.dataCell, ...styles.probColumn, ...styles.numericData }}>
                {row.horaRate || <span style={styles.emptyCellSpan}> </span>}
              </div>
              <div style={{ ...styles.dataCell, ...styles.probColumn, ...styles.numericData, borderRight: 'none' }}>
                {row.tenpaiRate || <span style={styles.emptyCellSpan}> </span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalculationResults;