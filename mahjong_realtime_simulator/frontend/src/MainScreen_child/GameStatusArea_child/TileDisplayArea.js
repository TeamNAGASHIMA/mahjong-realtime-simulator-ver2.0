// TileDisplayArea.js
import React, { useState, useEffect } from 'react';

//牌の画像（縦向きのみ）
import M1 from '../../img/M1.png';
import M2 from '../../img/M2.png';
import M3 from '../../img/M3.png';
import M4 from '../../img/M4.png';
import M5 from '../../img/M5.png';
import M6 from '../../img/M6.png';
import M7 from '../../img/M7.png';
import M8 from '../../img/M8.png';
import M9 from '../../img/M9.png';
import RM5 from '../../img/RM5.png';
import P1 from '../../img/P1.png';
import P2 from '../../img/P2.png';
import P3 from '../../img/P3.png';
import P4 from '../../img/P4.png';
import P5 from '../../img/P5.png';
import P6 from '../../img/P6.png';
import P7 from '../../img/P7.png';
import P8 from '../../img/P8.png';
import P9 from '../../img/P9.png';
import RP5 from '../../img/RP5.png';
import S1 from '../../img/S1.png';
import S2 from '../../img/S2.png';
import S3 from '../../img/S3.png';
import S4 from '../../img/S4.png';
import S5 from '../../img/S5.png';
import RS5 from '../../img/RS5.png';
import S6 from '../../img/S6.png';
import S7 from '../../img/S7.png';
import S8 from '../../img/S8.png';
import S9 from '../../img/S9.png';
import Z1 from '../../img/Z1.png';
import Z2 from '../../img/Z2.png';
import Z3 from '../../img/Z3.png';
import Z4 from '../../img/Z4.png';
import Z5 from '../../img/Z5.png';
import Z6 from '../../img/Z6.png';
import Z7 from '../../img/Z7.png';

// EM1, EM2... のインポートは削除しても動作しますが、可読性のために残してもOKです。
import EM1 from '../../img/EM1.png';
import EM2 from '../../img/EM2.png';
import EM3 from '../../img/EM3.png';
import EM4 from '../../img/EM4.png';
import EM5 from '../../img/EM5.png';
import EM6 from '../../img/EM6.png';
import EM7 from '../../img/EM7.png';
import EM8 from '../../img/EM8.png';
import EM9 from '../../img/EM9.png';
import ERM5 from '../../img/ERM5.png';
import EP1 from '../../img/EP1.png';
import EP2 from '../../img/EP2.png';
import EP3 from '../../img/EP3.png';
import EP4 from '../../img/EP4.png';
import EP5 from '../../img/EP5.png';
import EP6 from '../../img/EP6.png';
import EP7 from '../../img/EP7.png';
import EP8 from '../../img/EP8.png';
import EP9 from '../../img/EP9.png';
import ERP5 from '../../img/ERP5.png';
import ES1 from '../../img/ES1.png';
import ES2 from '../../img/ES2.png';
import ES3 from '../../img/ES3.png';
import ES4 from '../../img/ES4.png';
import ES5 from '../../img/ES5.png';
import ERS5 from '../../img/ERS5.png';
import ES6 from '../../img/ES6.png';
import ES7 from '../../img/ES7.png';
import ES8 from '../../img/ES8.png';
import ES9 from '../../img/ES9.png';
import EZ1 from '../../img/EZ1.png';
import EZ2 from '../../img/EZ2.png';
import EZ3 from '../../img/EZ3.png';
import EZ4 from '../../img/EZ4.png';
import EZ5 from '../../img/EZ5.png';
import EZ6 from '../../img/EZ6.png';
import EZ7 from '../../img/EZ7.png';


// --- データマッピング ---
const TILE_IMAGES = { M1, M2, M3, M4, M5, RM5, M6, M7, M8, M9, P1, P2, P3, P4, P5, RP5, P6, P7, P8, P9, S1, S2, S3, S4, S5, RS5, S6, S7, S8, S9, Z1, Z2, Z3, Z4, Z5, Z6, Z7, EM1, EM2, EM3, EM4, EM5, ERM5, EM6, EM7, EM8, EM9, EP1, EP2, EP3, EP4, EP5, ERP5, EP6, EP7, EP8, EP9, ES1, ES2, ES3, ES4, ES5, ERS5, ES6, ES7, ES8, ES9, EZ1, EZ2, EZ3, EZ4, EZ5, EZ6, EZ7 };
const TILE_NUM_TO_NAME = { 0: 'M1', 1: 'M2', 2: 'M3', 3: 'M4', 4: 'M5', 5: 'M6', 6: 'M7', 7: 'M8', 8: 'M9', 9: 'P1', 10: 'P2', 11: 'P3', 12: 'P4', 13: 'P5', 14: 'P6', 15: 'P7', 16: 'P8', 17: 'P9', 18: 'S1', 19: 'S2', 20: 'S3', 21: 'S4', 22: 'S5', 23: 'S6', 24: 'S7', 25: 'S8', 26: 'S9', 27: 'Z1', 28: 'Z2', 29: 'Z3', 30: 'Z4', 31: 'Z5', 32: 'Z6', 33: 'Z7', 34: 'RM5', 35: 'RP5', 36: 'RS5', 100: 'M1', 101: 'M2', 102: 'M3', 103: 'M4', 104: 'M5', 105: 'M6', 106: 'M7', 107: 'M8', 108: 'M9', 109: 'P1', 110: 'P2', 111: 'P3', 112: 'P4', 113: 'P5', 114: 'P6', 115: 'P7', 116: 'P8', 117: 'P9', 118: 'S1', 119: 'S2', 120: 'S3', 121: 'S4', 122: 'S5', 123: 'S6', 124: 'S7', 125: 'S8', 126: 'S9', 127: 'Z1', 128: 'Z2', 129: 'Z3', 130: 'Z4', 131: 'Z5', 132: 'Z6', 133: 'Z7', 134: 'RM5', 135: 'RP5', 136: 'RS5', 1000: 'EM1', 1001: 'EM2', 1002: 'EM3', 1003: 'EM4', 1004: 'EM5', 1005: 'EM6', 1006: 'EM7', 1007: 'EM8', 1008: 'EM9', 1009: 'EP1', 1010: 'EP2', 1011: 'EP3', 1012: 'EP4', 1013: 'EP5', 1014: 'EP6', 1015: 'EP7', 1016: 'EP8', 1017: 'EP9', 1018: 'ES1', 1019: 'ES2', 1020: 'ES3', 1021: 'ES4', 1022: 'ES5', 1023: 'ES6', 1024: 'ES7', 1025: 'ES8', 1026: 'ES9', 1027: 'EZ1', 1028: 'EZ2', 1029: 'EZ3', 1030: 'EZ4', 1031: 'EZ5', 1032: 'EZ6', 1033: 'EZ7', 1034: 'ERM5', 1035: 'ERP5', 1036: 'ERS5' };
const WIND_NUM_TO_KANJI = { 27: '東', 28: '南', 29: '西', 30: '北' };

