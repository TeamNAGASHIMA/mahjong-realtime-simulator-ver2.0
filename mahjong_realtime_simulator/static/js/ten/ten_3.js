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
const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
camera.position.set(200, 150, 300);
camera.lookAt(0, 0, 0);

const light = new THREE.DirectionalLight(0xffffff, 1.2);
light.position.set(1, 1, 1);
scene.add(light);

// テクスチャ画像をロード
const textureLoader = new THREE.TextureLoader();
const frontTexture = textureLoader.load('/static/img/ten3.png'); // ten2.pngのパスを指定

const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });

// 6面マテリアル（前面だけ画像、他は白）
const materials = [
  whiteMat,                            // +X
  whiteMat,                            // -X
  whiteMat,                            // +Y
  whiteMat,                            // -Y
  new THREE.MeshStandardMaterial({ map: frontTexture }), // +Z（前面）
  whiteMat                             // -Z
];

// 角柱のサイズ（縦長、薄く）
const widthBox = 5;
const heightBox = 80;
const depthBox = 2;

const geometry = new RoundedBoxGeometry(widthBox, heightBox, depthBox, 4, 0.8);
const tenbou = new THREE.Mesh(geometry, materials);
scene.add(tenbou);

// アニメーション
function tick() {
  requestAnimationFrame(tick);
  tenbou.rotation.y += 0.01;
  renderer.render(scene, camera);
}
tick();
