// カメラプレビューのカメラ画面のエレメントを取得。実際は二つ取得させる。
const video = document.getElementById('video');

// 計算ボタンのエレメントを取得。
const calcButton = document.getElementById('calc');

// カメラプレビューの手牌カメラから映る1フレームの画像の挿入用のcanvasタグのエレメントを取得
const hand_tiles_img = document.getElementById("hand_tiles");
const hand_tiles_canvas = document.getElementById("hand_tiles_canvas");
// カメラプレビューの盤面カメラから映る1フレームの画像の挿入用のcanvasタグのエレメントを取得
const board_tiles_img = document.getElementById("board_tiles");
const board_tiles_canvas = document.getElementById("board_tiles_canvas");

// バックエンドから受け取るレスポンスを挿入するタグのエレメントを取得。本番で言う計算結果表に該当する
const result = document.getElementById("result");

// 送信するリストデータ（テストデータ）
let syanten_Type = 1 // 「一般手：1」、「七対手：2」、「国士無双手：4」
let flag = 0 // 「向聴落とし考慮：1」、「手変わり考慮：2」、「ダブル立直考慮：4」、「一発考慮：8」、「海底撈月考慮：16」、「裏ドラ考慮：32」、「和了確率を最大化：64」

// テストデータ
let fixes_pai_info = {
    "version": "0.9.0",
    "zikaze": 27,
    "bakaze": 27,
    "turn": 3,
    "syanten_type": syanten_Type,
    "dora_indicators": [27],
    "flag": flag,
    "hand_tiles": [1, 1, 1, 4, 5, 6, 11, 12, 20, 20, 23, 23, 24, 30],
    "melded_blocks": [],
    //"melded_blocks": [
    //    { "type": 1, "tiles": [1, 1, 1], "discarded_tile": 1, "from": 0 },
    //    { "type": 2, "tiles": [4, 5, 6], "discarded_tile": 4, "from": 0 }
    //],

    //countsは空にする
    "counts": []
}

// 捨て牌すべての情報を格納する
let fixes_river_tiles = [1,2,3,4,4,5,10]

// const fixes_board_info = {
//     "fixes_pai_info": fixes_pai_info, // 自プレイヤーの手牌、鳴き牌と巡目数、ドラ牌、向聴タイプ、考慮項目の内容を保持する
//     "fixes_river_tiles": fixes_river_tiles // すべての鳴き牌を区別することなく格納する
// }
const fixes_board_info = {}

// カメラを起動
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        openFinder(stream);
    })
    .catch(err => {
        console.error("カメラ起動エラー:", err);
    });

function openFinder(stream) {
    //videoタグにカメラが見ている画像を表示
    video.srcObject = stream;
    video.onloadedmetadata = (e) => {
        video.play();
    };
}

// PromiseでBlobを取得（nullでも受け取る）
function getBlobFromCanvas(canvas, mime = 'image/jpeg') {
    return new Promise(resolve => {
        if (canvas) {
            canvas.toBlob(blob => resolve(blob), mime);
        } else {
            resolve(null);
        }
    });
}

calcButton.addEventListener('click', async () => {
    // バックエンドへfetch通信を行う際、送信するデータすべてをFormData形式でまとめるための変数の定義
    // バックエンドへの送信時は、必ずformData変数に格納してbodyに入れる
    const formData = new FormData();

    // 手牌画像の取得
    const hand_tiles_context = hand_tiles_canvas.getContext('2d');
    hand_tiles_context.drawImage(hand_tiles_img, 0, 0, hand_tiles_canvas.width, hand_tiles_canvas.height);

    // 盤面画像の取得
    const board_tiles_context = board_tiles_canvas.getContext('2d');
    board_tiles_context.drawImage(board_tiles_img, 0, 0, board_tiles_canvas.width, board_tiles_canvas.height);

    const [hand_tiles_blob, board_tiles_blob] = await Promise.all([
        getBlobFromCanvas(hand_tiles_canvas),
        getBlobFromCanvas(board_tiles_canvas)
    ]);

    // 手牌画像をFormDataに追加
    formData.append('hand_tiles_image', hand_tiles_blob, "hand_tiles_image.jpg");

    // 盤面画像をFormDataに追加
    if (board_tiles_blob) {
        formData.append("board_tiles_image", board_tiles_blob, "board_tiles_image.jpg");
    }

    formData.append('fixes_board_info', JSON.stringify(fixes_board_info));
    formData.append('syanten_Type', JSON.stringify(syanten_Type));
    formData.append('flag', JSON.stringify(flag));

    fetch('/app/main/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: formData
    })
    .then(async (res) => {
        // JSON本体を取り出す
        const data = await res.json();
        console.log('message: ', data.message);   // ← Djangoからのメッセージ
        console.log('status:', res.status); // ← HTTPステータスコード
        if (res.status == 200) {
            // ここにバックエンドから受け取った計算結果をUIに反映させる処理を記述する
            result.textContent = JSON.stringify(data.result_calc)
        }else{
            alert("Could not calculate")
        }
    })
    .catch(err => {
        alert('Sending failed. ' + err)
        console.log("message: Sending failed.")
    });
});

// 'X-CSRFToken': getCookie('csrftoken')のトークン作成関数。いじらなくていい。丸コピOK。
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}