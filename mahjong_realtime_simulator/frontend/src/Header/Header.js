// Header/Header.js
import React, { useState, useEffect, useRef } from 'react';

export const Header = ({ onMenuClick }) => {
  const [isOtherMenuOpen, setOtherMenuOpen] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOtherMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const localStyles = {
    headerBackground: { height: '40px', backgroundColor: '#333333', display: 'flex', alignItems: 'center', padding: '0 10px', borderBottom: '1px solid #444444', flexShrink: 0 },
    headerButton: { fontFamily: "'Inter', 'Meiryo', sans-serif", fontSize: '14px', color: 'lightgray', backgroundColor: 'transparent', border: 'none', padding: '5px 10px', cursor: 'pointer', marginRight: '5px', borderRadius: '4px', transition: 'background-color 0.2s ease' },
    headerButtonHover: { backgroundColor: '#555' },
    otherMenuContainer: { position: 'relative' },
    dropdownMenu: { position: 'absolute', top: '35px', left: '0', backgroundColor: '#3c3c3c', border: '1px solid #555', borderRadius: '4px', padding: '5px 0', minWidth: '150px', display: 'flex', flexDirection: 'column', zIndex: 1001 },
    dropdownItem: { color: 'lightgray', padding: '8px 15px', backgroundColor: 'transparent', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', transition: 'background-color 0.2s ease' },
    dropdownItemHover: { backgroundColor: '#555' },
  };

  const menuItems = [
    { label: '設定', key: 'settings' },
    { label: 'ゲーム設定', key: 'gameSettings' }, 
    { label: 'カメラ', key: 'camera' },
    { label: '表示', key: 'display' },
  ];
  const otherMenuItems = [
    { label: 'ヘルプ', key: 'help' },
    { label: '問い合わせ', key: 'contact' },
    { label: 'バージョン情報', key: 'version' },
  ];

  return (
    <div style={localStyles.headerBackground}>
      {menuItems.map(item => (
        <button
          key={item.key}
          style={{ ...localStyles.headerButton, ...(hoveredButton === item.key && localStyles.headerButtonHover) }}
          onClick={() => onMenuClick(item.key)}
          onMouseOver={() => setHoveredButton(item.key)}
          onMouseOut={() => setHoveredButton(null)}
        >
          {item.label}
        </button>
      ))}
      <div style={localStyles.otherMenuContainer} ref={menuRef}>
        <button
          style={{ ...localStyles.headerButton, ...(hoveredButton === 'other' && localStyles.headerButtonHover) }}
          onClick={() => setOtherMenuOpen(!isOtherMenuOpen)}
          onMouseOver={() => setHoveredButton('other')}
          onMouseOut={() => setHoveredButton(null)}
        >
          その他 ▼
        </button>
        {isOtherMenuOpen && (
          <div style={localStyles.dropdownMenu}>
            {otherMenuItems.map(item => (
              <button
                key={item.key}
                style={{ ...localStyles.dropdownItem, ...(hoveredButton === item.key && localStyles.dropdownItemHover) }}
                onClick={() => { onMenuClick(item.key); setOtherMenuOpen(false); }}
                onMouseOver={() => setHoveredButton(item.key)}
                onMouseOut={() => setHoveredButton(null)}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};