import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { createJi3_1Mesh } from "./ji3/ji3_1.js";
import { createJi3_2Mesh } from "./ji3/ji3_2.js";
import { createJi3_3Mesh } from "./ji3/ji3_3.js";
import { createJi3_4Mesh } from "./ji3/ji3_4.js";
import { createJi3_5Mesh } from "./ji3/ji3_5.js";
import { createJi3_6Mesh } from "./ji3/ji3_6.js";
import { createJi3_7Mesh } from "./ji3/ji3_7.js";
import { createman3_1Mesh } from "./man3/man3_1.js";
import { createman3_2Mesh } from "./man3/man3_2.js";
import { createman3_3Mesh } from "./man3/man3_3.js";
import { createman3_4Mesh } from "./man3/man3_4.js";
import { createman3_5Mesh } from "./man3/man3_5.js";
import { createman3_6Mesh } from "./man3/man3_6.js";
import { createman3_7Mesh } from "./man3/man3_7.js";
import { createman3_8Mesh } from "./man3/man3_8.js";
import { createman3_9Mesh } from "./man3/man3_9.js";
import { createaka3_1Mesh } from "./aka3/aka3_1.js";
import { createaka3_2Mesh } from "./aka3/aka3_2.js";
import { createaka3_3Mesh } from "./aka3/aka3_3.js";
import { createpin3_1Mesh } from "./pin3/pin3_1.js";
import { createpin3_2Mesh } from "./pin3/pin3_2.js";
import { createpin3_3Mesh } from "./pin3/pin3_3.js";
import { createpin3_4Mesh } from "./pin3/pin3_4.js";
import { createpin3_5Mesh } from "./pin3/pin3_5.js";
import { createpin3_6Mesh } from "./pin3/pin3_6.js";
import { createpin3_7Mesh } from "./pin3/pin3_7.js";
import { createpin3_8Mesh } from "./pin3/pin3_8.js";
import { createpin3_9Mesh } from "./pin3/pin3_9.js";
import { createsou3_1Mesh } from "./sou3/sou3_1.js";
import { createsou3_2Mesh } from "./sou3/sou3_2.js";
import { createsou3_3Mesh } from "./sou3/sou3_3.js";
import { createsou3_4Mesh } from "./sou3/sou3_4.js";
import { createsou3_5Mesh } from "./sou3/sou3_5.js";
import { createsou3_6Mesh } from "./sou3/sou3_6.js";
import { createsou3_7Mesh } from "./sou3/sou3_7.js";
import { createsou3_8Mesh } from "./sou3/sou3_8.js";
import { createsou3_9Mesh } from "./sou3/sou3_9.js";

import { createblindMesh } from "./ten/blind.js";

// レンダラー設定
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#myCanvas"),
    antialias: true,
});
const width = 960;
const height = 540;
renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio);

// 影を有効化
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// シーンとカメラ
const scene = new THREE.Scene();
const loader = new THREE.TextureLoader();
loader.load('/static/img/back_2.jpg', function (texture) {
    scene.background = texture;
});

const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
camera.position.set(0, 400, 1500);

// ライト
const light = new THREE.DirectionalLight(0xffffff, 1.5);
light.position.set(200, 500, 300);
light.castShadow = true;  // 影を落とすライトに設定

// 影の範囲・解像度設定（必要に応じて調整）
light.shadow.camera.near = 1;
light.shadow.camera.far = 3000;
light.shadow.camera.left = -1000;
light.shadow.camera.right = 1000;
light.shadow.camera.top = 1000;
light.shadow.camera.bottom = -1000;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;

scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

// 卓面（影を受ける）
const table = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000),
    new THREE.MeshStandardMaterial({ color: 0x228B22 })
);
table.rotation.x = -Math.PI / 2;
table.receiveShadow = true;  // 影を受ける設定
scene.add(table);

