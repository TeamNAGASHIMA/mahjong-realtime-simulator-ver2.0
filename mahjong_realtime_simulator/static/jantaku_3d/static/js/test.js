import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

const width = 960;
const height = 540;

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#myCanvas"),
    antialias: true,
});
renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
camera.position.set(0, 100, 200);
camera.lookAt(0, 0, 0);

const light = new THREE.DirectionalLight(0xffffff, 1.2);
light.position.set(1, 1, 1);
scene.add(light);

// サイコロの面を描画（1の目は赤、それ以外は黒）
function createDiceFaceTexture(pips) {
    const size = 256;
    const radius = 20;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    const isRed = (pips === 1);
    ctx.fillStyle = isRed ? "#ff0000" : "#000000";

    const dot = (x, y) => {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    };

    const positions = {
        1: [[0.5, 0.5]],
        2: [[0.25, 0.25], [0.75, 0.75]],
        3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
        4: [[0.25, 0.25], [0.25, 0.75], [0.75, 0.25], [0.75, 0.75]],
        5: [[0.25, 0.25], [0.25, 0.75], [0.5, 0.5], [0.75, 0.25], [0.75, 0.75]],
        6: [[0.25, 0.25], [0.25, 0.5], [0.25, 0.75], [0.75, 0.25], [0.75, 0.5], [0.75, 0.75]],
    };

    positions[pips].forEach(([x, y]) => {
        dot(x * size, y * size);
    });

    return new THREE.CanvasTexture(canvas);
}

// 各面に 1～6 のテクスチャを割り当てる（麻雀サイコロの面配置に合わせる）
const materials = [
    new THREE.MeshBasicMaterial({ map: createDiceFaceTexture(1) }), // +X
    new THREE.MeshBasicMaterial({ map: createDiceFaceTexture(6) }), // -X
    new THREE.MeshBasicMaterial({ map: createDiceFaceTexture(3) }), // +Y
    new THREE.MeshBasicMaterial({ map: createDiceFaceTexture(4) }), // -Y
    new THREE.MeshBasicMaterial({ map: createDiceFaceTexture(5) }), // +Z
    new THREE.MeshBasicMaterial({ map: createDiceFaceTexture(2) }), // -Z
];

// 角丸の立方体（RoundedBox）を作成
const geometry = new RoundedBoxGeometry(20, 20, 20, 4, 2); // 角半径2でなめらかに
const dice = new THREE.Mesh(geometry, materials);
scene.add(dice);

// アニメーション
function tick() {
    requestAnimationFrame(tick);
    dice.rotation.x += 0.01;
    dice.rotation.y += 0.01;
    renderer.render(scene, camera);
}
tick();
