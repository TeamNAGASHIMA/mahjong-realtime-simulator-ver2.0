import React, { useState, useMemo, useRef, useLayoutEffect } from 'react';
import MahjongTile from './MahjongTile';

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
    boxSizing: 'border-box', // paddingを適用するために必要
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
  }
};

const CalculationResults = ({ results, isLoading }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'exp_value', direction: 'descending' });
  // ★ 1. スクロールバーの幅を保持するstateと、tableBodyへの参照
  const [scrollbarWidth, setScrollbarWidth] = useState(0);
  const tableBodyRef = useRef(null);

  // ★ 2. レイアウト計算後にスクロールバーの幅を測定し、stateを更新
  useLayoutEffect(() => {
    if (tableBodyRef.current) {
      const width = tableBodyRef.current.offsetWidth - tableBodyRef.current.clientWidth;
      setScrollbarWidth(width);
    }
  }, [results, isLoading]); // データやロード状態が変わるたびに再計算

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
  
  if (!isLoading && results.length === 0) {
    displayData = Array(minRowsToDisplay).fill(null).map((_, i) => ({
        key: `initial-empty-${i}`, dapai: null, yukoHai: [], kitaiValue: '', horaRate: '', tenpaiRate: ''
    }));
    displayData[0] = { ...displayData[0], key: 'initial-message', dapai: "「計算」ボタンを押してください", isMessage: true };
  }

  return (
    <div style={styles.calculationScreen}>
      <div style={styles.tableContainer}>
        {/* ★ 3. ヘッダーに動的に計算したpaddingRightを適用 */}
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
        {/* ★ 4. tableBodyにrefを設定 */}
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