// 裏面（黒）
const back = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000),
    new THREE.MeshStandardMaterial({ color: 0x111111 })
);
back.rotation.x = Math.PI / 2;
back.position.y = -0.2;
back.receiveShadow = true;  // 影を受ける設定
scene.add(back);

// 牌作成関数群をオブジェクトで管理
const tileMakers = {
    createJi3_1Mesh,
    createJi3_2Mesh,
    createJi3_3Mesh,
    createJi3_4Mesh,
    createJi3_5Mesh,
    createJi3_6Mesh,
    createJi3_7Mesh,
    createman3_1Mesh,
    createman3_2Mesh,
    createman3_3Mesh,
    createman3_4Mesh,
    createman3_5Mesh,
    createman3_6Mesh,
    createman3_7Mesh,
    createman3_8Mesh,
    createman3_9Mesh,
    createaka3_1Mesh,
    createaka3_2Mesh,
    createaka3_3Mesh,
    createpin3_1Mesh,
    createpin3_2Mesh,
    createpin3_3Mesh,
    createpin3_4Mesh,
    createpin3_5Mesh,
    createpin3_6Mesh,
    createpin3_7Mesh,
    createpin3_8Mesh,
    createpin3_9Mesh,
    createsou3_1Mesh,
    createsou3_2Mesh,
    createsou3_3Mesh,
    createsou3_4Mesh,
    createsou3_5Mesh,
    createsou3_6Mesh,
    createsou3_7Mesh,
    createsou3_8Mesh,
    createsou3_9Mesh,
};

// 牌の最大枚数（ルール）  
const maxTileCounts = {
    createJi3_1Mesh: 4,
    createJi3_2Mesh: 4,
    createJi3_3Mesh: 4,
    createJi3_4Mesh: 4,
    createJi3_5Mesh: 4,
    createJi3_6Mesh: 4,
    createJi3_7Mesh: 4,
    createman3_1Mesh: 4,
    createman3_2Mesh: 4,
    createman3_3Mesh: 4,
    createman3_4Mesh: 4,
    createman3_5Mesh: 3,
    createman3_6Mesh: 4,
    createman3_7Mesh: 4,
    createman3_8Mesh: 4,
    createman3_9Mesh: 4,
    createaka3_1Mesh: 1,
    createaka3_2Mesh: 1,
    createaka3_3Mesh: 1,
    createpin3_1Mesh: 4,
    createpin3_2Mesh: 4,
    createpin3_3Mesh: 4,
    createpin3_4Mesh: 4,
    createpin3_5Mesh: 3,
    createpin3_6Mesh: 4,
    createpin3_7Mesh: 4,
    createpin3_8Mesh: 4,
    createpin3_9Mesh: 4,
    createsou3_1Mesh: 4,
    createsou3_2Mesh: 4,
    createsou3_3Mesh: 4,
    createsou3_4Mesh: 4,
    createsou3_5Mesh: 3,
    createsou3_6Mesh: 4,
    createsou3_7Mesh: 4,
    createsou3_8Mesh: 4,
    createsou3_9Mesh: 4,
};

// 現在場にある牌の枚数を管理
const currentTileCounts = {};
for (const key in maxTileCounts) {
    currentTileCounts[key] = 0;
}

// ランダムに牌を取得（枚数制限を考慮）
function getRandomTiles(count = 13) {
    const tiles = [];
    const keys = Object.keys(tileMakers);
    let tries = 0;

    while (tiles.length < count && tries < 1000) {
        tries++;
        const key = keys[Math.floor(Math.random() * keys.length)];

        if (currentTileCounts[key] < maxTileCounts[key]) {
            const mesh = tileMakers[key]();
            mesh.geometry.computeBoundingBox();
            mesh.userData.tileKey = key; // 種類キーを保持

            tiles.push(mesh);
            currentTileCounts[key]++;
        }
    }

    return tiles;
}


