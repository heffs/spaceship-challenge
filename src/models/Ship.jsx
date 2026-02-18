import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";
import rcsThrusterVertex from "../shaders/rcsthruster_vertex.glsl";
import rcsThrusterFragment from "../shaders/rcsthruster_fragment.glsl";
import useGame from "../gameState/useGame";
import { useFrame } from "@react-three/fiber";

const rcsThrusterMaterial = new THREE.ShaderMaterial({
    vertexShader: rcsThrusterVertex,
    fragmentShader: rcsThrusterFragment,
    uniforms: {
        uResolution: { value: new THREE.Vector2(240, 240) },
        uTime: { value: 0 },
        uNoiseTexture: { value: new THREE.TextureLoader().load("./noiseTexture.png") },
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
    },
    side: THREE.DoubleSide,
    transparent: true,
});

// const mainThrusterMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: false, side: THREE.DoubleSide });
// const rcsThrusterMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: false, side: THREE.DoubleSide });

const mainThrusterGeometry = new THREE.PlaneGeometry(2.0, 9);
const rcsThrusterGeometry = new THREE.PlaneGeometry(1, 3);

export default function Ship() {
    const model = useGLTF("./dsed-ship.glb");

    useFrame((state, delta) => {
        rcsThrusterMaterial.uniforms.uTime.value = useGame.getState().currentTime;
        mainThrusterMaterial.uniforms.uTime.value = useGame.getState().currentTime;
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
            <mesh geometry={mainThrusterGeometry} material={mainThrusterMaterial} position={[4.5, 2, 0.5]} rotation={[Math.PI, Math.PI / 2, 0]} />
            <mesh geometry={mainThrusterGeometry} material={mainThrusterMaterial} position={[4.5, 2, 0.5]} rotation={[Math.PI, 0, 0]} />
            {/* Aft port thruster */}
            <mesh geometry={mainThrusterGeometry} material={mainThrusterMaterial} position={[4.5, 2, -2.5]} rotation={[Math.PI, Math.PI / 2, 0]} />
            <mesh geometry={mainThrusterGeometry} material={mainThrusterMaterial} position={[4.5, 2, -2.5]} rotation={[Math.PI, 0, 0]} />
            {/* Forward starboard thruster */}
            <mesh geometry={mainThrusterGeometry} material={mainThrusterMaterial} position={[-4.5, 2, 0.5]} rotation={[Math.PI, Math.PI / 2, 0]} />
            <mesh geometry={mainThrusterGeometry} material={mainThrusterMaterial} position={[-4.5, 2, 0.5]} rotation={[Math.PI, 0, 0]} />
            {/* Aft starboard thruster */}
            <mesh geometry={mainThrusterGeometry} material={mainThrusterMaterial} position={[-4.5, 2, -2.5]} rotation={[Math.PI, Math.PI / 2, 0]} />
            <mesh geometry={mainThrusterGeometry} material={mainThrusterMaterial} position={[-4.5, 2, -2.5]} rotation={[Math.PI, 0, 0]} />
            {/* Port RCS Yaw Thruster - Forward */}
            <mesh geometry={rcsThrusterGeometry} material={rcsThrusterMaterial} position={[5.8, 5.25, 0.5]} rotation={[Math.PI / 2, Math.PI / 2, 0]} />
            <mesh geometry={rcsThrusterGeometry} material={rcsThrusterMaterial} position={[5.8, 5.25, 0.5]} rotation={[Math.PI / 2, Math.PI, 0]} />
            {/* Port RCS Yaw Thruster - Aft */}
            <mesh geometry={rcsThrusterGeometry} material={rcsThrusterMaterial} position={[5.8, 5.25, -2.5]} rotation={[-Math.PI / 2, Math.PI / 2, 0]} />
            <mesh geometry={rcsThrusterGeometry} material={rcsThrusterMaterial} position={[5.8, 5.25, -2.5]} rotation={[-Math.PI / 2, Math.PI, 0]} />
            {/* Port RCS Roll Thruster - Upward */}
            <mesh geometry={rcsThrusterGeometry} material={rcsThrusterMaterial} position={[5.8, 6.75, -1]} rotation={[0, Math.PI / 2, 0]} />
            <mesh geometry={rcsThrusterGeometry} material={rcsThrusterMaterial} position={[5.8, 6.75, -1]} rotation={[0, Math.PI, 0]} />
            {/* Port RCS Roll Thruster - Downward */}
            <mesh geometry={rcsThrusterGeometry} material={rcsThrusterMaterial} position={[5.8, 3.75, -1]} rotation={[Math.PI, Math.PI / 2, 0]} />
            <mesh geometry={rcsThrusterGeometry} material={rcsThrusterMaterial} position={[5.8, 3.75, -1]} rotation={[Math.PI, Math.PI, 0]} />
            {/* Starboard RCS Yaw Thruster - Forward */}
            <mesh geometry={rcsThrusterGeometry} material={rcsThrusterMaterial} position={[-5.8, 5.25, 0.5]} rotation={[Math.PI / 2, Math.PI / 2, 0]} />
            <mesh geometry={rcsThrusterGeometry} material={rcsThrusterMaterial} position={[-5.8, 5.25, 0.5]} rotation={[Math.PI / 2, Math.PI, 0]} />
            {/* Starboard RCS Yaw Thruster - Aft */}
            <mesh geometry={rcsThrusterGeometry} material={rcsThrusterMaterial} position={[-5.8, 5.25, -2.5]} rotation={[-Math.PI / 2, Math.PI / 2, 0]} />
            <mesh geometry={rcsThrusterGeometry} material={rcsThrusterMaterial} position={[-5.8, 5.25, -2.5]} rotation={[-Math.PI / 2, Math.PI, 0]} />
            {/* Starboard RCS Roll Thruster - Upward */}
            <mesh geometry={rcsThrusterGeometry} material={rcsThrusterMaterial} position={[-5.8, 6.75, -1]} rotation={[0, Math.PI / 2, 0]} />
            <mesh geometry={rcsThrusterGeometry} material={rcsThrusterMaterial} position={[-5.8, 6.75, -1]} rotation={[0, Math.PI, 0]} />
            {/* Starboard RCS Roll Thruster - Downward */}
            <mesh geometry={rcsThrusterGeometry} material={rcsThrusterMaterial} position={[-5.8, 3.75, -1]} rotation={[Math.PI, Math.PI / 2, 0]} />
            <mesh geometry={rcsThrusterGeometry} material={rcsThrusterMaterial} position={[-5.8, 3.75, -1]} rotation={[Math.PI, Math.PI, 0]} />
        </group>
    );
}
