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

            // Player position
            playerPosition: null,
            setPlayerPosition: (position) => set({ playerPosition: position }),

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