// --------------------
// DOM: オーバーレイ作成
// --------------------
const overlay = document.createElement("div");
overlay.id = "tileOverlay";
Object.assign(overlay.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)", // 中央配置
    width: "500px",   // 横幅
    height: "400px",  // 高さ
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "10px",
    boxShadow: "0 0 20px rgba(0,0,0,0.3)",
    display: "none",
    zIndex: "1000",
    padding: "20px",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
});

const closeBtn = document.createElement("button");
closeBtn.textContent = "×";
Object.assign(closeBtn.style, {
    position: "absolute",
    top: "0px",
    right: "5px",
    background: "transparent",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#333",
});
closeBtn.onmouseenter = () => (closeBtn.style.color = "#ff3333");
closeBtn.onmouseleave = () => (closeBtn.style.color = "#333");
closeBtn.onclick = (event) => {
    event.stopPropagation(); // 下層クリック防止
    overlay.style.display = "none"; // 閉じる
};
overlay.appendChild(closeBtn);

// ======== グリッド設定 ========
const tileGrid = document.createElement("div");
Object.assign(tileGrid.style, {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", // 各ボタンを自動調整
    gap: "15px",             // ボタン間の余白
    width: "100%",           // 横幅いっぱいに広げる
    height: "100%",          // オーバーレイ内にフィット
    justifyItems: "center",  // 各ボタンを中央揃え
    alignContent: "start",   // 上から詰める
    overflowY: "auto",
});
overlay.appendChild(tileGrid);
document.body.appendChild(overlay);

// ======== ボタン生成 ========
function showTileOverlay(onSelect) {
    tileGrid.innerHTML = ""; // 前回の内容をクリア

    // ======== グリッド設定 ========
    Object.assign(tileGrid.style, {
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)", // 横5列
        gap: "8px",              // 少し詰める
        width: "85%",            // 画面幅に収まるように調整 ✅
        height: "100%",
        justifyItems: "center",
        alignContent: "start",
        overflowY: "auto",       // 縦スクロールはOK
        margin: "0 auto",
    });

    // ======== 各牌ボタン生成 ========
    for (const key in tileMakers) {
        const thumbBtn = document.createElement("button");

        // ✅ ボタン共通スタイル（さらに小型化）
        Object.assign(thumbBtn.style, {
            width: "70px",           // ← さらに少し小さめ ✅
            height: "95px",          // ← 高さも比例して調整 ✅
            border: "none",
            outline: "none",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "0",
            margin: "2px",           // 余白を最小化 ✅
            transition: "transform 0.15s ease",
        });

        // ✅ 画像設定
        const img = document.createElement("img");
        img.src = `/static/js/img/${key}.png`;
        Object.assign(img.style, {
            width: "100%",
            height: "100%",
            objectFit: "contain",
            background: "transparent",
            border: "none",
            pointerEvents: "none",
        });

        thumbBtn.appendChild(img);

        // ✅ ホバー効果（拡大アニメ）
        thumbBtn.onmouseenter = () => thumbBtn.style.transform = "scale(1.05)";
        thumbBtn.onmouseleave = () => thumbBtn.style.transform = "scale(1.0)";

        // ✅ クリック時
        thumbBtn.onclick = (event) => {
            event.stopPropagation();
            overlay.style.display = "none";
            onSelect(key);
        };

        tileGrid.appendChild(thumbBtn);
    }

    overlay.style.display = "flex";
}

// ======== オーバーレイクリック時の下層クリック防止 ========
overlay.addEventListener("click", (event) => {
    event.stopPropagation();
});



// --------------------
// 手牌クリック処理を変更
// --------------------
function onHandTileClick(index) {
    const oldTile = playerHand[index];
    showTileOverlay((tileKey) => {
        // 新しい牌作成
        const newTile = tileMakers[tileKey]();
        newTile.geometry.computeBoundingBox();

        // 影を復活させる設定を追加
        newTile.castShadow = true;
        newTile.receiveShadow = true;

        // 古い牌の位置・回転をコピー
        newTile.position.copy(oldTile.position);
        newTile.rotation.copy(oldTile.rotation);

        // コールバック設定
        newTile.userData.index = index;
        newTile.callback = () => onHandTileClick(index);

        // Scene と配列を更新
        scene.remove(oldTile);
        playerHand[index] = newTile;
        scene.add(newTile);
    });
}

