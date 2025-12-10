// SidePanel_child/SettingsPanel.js

import React, { useState, useImperativeHandle, forwardRef } from 'react';

// ==============================================================================
// ▼▼▼ スタイル定義 (変更なし) ▼▼▼
// ==============================================================================
const styles = {
  settingsPanel: {
    width: '100%',
    backgroundColor: '#f4f7f6',
    padding: '12px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '8px',
    fontFamily: "'Inter', sans-serif",
    border: '1px solid #e9ecef',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#212529',
  },
  subHeader: {
    fontSize: '12px',
    marginBottom: '5px',
    color: '#6c757d',
    fontWeight: '600',
  },
  shantenTypeSection: {
    marginBottom: '15px',
  },
  shantenButtons: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  baseButton: {
    color: '#333',
    backgroundColor: '#FFFFFF',
    border: '1px solid #AAAAAA',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.15s ease, border-color 0.15s ease',
    outline: 'none',
  },
  shantenButton: {
    fontSize: '11px',
    width: '70px',
    height: '30px',
  },
  considerationSection: {},
  considerationButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
  },
  considerationButton: {
    fontSize: '14px',
    padding: '5px',
    height: '30px',
    boxSizing: 'border-box',
    textAlign: 'center',
  },
  selected: {
    backgroundColor: '#d1fecf',
    borderColor: '#7CFC00',
    fontWeight: 'bold',
    color: '#00695C',
  },
  buttonHover: {
    backgroundColor: '#e9ecef',
    borderColor: '#adb5bd',
  }
};
// ==============================================================================
// ▲▲▲ スタイル定義 (ここまで) ▲▲▲
// ==============================================================================


// データ定義 (変更なし)
const ShantenType = {
  IPPAN: '一般手',
  CHITOI: '七対子',
  KOKUSHI: '国士無双',
};
const ConsiderationItemsList = [
  '向聴落とし考慮', '手変わり考慮',
  'ダブル立直考慮', '一発考慮',
  '海底撈月考慮', '裏ドラ考慮',
  '和了確率最大化'
];
const TOOLTIP_DESCRIPTIONS = {
  '一般手': 'イッパンテ:4面子1雀頭の形を目指す、最も基本的な手の計算方法です。',
  '七対子': 'チートイツ:7つの異なる対子(トイツ)で構成される特殊な役です。',
  '国士無双': 'コクシムソウ:13種類の么九牌(ヤオチュウハイ)を1枚ずつ集める特殊な役です。',
  '向聴落とし考慮': 'シャンテン落とし考慮:一時的に向聴数が増えても、将来的に良い形になる打牌を考慮します。',
  '手変わり考慮': '手変わり考慮:打点や待ちの広さが向上するような手の変化を考慮します。',
  'ダブル立直考慮': 'ダブルリーチ考慮:配牌からの第一ツモで聴牌した場合のダブル立直を考慮します。',
  '一発考慮': 'イッパツ考慮:立直後、一巡以内に和了した場合の一発を考慮します。',
  '海底撈月考慮': 'ハイテイラオユエ考慮:局の最後のツモ牌での和了（海底撈月）を考慮します。',
  '裏ドラ考慮': 'ウラドラ考慮:立直して和了した場合にめくられる裏ドラを考慮します。',
  '和了確率最大化': 'ホーラカクリツ最大化:打点よりも和了できる確率が最も高くなる選択を優先します。',
};
const ShantenTypeValues = {
  [ShantenType.IPPAN]: 1,
  [ShantenType.CHITOI]: 2,
  [ShantenType.KOKUSHI]: 4,
};
const ConsiderationFlags = {
  '向聴落とし考慮': 1,
  '手変わり考慮': 2,
  'ダブル立直考慮': 4,
  '一発考慮': 8,
  '海底撈月考慮': 16,
  '裏ドラ考慮': 32,
  '和了確率最大化': 64,
};


// ▼▼▼ 修正1: propsから settings を受け取るように変更 ▼▼▼
const SettingsPanel = forwardRef(({ settings }, ref) => {
  const [selectedShanten, setSelectedShanten] = useState(ShantenType.IPPAN);
  const [toggledItems, setToggledItems] = useState(
    ConsiderationItemsList.reduce((acc, item) => ({ ...acc, [item]: false }), {})
  );
  const [hoveredButton, setHoveredButton] = useState(null);

  useImperativeHandle(ref, () => ({
    getSettings: () => {
      const syanten_type = ShantenTypeValues[selectedShanten];
      const flag = Object.keys(toggledItems).reduce((currentFlag, item) => {
        if (toggledItems[item]) {
          return currentFlag | ConsiderationFlags[item];
        }
        return currentFlag;
      }, 0);
      return { syanten_type, flag };
    }
  }));

  const handleShantenChange = (type) => setSelectedShanten(type);
  const handleToggleItem = (item) => setToggledItems(prev => ({ ...prev, [item]: !prev[item] }));

  return (
    <div style={styles.settingsPanel}>
      <div style={styles.sectionTitle}>設定</div>
      <div style={styles.shantenTypeSection}>
        <div style={styles.subHeader}>向聴タイプ</div>
        <div style={styles.shantenButtons}>
          {Object.values(ShantenType).map(type => {
            const isSelected = selectedShanten === type;
            const isHovered = hoveredButton === type;
            return (
              <button
                key={type}
                // ▼▼▼ 修正2: settings.showTooltipsに応じてtitle属性を制御 ▼▼▼
                title={settings?.showTooltips ? TOOLTIP_DESCRIPTIONS[type] : undefined}
                style={{
                  ...styles.baseButton,
                  ...styles.shantenButton,
                  ...(isSelected ? styles.selected : {}),
                  ...(isHovered && !isSelected ? styles.buttonHover : {}),
                }}
                onClick={() => handleShantenChange(type)}
                onMouseOver={() => setHoveredButton(type)}
                onMouseOut={() => setHoveredButton(null)}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>
      <div style={styles.considerationSection}>
        <div style={styles.subHeader}>考慮項目</div>
        <div style={styles.considerationButtons}>
          {ConsiderationItemsList.map(item => {
            const isToggled = toggledItems[item];
            const isHovered = hoveredButton === item;
            return (
              <button
                key={item}
                // ▼▼▼ 修正3: settings.showTooltipsに応じてtitle属性を制御 ▼▼▼
                title={settings?.showTooltips ? TOOLTIP_DESCRIPTIONS[item] : undefined}
                style={{
                  ...styles.baseButton,
                  ...styles.considerationButton,
                  ...(item === '和了確率最大化' && { gridColumn: '1 / -1' }),
                  ...(isToggled ? styles.selected : {}),
                  ...(isHovered && !isToggled ? styles.buttonHover : {}),
                }}
                onClick={() => handleToggleItem(item)}
                onMouseOver={() => setHoveredButton(item)}
                onMouseOut={() => setHoveredButton(null)}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default SettingsPanel;