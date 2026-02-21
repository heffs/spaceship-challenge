import * as THREE from "three";
import { useState, useEffect } from "react";
import { RigidBody, HeightfieldCollider } from "@react-three/rapier";

import { CHUNK_SIZE, CHUNK_GRID_SIZE, GEOM_TO_COLLISION_RATIO, OCTAVES, FREQUENCY, LACUNARITY, AMPLITUDE, PERSISTENCE } from "./constants";

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
                OCTAVES, FREQUENCY, LACUNARITY, AMPLITUDE, PERSISTENCE,
                false);


            for (let i = 0; i < heights.length; i++) {
                const h = heights[i];
                positions.setY(i, h);
            }

            planeGeometry.computeVertexNormals();
            planeGeometry.attributes.position.needsUpdate = true;


            const collisionVerts = Math.floor(CHUNK_SIZE / GEOM_TO_COLLISION_RATIO) + 1;
            const collisionHeights = terrainGen.terrainHeights(collisionVerts, collisionVerts, chunkWorldX * 0.5, chunkWorldZ * 0.5, 0.5 * GEOM_TO_COLLISION_RATIO,
                OCTAVES, FREQUENCY, LACUNARITY, AMPLITUDE, PERSISTENCE,
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
                <meshStandardMaterial color="#b06948" wireframe={false} />
            </mesh>
        </RigidBody>


    );
}