// --------------------
// placePlayerHand 修正
// --------------------
let playerHand = [];

function placePlayerHand(tiles, direction = "south") {
    // 古い牌を削除
    playerHand.forEach(tile => scene.remove(tile));
    playerHand = tiles; // 新しい配列で置き換え

    const spacing = 4;
    const widths = tiles.map(tile => tile.geometry.boundingBox.max.x - tile.geometry.boundingBox.min.x);
    const totalWidth = widths.reduce((sum, w) => sum + w, 0) + spacing * (tiles.length - 1);
    let start = -totalWidth / 2;

    for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
        const width = widths[i];
        const height = tile.geometry.boundingBox.max.y - tile.geometry.boundingBox.min.y;

        const x = start + width / 2;
        const z = 800;
        tile.position.set(x, height / 2, z);

        tile.castShadow = true;

        // クリック可能にする
        tile.userData.index = i;
        tile.callback = () => onHandTileClick(i);

        scene.add(tile);
        start += width + spacing;
    }
}

// --------------------
// Raycasterクリック処理
// --------------------

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("click", (event) => {
    // オーバレイが表示されている場合は処理を中断
    if (overlay.style.display === "flex") return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(playerHand);

    if (intersects.length > 0) {
        const clickedTile = intersects[0].object;
        const handIndex = playerHand.indexOf(clickedTile);

        if (handIndex !== -1) {
            onHandTileClick(handIndex); // ✅ オーバレイも表示される
        }
    }
});


// --------------------
// 捨て牌クリック処理
// --------------------
function onDiscardTileClick(index) {
    const oldTile = discardTiles[index];
    showTileOverlay((tileKey) => {
        // 新しい牌を作成
        const newTile = tileMakers[tileKey]();
        newTile.geometry.computeBoundingBox();

        // 影設定
        newTile.castShadow = true;
        newTile.receiveShadow = true;

        // 位置と回転を維持
        newTile.position.copy(oldTile.position);
        newTile.rotation.copy(oldTile.rotation);

        // シーンと配列を更新
        scene.remove(oldTile);
        discardTiles[index] = newTile;
        scene.add(newTile);
    });
}

// 捨て牌を並べる関数
let discardTiles = [];
function placeDiscardTiles(tiles, direction = "south") {
    const spacing = 4;
    const rowSpacing = 10;
    const maxPerRow = 6;
    const box = tiles[0].geometry.boundingBox;
    const tileWidth = box.max.x - box.min.x;
    const tileHeight = box.max.y - box.min.y;

    const startX = -(tileWidth + spacing) * (maxPerRow - 1) / 2;

    // 再配置時の重複防止
    // ※ 方向ごとに置く場合、呼び出し前に必要に応じてクリアするか、ここでクリアして全方向まとめて呼ぶ
    // 今回は呼び出しごとに追加する仕様ならこの行は不要だが、安全のため一度空にする場合は uncomment
    // discardTiles.length = 0;

    for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
        const row = Math.floor(i / maxPerRow);
        const col = i % maxPerRow;

        const isReverseCol = (direction === "north" || direction === "east");
        const displayCol = isReverseCol ? (maxPerRow - 1 - col) : col;

        let x = 0, z = 0;

        if (direction === "south") {
            x = startX + displayCol * (tileWidth + spacing);
            z = 300 + row * (tileWidth + spacing + rowSpacing);
        } else if (direction === "north") {
            x = startX + displayCol * (tileWidth + spacing);
            z = -300 - row * (tileWidth + spacing + rowSpacing);
        } else if (direction === "east") {
            x = 300 + row * (tileWidth + spacing + rowSpacing);
            z = startX + displayCol * (tileWidth + spacing);
        } else if (direction === "west") {
            x = -300 - row * (tileWidth + spacing + rowSpacing);
            z = startX + displayCol * (tileWidth + spacing);
        }

        tile.position.set(x, tileHeight / 4, z);

        if (direction === "south") {
            tile.rotation.x = -Math.PI / 2;
        } else if (direction === "north") {
            tile.rotation.x = -Math.PI / 2;
            tile.rotation.z = Math.PI;
        } else if (direction === "east") {
            tile.rotation.x = -Math.PI / 2;
            tile.rotation.z = Math.PI / 2;
        } else if (direction === "west") {
            tile.rotation.x = -Math.PI / 2;
            tile.rotation.z = -Math.PI / 2;
        }

        // 影を落とす設定
        tile.castShadow = true;
        tile.receiveShadow = false;

        scene.add(tile);

        // ---------- ここが重要 ----------
        // 捨て牌配列に登録（クリック検出用）
        discardTiles.push(tile);
    }
}

