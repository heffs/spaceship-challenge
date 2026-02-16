import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import * as THREE from "three";
import terrainVertex from "./shaders/terrainVertex.glsl";
import terrainFragment from "./shaders/terrainFragment.glsl";

const TerrainMaterial = shaderMaterial(
    {
        uColor: new THREE.Color(0.5, 0.5, 0.5),
    },
    terrainVertex,
    terrainFragment,
);

extend({ TerrainMaterial });

export default function Terrain() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} wireframe={true} castShadow={true} receiveShadow={true}>
            <planeGeometry args={[256, 256, 512, 512]} />
            <terrainMaterial />
        </mesh>
    );
}