const TILE_NAME_MAP = {
  M1: 'イーマン', M2: 'リャンマン', M3: 'サンマン', M4: 'スーマン', M5: 'ウーマン', M6: 'ローマン', M7: 'チーマン', M8: 'パーマン', M9: 'キュウマン', RM5: 'アカウーマン',
  P1: 'イーピン', P2: 'リャンピン', P3: 'サンピン', P4: 'スーピン', P5: 'ウーピン', P6: 'ローピン', P7: 'チーピン', P8: 'パーピン', P9: 'キュウピン', RP5: 'アカウーピン',
  S1: 'イーソウ', S2: 'リャンソウ', S3: 'サンソウ', S4: 'スーソウ', S5: 'ウーソウ', S6: 'ローソウ', S7: 'チーソウ', S8: 'パーソウ', S9: 'キュウソウ', RS5: 'アカウーソウ',
  Z1: 'トン', Z2: 'ナン', Z3: 'シャー', Z4: 'ペー', Z5: 'ハク', Z6: 'ハツ', Z7: 'チュン', 
  EM1: 'イーマン 誤検知の可能性あり', EM2: 'リャンマン 誤検知の可能性あり', EM3: 'サンマン 誤検知の可能性あり', EM4: 'スーマン 誤検知の可能性あり', EM5: 'ウーマン 誤検知の可能性あり', EM6: 'ローマン 誤検知の可能性あり', EM7: 'チーマン 誤検知の可能性あり', EM8: 'パーマン 誤検知の可能性あり', EM9: 'キュウマン 誤検知の可能性あり', ERM5: 'アカウーマン 誤検知の可能性あり',
  EP1: 'イーピン 誤検知の可能性あり', EP2: 'リャンピン 誤検知の可能性あり', EP3: 'サンピン 誤検知の可能性あり', EP4: 'スーピン 誤検知の可能性あり', EP5: 'ウーピン 誤検知の可能性あり', EP6: 'ローピン 誤検知の可能性あり', EP7: 'チーピン 誤検知の可能性あり', EP8: 'パーピン 誤検知の可能性あり', EP9: 'キュウピン 誤検知の可能性あり', ERP5: 'アカウーピン 誤検知の可能性あり',
  ES1: 'イーソウ 誤検知の可能性あり', ES2: 'リャンソウ 誤検知の可能性あり', ES3: 'サンソウ 誤検知の可能性あり', ES4: 'スーソウ 誤検知の可能性あり', ES5: 'ウーソウ 誤検知の可能性あり', ES6: 'ローソウ 誤検知の可能性あり', ES7: 'チーソウ 誤検知の可能性あり', ES8: 'パーソウ 誤検知の可能性あり', ES9: 'キュウソウ 誤検知の可能性あり', ERS5: 'アカウーソウ 誤検知の可能性あり',
  EZ1: 'トン 誤検知の可能性あり', EZ2: 'ナン 誤検知の可能性あり', EZ3: 'シャー 誤検知の可能性あり', EZ4: 'ペー 誤検知の可能性あり', EZ5: 'ハク 誤検知の可能性あり', EZ6: 'ハツ 誤検知の可能性あり', EZ7: 'チュン 誤検知の可能性あり',
};
const ALL_TILES_IN_POOL = Array.from({ length: 37 }, (_, i) => i);