// --------------------
// 捨て牌クリック検出用 Raycaster
// --------------------
(function setupDiscardTileClickListener() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // renderer.domElement に対してリスナを付ける（キャンバス内クリックのみ）
    renderer.domElement.addEventListener("click", (event) => {
        // オーバーレイが表示されている場合は無視
        if (overlay && overlay.style.display === "flex") return;

        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        // 子を含めて当たり判定
        const intersects = raycaster.intersectObjects(discardTiles, true);

        if (intersects.length === 0) return;

        // 最初のヒットを処理
        const hit = intersects[0].object;

        // 直接見つかるか試す
        let index = discardTiles.indexOf(hit);

        // 見つからない場合は親方向に辿って探す（子メッシュの場合のフォールバック）
        if (index === -1) {
            let obj = hit;
            while (obj) {
                index = discardTiles.indexOf(obj);
                if (index !== -1) break;
                obj = obj.parent;
            }
        }

        // さらにフォールバック：ヒットオブジェクトのuuid が一致するかで判定
        if (index === -1) {
            index = discardTiles.findIndex(d => d.uuid === hit.parent?.uuid || d.uuid === hit.uuid);
        }

        if (index !== -1) {
            console.log("捨て牌クリック -> index:", index, "hit:", hit);
            // 下層の手牌クリックに行かないように標準動作止める
            event.stopPropagation();
            event.preventDefault();

            onDiscardTileClick(index);
        }
    }, false);
})();



// 鳴き牌を並べる関数
let meldTiles = []; // ← 鳴き牌を格納（クリック検出用）

function placeMeld(tiles, direction = "south", meldIndex = 0, rotatedIndex = null) {
    const spacing = 10;
    const widths = tiles.map(tile => {
        tile.geometry.computeBoundingBox();
        const box = tile.geometry.boundingBox;
        return box.max.x - box.min.x;
    });

    const tileHeight = tiles[0].geometry.boundingBox.max.y - tiles[0].geometry.boundingBox.min.y;
    const totalWidth = widths.reduce((sum, w) => sum + w, 0) + spacing * (tiles.length - 1);
    let start = -totalWidth / 2;

    for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
        const width = widths[i];

        let x = 0, y = 20, z = 0;
        const offset = 900;
        const sideOffset = 850 - meldIndex * 220;

        let rotX = -Math.PI / 2;
        let rotZ = 0;
        const isRotated = i === rotatedIndex;

        if (direction === "south") {
            x = sideOffset + start + width / 2;
            z = offset;
            rotZ = isRotated ? Math.PI / 2 : 0;
        } else if (direction === "north") {
            x = -sideOffset + start + width / 2;
            z = -offset;
            rotZ = isRotated ? -Math.PI / 2 : Math.PI;
        } else if (direction === "east") {
            x = offset;
            z = -sideOffset + start + width / 2;
            rotZ = isRotated ? Math.PI : Math.PI / 2;
        } else if (direction === "west") {
            x = -offset;
            z = sideOffset + start + width / 2;
            rotZ = isRotated ? 0 : -Math.PI / 2;
        }

        tile.rotation.set(rotX, 0, rotZ);
        tile.position.set(x, y, z);
        tile.castShadow = true;
        scene.add(tile);

        // ✅ 鳴き牌として登録
        meldTiles.push(tile);

        start += width + spacing;
    }
}


