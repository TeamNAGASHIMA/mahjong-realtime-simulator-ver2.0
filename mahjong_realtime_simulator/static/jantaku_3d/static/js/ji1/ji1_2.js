import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// サイズ
const width = 960;
const height = 540;

// レンダラー
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#myCanvas"),
    antialias: true,
});
renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio);

// シーンとカメラ
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
camera.position.set(500, 300, 600);
camera.lookAt(0, 0, 0);

// ライト
const light = new THREE.DirectionalLight(0xffffff, 1.5);
light.position.set(1, 1, 1);
scene.add(light);

// 側面（左右）: 半分黄色テクスチャ (X軸方向)
function createHalfYellowTextureX(isLeft) {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    if (isLeft) {
        ctx.fillStyle = "#E39C40"; // 左半分黄色
        ctx.fillRect(0, 0, size / 2, size);
        ctx.fillStyle = "#ffffff"; // 右半分白
        ctx.fillRect(size / 2, 0, size / 2, size);
    } else {
        ctx.fillStyle = "#ffffff"; // 左半分白
        ctx.fillRect(0, 0, size / 2, size);
        ctx.fillStyle = "#E39C40"; // 右半分黄色
        ctx.fillRect(size / 2, 0, size / 2, size);
    }

    return new THREE.CanvasTexture(canvas);
}

// 上下（Y軸方向）: 半分黄色テクスチャ
function createHalfYellowTextureY(isTop) {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    if (isTop) {
        ctx.fillStyle = "#ffffff"; // 上半分白
        ctx.fillRect(0, 0, size, size / 2);
        ctx.fillStyle = "#E39C40"; // 下半分黄色
        ctx.fillRect(0, size / 2, size, size / 2);
    } else {
        ctx.fillStyle = "#E39C40"; // 上半分黄色
        ctx.fillRect(0, 0, size, size / 2);
        ctx.fillStyle = "#ffffff"; // 下半分白
        ctx.fillRect(0, size / 2, size, size / 2);
    }

    return new THREE.CanvasTexture(canvas);
}

// 背面（-Z）: 単色黄色のテクスチャ
function createSolidYellowTexture() {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#E39C40";
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
}

// 角丸ボックスジオメトリ
const geometry = new RoundedBoxGeometry(24, 32, 16, 2, 3);

// テクスチャローダーで画像を読み込み（前面）
const textureLoader = new THREE.TextureLoader();
const frontTexture = textureLoader.load("/static/img/ji2.png");

// 各面のマテリアル
const materials = [
    new THREE.MeshStandardMaterial({ map: createHalfYellowTextureX(false) }), // +X（右）
    new THREE.MeshStandardMaterial({ map: createHalfYellowTextureX(true) }),  // -X（左）
    new THREE.MeshStandardMaterial({ map: createHalfYellowTextureY(false) }), // +Y（上）
    new THREE.MeshStandardMaterial({ map: createHalfYellowTextureY(true) }),  // -Y（下）
    new THREE.MeshBasicMaterial({ map: frontTexture }),                       // +Z（前）
    new THREE.MeshStandardMaterial({ map: createSolidYellowTexture() }),      // -Z（背面）
];

// メッシュ作成
const tile = new THREE.Mesh(geometry, materials);
scene.add(tile);

// アニメーション
function tick() {
    requestAnimationFrame(tick);
    tile.rotation.y += 0.005;
    tile.rotation.x += 0.003;
    renderer.render(scene, camera);
}
tick();