// --- CSS定義 ---
const styles = `
  body { background-color: #222; margin: 0; font-family: sans-serif; }
  .tile-pool { 
    display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; 
    padding: 20px; border-radius: 5px; margin: 10px;
    position: relative;
  }
  .tile-pool-close-button {
    position: absolute; top: 10px; right: 10px;
    background: rgba(0,0,0,0.5); color: white;
    border: 1px solid white; border-radius: 50%;
    width: 28px; height: 28px; font-size: 20px;
    line-height: 26px; text-align: center;
    cursor: pointer; transition: all 0.2s;
  }
  .tile-pool-close-button:hover {
    background: rgba(255,255,255,0.8); color: black;
  }
  .tile-wrapper { 
    transition: all 0.2s ease-in-out; cursor: pointer; 
  }
  .tile-wrapper:hover { transform: translateY(-5px); }
  .tile-wrapper.rotated:hover { transform: translateY(-5px) rotate(90deg); }
  .tile-img { 
    display: block; background-color: #f0ead6; border-radius: 4px; 
    box-shadow: 0 2px 2px rgba(0,0,0,0.3); 
  }
  .tile-wrapper.selected { transform: translateY(-12px); }
  .tile-wrapper.rotated.selected { transform: translateY(-12px) rotate(90deg); }
  .tile-wrapper.selected .tile-img { 
    border: 3px solid #00aaff; 
    box-shadow: 0 8px 15px rgba(50, 150, 255, 0.5); 
  }
  .tile-pool .tile-wrapper:hover { transform: scale(1.1); }
  .tile-pool .tile-wrapper.rotated:hover { transform: scale(1.1) rotate(90deg); }
  .empty-pool-tile {
    width: 45px; height: 65px; background-color: #7f8c8d;
    border-radius: 4px; box-shadow: 0 2px 2px rgba(0,0,0,0.3);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: all 0.2s ease-in-out;
  }
  .empty-pool-tile:hover {
    transform: translateY(-5px) scale(1.1);
    background-color: #95a5a6;
  }
  .empty-pool-tile-text {
    font-size: 24px; color: white; font-weight: bold; user-select: none;
  }
  .tile-display-container { 
    padding: 10px; box-sizing: border-box; 
    border-radius: 8px; margin: 10px; 
  }
  .upper-game-area { 
    display: flex; justify-content: flex-start; gap: 10px; 
    margin-bottom: 10px; align-items: flex-start; 
  }
  .player-display {
    padding: 8px; border-radius: 6px; 
    box-sizing: border-box; display: flex; flex-direction: column; 
    flex-basis: 0; flex-grow: 1;
  }
  .player-label-container { 
    display: flex; justify-content: center; align-items: baseline; gap: 8px; 
    margin-bottom: 8px; min-height: 20px; 
  }
  .player-label { font-size: 1.1em; font-weight: bold; }
  .player-sub-label { font-size: 0.9em; }
  .other-player-melds-area {
    display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 5px;
    min-height: 45px; margin-bottom: 8px; padding-right: 5px;
  }
  .other-player-meld-set { display: flex; align-items: flex-end; }
  .other-player-meld-set .tile-wrapper { margin-left: -1px; }
  .discard-area { 
    display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;
    width: 100%; cursor: pointer; box-sizing: border-box;
    background-color: rgba(0, 0, 0, 0.15); padding: 5px; border-radius: 4px;
    min-height: 42px;
  }
  .discard-slot {
    width: 100%; padding-bottom: 150%; position: relative; 
    background-color: rgba(0,0,0,0.2); border: 1px dashed rgba(255,255,255,0.3);
    border-radius: 3px; cursor: pointer;
  }
  .discard-slot .tile-wrapper { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; }
  
  .discard-slot .tile-wrapper:not(.rotated) .tile-img {
    width: 100%;
    height: auto;
  }
  .discard-slot .tile-wrapper.rotated .tile-img {
    width: auto;
    height: 100%;
  }

  .dora-indicator-area { 
    margin: 15px ; display: flex; justify-content: start;
  }
  .dora-indicator-grid {
    display: grid; grid-template-columns: repeat(5, 26px); grid-template-rows: 38px;
    gap: 3px; justify-content: flex-start; 
    background-color: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 5px;
    border-radius: 4px;
  }
  .dora-slot {
    width: 26px; height: 38px; 
    background-color: rgba(0, 0, 0, 0.25);
    border: 1px dashed rgba(255, 255, 255, 0.5);
    border-radius: 3px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }
  .dora-slot .tile-img { width: 100%; height: 100%; }
  .own-hand-area { 
    display: flex; align-items: flex-end; justify-content: flex-start; 
    padding: 10px; min-height: 85px; width: 100%; 
    border-radius: 6px; box-sizing: border-box; margin-top: 10px; 
  }
  .hand-controls {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; margin-right: 20px; min-width: 60px;
    align-self: center;
  }
  .own-wind { 
    font-size: 1.5em; font-weight: bold; text-align: center;
    cursor: pointer; user-select: none; transition: color 0.2s;
  }
  .meld-button {
    font-size: 0.9em; font-weight: bold; color: #fff; background-color: #4CAF50;
    border: none; border-radius: 4px; padding: 6px 12px; margin-top: 8px;
    cursor: pointer; transition: background-color 0.2s;
  }
  .meld-button:hover:not(:disabled) { background-color: #45a049; }
  .meld-button:disabled { background-color: #666; color: #aaa; cursor: not-allowed; }
  .hand-and-melds-container {
    display: flex; align-items: flex-end; flex-grow: 1; justify-content: flex-start;
  }
  .own-melds-area { display: flex; align-items: flex-end; gap: 10px; margin-left: 15px; }
  .own-meld-set { display: flex; align-items: flex-end; }
  .own-meld-set .tile-wrapper { margin-right: -1px; }
  .own-meld-set .tile-wrapper:hover { transform: translateY(-5px); }
  .own-meld-set .tile-wrapper.selected { transform: translateY(-12px); }
  .hand-tiles-container { display: flex; align-items: flex-end; flex-grow: 1; flex-wrap: wrap; }
  .hand-tile { margin-right: 2px; }
  .tsumo-tile { margin-left: 10px; }
  .empty-slot {
    width: 45px; height: 65px; background-color: rgba(0,0,0,0.2);
    border: 1px dashed rgba(255,255,255,0.3); border-radius: 4px;
    cursor: pointer; box-sizing: border-box; display: flex;
    align-items: center; justify-content: center;
  }
  .selection-highlight {
    width: 90%; height: 90%; border: 2px solid #00aaff; border-radius: 3px; box-sizing: border-box;
  }
  .clickable-text {
    cursor: pointer; text-decoration: underline; user-select: none;
    padding: 0 2px; border-radius: 3px; transition: background-color 0.2s;
  }
  .clickable-text:hover { background-color: rgba(255, 255, 255, 0.15); }
  
  .modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex; justify-content: center; align-items: center; z-index: 1000;
  }
  .modal-content {
    padding: 20px; border-radius: 8px;
    width: 640px; max-width: 90%;
    background-color: #f0f0f0; border: 2px solid #000000ff;
  }
  .modal-header {
    font-size: 1.2em; font-weight: bold;
    margin-bottom: 15px; padding-bottom: 10px;
  }
  .modal-tabs { display: flex; margin-bottom: 20px; }
  .modal-tab-button { background: none; border: none; font-size: 1em; font-weight: bold; padding: 10px 20px; cursor: pointer; transition: all 0.2s; border-bottom: 3px solid transparent; text-transform: uppercase; }
  .modal-tab-button:disabled { cursor: not-allowed; }
  .meld-candidate-list { display: flex; flex-wrap: wrap; gap: 15px; min-height: 80px; }
  .meld-candidate-item { border-radius: 5px; padding: 10px; cursor: pointer; display: flex; align-items: center; transition: background-color 0.2s; }
  .meld-candidate-item .tile-wrapper { margin-right: -2px; }
  .meld-candidate-item .tile-img { width: 30px; height: 44px; }
  .meld-candidate-item .kan-type-label { width: auto; height: auto; background: none; box-shadow: none; font-size: 0.8em; font-weight: bold; margin-left: 8px; display: flex; align-items: center; }
  .modal-actions { margin-top: 20px; text-align: right; }
  .modal-cancel-button { background-color: #e74c3c; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; transition: background-color 0.2s; }
  .modal-cancel-button:hover { background-color: #c0392b; }
  .reset-button { font-family: "'Inter', sans-serif"; font-size: 0.8em; color: #ffffff; background-color: #dc3545; border: 1px solid #c82333; padding: 4px 12px; border-radius: 4px; cursor: pointer; white-space: nowrap; transition: all 0.3s ease; margin-left: 10px; }
  .reset-button:hover { background-color: #c82333; }

  /* --- 回転用のスタイル --- */
  .tile-wrapper.rotated {
    transform: rotate(90deg);
  }
  .other-player-meld-set .tile-wrapper.rotated {
    margin-top: 6px;
    margin-bottom: 6px;
  }
  .own-meld-set .tile-wrapper.rotated {
    margin-top: 10px;
    margin-bottom: 10px;
  }

  /* --- Theme Specific Styles --- */
  .theme-dark .tile-display-container, .theme-dark .tile-pool { background-color: #005522; }
  .theme-dark .player-display, .theme-dark .own-hand-area { background-color: #4f739e; }
  .theme-dark .player-label, .theme-dark .own-wind { color: #FFFFFF; }
  .theme-dark .player-sub-label { color: #DDDDDD; }
  .theme-dark .own-wind:hover { color: #ffff99; }
  .theme-dark .status-header, .theme-dark .clickable-text { color: #FFFFFF; }
  .theme-dark .tile-pool-close-button { background: rgba(0,0,0,0.5); color: white; border: 1px solid white; }
  .theme-dark .tile-pool-close-button:hover { background: rgba(255,255,255,0.8); color: black; }
  
  .theme-dark .modal-content { 
    background-color: #34495e;
    color: #ecf0f1;
    border: 2px solid #567d9e;
  }
  .theme-dark .modal-header { color: #ecf0f1; border-bottom: 1px solid #567d9e; }
  .theme-dark .modal-tabs { border-bottom: 2px solid #567d9e; }
  .theme-dark .modal-tab-button { color: #bdc3c7; }
  .theme-dark .modal-tab-button.active { color: #ecf0f1; border-bottom-color: #3498db; }
  .theme-dark .modal-tab-button:disabled { color: #7f8c8d; }
  .theme-dark .meld-candidate-item { background-color: #2c3e50; }
  .theme-dark .meld-candidate-item:hover { background-color: #4a627a; }
  .theme-dark .kan-type-label { color: #ecf0f1; }

  .theme-light .tile-display-container, .theme-light .tile-pool { background-color: #d0e0d0; }
  .theme-light .player-display, .theme-light .own-hand-area { background-color: #4f739e; }
  .theme-light .player-label, .theme-light .own-wind { color: #FFFFFF; }
  .theme-light .player-sub-label { color: #DDDDDD; }
  .theme-light .own-wind:hover { color: #ffff99; }
  .theme-light .status-header, .theme-light .clickable-text { color: #333333; }
  .theme-light .tile-pool-close-button { background: rgba(255,255,255,0.5); color: black; border: 1px solid black; }
  .theme-light .tile-pool-close-button:hover { background: rgba(0,0,0,0.8); color: white; }

  .theme-light .modal-content { background-color: #ffffff; color: #333; border: 2px solid #bdc3c7; }
  .theme-light .modal-header { color: #333; border-bottom: 1px solid #dddddd; }
  .theme-light .modal-tabs { border-bottom: 2px solid #dddddd; }
  .theme-light .modal-tab-button { color: #777777; }
  .theme-light .modal-tab-button.active { color: #333333; border-bottom-color: #3498db; }
  .theme-light .modal-tab-button:disabled { color: #aaaaaa; }
  .theme-light .meld-candidate-item { background-color: #f0f0f0; }
  .theme-light .meld-candidate-item:hover { background-color: #e5e5e5; }
  .theme-light .kan-type-label { color: #333; }
`;