// --------------------
// 鳴き牌クリック処理
// --------------------
function onMeldTileClick(index) {
    const oldTile = meldTiles[index];
    showTileOverlay((tileKey) => {
        const newTile = tileMakers[tileKey]();
        newTile.geometry.computeBoundingBox();
        newTile.castShadow = true;
        newTile.receiveShadow = true;

        // 位置・回転を引き継ぐ
        newTile.position.copy(oldTile.position);
        newTile.rotation.copy(oldTile.rotation);

        scene.remove(oldTile);
        meldTiles[index] = newTile;
        scene.add(newTile);
    });
}


// --------------------
// 鳴き牌クリック検出用 Raycaster
// --------------------
(function setupMeldTileClickListener() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    renderer.domElement.addEventListener("pointerdown", (event) => {
        if (overlay && overlay.style.display === "flex") return;

        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(meldTiles, true);

        if (intersects.length === 0) return;

        const hit = intersects[0].object;
        let index = meldTiles.indexOf(hit);

        if (index === -1) {
            let obj = hit;
            while (obj) {
                index = meldTiles.indexOf(obj);
                if (index !== -1) break;
                obj = obj.parent;
            }
        }

        if (index !== -1) {
            console.log("🟢 鳴き牌クリック index:", index);
            event.stopPropagation();
            event.preventDefault();
            onMeldTileClick(index);
        }
    });
})();



// 🔽 追加：非表示牌関連関数
function dealHiddenTiles(count = 13) {
    const keys = Object.keys(tileMakers);
    let tries = 0;
    let dealt = 0;

    while (dealt < count && tries < 1000) {
        tries++;
        const key = keys[Math.floor(Math.random() * keys.length)];
        if (currentTileCounts[key] < maxTileCounts[key]) {
            currentTileCounts[key]++;
            dealt++;
        }
    }
}

function placeHiddenHand(count, direction = "north") {
    const spacing = 4;
    const dummy = createblindMesh();
    dummy.geometry.computeBoundingBox();
    const box = dummy.geometry.boundingBox;
    const tileWidth = box.max.x - box.min.x;
    const tileHeight = box.max.y - box.min.y;
    const totalWidth = count * tileWidth + (count - 1) * spacing;
    let start = -totalWidth / 2;

    for (let i = 0; i < count; i++) {
        const tile = createblindMesh();
        tile.geometry.computeBoundingBox();

        let x = 0, z = 0;
        if (direction === "north") {
            x = start + tileWidth / 2;
            z = -800;
            tile.rotation.y = Math.PI;
        } else if (direction === "east") {
            x = 800;
            z = start + tileWidth / 2;
            tile.rotation.y = Math.PI / 2;
        } else if (direction === "west") {
            x = -800;
            z = start + tileWidth / 2;
            tile.rotation.y = -Math.PI / 2;
        }

        tile.position.set(x, tileHeight / 2, z);
        tile.castShadow = true;
        scene.add(tile);
        start += tileWidth + spacing;
    }
}


// --------------------
// ドラ牌エリアの作成
// --------------------
const doraContainer = document.createElement("div");
doraContainer.id = "doraContainer";
Object.assign(doraContainer.style, {
    position: "fixed",
    top: "10px",
    left: "10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    padding: "6px 8px",
    background: "rgba(255, 255, 255, 0.8)",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    zIndex: "1000",
});

// タイトル
const doraTitle = document.createElement("div");
doraTitle.textContent = "ドラ";
Object.assign(doraTitle.style, {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#c00",
    textAlign: "center",
    marginBottom: "2px",
});
doraContainer.appendChild(doraTitle);

