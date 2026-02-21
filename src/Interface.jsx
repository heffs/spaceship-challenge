import { useKeyboardControls } from "@react-three/drei";
import useGame from "./gameState/useGame";
import { useFrame } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { drawAttitudeIndicator, drawMainThrusterIndicator, drawSpeedIndicators, drawHeadingIndicator, drawHeightWarning, drawControls, drawAltitude } from "./drawInterface";
import * as THREE from "three";
import { interfaceColors, worldToChunk } from "./utils";
import { INTERFACE_WIDTH, INTERFACE_HEIGHT } from "./constants";

export default function Interface({ canvas2DRef }) {
    const [fontLoaded, setFontLoaded] = useState(false);

    // Load font
    useEffect(() => {
        const loadFont = async () => {
            try {
                const font = new FontFace("Coctab", "url(/coctab.ttf)");
                await font.load();
                document.fonts.add(font);
                setFontLoaded(true);
            } catch (error) {
                console.error("Failed to load Coctab font:", error);
                // Fallback to use the font even if loading fails
                setFontLoaded(true);
            }
        };
        loadFont();
    }, []);

    useFrame((state, delta) => {
        const showInstruments = useGame.getState().showInstruments;
        if (showInstruments) {
            if (canvas2DRef.current && fontLoaded) {
                const w = INTERFACE_WIDTH;
                const h = INTERFACE_HEIGHT;

                const gameState = useGame.getState();
                const playerPosition = gameState.playerPosition;
                const playerRotation = gameState.playerRotation;
                const playerVelocity = gameState.playerVelocity;
                const playerEuler = new THREE.Euler().setFromQuaternion(new THREE.Quaternion(playerRotation.x, playerRotation.y, playerRotation.z, playerRotation.w), 'XYZ');

                const velocityMagnitude = Math.sqrt(
                    playerVelocity.x * playerVelocity.x +
                    playerVelocity.y * playerVelocity.y +
                    playerVelocity.z * playerVelocity.z
                );
                const context = canvas2DRef.current.getContext("2d");
                context.clearRect(0, 0, w, h);
                context.fillStyle = "rgba(0, 0, 0, 0.8)";
                context.fillRect(0, 0, w, h);

                // Interface frame
                // Top bar
                context.fillStyle = interfaceColors.brightAmber;
                context.strokeStyle = interfaceColors.brightAmber;
                context.fillRect(8, 8, w - 16, 24);
                context.lineWidth = 2;
                context.strokeRect(8, 8, w - 16, h - 16);

                context.textAlign = "left";

                context.font = "18px Coctab";
                const { chunkX, chunkZ } = worldToChunk(playerPosition.x, playerPosition.z);
                // context.fillText(`Chunk: ${chunkX}, ${chunkZ}`, 12, h - 35);
                // context.fillText(`Pos: ${playerPosition.x.toFixed(2)}, ${playerPosition.y.toFixed(2)}, ${playerPosition.z.toFixed(2)}`, 12, h - 15);
                // context.fillText(`Eul: ${playerEuler.x.toFixed(2)}, ${playerEuler.y.toFixed(2)}, ${playerEuler.z.toFixed(2)}`, 220, h - 15);
                context.fillText("[K] Show controls", 12, h - 15);
                context.font = "22px Coctab";

                context.fillStyle = "#000000";
                context.fillText("Dynamars Ship Control System v0.1.0", 10, 22);
                drawAttitudeIndicator(context, playerRotation, 80, 120, 60);
                drawMainThrusterIndicator(context, gameState.shipMainThrust, playerPosition.y, 180, 60, 20, 120);
                drawSpeedIndicators(context, playerVelocity, 20, 210);
                drawHeadingIndicator(context, playerRotation, playerVelocity, 320, 120, 60);
                drawHeightWarning(context, playerPosition.y, 10, 240, w - 20);
                drawAltitude(context, playerPosition.y, 260, 230);
            }
        } else {
            const w = INTERFACE_WIDTH;
            const h = INTERFACE_HEIGHT;
            if (canvas2DRef.current && fontLoaded) {
                const context = canvas2DRef.current.getContext("2d");
                context.clearRect(0, 0, w, h);
                context.fillStyle = "rgba(0, 0, 0, 0.8)";
                context.fillRect(0, 0, w, h);

                drawControls(context, w, h);
            }
        }
    });

    return (
        <>
            {/* <mesh>
                <planeGeometry args={[240, 240]} />
                <meshBasicMaterial color="red" />
            </mesh> */}
        </>
    );
}