// --- 子コンポーネント定義 ---
const StatusHeader = ({ title, onResetClick, isSimulatorMode, onModeChange }) => {
  const dynamicButtonText = isSimulatorMode ? '牌譜' : 'リアルタイムシミュレーター';  

  const buttonStyle = {
    fontFamily: "'Inter', sans-serif", fontSize: '0.8em', color: '#ffffff',
    backgroundColor: '#E39C40', border: `1px solid #eda040`,
    padding: '4px 12px', borderRadius: '4px', cursor: 'pointer',
    whiteSpace: 'nowrap', transition: 'all 0.3s ease',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0 15px 0' }}>
      <span className="status-header" style={{ fontFamily: "'Inter', sans-serif", fontSize: '1em', fontWeight: 'bold' }}>{title}</span>
      <div>
        <button style={buttonStyle} onClick={onModeChange}>{dynamicButtonText}</button>
        <button className="reset-button" onClick={onResetClick}>全クリア</button>
      </div>
    </div>
  );
};

const Tile = ({ tileNum, size = 'hand', onClick, isSelected = false, orientation = 'vertical', showTooltips }) => {
  const isRotated = (tileNum !== null && tileNum >= 100 && tileNum < 200) || orientation === 'horizontal';

  // 裏向きの牌('b')の処理
  if (tileNum === 'b') {
    const sizeStyles = {
        hand: { width: '45px', height: '65px' },
        meld: { width: '45px', height: '65px' },
        other_meld: { width: '26px', height: '38px' },
    };
    return (
      <div 
        className={`tile-wrapper ${isSelected ? 'selected' : ''} ${isRotated ? 'rotated' : ''}`} 
        onClick={onClick} 
        title={showTooltips ? "裏向きの牌" : undefined} // 条件付きでtitle属性を設定
      >
        <div style={{...sizeStyles[size], backgroundColor: '#005936', border: '2px solid #f0ead6', borderRadius: '4px', boxSizing: 'border-box'}} className="tile-img" />
      </div>
    );
  }

  const imageKey = TILE_NUM_TO_NAME[tileNum] || null;
  const tileDisplayName = imageKey ? TILE_NAME_MAP[imageKey] || imageKey : '不明な牌';
  const src = imageKey ? TILE_IMAGES[imageKey] : null;
  
  if (!src) return null;

  const sizeStyles = {
    hand: { width: '45px', height: '65px' },
    tsumo: { width: '45px', height: '65px' },
    pool: { width: '45px', height: '65px' }, 
    dora: { width: '100%', height: '100%' },
    meld: { width: '45px', height: '65px' },
    other_meld: { width: '26px', height: '38px' }
  };
  
  const finalSizeStyle = sizeStyles[size] || {};

  return (
    <div 
      className={`tile-wrapper ${isSelected ? 'selected' : ''} ${isRotated ? 'rotated' : ''}`} 
      onClick={onClick} 
      title={showTooltips ? tileDisplayName : undefined} // 条件付きでtitle属性を設定
    >
        <img src={src} alt={tileDisplayName} style={finalSizeStyle} className="tile-img" />
    </div>
  );
};

const EmptyPoolTile = ({ onClick }) => (
  <div className="empty-pool-tile" onClick={onClick} title="牌を削除">
    <span className="empty-pool-tile-text">✕</span>
  </div>
);

