import React, { useState, useMemo, useRef, useLayoutEffect } from 'react';
import MahjongTile from '../../MahjongTile';

// ==============================================================================
// ▼▼▼ スタイル定義 (変更箇所) ▼▼▼
// ==============================================================================
// 見やすいようにカラーパレットを定義
const colors = {
  background: '#f4f7f6', // 全体の背景色 (薄い緑がかったグレー)
  surface: '#ffffff',     // テーブルの背景
  primary: '#00695C',     // ヘッダーなど、アクセントとなる濃い緑
  primaryText: '#ffffff', // ヘッダーの文字色
  text: '#212529',        // 通常の文字色
  textSecondary: '#6c757d', // 補助的な文字色
  border: '#e9ecef',      // ボーダーの色
  stripe: '#f8f9fa',      // ストライプ行の背景色
  gold: '#fffbeb',        // 1位の背景色
  silver: '#f7f8fc',      // 2位の背景色
  bronze: '#fef8f3',      // 3位の背景色
  goldText: '#b45309',    // 1位の期待値の色
};

const styles = {
  // --- 全体コンテナ ---
  calculationScreen: {
    minHeight: '260px',
    maxHeight: '400px',
    backgroundColor: colors.background,
    padding: '10px',
    boxSizing: 'border-box',
    display: 'flex',
    borderRadius: '8px',
  },
  tableContainer: {
    width: '100%',
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', // 影を追加
  },
  // --- テーブルヘッダー ---
  tableHeader: {
    backgroundColor: colors.primary,
    display: 'flex',
    fontSize: '13px',
    fontWeight: 'bold',
    color: colors.primaryText,
    flexShrink: 0,
    boxSizing: 'border-box',
  },
  headerCell: {
    padding: '10px 5px',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    borderRight: `1px solid rgba(255, 255, 255, 0.2)`,
    flexShrink: 0,
  },
  sortableHeader: {
    cursor: 'pointer',
    userSelect: 'none',
  },
  // --- テーブルボディ ---
  tableBody: {
    overflowY: 'auto', // autoに変更してコンテンツが少ない場合はスクロールバーを非表示
    flexGrow: 1,
  },
  tableRow: {
    display: 'flex',
    borderBottom: `1px solid ${colors.border}`,
    fontSize: '14px',
    backgroundColor: colors.surface,
    alignItems: 'center',
    minHeight: '42px',
    transition: 'background-color 0.2s ease',
  },
  // --- 行のスタイル (ストライプと上位ランク) ---
  stripedRow: {
    backgroundColor: colors.stripe,
  },
  top1Row: { backgroundColor: colors.gold },
  top2Row: { backgroundColor: colors.silver },
  top3Row: { backgroundColor: colors.bronze },

  // --- セルのスタイル ---
  dataCell: {
    padding: '5px',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    borderRight: `1px solid ${colors.border}`,
    flexShrink: 0,
    color: colors.text,
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
  emptyCellSpan: {
    display: 'inline-block',
    width: '100%',
    color: '#a0a0a0',
  },
  // --- 上位ランクのセルを強調するスタイル ---
  topRankCell: {
    fontWeight: 'bold',
    fontSize: '15px',
  },
  top1ValueCell: {
    color: colors.goldText,
    fontSize: '16px',
  },

  // --- 手牌13枚表示のスタイル ---
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
    padding: '12px',
    borderRadius: '6px',
    backgroundColor: colors.background,
  },
  thirteenViewLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: colors.textSecondary,
  },
  thirteenViewValue: {
    fontSize: '20px', // 数値を大きく
    fontWeight: 'bold',
    color: colors.primary, // メインカラーで統一
  },
  thirteenViewTilesContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  },
};
// ==============================================================================
// ▲▲▲ スタイル定義 (ここまで) ▲▲▲
// ==============================================================================


/**
 * 手牌13枚の場合の専用表示コンポーネント (スタイル適用)
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
                <span style={{fontSize: '16px', color: colors.text}}>なし</span>
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

  if (isThirteenTileView) {
    return <ThirteenTileView data={results[0]} />;
  }

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
                  <span style={{ marginLeft: '4px', width: '1em', display: 'inline-block' }}>
                    {sortConfig.key === header.key ? (sortConfig.direction === 'descending' ? '▼' : '▲') : ''}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div ref={tableBodyRef} style={styles.tableBody}>
          {displayData.map((row, rowIndex) => {
            // ==================================================================
            // ▼▼▼ ランクに応じてスタイルを動的に適用 (変更箇所) ▼▼▼
            // ==================================================================
            const isDataRow = !isLoading && !row.isMessage && row.dapai !== null && row.dapai !== '...';
            const isTop1 = isDataRow && rowIndex === 0;
            const isTop2 = isDataRow && rowIndex === 1;
            const isTop3 = isDataRow && rowIndex === 2;

            const rowStyle = {
              ...styles.tableRow,
              // 上位ランクでない奇数行にストライプを適用
              ...(rowIndex % 2 === 1 && !isTop1 && !isTop2 && !isTop3 ? styles.stripedRow : {}),
              ...(isTop1 ? styles.top1Row : {}),
              ...(isTop2 ? styles.top2Row : {}),
              ...(isTop3 ? styles.top3Row : {}),
              ...(rowIndex === displayData.length - 1 ? { borderBottom: 'none' } : {})
            };

            const rankCellStyle = (isTop1 || isTop2 || isTop3) ? styles.topRankCell : {};
            const top1ValueCellStyle = isTop1 ? styles.top1ValueCell : {};
            // ==================================================================
            // ▲▲▲ スタイル適用ロジック (ここまで) ▲▲▲
            // ==================================================================
            
            return (
              <div key={row.key} style={rowStyle}>
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
                <div style={{ ...styles.dataCell, ...styles.valueColumn, ...styles.numericData, ...rankCellStyle, ...top1ValueCellStyle }}>
                  {row.kitaiValue || <span style={styles.emptyCellSpan}> </span>}
                </div>
                <div style={{ ...styles.dataCell, ...styles.probColumn, ...styles.numericData, ...rankCellStyle }}>
                  {row.horaRate || <span style={styles.emptyCellSpan}> </span>}
                </div>
                <div style={{ ...styles.dataCell, ...styles.probColumn, ...styles.numericData, borderRight: 'none', ...rankCellStyle }}>
                  {row.tenpaiRate || <span style={styles.emptyCellSpan}> </span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalculationResults;