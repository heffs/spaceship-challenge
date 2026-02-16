import "./App.css";
import { Environment } from "@react-three/drei";
import Player from "./Player";
import { Physics } from "@react-three/rapier";
import { useRef, useEffect } from "react";
import World from "./World";

function App() {
    const playerRef = useRef();
    const canvas2DRef = useRef();
    const hash = "test";

    useEffect(() => {
        // Create a 2D canvas and set reference
        const canvas = document.createElement("canvas");
        canvas.width = 240;
        canvas.height = 240;
        canvas.style.position = "fixed";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.zIndex = "1000";
        document.body.appendChild(canvas);
        canvas2DRef.current = canvas;
    }, []);

    return (
        <>

            <Physics debug={true} gravity={[0, -0.1, 0]}>
                <mesh position={[0, 12, 0]}>
                    <boxGeometry args={[2, 2, 2]} />
                    <meshStandardMaterial color="red" />
                </mesh>
                <axesHelper args={[10]} />
                <Player ref={playerRef} />
                <World hash={hash} />
                <Environment files="./lunar-surface.hdr" background={true} />
            </Physics>
        </>
    );
}

export default App;