const DoraIndicatorArea = ({ indicators, onSlotClick, selection, settings }) => {
  const slots = Array(5).fill(null);
  indicators.forEach((tileNum, index) => { 
    if (index < 5) slots[index] = tileNum; 
  });
  return (
    <div className="dora-indicator-area">
      <div className="dora-indicator-grid">
        {slots.map((tileNum, index) => (
          <div key={index} className="dora-slot" onClick={() => onSlotClick(index)}>
            {tileNum !== null ? (
                <Tile tileNum={tileNum} size="dora" isSelected={selection.type === 'dora' && selection.index === index} showTooltips={settings.showTooltips}/>
            ) : (
                selection.type === 'add_dora' && selection.index === index && <div className="selection-highlight"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const PlayerDisplay = ({ playerKey, label, subLabel, discards, melds, selection, onTileClick, onAddSlotClick, onMeldTileClick, settings}) => {
  const maxDiscards = 21; 
    const slots = Array(maxDiscards).fill(null);
    discards.forEach((tileNum, index) => {
        if (index < maxDiscards) slots[index] = tileNum;
    });
    return (
        <div className="player-display">
            <div className="player-label-container">
                <span className="player-label">{label}</span>
                {subLabel && <span className="player-sub-label">{subLabel}</span>}
            </div>
            <div className="other-player-melds-area">
              {melds.map((meld, meldIndex) => (
                <div key={meldIndex} className="other-player-meld-set">
                  {meld.tiles.map((tileNum, tileIndex) => {
                    const isAnkan = meld.type === 'ankan';
                    const isClosed = isAnkan && (tileIndex === 0 || tileIndex === 3);
                    const isExposed = !isAnkan && tileIndex === meld.exposed_index;
                    const finalTileNum = isClosed ? 'b' : tileNum;
                    const isSelected = selection.type === 'meld' && selection.playerKey === playerKey && selection.meldIndex === meldIndex && selection.tileIndex === tileIndex;

                    return (
                        <div key={tileIndex} className={`tile-wrapper ${isSelected ? 'selected' : ''}`}
                            onClick={(e) => { e.stopPropagation(); onMeldTileClick(playerKey, meldIndex, tileIndex); }}>
                          <Tile 
                            tileNum={finalTileNum} 
                            size="other_meld" 
                            orientation={isExposed ? 'horizontal' : 'vertical'}
                            showTooltips={settings.showTooltips}
                          />
                        </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="discard-area">
                {slots.map((tileNum, i) => (
                    <div key={`${playerKey}-discard-${i}`} className="discard-slot" onClick={() => onAddSlotClick(playerKey)}>
                        {tileNum !== null ? (
                            <div onClick={(e) => { e.stopPropagation(); onTileClick(playerKey, i); }}>
                                <Tile
                                    tileNum={tileNum} size="discard"
                                    isSelected={selection.type === 'discard' && selection.playerKey === playerKey && selection.index === i}
                                    showTooltips={settings.showTooltips}
                                />
                            </div>
                        ) : ( selection.type === 'add_discard' && selection.playerKey === playerKey && <div className="selection-highlight"></div>)}
                    </div>
                ))}
            </div>
        </div>
    );
};

const OwnMeldArea = ({ melds, onMeldTileClick, selection, settings }) => {
  return (
    <div className="own-melds-area">
      {melds.map((meld, meldIndex) => (
        <div key={meldIndex} className="own-meld-set">
          {meld.tiles.map((tileNum, tileIndex) => {
            const isAnkan = meld.type === 'ankan';
            const isClosed = isAnkan && (tileIndex === 0 || tileIndex === 3);
            const isExposed = !isAnkan && meld.exposed_index === tileIndex;
            const finalTileNum = isClosed ? 'b' : tileNum;
            const isSelected = selection.type === 'meld' && selection.playerKey === 'self' && selection.meldIndex === meldIndex && selection.tileIndex === tileIndex;
            return (
              <div key={tileIndex} className={`tile-wrapper ${isSelected ? 'selected' : ''}`} 
                  onClick={(e) => { e.stopPropagation(); onMeldTileClick('self', meldIndex, tileIndex); }}>
                <Tile 
                  tileNum={finalTileNum} 
                  size="meld"
                  orientation={isExposed ? 'horizontal' : 'vertical'}
                  showTooltips={settings.showTooltips}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const MeldSelectionModal = ({ isOpen, candidates, onSelect, onClose, settings }) => {
  const [selectedMeldType, setSelectedMeldType] = useState('pon');
  
  const ponCandidates = candidates.filter(c => c.type === 'pon');
  const chiCandidates = candidates.filter(c => c.type === 'chi');
  const kanCandidates = candidates.filter(c => ['ankan', 'daiminkan', 'kakan'].includes(c.type));

  const KAN_TYPE_LABELS = { ankan: '暗槓', daiminkan: '大明槓', kakan: '加槓'};

  useEffect(() => {
    if (isOpen) {
      if (ponCandidates.length > 0) setSelectedMeldType('pon');
      else if (chiCandidates.length > 0) setSelectedMeldType('chi');
      else if (kanCandidates.length > 0) setSelectedMeldType('kan');
      else setSelectedMeldType('pon');
    }
  }, [isOpen, ponCandidates.length, chiCandidates.length, kanCandidates.length]); 

  if (!isOpen) return null;
  
  const displayedCandidates = 
    selectedMeldType === 'pon' ? ponCandidates :
    selectedMeldType === 'chi' ? chiCandidates :
    kanCandidates;

  const getMeldDisplayTiles = (candidate) => {
      if (candidate.from && candidate.called_tile !== undefined) {
          return [...(candidate.hand_tiles || candidate.tiles), candidate.called_tile];
      }
      return candidate.hand_tiles || candidate.tiles;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">鳴きを選択</div>
        <div className="modal-tabs">
          <button 
            className={`modal-tab-button ${selectedMeldType === 'pon' ? 'active' : ''}`}
            onClick={() => setSelectedMeldType('pon')}
            disabled={ponCandidates.length === 0}
          >
            ポン ({ponCandidates.length})
          </button>
          <button 
            className={`modal-tab-button ${selectedMeldType === 'chi' ? 'active' : ''}`}
            onClick={() => setSelectedMeldType('chi')}
            disabled={chiCandidates.length === 0}
          >
            チー ({chiCandidates.length})
          </button>
          <button 
            className={`modal-tab-button ${selectedMeldType === 'kan' ? 'active' : ''}`}
            onClick={() => setSelectedMeldType('kan')}
            disabled={kanCandidates.length === 0}
          >
            カン ({kanCandidates.length})
          </button>
        </div>
        <div className="meld-candidate-list">
          {displayedCandidates.map((candidate, index) => (
            <div key={index} className="meld-candidate-item" onClick={() => onSelect(candidate)}>
              <div style={{display: 'flex'}}>
                {getMeldDisplayTiles(candidate).sort((a,b) => a - b).map((tileNum, tileIndex) => (
                      <Tile key={tileIndex} tileNum={tileNum} size="hand" showTooltips={settings.showTooltips}/>
                ))}
              </div>
              {selectedMeldType === 'kan' && <span className="kan-type-label">{KAN_TYPE_LABELS[candidate.type]}</span>}
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button className="modal-cancel-button" onClick={onClose}>キャンセル</button>
        </div>
      </div>
    </div>
  );
};


const TileDisplayArea = ({ boardState, onBoardStateChange, onResetBoardState, settings = { theme: 'dark', fontSize: '14px', flag: 1, showTooltips: true }, onModeChange, calculationError, }) => {

  const AKA_DORA_NUMS = [34, 35, 36];
  const NORMAL_TO_RED_MAP = { 4: 34, 13: 35, 22: 36 };
  const RED_TO_NORMAL_MAP = { 34: 4, 35: 13, 36: 22 };
  
  const normalize = (n) => {
      if (n === null || n === undefined) return null;
      if (n >= 1000) return normalize(n - 1000); // 1000番台を通常牌に変換
      if (n >= 100) return normalize(n - 100);   // 100番台を通常牌に変換
      return (n in RED_TO_NORMAL_MAP) ? RED_TO_NORMAL_MAP[n] : n;
  };

  const getCombinations = (array, size) => {
    const result = [];
    const f = (prefix, arr) => {
        if (prefix.length === size) {
            result.push(prefix);
            return;
        }
        for (let i = 0; i < arr.length; i++) {
            f(prefix.concat(arr[i]), arr.slice(i + 1));
        }
    };
    f([], array);
    return result;
  };
  
  const isMeldValid = (type, tiles) => {
    if (!tiles || tiles.some(t => t === null || t === undefined)) return false;
    const normalizedTiles = tiles.map(t => normalize(t)).sort((a, b) => a - b);
    if (type === 'pon' || type.includes('kan') || type.includes('minkan')) {
      return normalizedTiles.every(t => t === normalizedTiles[0]);
    }
    if (type === 'chi') {
      if (tiles.length !== 3) return false;
      const isNumberTile = (n) => n >= 0 && n <= 26;
      if (!normalizedTiles.every(isNumberTile)) return false;
      const getSuit = (n) => Math.floor(n / 9);
      if (new Set(normalizedTiles.map(getSuit)).size > 1) return false;
      return normalizedTiles[0] + 1 === normalizedTiles[1] && normalizedTiles[1] + 1 === normalizedTiles[2];
    }
    return true;
  };

  const [selection, setSelection] = useState({ type: null });
  const [isMeldModalOpen, setIsMeldModalOpen] = useState(false);

  // ▼▼▼ ここから修正 ▼▼▼
  const findMeldCandidates = (currentBoardState) => {
    if (!currentBoardState) return [];

    // 元のコード: boardStateの構造が不完全な場合にエラーになる可能性がありました
    // const { hand_tiles: hand, tsumo_tile: tsumoTile, melds: { self: selfMelds }, last_discard: lastDiscard } = currentBoardState;

    // 修正後: stateが不完全な場合でも安全に動作するように、デフォルト値を用意します
    const hand = currentBoardState.hand_tiles || [];
    const tsumoTile = currentBoardState.tsumo_tile;
    const selfMelds = (currentBoardState.melds && Array.isArray(currentBoardState.melds.self)) ? currentBoardState.melds.self : [];
    const lastDiscard = currentBoardState.last_discard;
  // ▲▲▲ ここまで修正 ▲▲▲

    const candidates = [];
    const fullHand = [...hand, tsumoTile].filter(t => t !== null);
    const normalizedGroups = {};
    fullHand.forEach(tile => {
        const norm = normalize(tile);
        if (!normalizedGroups[norm]) normalizedGroups[norm] = [];
        normalizedGroups[norm].push(tile);
    });

    if (lastDiscard && lastDiscard.tile !== null) {
        const discardedTile = lastDiscard.tile;
        const normDiscarded = normalize(discardedTile);
        
        if (normalizedGroups[normDiscarded] && normalizedGroups[normDiscarded].length >= 2) {
            getCombinations(normalizedGroups[normDiscarded], 2).forEach(combo => {
                candidates.push({ type: 'pon', hand_tiles: combo, from: lastDiscard.from, called_tile: discardedTile });
            });
        }
        if (normalizedGroups[normDiscarded] && normalizedGroups[normDiscarded].length >= 3) {
            getCombinations(normalizedGroups[normDiscarded], 3).forEach(combo => {
                candidates.push({ type: 'daiminkan', hand_tiles: combo, from: lastDiscard.from, called_tile: discardedTile });
            });
        }
        if (lastDiscard.from === 'kamicha' && discardedTile !== undefined && discardedTile !== null && normalize(discardedTile) < 27) {
            const n = normalize(discardedTile);
            const suit = Math.floor(n / 9);

            const checkChiPattern = (t1, t2) => {
                if (t1 >= 0 && t1 < 27 && Math.floor(t1 / 9) === suit &&
                    t2 >= 0 && t2 < 27 && Math.floor(t2 / 9) === suit &&
                    normalizedGroups[t1] && normalizedGroups[t2]) {
                    
                    normalizedGroups[t1].forEach(tile1 => {
                        normalizedGroups[t2].forEach(tile2 => {
                            candidates.push({ type: 'chi', hand_tiles: [tile1, tile2], from: 'kamicha', called_tile: discardedTile });
                        });
                    });
                }
            };
            
            if (n % 9 >= 2) checkChiPattern(n - 2, n - 1);
            if (n % 9 >= 1 && n % 9 <= 7) checkChiPattern(n - 1, n + 1);
            if (n % 9 <= 6) checkChiPattern(n + 1, n + 2);
        }
    } else {
        for (const norm in normalizedGroups) {
            if (normalizedGroups[norm].length === 4) {
                candidates.push({ type: 'ankan', tiles: normalizedGroups[norm] });
            }
        }
        
        selfMelds.forEach((meld, meldIndex) => {
            if (meld.type === 'pon') {
                const norm = normalize(meld.tiles[0]);
                if (normalizedGroups[norm] && normalizedGroups[norm].length > 0) {
                    normalizedGroups[norm].forEach(tileInHand => {
                        candidates.push({ type: 'kakan', tiles: [tileInHand], from_meld_index: meldIndex });
                    });
                }
            }
        });
    }
    
    const uniqueCandidates = [];
    const signatures = new Set();
    candidates.forEach(c => {
        const tilesToSort = c.hand_tiles || c.tiles;
        const signature = c.type + ':' + (c.from_meld_index ?? '') + ':' + (c.called_tile ?? '') + ':' + [...tilesToSort].sort((a,b)=>a-b).join(',');
        if (!signatures.has(signature)) {
            signatures.add(signature);
            uniqueCandidates.push(c);
        }
    });

    return uniqueCandidates;
  };
  
  const handleSelectMeld = (meldToMake) => {
    if (!boardState) return;
    const newBoardState = JSON.parse(JSON.stringify(boardState)); 
        let hand = newBoardState.hand_tiles;
        let tsumo = newBoardState.tsumo_tile;

        const removeTilesFromHand = (tilesToRemove) => {
            for (const tile of tilesToRemove) {
                const indexInHand = hand.findIndex(h => h === tile);
                if (indexInHand > -1) {
                    hand.splice(indexInHand, 1);
                } else if (tsumo === tile) {
                    tsumo = null;
                } else {
                    return false; 
                }
            }
            return true;
        }

        if (meldToMake.type === 'kakan') {
            const meldToUpdate = newBoardState.melds.self[meldToMake.from_meld_index];
            if(removeTilesFromHand(meldToMake.tiles)) {
                meldToUpdate.type = 'minkan'; 
                meldToUpdate.tiles.push(meldToMake.tiles[0]);
                meldToUpdate.tiles.sort((a, b) => a - b);
            }
        } else if (meldToMake.type === 'ankan') {
            if(removeTilesFromHand(meldToMake.tiles)) {
                newBoardState.melds.self.push({ type: 'ankan', tiles: meldToMake.tiles, from: 'self' });
            }
        } else if (meldToMake.from) { 
            const fromPlayer = meldToMake.from;
            const calledTile = meldToMake.called_tile; 

            if (removeTilesFromHand(meldToMake.hand_tiles)) {
                const discardPile = newBoardState.player_discards[fromPlayer];
                const discardIndex = discardPile.lastIndexOf(calledTile); 
                if(discardIndex > -1) discardPile.splice(discardIndex, 1);

                const meldTiles = [...meldToMake.hand_tiles, calledTile].sort((a,b)=>a-b);
                let exposed_index;
                if (meldToMake.type === 'chi') {
                    exposed_index = meldTiles.findIndex(t => t === calledTile);
                } else { 
                    if (fromPlayer === 'kamicha') exposed_index = 0; 
                    else if (fromPlayer === 'toimen') exposed_index = 1; 
                    else if (fromPlayer === 'shimocha') exposed_index = 2; 
                    else exposed_index = 0; 
                }

                const meldType = meldToMake.type === 'daiminkan' ? 'minkan' : meldToMake.type;
                newBoardState.melds.self.push({ type: meldType, tiles: meldTiles, from: fromPlayer, exposed_index });
            }
        }
        
        newBoardState.hand_tiles = hand.sort((a, b) => a - b);
        newBoardState.tsumo_tile = tsumo;
        newBoardState.last_discard = { tile: null, from: null, index: null }; 
    onBoardStateChange(newBoardState); 
    setSelection({type: null});
    setIsMeldModalOpen(false);
  };
  
  const handleTurnChange = () => {
    if (!boardState) return;
    onBoardStateChange({ ...boardState, turn: (typeof boardState.turn === 'number' && boardState.turn < 22) ? boardState.turn + 1 : 1 });
  };
  const handleRoundWindChange = () => {
    if (!boardState) return;
    onBoardStateChange({ ...boardState, round_wind: boardState.round_wind === 27 ? 28 : 27 });
  };

  const handlePlayerWindChange = () => {
    if (!boardState) return;
    onBoardStateChange(prevBoardState => {
      const WIND_ORDER = [27, 28, 29, 30];
      const currentIndex = WIND_ORDER.indexOf(prevBoardState.player_winds.self);
      const nextIndex = (currentIndex + 1) % 4;
      return { ...prevBoardState, player_winds: { self: WIND_ORDER[nextIndex], shimocha: WIND_ORDER[(nextIndex + 1) % 4], toimen: WIND_ORDER[(nextIndex + 2) % 4], kamicha: WIND_ORDER[(nextIndex + 3) % 4] } };
    });
  };
  
  const handlePoolTileClick = (newTileNum) => {
    if (!boardState) return;
    if (!selection.type) return;

    if (selection.type.startsWith('add_') && newTileNum === null) {
        return;
    }

    const newBoardState = JSON.parse(JSON.stringify(boardState));
    const sortedHand = [...newBoardState.hand_tiles].sort((a, b) => a - b);

    if (newTileNum === null) {
        switch (selection.type) {
            case 'hand': {
                const tileToRemove = sortedHand[selection.index];
                const originalIndex = newBoardState.hand_tiles.findIndex(t => t === tileToRemove);
                if (originalIndex > -1) newBoardState.hand_tiles.splice(originalIndex, 1);
                break;
            }
            case 'tsumo':
                newBoardState.tsumo_tile = null;
                break;
            case 'discard':
                newBoardState.player_discards[selection.playerKey].splice(selection.index, 1);
                break;
            case 'dora':
                newBoardState.dora_indicators.splice(selection.index, 1);
                break;
            case 'meld':
                alert("面子の牌を個別に削除することはできません。面子全体を削除するには、再度同じ面子の牌をクリックしてください。");
                setSelection({ type: null });
                return;
            default:
                break;
        }
        onBoardStateChange(newBoardState);
        setSelection({ type: null });
        return;
    }

    const getSelectedTileNum = () => {
        if (!selection || !selection.type) return null;
        switch (selection.type) {
            case 'hand': return sortedHand[selection.index];
            case 'tsumo': return newBoardState.tsumo_tile;
            case 'discard': return newBoardState.player_discards[selection.playerKey]?.[selection.index];
            case 'dora': return newBoardState.dora_indicators[selection.index];
            case 'meld': return newBoardState.melds[selection.playerKey]?.[selection.meldIndex]?.tiles[selection.tileIndex];
            default: return null;
        }
    };
    
    const originalTileNum = getSelectedTileNum();
    
    const allTilesOnBoard = [
        ...newBoardState.hand_tiles, newBoardState.tsumo_tile, 
        ...Object.values(newBoardState.player_discards).flat(),
        ...Object.values(newBoardState.melds).flatMap(p => p.flatMap(m => m.tiles)),
        ...newBoardState.dora_indicators,
    ].filter(t => t !== null && t !== undefined);

    let tempBoard = [...allTilesOnBoard];
    if (originalTileNum !== null && originalTileNum !== undefined) {
      const indexToRemove = tempBoard.indexOf(originalTileNum);
      if (indexToRemove > -1) tempBoard.splice(indexToRemove, 1);
    }
    
    const countInBoard = (tile) => tempBoard.filter(t => normalize(t) === normalize(tile)).length;
    const countRedInBoard = (redTile) => tempBoard.filter(t => t === redTile || t === redTile + 100).length;

    const normNewTile = normalize(newTileNum);
    
    if (AKA_DORA_NUMS.includes(normNewTile)) {
        if (countRedInBoard(normNewTile) >= 1) {
            alert("赤ドラは各種1枚までしか使用できません。");
            return;
        }
    }
    
    if (countInBoard(newTileNum) >= 4) {
      alert(`${TILE_NUM_TO_NAME[normNewTile]} は4枚までしか使用できません。`);
      return;
    }
    
    switch (selection.type) {
        case 'add_hand':
            newBoardState.hand_tiles.push(newTileNum);
            break;
        case 'add_tsumo':
            newBoardState.tsumo_tile = newTileNum;
            break;
        case 'add_discard':
            newBoardState.player_discards[selection.playerKey].push(newTileNum);
            break;
        case 'add_dora':
            newBoardState.dora_indicators.push(newTileNum);
            break;
        case 'hand': {
            const tileToReplace = sortedHand[selection.index];
            const originalIndexInHand = newBoardState.hand_tiles.findIndex(t => t === tileToReplace);
            if(originalIndexInHand > -1){
              newBoardState.hand_tiles[originalIndexInHand] = newTileNum;
            }
            break;
        }
        case 'tsumo':
            newBoardState.tsumo_tile = newTileNum;
            break;
        case 'discard':
            newBoardState.player_discards[selection.playerKey][selection.index] = newTileNum;
            if (selection.playerKey !== 'self' && newBoardState.last_discard.from === selection.playerKey && newBoardState.last_discard.index === selection.index) {
                newBoardState.last_discard = { tile: newTileNum, from: selection.playerKey, index: selection.index };
            }
            break;
        case 'dora':
            newBoardState.dora_indicators[selection.index] = newTileNum;
            break;
        case 'meld': {
            alert("鳴いた面子の個別の牌は変更できません。面子全体を崩すには、面子の牌をクリックし直してください。");
            setSelection({ type: null }); 
            return; 
        }
        default: break;
    }
    
    newBoardState.hand_tiles.sort((a,b) => a - b);
    onBoardStateChange(newBoardState); 
    setSelection({ type: null }); 
  };
  
  const handleTileClick = (type, index, playerKey = 'self', options = {}) => {
      if (!boardState) return;
      const newSelection = {type, index, playerKey, ...options};
      
      const isSameTile = selection.type === newSelection.type &&
                          selection.index === newSelection.index &&
                          selection.playerKey === newSelection.playerKey &&
                          selection.meldIndex === newSelection.meldIndex; 

      const isSameMeld = selection.type === 'meld' && selection.playerKey === 'self' &&
                          newSelection.type === 'meld' && newSelection.playerKey === 'self' &&
                          selection.meldIndex === newSelection.meldIndex;

      if (isSameTile || isSameMeld) {
          if (isSameMeld) {
              onBoardStateChange(prevBoardState => { 
                  const newBoardState = JSON.parse(JSON.stringify(prevBoardState));
                  const meldToBreak = newBoardState.melds.self[selection.meldIndex];
                  
                  if (meldToBreak) {
                      const tilesFromMeld = meldToBreak.tiles;
                      
                      const newHand = [
                        ...newBoardState.hand_tiles,
                        ...(newBoardState.tsumo_tile !== null ? [newBoardState.tsumo_tile] : []),
                        ...tilesFromMeld
                      ];
                      
                      newBoardState.hand_tiles = newHand.sort((a, b) => a - b);
                      newBoardState.tsumo_tile = null;
                      newBoardState.melds.self.splice(selection.meldIndex, 1);
                  }
                  return newBoardState;
              });
          }
          setSelection({ type: null }); 

      } else { 
          setSelection(newSelection);

          if (newSelection.type === 'discard' && newSelection.playerKey !== 'self') {
              onBoardStateChange(prevBoardState => ({ 
                  ...prevBoardState,
                  last_discard: {
                      tile: prevBoardState.player_discards[newSelection.playerKey][newSelection.index],
                      from: newSelection.playerKey,
                      index: newSelection.index
                  }
              }));
          } else {
              onBoardStateChange(prevBoardState => ({ 
                  ...prevBoardState,
                  last_discard: { tile: null, from: null, index: null }
              }));
          }
      }
  }

  if (!boardState) {
    return <div>Loading board state...</div>;
  }
  
  const sortedHand = [...boardState.hand_tiles].sort((a,b) => a - b);
  const meldCandidates = findMeldCandidates(boardState); 

  const playerWindNames = { self: WIND_NUM_TO_KANJI[boardState.player_winds.self] || '東', shimocha: WIND_NUM_TO_KANJI[boardState.player_winds.shimocha] || '南', toimen: WIND_NUM_TO_KANJI[boardState.player_winds.toimen] || '西', kamicha: WIND_NUM_TO_KANJI[boardState.player_winds.kamicha] || '北' };
  const roundWindKanji = WIND_NUM_TO_KANJI[boardState.round_wind] || '東';
  
  const headerTitle = (
    <>
      状況 (巡目:<span className="clickable-text" onClick={handleTurnChange}>{boardState?.turn || '未'}</span> 場風:<span className="clickable-text" onClick={handleRoundWindChange}>{roundWindKanji}</span>)
    </>
  );

  const handleClearAll = () => {
    onResetBoardState();
    setSelection({ type: null });
    setIsMeldModalOpen(false);
  };

  const MAX_HAND_SLOTS = 13;
  const numMelds = boardState.melds.self.length;

  const errorStyle = {
    color: '#ff4d4d',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    border: '1px solid #ff4d4d',
    borderRadius: '4px',
    padding: '10px',
    marginTop: '10px',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '0.9em'
  };
  
  return (
    <>
      <style>{styles}</style>
      <MeldSelectionModal
        isOpen={isMeldModalOpen}
        candidates={meldCandidates}
        onSelect={handleSelectMeld}
        onClose={() => setIsMeldModalOpen(false)}
        settings={settings}
      />
      <div 
        className={`tile-display-container theme-${settings.theme}`}
        style={{ fontSize: settings.fontSize }}
      >
        {selection.type && (
          <div className="tile-pool">
            <button className="tile-pool-close-button" onClick={() => setSelection({ type: null })}>×</button>
            {!selection.type.startsWith('add_') && <EmptyPoolTile onClick={() => handlePoolTileClick(null)} />}
            {ALL_TILES_IN_POOL.map(tileNum => 
              <Tile 
                key={`pool-${tileNum}`} 
                tileNum={tileNum} 
                size="pool" 
                onClick={() => handlePoolTileClick(tileNum)} 
                showTooltips={settings.showTooltips}
              />
            )}
          </div>
        )}
        <div onClick={(e) => { e.stopPropagation(); setSelection({type: null}); }}>
          <div onClick={e => e.stopPropagation()}>
            <StatusHeader 
              title={headerTitle} 
              onResetClick={handleClearAll}
              isSimulatorMode={settings.flag === 1}
              onModeChange={onModeChange}
            />
            
            <DoraIndicatorArea indicators={boardState.dora_indicators} onSlotClick={(index) => handleTileClick(boardState.dora_indicators[index] !== undefined ? 'dora' : 'add_dora', index)} selection={selection} settings={settings}/>
            <div className="upper-game-area">
              <PlayerDisplay playerKey="self" label="自" subLabel={playerWindNames.self} discards={boardState.player_discards.self} melds={boardState.melds.self} selection={selection} onTileClick={(playerKey, index) => handleTileClick('discard', index, playerKey)} onAddSlotClick={() => setSelection({type: 'add_discard', playerKey: 'self'})} onMeldTileClick={(playerKey, meldIndex, tileIndex) => handleTileClick('meld', tileIndex, playerKey, { meldIndex })} settings={settings}/>
              <PlayerDisplay playerKey="shimocha" label="下家" subLabel={playerWindNames.shimocha} discards={boardState.player_discards.shimocha} melds={boardState.melds.shimocha} selection={selection} onTileClick={(playerKey, index) => handleTileClick('discard', index, playerKey)} onAddSlotClick={() => setSelection({type: 'add_discard', playerKey: 'shimocha'})} onMeldTileClick={(playerKey, meldIndex, tileIndex) => handleTileClick('meld', tileIndex, playerKey, { meldIndex })} settings={settings}/>
              <PlayerDisplay playerKey="toimen" label="対面" subLabel={playerWindNames.toimen} discards={boardState.player_discards.toimen} melds={boardState.melds.toimen} selection={selection} onTileClick={(playerKey, index) => handleTileClick('discard', index, playerKey)} onAddSlotClick={() => setSelection({type: 'add_discard', playerKey: 'toimen'})} onMeldTileClick={(playerKey, meldIndex, tileIndex) => handleTileClick('meld', tileIndex, playerKey, { meldIndex })} settings={settings}/>
              <PlayerDisplay playerKey="kamicha" label="上家" subLabel={playerWindNames.kamicha} discards={boardState.player_discards.kamicha} melds={boardState.melds.kamicha} selection={selection} onTileClick={(playerKey, index) => handleTileClick('discard', index, playerKey)} onAddSlotClick={() => setSelection({type: 'add_discard', playerKey: 'kamicha'})} onMeldTileClick={(playerKey, meldIndex, tileIndex) => handleTileClick('meld', tileIndex, playerKey, { meldIndex })} settings={settings}/>
            </div>
            <div className="own-hand-area">
              <div className="hand-controls">
                  <div className="own-wind" onClick={handlePlayerWindChange} title="クリックして自風を切り替え">
                      {playerWindNames.self}
                  </div>
                  <button
                      className="meld-button"
                      onClick={() => setIsMeldModalOpen(true)}
                      disabled={meldCandidates.length === 0}
                      title={meldCandidates.length > 0 ? "鳴き候補を選択" : "鳴ける牌がありません"}
                  >
                      鳴く
                  </button>
              </div>
              <div className="hand-and-melds-container">
                <div className="hand-tiles-container">
                  {sortedHand.map((tileNum, i) => (
                    <div key={`hand-tile-${i}`} className="hand-tile" onClick={() => handleTileClick('hand', i)}>
                      <Tile tileNum={tileNum} size="hand" isSelected={selection.type === 'hand' && selection.index === i} showTooltips={settings.showTooltips}/>
                    </div>
                  ))}

                  {[...Array(Math.max(0, (MAX_HAND_SLOTS - numMelds * 3) - sortedHand.length))].map((_, i) => (
                    <div key={`empty-slot-${i}`} className="hand-tile" onClick={() => setSelection({ type: 'add_hand' })}>
                      <div className="empty-slot">
                        {selection.type === 'add_hand' && <div className="selection-highlight"></div>}
                      </div>
                    </div>
                  ))}
                  <div className="tsumo-tile">
                    {boardState.tsumo_tile !== null ? (
                      <div onClick={() => handleTileClick('tsumo')} style={{cursor: 'pointer'}}>
                        <Tile tileNum={boardState.tsumo_tile} size="tsumo" isSelected={selection.type === 'tsumo'} showTooltips={settings.showTooltips}/>
                      </div>
                    ) : (
                      (sortedHand.length + numMelds * 3) < 14 && 
                      <div className="empty-slot" onClick={() => setSelection({ type: 'add_tsumo' })}>
                        {selection.type === 'add_tsumo' && <div className="selection-highlight"></div>}
                      </div>
                    )}
                  </div>
                </div>
                <OwnMeldArea melds={boardState.melds.self} onMeldTileClick={(playerKey, meldIndex, tileIndex) => handleTileClick('meld', tileIndex, playerKey, { meldIndex })} selection={selection} settings={settings}/>
              </div>
            </div>
            
            {calculationError && (
              <div style={errorStyle}>
                {calculationError}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default TileDisplayArea;