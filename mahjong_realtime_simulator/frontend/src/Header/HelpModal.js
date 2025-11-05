// Header/HelpModal.js
import React, { useState } from 'react';
import { styles } from './styles';
import { HelpContentPage } from './HelpContentPage';
import { ReferenceLinks } from './ReferenceLinks';

export const HelpModal = ({ onClose }) => {
  const [view, setView] = useState('menu');
  const [hoveredButton, setHoveredButton] = useState(null);

  const localStyles = {
    button: { ...styles.button, display: 'block', width: '100%', padding: '15px', marginBottom: '15px', fontSize: '16px', textAlign: 'center', marginLeft: 0 },
  };

  const modalWidth = view === 'reference' ? '550px' : '400px';

  const menuButtons = [
    { label: '操作の流れ', view: 'workflow' },
    { label: '機能説明', view: 'features' },
    { label: 'カメラ説明', view: 'camera' },
    { label: '参考URL', view: 'reference' },
  ];

  const renderMenu = () => (
    <>
      {menuButtons.map(btn => (
        <button
          key={btn.view}
          style={{ ...localStyles.button, ...(hoveredButton === btn.view && styles.buttonHover) }}
          onClick={() => setView(btn.view)}
          onMouseOver={() => setHoveredButton(btn.view)}
          onMouseOut={() => setHoveredButton(null)}
        >
          {btn.label}
        </button>
      ))}
    </>
  );

  const renderContent = () => {
    if (view === 'menu') return renderMenu();
    const pageMap = {
      workflow: { title: '操作の流れ', content: null },
      features: { title: '機能説明', content: null },
      camera: { title: 'カメラ説明', content: null },
      reference: { title: '参考URL', content: <ReferenceLinks /> },
    };
    const currentPage = pageMap[view];
    return <HelpContentPage title={currentPage.title} onBack={() => setView('menu')}>{currentPage.content}</HelpContentPage>;
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={{ ...styles.modalContent, width: modalWidth, transition: 'width 0.3s ease' }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalHeaderTitle}>ヘルプ</h3>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </div>
        <div style={styles.modalBody}>{renderContent()}</div>
      </div>
    </div>
  );
};