import * as THREE from "three";
import { useState, useEffect } from "react";
import { RigidBody, HeightfieldCollider } from "@react-three/rapier";

import { CHUNK_SIZE, CHUNK_GRID_SIZE, GEOM_TO_COLLISION_RATIO, OCTAVES, FREQUENCY, LACUNARITY, AMPLITUDE, PERSISTENCE, OFFSET } from "./constants";

// Load textures once at module level - shared across all chunks
const textureLoader = new THREE.TextureLoader();
const textureRepeat = CHUNK_SIZE * CHUNK_GRID_SIZE / 10;

const configureTexture = (texture) => {
    if (texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(textureRepeat, textureRepeat);
    }
    return texture;
};

const diffuseMap = configureTexture(textureLoader.load("/textures/martian_soil_stones_diff_1k.jpg"));
const normalMap = configureTexture(textureLoader.load("/textures/red_laterite_soil_stones_nor_gl_1k.jpg"));
const roughnessMap = configureTexture(textureLoader.load("/textures/red_laterite_soil_stones_rough_1k.jpg"));
const aoMap = configureTexture(textureLoader.load("/textures/red_laterite_soil_stones_ao_1k.jpg"));
const displacementMap = configureTexture(textureLoader.load("/textures/red_laterite_soil_stones_disp_1k.jpg"));

export default function WorldChunk({ chunkX, chunkZ, terrainGen }) {
    const [geometry, setGeometry] = useState(null);
    const [collisionMesh, setCollisionMesh] = useState([]);

    useEffect(() => {
        const handleIdle = requestIdleCallback(() => {
            const planeGeometry = new THREE.PlaneGeometry(CHUNK_SIZE * CHUNK_GRID_SIZE, CHUNK_SIZE * CHUNK_GRID_SIZE, CHUNK_SIZE, CHUNK_SIZE);
            planeGeometry.rotateX(-Math.PI / 2);

            const positions = planeGeometry.attributes.position;
            const numVertices = (CHUNK_SIZE + 1) * (CHUNK_SIZE + 1);

            // Chunk origin in world coordinates - just for the terrain generation, so we don't have to scale the terrain
            const chunkWorldX = chunkX * CHUNK_SIZE;
            const chunkWorldZ = chunkZ * CHUNK_SIZE;


            const heights = terrainGen.terrainHeights(CHUNK_SIZE + 1, CHUNK_SIZE + 1, chunkWorldX * 0.5, chunkWorldZ * 0.5, 0.5,
                OCTAVES, FREQUENCY, LACUNARITY, AMPLITUDE, PERSISTENCE, OFFSET,
                false);


            for (let i = 0; i < heights.length; i++) {
                const h = heights[i];
                positions.setY(i, h);
            }

            planeGeometry.computeVertexNormals();
            planeGeometry.attributes.position.needsUpdate = true;


            const collisionVerts = Math.floor(CHUNK_SIZE / GEOM_TO_COLLISION_RATIO) + 1;
            const collisionHeights = terrainGen.terrainHeights(collisionVerts, collisionVerts, chunkWorldX * 0.5, chunkWorldZ * 0.5, 0.5 * GEOM_TO_COLLISION_RATIO,
                OCTAVES, FREQUENCY, LACUNARITY, AMPLITUDE, PERSISTENCE, OFFSET,
                true);


            // console.log(`Geometry generated for chunk ${chunkX}, ${chunkZ}`);
            setGeometry(planeGeometry);
            setCollisionMesh(collisionHeights);
        }, { timeout: 1000 });

        return () => {
            cancelIdleCallback(handleIdle);
        };
    }, [chunkX, chunkZ]);

    if (!geometry) {
        return null;
    }

    return (
        <RigidBody type="fixed" colliders={false} position={[chunkX * CHUNK_SIZE * CHUNK_GRID_SIZE, 0, chunkZ * CHUNK_SIZE * CHUNK_GRID_SIZE]}>
            <HeightfieldCollider args={[
                CHUNK_SIZE / GEOM_TO_COLLISION_RATIO, CHUNK_SIZE / GEOM_TO_COLLISION_RATIO, [...collisionMesh],
                { x: CHUNK_SIZE * CHUNK_GRID_SIZE, y: 1, z: CHUNK_SIZE * CHUNK_GRID_SIZE }
            ]} />
            <mesh geometry={geometry} receiveShadow>
                <meshStandardMaterial
                // color="#b06948"
                    map={diffuseMap}
                    normalMap={normalMap}
                    roughnessMap={roughnessMap}
                    aoMap={aoMap}
                    displacementMap={displacementMap}
                    displacementScale={0.1}
                    wireframe={false}
                />
            </mesh>
        </RigidBody>


    );
}