import * as THREE from "three";
import { CHUNK_SIZE, CHUNK_GRID_SIZE } from "./constants";

const interfaceColors = {
    dullAmber: "rgba(186, 150, 0, 0.9)",
    brightAmber: "rgba(247, 158, 0, 0.9)",
    darkRed: "rgba(158, 32, 0, 0.9)",
    interfaceGreen: "rgba(164, 252, 174, 0.9)",
    interfaceWhite: "rgba(240, 255, 220, 0.9)",
}

/**
 * Rotate a vector by a quaternion
 * @param {THREE.Vector3} v 
 * @param {THREE.Quaternion} q 
 * @returns {THREE.Vector3}
 */
function rotateVectorByQuaternion(v, q) {
    const u = new THREE.Vector3(q.x, q.y, q.z);
    const s = q.w;
    const u_v = u.clone().dot(v);
    const u_u = u.clone().dot(u);
    const uxv = u.clone().cross(v);

    const a = u.clone().multiplyScalar(2 * u_v);
    const b = v.clone().multiplyScalar(s * s - u_u);
    const c = uxv.clone().multiplyScalar(2 * s);

    return a.add(b).add(c);
}


function actualThrust(thrust, altitude) {
    let maxThrust = 1;
    if (altitude > 500) {
        maxThrust = Math.max(0, 1 - ((altitude - 500) / 200));
    }
    return Math.min(maxThrust, thrust);
}

function worldToChunk(worldX, worldZ) {
    return {
        chunkX: Math.floor(worldX / (CHUNK_SIZE * CHUNK_GRID_SIZE) + 0.5),
        chunkZ: Math.floor(worldZ / (CHUNK_SIZE * CHUNK_GRID_SIZE) + 0.5),
    };
}

export { rotateVectorByQuaternion, interfaceColors, actualThrust, worldToChunk };