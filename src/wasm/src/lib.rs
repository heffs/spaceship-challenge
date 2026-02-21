mod log;
mod rand_box;

use crate::log::log;
use crate::rand_box::RandBox;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct TerrainGen {
    rng: RandBox,
    octaves: usize,
    frequency: f32,
    lacunarity: f32,
    amplitude: f32,
    persistence: f32,
}

#[wasm_bindgen]
impl TerrainGen {
    pub fn new(hash: String) -> Self {
        let rng = RandBox::new(hash.clone());

        Self {
            rng,
            octaves: 8,
            frequency: 0.01,
            lacunarity: 2.0,
            amplitude: 1.0,
            persistence: 0.5,
        }
    }

    #[wasm_bindgen(js_name = logRandom)]
    pub fn log_random(&mut self) {
        log(&format!("{}", self.rng.rand()));
    }

    #[wasm_bindgen(js_name = setOctaves)]
    pub fn set_octaves(&mut self, octaves: usize) {
        self.octaves = octaves;
    }

    #[wasm_bindgen(js_name = setFrequency)]
    pub fn set_frequency(&mut self, frequency: f32) {
        self.frequency = frequency;
    }

    #[wasm_bindgen(js_name = setLacunarity)]
    pub fn set_lacunarity(&mut self, lacunarity: f32) {
        self.lacunarity = lacunarity;
    }

    #[wasm_bindgen(js_name = setAmplitude)]
    pub fn set_amplitude(&mut self, amplitude: f32) {
        self.amplitude = amplitude;
    }

    #[wasm_bindgen(js_name = setPersistence)]
    pub fn set_persistence(&mut self, persistence: f32) {
        self.persistence = persistence;
    }

    /**
     * Generate a 2D array of terrain heights.
     * @param width - The number of columns in the terrain.
     * @param height - The number of rows in the terrain.
     * @param origin_x - The x coordinate of the origin.
     * @param origin_y - The y coordinate of the origin.
     * @param step - The step size between each height.
     * @returns A 2D array of terrain heights (A Float32Array in JavaScript)
     */
    #[wasm_bindgen(js_name = terrainHeights)]
    pub fn terrain_heights(
        &self,
        width: usize,
        height: usize,
        origin_x: f32,
        origin_y: f32,
        step: f32,
        flip_x: bool,
        flip_y: bool,
        rotate: bool,
    ) -> Vec<f32> {
        let mut heights = Vec::<f32>::with_capacity(width * height);

        for y in 0..height {
            for x in 0..width {
                // let x = x as f32 * step + origin_x;
                // let y = y as f32 * step + origin_y;
                let mut nx = x;
                let mut ny = y;
                if rotate {
                    let temp = x;
                    nx = y;
                    ny = temp;
                }
                let fx: f32 = (if flip_x { width - nx - 1 } else { nx }) as f32 * step + origin_x;
                let fy: f32 = (if flip_y { height - ny - 1 } else { ny }) as f32 * step + origin_y;

                heights.push(self.height_at(fx, fy));
            }
        }
        heights
    }

    /**
     * Get the height at a given x and y coordinate.
     * @param x - The x coordinate.
     * @param y - The y coordinate.
     * @returns The height at the given x and y coordinate.
     */
    #[wasm_bindgen(js_name = heightAt)]
    pub fn height_at(&self, x: f32, y: f32) -> f32 {
        self.rng.fbm(
            x,
            y,
            self.octaves,
            self.frequency,
            self.lacunarity,
            self.amplitude,
            self.persistence,
        )
    }
}
