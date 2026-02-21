import { useMemo, useRef, useState, useEffect } from "react";
import WorldChunk from "./WorldChunk";
import useGame from "./gameState/useGame";
import { CHUNK_SIZE, CHUNK_GRID_SIZE, RENDER_DISTANCE } from "./constants";
import { worldToChunk } from "./utils";

export default function World({ terrainGen }) {
    const playerPosition = useGame((state) => state.playerPosition);
    const [chunks, setChunks] = useState(() => new Map());
    // const [terrainGen, setTerrainGen] = useState(null);

    // Initialize WASM terrain generator once
    // useEffect(() => {
    //     init().then(() => {
    //         const gen = TerrainGen.new(hash);
    //         gen.setAmplitude(200);
    //         setTerrainGen(gen);
    //         console.log("TerrainGen initialized");
    //     });
    // }, [hash]);

    // Keep track of the current chunk and chunk id
    const currentChunk = useRef({ chunkX: 0, chunkZ: 0 });
    const currentChunkId = useMemo(() => {
        if (!playerPosition) return null;
        const { chunkX, chunkZ } = worldToChunk(playerPosition.x, playerPosition.z);
        if (currentChunk.current === null || currentChunk.current.chunkX !== chunkX || currentChunk.current.chunkZ !== chunkZ) {
            currentChunk.current = { chunkX, chunkZ };
            // console.log(`current chunk changed to ${chunkX}_${chunkZ} with player at ${playerPosition.x}, ${playerPosition.y}, ${playerPosition.z}`);
        }
        return `${chunkX}_${chunkZ}`;
    }, [playerPosition]);

    // When the current chunk id changes, update the chunks map
    // Only create chunks when terrainGen is ready
    useEffect(() => {
        // Don't create chunks until terrainGen is initialized
        if (!terrainGen) {
            return;
        }

        setChunks((prevChunks) => {
            const nextChunks = new Map(prevChunks);
            // Add needed chunks and create list of required chunks
            const requiredChunks = new Set();
            for (let x = -RENDER_DISTANCE; x <= RENDER_DISTANCE; x++) {
                for (let z = -RENDER_DISTANCE; z <= RENDER_DISTANCE; z++) {
                    const chunkX = currentChunk.current.chunkX + x;
                    const chunkZ = currentChunk.current.chunkZ + z;
                    const chunkId = `${chunkX}_${chunkZ}`;
                    if (!prevChunks.has(chunkId)) {
                        nextChunks.set(chunkId,
                            <WorldChunk key={chunkId} chunkX={chunkX} chunkZ={chunkZ} terrainGen={terrainGen} />);
                    }
                    requiredChunks.add(`${currentChunk.current.chunkX + x}_${currentChunk.current.chunkZ + z}`);
                }
            }

            // Remove chunks that are no longer needed
            for (const chunkId of prevChunks.keys()) {
                if (!requiredChunks.has(chunkId)) {
                    nextChunks.delete(chunkId);
                }
            }
            return nextChunks;
        });
    }, [currentChunkId, terrainGen]);

    return (
        <>
            {Array.from(chunks.values()).map((chunk) => (
                chunk
            ))}
        </>
    );
}