// Header/HelpContentPage.js
import React, { useState } from 'react';
import { styles } from './styles';

export const HelpContentPage = ({ title, onBack, children }) => {
  const [hoveredButton, setHoveredButton] = useState(null);

  const localStyles = {
    contentHeader: { display: 'flex', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #444', paddingBottom: '15px' },
    backButton: { ...styles.button, padding: '5px 10px', marginRight: '15px', marginLeft: 0, fontSize: '14px' },
    contentTitle: { margin: 0, fontSize: '18px' },
    contentBody: { color: '#ccc', lineHeight: '1.6' }
  };

  return (
    <div>
      <div style={localStyles.contentHeader}>
        <button
          onClick={onBack}
          style={{ ...localStyles.backButton, ...(hoveredButton === 'back' && styles.buttonHover) }}
          onMouseOver={() => setHoveredButton('back')}
          onMouseOut={() => setHoveredButton(null)}
        >
          ← 戻る
        </button>
        <h4 style={localStyles.contentTitle}>{title}</h4>
      </div>
      <div style={localStyles.contentBody}>
        {children || <p>{title}のコンテンツは準備中です。</p>}
      </div>
    </div>
  );
};