// 牌エリア
const doraTilesContainer = document.createElement("div");
Object.assign(doraTilesContainer.style, {
    display: "flex",
    gap: "6px",
});
doraContainer.appendChild(doraTilesContainer);

document.body.appendChild(doraContainer);

// --------------------
// ドラ牌配列の管理
// --------------------
let doraTiles = [];

// ドラ牌を追加する関数
function addDoraTile(tileKey) {
    doraTiles.push(tileKey);
    updateDoraDisplay();
}

// ドラ表示更新（クリックで変更可能にする）
function updateDoraDisplay() {
    doraTilesContainer.innerHTML = ""; // 一度クリア
    doraTiles.forEach((key, index) => {
        const img = document.createElement("img");
        img.src = `/static/js/img/${key}.png`;
        Object.assign(img.style, {
            width: "50px",
            height: "auto",
            objectFit: "contain",
            borderRadius: "4px",
            //cursor: "pointer",
        });

        // クリックで牌を変更
        img.addEventListener("click", () => {
            showTileOverlay((newKey) => {
                doraTiles[index] = newKey;  // 配列を更新
                updateDoraDisplay();        // 再表示
            });
        });

        doraTilesContainer.appendChild(img);
    });
}


// 初期表示（例）
addDoraTile("createman3_5Mesh");
//addDoraTile("createji3_2Mesh");



//ポンとか
// 南家：2番目の牌を横向きに
placeMeld(
    [createman3_5Mesh(), createman3_5Mesh(), createman3_5Mesh()],
    "south", 0, 1
);
placeMeld(
    [createsou3_5Mesh(), createsou3_5Mesh(), createsou3_5Mesh()],
    "south", 1, 1
);

// 東家：0番目の牌を横向きに
placeMeld(
    [createpin3_2Mesh(), createpin3_2Mesh(), createpin3_2Mesh()],
    "east", 0, 0
);
placeMeld(
    [createsou3_2Mesh(), createsou3_2Mesh(), createsou3_2Mesh()],
    "east", 1, 0
);

// 北家：2番目の牌を横向きに
placeMeld(
    [createsou3_9Mesh(), createsou3_9Mesh(), createsou3_9Mesh()],
    "north", 0, 2
);

// 西家：1番目の牌を横向きに
placeMeld(
    [createJi3_3Mesh(), createJi3_3Mesh(), createJi3_3Mesh()],
    "west", 0, 1
);






// 手牌・捨て牌配置
placePlayerHand(getRandomTiles(13), "south");

dealHiddenTiles(13);
placeHiddenHand(13, "east");

dealHiddenTiles(13);
placeHiddenHand(13, "north");

dealHiddenTiles(13);
placeHiddenHand(13, "west");


placeDiscardTiles(getRandomTiles(8), "south");
placeDiscardTiles(getRandomTiles(7), "east");
placeDiscardTiles(getRandomTiles(18), "north");
placeDiscardTiles(getRandomTiles(22), "west");


// 残り枚数を更新表示
// updateRemainingCountDisplay();

// カメラ操作
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.x += 100;
controls.target.x += 100;
camera.position.y += 80;
controls.target.y += 80;
controls.update();

window.addEventListener("keydown", (event) => {
    const step = 50;

    // カメラの前方向（XZ平面のみ）
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    // カメラの右方向ベクトル
    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3();
    right.crossVectors(forward, up).normalize();

    switch (event.key) {
        case "ArrowUp":
            camera.position.addScaledVector(forward, step);
            controls.target.addScaledVector(forward, step);
            break;
        case "ArrowDown":
            camera.position.addScaledVector(forward, -step);
            controls.target.addScaledVector(forward, -step);
            break;
        case "ArrowLeft":
            camera.position.addScaledVector(right, -step);
            controls.target.addScaledVector(right, -step);
            break;
        case "ArrowRight":
            camera.position.addScaledVector(right, step);
            controls.target.addScaledVector(right, step);
            break;
    }

    controls.update();
});



// アニメーションループ
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();
