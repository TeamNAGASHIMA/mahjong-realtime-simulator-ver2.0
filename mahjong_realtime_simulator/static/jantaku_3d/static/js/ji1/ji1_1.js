
import { RoundedBoxGeometry } from "https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/geometries/RoundedBoxGeometry.js";

// THREE は引数で受け取る形に変更する
export function createJi1Mesh(THREE) {
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

    const textureLoader = new THREE.TextureLoader();
    const frontTexture = textureLoader.load("./img/ji1.png");

    const geometry = new RoundedBoxGeometry(24, 32, 16, 2, 3);

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
