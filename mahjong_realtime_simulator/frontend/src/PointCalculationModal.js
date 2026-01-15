// PointCalculationModal.js
import React, { useState, useEffect } from 'react';
import { TILE_IMAGES, TILE_NUM_TO_NAME } from './MainScreen_child/GameStatusArea_child/TileDisplayArea';

const ALL_TILES_IN_POOL = Array.from({ length: 37 }, (_, i) => i);

// スタイル定義（デザイン強化版）
const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 30000 },
    content: { backgroundColor: '#2c3e50', padding: '0', borderRadius: '16px', width: '600px', maxHeight: '95vh', overflowY: 'auto', color: '#ecf0f1', boxShadow: '0 20px 60px rgba(0,0,0,0.8)', border: '1px solid #444', display: 'flex', flexDirection: 'column' },
    
    // ヘッダーエリア
    header: { padding: '20px', borderBottom: '1px solid #34495e', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#34495e', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' },
    title: { fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#fff' },

    body: { padding: '25px' },

    // 【重要】結果表示カード（リッチなデザイン）
    resultCard: { 
        background: 'linear-gradient(135deg, #1a252f 0%, #2c3e50 100%)', 
        padding: '25px', 
        borderRadius: '12px', 
        marginBottom: '25px', 
        border: '1px solid #3498db', 
        boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
    },
    // 飾り線
    decorativeLine: { height: '2px', background: 'linear-gradient(90deg, transparent, #f1c40f, transparent)', margin: '15px 0', opacity: 0.6 },
    
    // ランク表示（満貫、役満など）
    limitRank: { fontSize: '28px', color: '#e74c3c', fontWeight: '900', textShadow: '0 2px 4px rgba(0,0,0,0.8)', letterSpacing: '2px', marginBottom: '5px' },
    
    // スコアコンテナ
    scoreContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' },
    
    // メインスコア（合計点数など）
    mainScore: { fontSize: '48px', fontWeight: '900', color: '#f1c40f', textShadow: '0 4px 10px rgba(241, 196, 15, 0.3)', lineHeight: '1.1' },
    
    // 点数内訳（4000オールなど）
    scoreDetail: { fontSize: '18px', color: '#bdc3c7', marginTop: '5px' },
    
    // 符・翻表示
    hanHuLabel: { fontSize: '16px', color: '#fff', backgroundColor: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '15px', marginTop: '10px', display: 'inline-block' },

    // 役リストエリア
    yakuContainer: { marginTop: '10px', textAlign: 'left', backgroundColor: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px' },
    yakuList: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
    yakuItem: { fontSize: '16px', color: '#ecf0f1', borderBottom: '1px dashed #555', paddingBottom: '4px' },

    // エラー
    errorCard: { backgroundColor: '#c0392b', color: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #ff7675', textAlign: 'center' },

    // オプション・ドラ
    sectionTitle: { fontSize: '14px', color: '#95a5a6', marginBottom: '8px', borderLeft: '3px solid #3498db', paddingLeft: '8px' },
    optionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' },
    optionItem: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', padding: '10px', borderRadius: '6px', backgroundColor: '#3d566e', transition: 'all 0.2s' },
    optionItemActive: { backgroundColor: '#2980b9', border: '1px solid #3498db' },

    uraDoraSection: { marginTop: '15px', padding: '15px', border: '1px solid #555', borderRadius: '10px', backgroundColor: '#222f3e' },
    uraDoraGrid: { display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'center' },
    uraDoraSlot: { width: '40px', height: '56px', border: '1px dashed #777', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
    
    tilePicker: { display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '10px', padding: '10px', backgroundColor: '#34495e', borderRadius: '8px', justifyContent: 'center' },
    
    footer: { padding: '20px', borderTop: '1px solid #34495e', display: 'flex', justifyContent: 'center', background: '#34495e', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' },
    closeButton: { padding: '12px 60px', backgroundColor: '#2ecc71', border: 'none', borderRadius: '30px', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 4px 0 #27ae60', transition: 'transform 0.1s' }
};

export const PointCalculationModal = ({ isOpen, onClose, initialData, winSnapshot, winTile, gameSettings, getCookie }) => {
    // ... (state定義は変更なし) ...
    const [options, setOptions] = useState({
        player_wind: 27, round_wind: 27, is_tsumo: true, is_riichi: false, is_rinshan: false, is_ippatsu: false, is_chankan: false, is_haitei: false, is_houtei: false, is_daburu_riichi: false,
        options: { kazoe_limit: 1, has_aka_dora: true, has_open_tanyao: true, kiriage: false }
    });
    const [uraDoraIndicators, setUraDoraIndicators] = useState([]);
    const [selectingSlot, setSelectingSlot] = useState(null);
    const [calcResult, setCalcResult] = useState(null);
    const [calcError, setCalcError] = useState(null);

    // ... (useEffectやupdatePointCalculation, toggleOption等のロジックは変更なし) ...
    useEffect(() => {
        if (isOpen && winSnapshot) {
            let initResult = null;
            
            if (initialData) {
                // point_result または result または initialData そのものを使う
                initResult = initialData.point_result || initialData.result || initialData;
            }

            setCalcResult(initResult);
            setCalcError(null);
            setUraDoraIndicators([]);
            setOptions({
                player_wind: winSnapshot.zikaze ?? gameSettings.zikaze ?? 27,
                round_wind: winSnapshot.bakaze ?? gameSettings.bakaze ?? 27,
                is_tsumo: true,
                is_riichi: false,
                is_rinshan: false,
                is_ippatsu: false,
                is_chankan: false,
                is_haitei: false,
                is_houtei: false,
                is_daburu_riichi: false,
                options: {
                    kazoe_limit: gameSettings.kazoe_limit ?? 1,
                    has_aka_dora: gameSettings.has_aka_dora ?? true,
                    has_open_tanyao: gameSettings.has_open_tanyao ?? true,
                    kiriage: gameSettings.kiriage ?? false,
                }
            });
        }
    }, [isOpen, initialData, winSnapshot]);

    useEffect(() => {
        if (isOpen && winSnapshot && winTile !== null) {
            updatePointCalculation();
        }
    }, [options, uraDoraIndicators]);

    const updatePointCalculation = async () => {
        setCalcError(null);
        const formData = new FormData();
        const melds_list = winSnapshot.melds.map(m => m.tiles);
        const flattened_melds = melds_list.flat();
        const full_hand_tiles = [...winSnapshot.hand_tiles, ...flattened_melds].filter(t => t !== null && t !== undefined);
        const combined_dora = [...winSnapshot.dora_indicators, ...uraDoraIndicators].filter(t => t !== null && t !== undefined);
        const hand_tiles_info = { hand_tiles: full_hand_tiles, meld_tiles: melds_list, dora_indicators: combined_dora, win_tile: winTile };

        formData.append('hand_tiles_info', JSON.stringify(hand_tiles_info));
        formData.append('options', JSON.stringify(options));

        try {
            const response = await fetch('/app/point_calc/', {
                method: 'POST',
                headers: { 'X-CSRFToken': getCookie('csrftoken') },
                body: formData
            });
            const data = await response.json();
            console.log("Backend Response:", data);
            if (response.status === 200) {
                console.log("Setting calcResult to:", data.point_result);
                const resultData = data.point_result || data.result;
                setCalcResult(resultData);
                setCalcError(null);
            } else {
                setCalcError(data.message || `Error ${response.status}`);
                //setCalcResult(null);
            }
        } catch (error) {
            setCalcError("通信エラーが発生しました");
            setCalcResult(null);
        }
    };

    const toggleOption = (key) => {
        setOptions(prev => {
            let next = { ...prev };
            const currentVal = !prev[key];
            next[key] = currentVal;
            if (currentVal === true) {
                if (key === 'is_haitei') { next.is_tsumo = true; next.is_rinshan = false; next.is_houtei = false; }
                if (key === 'is_houtei') { next.is_tsumo = false; next.is_rinshan = false; next.is_haitei = false; }
                if (key === 'is_rinshan') { next.is_tsumo = true; next.is_haitei = false; next.is_houtei = false; }
                if (key === 'is_daburu_riichi') { next.is_riichi = true; }
            }
            if (key === 'is_tsumo') {
                if (currentVal) next.is_houtei = false;
                else { next.is_haitei = false; next.is_rinshan = false; }
            }
            return next;
        });
    };

    const checkDisabled = (key) => {
        if (key === 'is_tsumo') return options.is_haitei || options.is_houtei || options.is_rinshan;
        if (key === 'is_haitei') return !options.is_tsumo || options.is_houtei || options.is_rinshan;
        if (key === 'is_houtei') return options.is_tsumo || options.is_haitei || options.is_rinshan;
        if (key === 'is_rinshan') return !options.is_tsumo || options.is_haitei || options.is_houtei;
        return false;
    };


    // ---------------------------------------------------------
    // 新しいヘルパー関数群
    // ---------------------------------------------------------

    // 翻数と符数から簡易的にランク名を取得（バックエンドから来ない場合の補完）
    const getLimitRankName = (han, fu) => {
        if (han >= 26) return "ダブル役満"; // ログに han:26 があったため
        if (han >= 13) return "役満";
        if (han >= 11) return "三倍満";
        if (han >= 8) return "倍満";
        if (han >= 6) return "跳満";
        if (han >= 5) return "満貫";
        // 4翻以下でも符数によっては満貫になるケース
        if (han === 4 && fu >= 40) return "満貫"; 
        if (han === 3 && fu >= 70) return "満貫";
        return null;
    };

    // 点数表示用のオブジェクトを作成
    const getScoreDisplay = (result) => {
        if (!result) return { total: "---", detail: "" };

        const isDealer = options.player_wind === 27; // 27 = 東
        let total = 0;
        let detail = "";

        if (options.is_tsumo) {
            // ツモの場合
            if (isDealer) {
                // 親のツモ
                total = result.main * 3; // 一般的な計算（バックエンドの値に依存しますが、概算として）
                // ※正確にはバックエンドのmainが「オール」の点数
                total = result.main * 3; // 仮：実際のトータルはオールx3
                detail = `${result.main} ALL`;
            } else {
                // 子のツモ
                // main: 親の支払い, additional: 子の支払い
                total = result.main + (result.additional * 2);
                detail = `${result.additional} / ${result.main}`; // 子 / 親
            }
        } else {
            // ロンの場合
            total = result.main;
            detail = isDealer ? "" : ""; // ロンは合計点だけでシンプルでも良い
        }

        // バックエンドがトータルスコアを返していない場合、
        // 単純にmain/additionalを表示の主役にするアプローチをとります
        return {
            totalDisplay: options.is_tsumo && isDealer ? `${result.main * 3}` : 
                          options.is_tsumo && !isDealer ? `${result.main + result.additional * 2}` :
                          `${result.main}`,
            detailText: detail
        };
    };

    if (!isOpen || !winSnapshot) return null;

    const rankName = calcResult ? getLimitRankName(calcResult.han, calcResult.hu) : null;
    const { totalDisplay, detailText } = calcScoreInfo();

    // 描画用のスコア情報を整理する関数
    function calcScoreInfo() {
        if (!calcResult) return { totalDisplay: "---", detailText: "" };
        const isDealer = options.player_wind === 27;
        
        if (options.is_tsumo) {
            if (isDealer) {
                return { totalDisplay: calcResult.main * 3, detailText: `${calcResult.main} ALL` };
            } else {
                return { totalDisplay: calcResult.main + (calcResult.additional * 2), detailText: `${calcResult.additional} / ${calcResult.main}` };
            }
        } else {
            return { totalDisplay: calcResult.main, detailText: "点" };
        }
    }

    return (
        <div style={styles.overlay}>
            <div style={styles.content}>
                
                {/* ヘッダー */}
                <div style={styles.header}>
                    <h2 style={styles.title}>和了点数計算</h2>
                </div>

                <div style={styles.body}>
                    {/* エラー表示 */}
                    {calcError && (
                        <div style={styles.errorCard}>
                            <strong>計算エラー</strong><br/>{calcError}
                        </div>
                    )}

                    {/* 結果カード */}
                    {calcResult && (
                        <div style={styles.resultCard}>
                            {/* ランク（満貫・役満など） */}
                            {rankName && <div style={styles.limitRank}>{rankName}</div>}

                            {/* メインスコア */}
                            <div style={styles.scoreContainer}>
                                <div style={styles.mainScore}>
                                    {totalDisplay}
                                </div>
                                <div style={styles.scoreDetail}>
                                    {detailText}
                                </div>
                            </div>

                            <div style={styles.decorativeLine}></div>

                            {/* 符・翻・役 */}
                            <div>
                                <div style={styles.hanHuLabel}>
                                    {calcResult.hu}符 {calcResult.han}翻
                                </div>
                                
                                <div style={styles.yakuContainer}>
                                    <div style={styles.yakuList}>
                                        {calcResult.yaku && calcResult.yaku.map((y, i) => (
                                            <div key={i} style={styles.yakuItem}>
                                                {y}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* オプション設定エリア */}
                    <div style={styles.sectionTitle}>和了状況設定</div>
                    <div style={styles.optionsGrid}>
                        {[
                            { key: 'is_tsumo', label: 'ツモ' },
                            { key: 'is_riichi', label: '立直' },
                            { key: 'is_daburu_riichi', label: 'ダブル立直' },
                            { key: 'is_ippatsu', label: '一発' },
                            { key: 'is_rinshan', label: '嶺上開花' },
                            { key: 'is_haitei', label: '海底摸月' },
                            { key: 'is_houtei', label: '河底撈魚' },
                            { key: 'is_chankan', label: '槍槓' },
                        ].map(opt => {
                            const isDisabled = checkDisabled(opt.key);
                            const isActive = options[opt.key];
                            return (
                                <div 
                                    key={opt.key}
                                    style={{ 
                                        ...styles.optionItem, 
                                        ...(isActive ? styles.optionItemActive : {}),
                                        opacity: isDisabled ? 0.4 : 1, 
                                        cursor: isDisabled ? 'not-allowed' : 'pointer' 
                                    }}
                                    onClick={() => !isDisabled && toggleOption(opt.key)}
                                >
                                    <input 
                                        type="checkbox" 
                                        checked={isActive} 
                                        readOnly
                                        disabled={isDisabled}
                                        style={{ pointerEvents: 'none' }} // クリックイベントは親divで処理
                                    />
                                    <span>{opt.label}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* 裏ドラ選択エリア（リーチ時のみ表示） */}
                    {(options.is_riichi || options.is_daburu_riichi) && (
                        <div style={styles.uraDoraSection}>
                            <div style={{ ...styles.sectionTitle, borderLeft: '3px solid #f1c40f', marginBottom:0 }}>裏ドラ表示牌 (クリックして選択)</div>
                            <div style={styles.uraDoraGrid}>
                                {[0, 1, 2, 3, 4].map(i => (
                                    <div key={i} style={{ ...styles.uraDoraSlot, borderColor: selectingSlot === i ? '#f1c40f' : '#777' }} onClick={() => setSelectingSlot(i === selectingSlot ? null : i)}>
                                        {uraDoraIndicators[i] !== undefined ? (
                                            <img src={TILE_IMAGES[TILE_NUM_TO_NAME[uraDoraIndicators[i]]]} style={{width:'100%'}} alt="tile" />
                                        ) : <span style={{ fontSize: '18px', color: '#555' }}>?</span>}
                                    </div>
                                ))}
                            </div>
                            
                            {selectingSlot !== null && (
                                <div style={styles.tilePicker}>
                                    <div style={{ width: '30px', height: '40px', backgroundColor: '#e74c3c', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }} onClick={() => {
                                        const newUra = [...uraDoraIndicators]; newUra.splice(selectingSlot, 1); setUraDoraIndicators(newUra.filter(t => t !== undefined)); setSelectingSlot(null);
                                    }}>✕</div>
                                    {ALL_TILES_IN_POOL.map(tileNum => (
                                        <div key={tileNum} onClick={() => {
                                            const newUra = [...uraDoraIndicators]; newUra[selectingSlot] = tileNum; setUraDoraIndicators(newUra.filter(t => t !== undefined)); setSelectingSlot(null);
                                        }} style={{ cursor: 'pointer' }}>
                                            <img src={TILE_IMAGES[TILE_NUM_TO_NAME[tileNum]]} style={{width: '30px', height: '40px', borderRadius: '2px'}} alt="pick" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* フッター */}
                <div style={styles.footer}>
                    <button style={styles.closeButton} onClick={onClose} onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'} onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    );
};