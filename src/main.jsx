import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { Perf } from "r3f-perf";
import { EffectComposer, Bloom, DepthOfField } from "@react-three/postprocessing";
import Fog from "./postprocessing/Fog.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <KeyboardControls
            map={[
                { name: "pitch_up", keys: ["KeyS"] },
                { name: "pitch_down", keys: ["KeyW"] },
                { name: "yaw_left", keys: ["KeyA"] },
                { name: "yaw_right", keys: ["KeyD"] },
                { name: "roll_left", keys: ["KeyQ"] },
                { name: "roll_right", keys: ["KeyE"] },
                { name: "thrust_increase", keys: ["Space"] },
                { name: "thrust_decrease", keys: ["KeyX"] },
                { name: "camera_next", keys: ["KeyC"] },
                { name: "camera_previous", keys: ["KeyV"] },
            ]}
        >
            <Canvas
                gl={{ antialias: true }}
                shadows
                camera={{
                    fov: 45,
                    near: 0.1,
                    far: 1600,
                    position: [0, 300, -25],
                }}
            >
                <Perf position="top-left" />


                <App />
                <EffectComposer renderTargetX-format={THREE.RGBAFormat} renderTargetY-format={THREE.RGBAFormat}>
                    <Bloom luminanceThreshold={0.9} intensity={1.0} />
                    {/* <Fog /> */}
                </EffectComposer>
            </Canvas>
        </KeyboardControls>
    </StrictMode>,
);
