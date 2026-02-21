/* tslint:disable */
/* eslint-disable */

export class TerrainGen {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     *
     *     * Get the height at a given x and y coordinate.
     *     * @param x - The x coordinate.
     *     * @param y - The y coordinate.
     *     * @returns The height at the given x and y coordinate.
     *
     */
    heightAt(x: number, y: number, octaves: number, frequency: number, lacunarity: number, amplitude: number, persistence: number, offset: number): number;
    static new(hash: string): TerrainGen;
    /**
     *
     *     * Generate a 2D array of terrain heights.
     *     * @param width - The number of columns in the terrain.
     *     * @param height - The number of rows in the terrain.
     *     * @param origin_x - The x coordinate of the origin.
     *     * @param origin_y - The y coordinate of the origin.
     *     * @param step - The step size between each height.
     *     * @returns A 2D array of terrain heights (A Float32Array in JavaScript)
     *
     */
    terrainHeights(width: number, height: number, origin_x: number, origin_y: number, step: number, octaves: number, frequency: number, lacunarity: number, amplitude: number, persistence: number, offset: number, rotate: boolean): Float32Array;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_terraingen_free: (a: number, b: number) => void;
    readonly terraingen_new: (a: number, b: number) => number;
    readonly terraingen_terrainHeights: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number) => [number, number];
    readonly terraingen_heightAt: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
