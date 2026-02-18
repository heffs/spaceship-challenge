import "./App.css";
import { Environment } from "@react-three/drei";
import Player from "./Player";
import { Physics } from "@react-three/rapier";
import { useRef, useEffect } from "react";
import World from "./World";
import useGame from "./gameState/useGame";
import { useFrame } from "@react-three/fiber";

function App() {
    const playerRef = useRef();
    const canvas2DRef = useRef();
    const hash = "test2";

    useFrame((state, delta) => {
        useGame.setState({ currentTime: state.clock.elapsedTime });
    });

    useEffect(() => {
        // Create a 2D canvas and set reference
        const canvas = document.createElement("canvas");
        canvas.width = 240;
        canvas.height = 240;
        canvas.style.position = "fixed";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.zIndex = "1280";
        document.body.appendChild(canvas);
        canvas2DRef.current = canvas;
    }, []);

    return (
        <>

            <Physics debug={false} gravity={[0, -0.5, 0]}>
                {/* <axesHelper args={[40]} /> */}
                <Player ref={playerRef} />
                {/* <Environment files="./lunar-surface.hdr" background={true} /> */}
                <World hash={hash} />
                <fog attach="fog" args={[0xebb18d, 768, 1024]} />
            </Physics>
        </>
    );
}

export default App;
