import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { Perf } from "r3f-perf";
import { EffectComposer, Bloom, DepthOfField } from "@react-three/postprocessing";
import Drunk from "./postprocessing/Drunk.jsx";
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
            ]}
        >
            <Canvas
                gl={{ antialias: true }}
                shadows
                camera={{
                    fov: 45,
                    near: 0.1,
                    far: 5000,
                    position: [0, 20, -25],
                }}
            >
                <Perf position="top-left" />
                <EffectComposer>
                    {/* <Bloom luminanceThreshold={0.9} intensity={1.0} /> */}
                    {/* <Drunk /> */}
                    <Fog />
                </EffectComposer>
                <App />
            </Canvas>
        </KeyboardControls>
    </StrictMode>,
);
