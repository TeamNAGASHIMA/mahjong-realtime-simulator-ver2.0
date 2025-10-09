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
    display: "none",
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: "1000",
});
overlay.style.display = "none";

const tileGrid = document.createElement("div");
Object.assign(tileGrid.style, {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, 100px)",
    gap: "10px",
    background: "white",
    padding: "20px",
    maxHeight: "80%",
    overflowY: "auto"
});

overlay.appendChild(tileGrid);
document.body.appendChild(overlay);

// 牌のサムネイル生成関数
function showTileOverlay(onSelect) {
    tileGrid.innerHTML = ""; // 前回の内容をクリア
    for (const key in tileMakers) {
        const thumbBtn = document.createElement("button");
        thumbBtn.textContent = key;
        thumbBtn.style.width = "100px";
        thumbBtn.style.height = "50px";
        thumbBtn.onclick = () => {
            overlay.style.display = "none";
            onSelect(key);
        };
        tileGrid.appendChild(thumbBtn);
    }
    overlay.style.display = "flex";
}

// --------------------
// 手牌クリック処理を変更
// --------------------
function onHandTileClick(index) {
    const oldTile = playerHand[index];
    showTileOverlay((tileKey) => {
        // 新しい牌作成
        const newTile = tileMakers[tileKey]();
        newTile.geometry.computeBoundingBox();

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

// 画面表示用の簡単な div を作成
const coordDisplay = document.createElement("div");
coordDisplay.style.position = "fixed";
coordDisplay.style.top = "10px";
coordDisplay.style.left = "10px";
coordDisplay.style.padding = "100px 150px";  // 少し大きめに
coordDisplay.style.background = "rgba(0,0,0,0.8)";
coordDisplay.style.color = "yellow";        // 目立つ色
coordDisplay.style.fontFamily = "monospace";
coordDisplay.style.fontSize = "18px";      // 文字サイズを大きく
coordDisplay.style.fontWeight = "bold";    // 太字
coordDisplay.style.zIndex = 1000;
document.body.appendChild(coordDisplay);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("click", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(playerHand);

    if (intersects.length > 0) {
        const obj = intersects[0].object;

        // --- ここから座標→インデックス計算 ---
        const spacing = 4;
        const widths = playerHand.map(tile => {
            const box = tile.geometry.boundingBox;
            return box.max.x - box.min.x;
        });
        const totalWidth = widths.reduce((sum, w) => sum + w, 0) + spacing * (widths.length - 1);
        let start = -totalWidth / 2;

        // 左端からの相対座標
        const relX = obj.position.x - start;

        // インデックスを探索
        let index = 0;
        let cursor = 0;
        for (let i = 0; i < widths.length; i++) {
            const w = widths[i];
            if (relX >= cursor && relX < cursor + w + spacing) {
                index = i;
                break;
            }
            cursor += w + spacing;
        }
        // --- 計算完了 ---

        // ハンドリング
        onHandTileClick(index);

        // デバッグ表示
        const pos = obj.position;
        coordDisplay.textContent = `index: ${index}, x: ${pos.x.toFixed(1)}, y: ${pos.y.toFixed(1)}, z: ${pos.z.toFixed(1)}`;
    } else {
        coordDisplay.textContent = "";
    }
});





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


// 捨て牌を並べる関数
function placeDiscardTiles(tiles, direction = "south") {
    const spacing = 4;
    const rowSpacing = 10;
    const maxPerRow = 6;
    const box = tiles[0].geometry.boundingBox;
    const tileWidth = box.max.x - box.min.x;
    const tileHeight = box.max.y - box.min.y;

    const startX = -(tileWidth + spacing) * (maxPerRow - 1) / 2;

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
    }
}


//ポンとか
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

        // 向きの設定
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

        start += width + spacing;
    }
}







// // 右上に残り枚数表示用のDOMを作成（html bodyにあらかじめ<div id="remainingCount"></div>が必要です）
// function updateRemainingCountDisplay() {
//     const container = document.getElementById("remainingCount");
//     container.innerHTML = "<b>残り枚数</b><br>";

//     for (const key in maxTileCounts) {
//         const remain = maxTileCounts[key] - currentTileCounts[key];
//         container.innerHTML += `${key}: ${remain}<br>`;
//     }
// }



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


placeDiscardTiles(getRandomTiles(1), "south");
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

    switch(event.key) {
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
