import * as THREE from "three";
import { useState, useEffect } from "react";

const CHUNK_SIZE = 128;
const CHUNK_GRID_SIZE = 4;

export default function WorldChunk({ chunkX, chunkZ, terrainGen }) {
    const [geometry, setGeometry] = useState(null);

    useEffect(() => {
        const handleIdle = requestIdleCallback(() => {
            const planeGeometry = new THREE.PlaneGeometry(CHUNK_SIZE * CHUNK_GRID_SIZE, CHUNK_SIZE * CHUNK_GRID_SIZE, CHUNK_SIZE, CHUNK_SIZE);
            planeGeometry.rotateX(-Math.PI / 2);

            const positions = planeGeometry.attributes.position;
            const numVertices = (CHUNK_SIZE + 1) * (CHUNK_SIZE + 1);
            const heightData = new Float32Array(numVertices);

            // Chunk origin in world coordinates - just for the terrain generation, so we don't have to scale the terrain
            const chunkWorldX = chunkX * CHUNK_SIZE;
            const chunkWorldZ = chunkZ * CHUNK_SIZE;

            const heights = terrainGen.terrainHeights(CHUNK_SIZE + 1, CHUNK_SIZE + 1, chunkWorldX * 0.5, chunkWorldZ * 0.5, 0.5);

            for (let i = 0; i < heights.length; i++) {
                const h = heights[i];
                positions.setY(i, h * 80);
            }

            planeGeometry.computeVertexNormals();
            planeGeometry.attributes.position.needsUpdate = true;

            // console.log(`Geometry generated for chunk ${chunkX}, ${chunkZ}`);
            setGeometry(planeGeometry);
        }, { timeout: 1000 });

        return () => {
            cancelIdleCallback(handleIdle);
        };
    }, [chunkX, chunkZ]);

    if (!geometry) {
        return null;
    }

    return (
        <mesh geometry={geometry} position={[chunkX * CHUNK_SIZE * CHUNK_GRID_SIZE, 0, chunkZ * CHUNK_SIZE * CHUNK_GRID_SIZE]} receiveShadow>
            <meshStandardMaterial color="#b06948" wireframe={false} />
        </mesh>
    );
}