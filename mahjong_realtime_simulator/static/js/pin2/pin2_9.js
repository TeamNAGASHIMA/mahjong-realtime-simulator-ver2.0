import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// 側面（左右）
function createHalfYellowTextureX(isLeft) {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    if (isLeft) {
        ctx.fillStyle = "#E39C40";
        ctx.fillRect(0, 0, size / 2, size);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(size / 2, 0, size / 2, size);
    } else {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size / 2, size);
        ctx.fillStyle = "#E39C40";
        ctx.fillRect(size / 2, 0, size / 2, size);
    }

    return new THREE.CanvasTexture(canvas);
}

// 上下
function createHalfYellowTextureY(isTop) {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    if (isTop) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size / 2);
        ctx.fillStyle = "#E39C40";
        ctx.fillRect(0, size / 2, size, size / 2);
    } else {
        ctx.fillStyle = "#E39C40";
        ctx.fillRect(0, 0, size, size / 2);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, size / 2, size, size / 2);
    }

    return new THREE.CanvasTexture(canvas);
}

// 背面
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

// 🔽 これが呼び出し関数になる
export function createJi1Mesh() {
    const geometry = new RoundedBoxGeometry(24, 32, 16, 2, 3);

    const textureLoader = new THREE.TextureLoader();
    const frontTexture = textureLoader.load("/static/img/pin9.png");

    const materials = [
        new THREE.MeshStandardMaterial({ map: createHalfYellowTextureX(false) }),
        new THREE.MeshStandardMaterial({ map: createHalfYellowTextureX(true) }),
        new THREE.MeshStandardMaterial({ map: createHalfYellowTextureY(false) }),
        new THREE.MeshStandardMaterial({ map: createHalfYellowTextureY(true) }),
        new THREE.MeshBasicMaterial({ map: frontTexture }),
        new THREE.MeshStandardMaterial({ map: createSolidYellowTexture() }),
    ];

    const mesh = new THREE.Mesh(geometry, materials);
    return mesh;
}
