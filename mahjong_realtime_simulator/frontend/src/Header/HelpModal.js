// Header/HelpModal.js
import React, { useState, useEffect } from 'react';
import { styles } from './styles';
import { HelpContentPage } from './HelpContentPage';
import { ReferenceLinks } from './ReferenceLinks';
import { MahjongRulesPage } from './MahjongRulesPage';

export const HelpModal = ({ onClose }) => {
  const [view, setView] = useState('menu');
  const [hoveredButton, setHoveredButton] = useState(null);

  const localStyles = {
    button: { ...styles.button, display: 'block', width: '100%', padding: '15px', marginBottom: '15px', fontSize: '16px', textAlign: 'center', marginLeft: 0 },
  };

  const modalWidth = view === 'reference' || view === 'mahjongRules' ? '800px' : '400px';

   // ★ここから追加: Escapeキーでモーダルを閉じるための処理
    useEffect(() => {
      // キーが押されたときに実行される関数
      const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
          onClose(); // Escapeキーが押されたらonClose関数を呼び出す
        }
      };
  
      // グローバルなkeydownイベントリスナーを追加
      window.addEventListener('keydown', handleKeyDown);
  
      // クリーンアップ関数: コンポーネントがアンマウントされるときにイベントリスナーを削除
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [onClose]); // 依存配列にonCloseを含め、onCloseが変更された場合に再設定する
    // ★ここまで追加

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
      workflow: { title: '操作の流れ', content: "アプリを起動するとメイン画面が表示される。\\Aカメラを起動させ盤面と手牌を読み込ませるメイン画面に表示される手牌と実際の手牌があっていることを確認して計算開始ボタンを押す\\Aもし間違っていたら手動で切り替える\\Aツモ牌はカメラで読み取るか手動で入れる\\A鳴きたいときはなく牌をクリックしてから鳴く\\A牌譜モードボタンを押すと記録が開始され停止押すとその間のデータが保存または削除ができる\\A和了の形になったら「和了の形です」とコメントが出る" }, 
      features: { 
        title: '機能説明', 
        content: "明るさ:スライドバーによって画面の明るさを変えることができる\\A画面サイズ:フルスクリーンかウィンドウサイズを選ぶことができる\\Aテーマ:ライトかダークを選択できる\\Aフォントサイズ:小・中(デフォルト)・大・特大から選びフォントサイズを変えることができる\\A効果音:\\A雀卓の背景:デフォルトかユーザーの好きな画像に変えることができる\\Aアプリの背景:デフォルトかユーザーの好きな画像に変えることができる\\Aカメラカメラ接続ボタン:USB等でつながれているカメラとの接続\\A盤面カメラ:盤面を映し出すカメラ\\A手牌カメラ:手牌を映し出すカメラ\\A左右反転ボタン:左右を反転できるボタン\\A上下反転ボタン:上下を反転できるボタン\\Aカメラ割り当て設定:盤面と手牌を映し出すカメラの選択\\A表示シミュレーション結果の表示件数:シミュレーション結果を何件表示するか1~14件まで選択できる\\AボタンUIの項目表示非表示設定:状況・シミュレーション結果・カメラプレビュー・設定の表示するか非表示にするか設定できるボタン\\A盤面巡目を1~22まで切り替えられるボタン\\A場風を東か南に切り替えるボタン\\A牌の枠をクリックすると上部に全牌が表示され選択できる\\A計算結果表:手牌がそろった状態で計算開始ボタンを押すと打牌・有効牌・期待値・和了確率・聴牌確率の計五項目が表示される\\Aカメラプレビュー:設定した盤面カメラと手牌カメラをそれぞれ見ることができるまた左右反転ボタンと上下反転ボタンの設定ができる\\Aデータ表示:記録した牌譜の名前と日付が表示され、牌譜の削除と名前の編集が可能\\A設定項目:向聴タイプ一般手、七対手、国士無双手の３つから一つを選択できる。（複数選択不可）\\A一般手とは、いわゆる一雀頭四面子または四面子一雀頭と呼ばれる和了形式。\\A七対手とは七対子という役の和了形式。\\A国士無双手とは国士無双という役満の和了形式。\\A考慮項目向聴落とし考慮、手変わり考慮、ダブル立直考慮、一発考慮、海底撈月考慮、裏ドラ考慮、和了確率最大化の７つの内任意の項目を選択できる。（複数選択可）\\A向聴落とし考慮（または向聴戻し）とは、聴牌*に近づいている状態（向聴数が少ない状態）から、あえて不要な牌を切ることで向聴数を増やし、一時的に聴牌から遠ざかる戦術*\\A手変わりとは、聴牌時に特定の牌をツモることで、待ちの数が増えたり、役が追加されたりする現象\\Aダブル立直とは、*親は配牌時、子は第１ツモで聴牌し、誰も鳴いていない純粋な１巡目に立直をかけると成立する２翻役*\\A一発とは、立直をかけてから次の自模までの１巡の間で誰も鳴いていない状態でロンまたはツモをして上がると成立する１*翻*\\A役海底撈月とは、山の一番最後の牌をツモって上がることで成立する１*翻*役\\A裏ドラとは、その局で立直をしてアガった場合のみ、裏ドラを確認する権利を得る\\A和了確率最大化とは、計算ボタンが押されると現在の手牌を考慮して計算結果表に結果を表示する\\A記録開始/記録終了ボタン:リアルタイムシミュレーションから牌譜モードに切り替えられたときに配布を記録できるようにするためのボタン\\A巡目±ボタン:牌譜モード時に巡目を増やしたり減らしたりすることのできるボタン\\Aリアルタイムシミュレーション/牌譜モード切替ボタン:リアルタイムシミュレーションか牌譜モードにするか切り替えることのできるボタン" 
      },
      camera: { title: 'カメラ説明', content: "（ここにカメラの説明が入ります）" }, 
      reference: { title: '参考URL', content: <ReferenceLinks onShowRules={() => setView('mahjongRules')} />, backView: 'menu' },
      mahjongRules: { title: '麻雀の基本ルール', content: <MahjongRulesPage />, backView: 'reference' },
    };

    const currentPage = pageMap[view];
    const handleBack = () => setView(currentPage.backView || 'menu');
    
    let displayContent = currentPage.content;
    if (typeof currentPage.content === 'string') {
      const lines = currentPage.content.split('\\A');
      displayContent = lines.map((line, index) => (
        <p key={index} style={{ margin: '0 0 8px 0', padding: 0, fontSize: '22px' }}>
          {line}
        </p>
      ));
    } else {
      // 文字列でない場合（例: JSXコンポーネントやnull）はそのまま使用
      displayContent = currentPage.content;
    }

    return (
      <HelpContentPage title={currentPage.title} onBack={(handleBack)}>
        {displayContent}
      </HelpContentPage>
    );
  };

  return (
    // このonClick={onClose}が枠外クリックで閉じる機能を担当しています
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}></div>
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={{ ...styles.modalContent, width: modalWidth, transition: 'width 0.3s ease' }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalHeaderTitle}>ヘルプ</h3>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </div>
        <div style={styles.modalBody}>{renderContent()}</div>
      </div>
    </div>
    </div>
  );
};

export default HelpModal;
