import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export default create(
    subscribeWithSelector((set) => {
        return {
            // Time
            startTime: 0,
            endTime: 0,

            // Phases
            phase: "splash",

            showInstruments: false,
            setShowInstruments: (show) => set({ showInstruments: show }),

            // Player position, rotation, and velocity
            playerPosition: null,
            setPlayerPosition: (position) => set({ playerPosition: position }),
            playerRotation: null,
            setPlayerRotation: (rotation) => set({ playerRotation: rotation }),
            playerVelocity: null,
            setPlayerVelocity: (velocity) => set({ playerVelocity: velocity }),

            shipMainThrust: 0.445,
            setShipMainThrust: (thrust) => set({ shipMainThrust: thrust }),
            
            // Camera position and orientation
            cameraIndex: 0,
            setCameraIndex: (index) => set({ cameraIndex: index }),
            cameraPosition: null,
            setCameraPosition: (position) => set({ cameraPosition: position }),
            cameraOrientation: null,
            setCameraOrientation: (orientation) => set({ cameraOrientation: orientation }),

            // Current time
            currentTime: 0,
            setCurrentTime: (time) => set({ currentTime: time }),

            // Phase transitions
            // Start: From splash screen to game
            start: () => {
                set((state) => {
                    if (state.phase === "splash")
                        return { phase: "playing", startTime: Date.now() };
                    return {};
                });
            },

            // Quit: From game back to splash screen
            quit: () => {
                set((state) => {
                    if (state.phase === "playing") return { phase: "splash" };
                    return {};
                });
            },

            // Crash: From playing to crash state that does not accept input
            crash: () => {
                set((state) => {
                    if (state.phase === "playing")
                        return { phase: "crashed", endTime: Date.now() };
                    return {};
                });
            },

            // Restart: From game over crashed state back to splash
            restart: () => {
                set((state) => {
                    if (state.phase === "crashed") return { phase: "splash" };
                    return {};
                });
            },
        };
    }),
);
