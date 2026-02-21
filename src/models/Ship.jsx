import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";
import rcsThrusterVertex from "../shaders/rcsthruster_vertex.glsl";
import rcsThrusterFragment from "../shaders/rcsthruster_fragment.glsl";
import useGame from "../gameState/useGame";
import { useFrame } from "@react-three/fiber";
import { actualThrust } from "../utils";

const rcsYawLeftMaterial = new THREE.ShaderMaterial({
    vertexShader: rcsThrusterVertex,
    fragmentShader: rcsThrusterFragment,
    uniforms: {
        uResolution: { value: new THREE.Vector2(240, 240) },
        uTime: { value: 0 },
        uNoiseTexture: { value: new THREE.TextureLoader().load("./noiseTexture.png") },
        uPower: { value: 0 },
    },
    side: THREE.DoubleSide,
    transparent: true,
});
const rcsYawRightMaterial = new THREE.ShaderMaterial({
    vertexShader: rcsThrusterVertex,
    fragmentShader: rcsThrusterFragment,
    uniforms: {
        uResolution: { value: new THREE.Vector2(240, 240) },
        uTime: { value: 0 },
        uNoiseTexture: { value: new THREE.TextureLoader().load("./noiseTexture.png") },
        uPower: { value: 0 },
    },
    side: THREE.DoubleSide,
    transparent: true,
});
const rcsRollLeftMaterial = new THREE.ShaderMaterial({
    vertexShader: rcsThrusterVertex,
    fragmentShader: rcsThrusterFragment,
    uniforms: {
        uResolution: { value: new THREE.Vector2(240, 240) },
        uTime: { value: 0 },
        uNoiseTexture: { value: new THREE.TextureLoader().load("./noiseTexture.png") },
        uPower: { value: 0 },
    },
    side: THREE.DoubleSide,
    transparent: true,
});

const rcsRollRightMaterial = new THREE.ShaderMaterial({
    vertexShader: rcsThrusterVertex,
    fragmentShader: rcsThrusterFragment,
    uniforms: {
        uResolution: { value: new THREE.Vector2(240, 240) },
        uTime: { value: 0 },
        uNoiseTexture: { value: new THREE.TextureLoader().load("./noiseTexture.png") },
        uPower: { value: 0 },
    },
    side: THREE.DoubleSide,
    transparent: true,
});

const mainThrusterMaterial = new THREE.ShaderMaterial({
    vertexShader: rcsThrusterVertex,
    fragmentShader: rcsThrusterFragment,
    uniforms: {
        uResolution: { value: new THREE.Vector2(240, 240) },
        uTime: { value: 0 },
        uNoiseTexture: { value: new THREE.TextureLoader().load("./noiseTexture.png") },
        uPower: { value: 0 },
    },
    side: THREE.DoubleSide,
    transparent: true,
});

// const mainThrusterMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: false, side: THREE.DoubleSide });
// const rcsThrusterMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: false, side: THREE.DoubleSide });

const mainThrusterGeometry = new THREE.PlaneGeometry(2.0, 9);
const rcsThrusterGeometry = new THREE.PlaneGeometry(1, 3);

