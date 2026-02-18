import * as THREE from "three";

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

export { rotateVectorByQuaternion };