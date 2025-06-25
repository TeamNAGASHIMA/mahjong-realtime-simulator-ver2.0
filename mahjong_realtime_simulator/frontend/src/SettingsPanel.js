import React, { useState, useImperativeHandle, forwardRef } from 'react';

const styles = {
  settingsPanel: {
    width: '100%',
    backgroundColor: '#D9D9D9',
    padding: '10px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '8px',
    fontFamily: "'Inter', sans-serif",
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#000000',
  },
  subHeader: {
    fontSize: '12px',
    marginBottom: '5px',
    color: '#000000',
  },
  shantenTypeSection: {
    marginBottom: '15px',
  },
  shantenButtons: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  shantenButton: {
    fontSize: '14px',
    color: '#000000',
    width: '70px',
    height: '30px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #AAAAAA',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  considerationSection: {
    // このセクションに特有のスタイルはなし
  },
  considerationButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
  },
  considerationButton: {
    fontSize: '14px',
    color: '#000000',
    padding: '8px 5px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #AAAAAA',
    borderRadius: '4px',
    cursor: 'pointer',
    textAlign: 'center',
    whiteSpace: 'normal',
    lineHeight: '1.2',
    height: '30px',
    boxSizing: 'border-box',
  },
  selected: {
    backgroundColor: '#BEFB98',
  }
};

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

const SettingsPanel = forwardRef((props, ref) => {
  const [selectedShanten, setSelectedShanten] = useState(ShantenType.IPPAN);
  const [toggledItems, setToggledItems] = useState(
    ConsiderationItemsList.reduce((acc, item) => ({ ...acc, [item]: false }), {})
  );

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
          {Object.values(ShantenType).map(type => (
            <button key={type} style={{ ...styles.shantenButton, ...(selectedShanten === type ? styles.selected : {}) }} onClick={() => handleShantenChange(type)}>
              {type}
            </button>
          ))}
        </div>
      </div>
      <div style={styles.considerationSection}>
        <div style={styles.subHeader}>考慮項目</div>
        <div style={styles.considerationButtons}>
          {ConsiderationItemsList.map(item => (
            <button key={item} style={{ ...styles.considerationButton, ...(item === '和了確率最大化' && { gridColumn: '1 / -1' }), ...(toggledItems[item] ? styles.selected : {}) }} onClick={() => handleToggleItem(item)}>
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

export default SettingsPanel;