export default function Ship({ yawLeftActive, yawRightActive, rollLeftActive, rollRightActive }) {
    const model = useGLTF("./ship.glb");

    useFrame((state, delta) => {
        const { shipMainThrust, playerPosition } = useGame.getState();
        if (!playerPosition) return; 

        const thrust = actualThrust(shipMainThrust, playerPosition.y);
        const time = state.clock.elapsedTime;
        rcsYawLeftMaterial.uniforms.uTime.value = time;
        rcsYawRightMaterial.uniforms.uTime.value = time + 10;
        rcsRollLeftMaterial.uniforms.uTime.value = time + 20;
        rcsRollRightMaterial.uniforms.uTime.value = time + 30;

        mainThrusterMaterial.uniforms.uTime.value = time + 40;
        mainThrusterMaterial.uniforms.uPower.value = thrust * thrust * 100 + 0.01;

        rcsYawLeftMaterial.uniforms.uPower.value = yawLeftActive ? 100 : 0.01;
        rcsYawRightMaterial.uniforms.uPower.value = yawRightActive ? 100 : 0.01;
        rcsRollLeftMaterial.uniforms.uPower.value = rollLeftActive ? 100 : 0.01;
        rcsRollRightMaterial.uniforms.uPower.value = rollRightActive ? 100 : 0.01;
    });

    // Enable castShadow on all meshes in the model ( no need for receiveShadow, nothing else is likely to cast shadows on it)
    useEffect(() => {
        model.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                // child.receiveShadow = true;
            }
        });
    }, [model.scene]);

    return (
        <group>
            <primitive object={model.scene} />
            {/* Forward port thruster */}
            <mesh geometry={mainThrusterGeometry} material={mainThrusterMaterial} position={[4.5, -6, 1.5]} rotation={[Math.PI, Math.PI / 2, 0]} />
            <mesh geometry={mainThrusterGeometry} material={mainThrusterMaterial} position={[4.5, -6, 1.5]} rotation={[Math.PI, 0, 0]} />
            {/* Aft port thruster */}
            <mesh geometry={mainThrusterGeometry} material={mainThrusterMaterial} position={[4.5, -6, -1.5]} rotation={[Math.PI, Math.PI / 2, 0]} />
            <mesh geometry={mainThrusterGeometry} material={mainThrusterMaterial} position={[4.5, -6, -1.5]} rotation={[Math.PI, 0, 0]} />
            {/* Forward starboard thruster */}
            <mesh geometry={mainThrusterGeometry} material={mainThrusterMaterial} position={[-4.5, -6, 1.5]} rotation={[Math.PI, Math.PI / 2, 0]} />
            <mesh geometry={mainThrusterGeometry} material={mainThrusterMaterial} position={[-4.5, -6, 1.5]} rotation={[Math.PI, 0, 0]} />
            {/* Aft starboard thruster */}
            <mesh geometry={mainThrusterGeometry} material={mainThrusterMaterial} position={[-4.5, -6, -1.5]} rotation={[Math.PI, Math.PI / 2, 0]} />
            <mesh geometry={mainThrusterGeometry} material={mainThrusterMaterial} position={[-4.5, -6, -1.5]} rotation={[Math.PI, 0, 0]} />
            {/* Port RCS Yaw Thruster - Forward */}
            <mesh geometry={rcsThrusterGeometry} material={rcsYawLeftMaterial} position={[6.0, 0.0, 1.5]} rotation={[Math.PI / 2, Math.PI / 2, 0]} />
            <mesh geometry={rcsThrusterGeometry} material={rcsYawLeftMaterial} position={[6.0, 0.0, 1.5]} rotation={[Math.PI / 2, Math.PI, 0]} />
            {/* Port RCS Yaw Thruster - Aft */}
            <mesh geometry={rcsThrusterGeometry} material={rcsYawRightMaterial} position={[6.0, 0.0, -1.5]} rotation={[-Math.PI / 2, Math.PI / 2, 0]} />
            <mesh geometry={rcsThrusterGeometry} material={rcsYawRightMaterial} position={[6.0, 0.0, -2.5]} rotation={[-Math.PI / 2, Math.PI, 0]} />
            {/* Port RCS Roll Thruster - Upward */}
            <mesh geometry={rcsThrusterGeometry} material={rcsRollLeftMaterial} position={[6.0, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} />
            <mesh geometry={rcsThrusterGeometry} material={rcsRollLeftMaterial} position={[6.0, 1.5, 0]} rotation={[0, Math.PI, 0]} />
            {/* Port RCS Roll Thruster - Downward */}
            <mesh geometry={rcsThrusterGeometry} material={rcsRollRightMaterial} position={[6.0, -1.5, 0]} rotation={[Math.PI, Math.PI / 2, 0]} />
            <mesh geometry={rcsThrusterGeometry} material={rcsRollRightMaterial} position={[6.0, -1.5, 0]} rotation={[Math.PI, Math.PI, 0]} />
            {/* Starboard RCS Yaw Thruster - Forward */}
            <mesh geometry={rcsThrusterGeometry} material={rcsYawRightMaterial} position={[-6.0, 0, 1.5]} rotation={[Math.PI / 2, Math.PI / 2, 0]} />
            <mesh geometry={rcsThrusterGeometry} material={rcsYawRightMaterial} position={[-6.0, 0, 1.5]} rotation={[Math.PI / 2, Math.PI, 0]} />
            {/* Starboard RCS Yaw Thruster - Aft */}
            <mesh geometry={rcsThrusterGeometry} material={rcsYawLeftMaterial} position={[-6.0, 0, -1.5]} rotation={[-Math.PI / 2, Math.PI / 2, 0]} />
            <mesh geometry={rcsThrusterGeometry} material={rcsYawLeftMaterial} position={[-6.0, 0, -1.5]} rotation={[-Math.PI / 2, Math.PI, 0]} />
            {/* Starboard RCS Roll Thruster - Upward */}
            <mesh geometry={rcsThrusterGeometry} material={rcsRollRightMaterial} position={[-6.0, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} />
            <mesh geometry={rcsThrusterGeometry} material={rcsRollRightMaterial} position={[-6.0, 1.5, 0]} rotation={[0, Math.PI, 0]} />
            {/* Starboard RCS Roll Thruster - Downward */}
            <mesh geometry={rcsThrusterGeometry} material={rcsRollLeftMaterial} position={[-6.0, -1.5, 0]} rotation={[Math.PI, Math.PI / 2, 0]} />
            <mesh geometry={rcsThrusterGeometry} material={rcsRollLeftMaterial} position={[-6.0, -1.5, 0]} rotation={[Math.PI, Math.PI, 0]} />
        </group>
    );
}
