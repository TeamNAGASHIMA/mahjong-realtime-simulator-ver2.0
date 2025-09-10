import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/controls/OrbitControls.js";
import { createJi1Mesh } from "./js/ji1/ji1_1.js"; // 相対パスは環境に合わせて

// レンダラー設定
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#myCanvas"),
    antialias: true,
});
const width = 960;
const height = 540;
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
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

// 卓面
const table = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000),
    new THREE.MeshStandardMaterial({ color: 0x228B22 })
);
table.rotation.x = -Math.PI / 2;
scene.add(table);

// プレイヤーの手牌を7枚並べる（THREEを渡す）
for (let i = 0; i < 7; i++) {
    const tile = createJi1Mesh(THREE); // ここでTHREEを渡す
    tile.position.set(-80 + i * 28, 16, 200);
    scene.add(tile);
}

// カメラ操作
const controls = new OrbitControls(camera, renderer.domElement);

// アニメーションループ
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();
