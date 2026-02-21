import "./App.css";
import { Environment } from "@react-three/drei";
import Player from "./Player";
import Interface from "./Interface";
import { Physics } from "@react-three/rapier";
import { useRef, useEffect, useState } from "react";
import World from "./World";
import useGame from "./gameState/useGame";
import { useFrame } from "@react-three/fiber";
import init, { TerrainGen } from "./wasm/dsed_terrain.js";
import { INTERFACE_WIDTH, INTERFACE_HEIGHT } from "./constants";
import { usePageVisibility } from "./usePageVisibility";

function App({ hash }) {
    const playerRef = useRef();
    const canvas2DRef = useRef();
    const [terrainGen, setTerrainGen] = useState(null);
    const isPageVisible = usePageVisibility();

    useFrame((state, delta) => {
        useGame.setState({ currentTime: state.clock.elapsedTime });
    });

    // Initialize WASM terrain generator once
    useEffect(() => {
        init().then(() => {
            const gen = TerrainGen.new(hash);
            setTerrainGen(gen);
        });
    }, [hash]);

    useEffect(() => {
        // Create a 2D canvas and set reference
        const canvas = document.createElement("canvas");
        canvas.id = "interface-canvas";
        canvas.width = INTERFACE_WIDTH;
        canvas.height = INTERFACE_HEIGHT;
        canvas.style.position = "fixed";
        canvas.style.bottom = "10px";
        canvas.style.left = "10px";
        canvas.style.zIndex = "1";
        canvas.imageSmoothingEnabled = false;
        document.body.appendChild(canvas);
        canvas2DRef.current = canvas;
    }, []);

    return (
        <>

            <Physics debug={false} paused={!isPageVisible} gravity={[0, -1.0, 0]}>
                {/* <axesHelper args={[40]} /> */}
                <Player ref={playerRef} />
                <World terrainGen={terrainGen} />
                <Interface canvas2DRef={canvas2DRef} />
                <fog attach="fog" args={[0xebb18d, 768, 1024]} />
            </Physics>
        </>
    );
}

export default App;
