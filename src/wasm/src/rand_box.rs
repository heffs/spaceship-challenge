use noise::{NoiseFn, Perlin, Simplex};
use rand::{RngExt, SeedableRng};
use rand::rngs::StdRng;
use sha2::{Digest, Sha256};
use std::f64::consts::PI;
use std::hash::{DefaultHasher, Hash, Hasher};

pub struct RandBox {
    rng: StdRng,
    hash: String,
    perlin: Perlin,
    simplex: Simplex,
}

impl RandBox {
    pub fn new(hash: String) -> Self {
        let rng = RandBox::init_rng(&hash[..]);
        let perlin = Perlin::new(Self::string_to_u32_seed(hash.clone()));
        let simplex = Simplex::new(Self::string_to_u32_seed(hash.clone()) + 1);

        Self {
            rng,
            hash,
            perlin,
            simplex,
        }
    }

    fn init_rng(hash: &str) -> StdRng {
        let mut hasher = Sha256::new();
        hasher.update(hash);
        let hash_result = hasher.finalize();

        let seed: [u8; 32] = hash_result.into();

        let rng: StdRng = SeedableRng::from_seed(seed);

        rng
    }

    pub fn reset(&mut self) {
        let new_rng = Self::init_rng(&self.hash);
        self.rng = new_rng;
    }

    fn box_muller_transform_z0(rng: &mut StdRng) -> f64 {
        let u1: f64 = rng.random();
        let u2: f64 = rng.random();

        let z0 = (-2.0 * u1.ln()).sqrt() * (2.0 * PI * u2).cos();
        // let z1 = (-2.0 * u1.ln()).sqrt() * (2.0 * PI * u2).sin();

        z0
    }

    pub fn noise_1d(&self, x: f64) -> f64 {
        (self.perlin.get([x]) + 1.0) / 2.0
    }

    pub fn noise(&self, x: f64, y: f64) -> f64 {
        (self.perlin.get([x, y]) + 1.0) / 2.0
    }

    pub fn raw_noise(&self, x: f64, y: f64) -> f64 {
        self.perlin.get([x, y])
    }

    pub fn raw_simplex(&self, x: f64, y: f64) -> f64 {
        self.simplex.get([x, y])
    }

    pub fn simplex(&self, x: f64, y: f64) -> f64 {
        (self.simplex.get([x, y]) + 1.0) / 2.0
    }

    pub fn normal_random(&mut self, mean: f64, sd: f64) -> f64 {
        Self::box_muller_transform_z0(&mut self.rng) * sd + mean
    }

    pub fn rand(&mut self) -> f64 {
        let r: f64 = self.rng.random();

        r
    }

    pub fn rand_u8(&mut self, min: u8, max: u8) -> u8 {
        let r: u8 = self.rng.random_range(min..max);

        r
    }

    pub fn rand_usize(&mut self, min: usize, max: usize) -> usize {
        let r: usize = self.rng.random_range(min..max);

        r
    }

    pub fn rand_f64(&mut self, min: f64, max: f64) -> f64 {
        let r: f64 = self.rng.random_range(min..max);

        r
    }

    pub fn rand_element<'a, T>(&mut self, elements: &'a [T]) -> &'a T {
        let r: usize = self.rng.random_range(0..elements.len());

        &elements[r]
    }

    pub fn fbm(&self, x: f32, y: f32, octaves: usize, frequency: f32, lacunarity: f32, amplitude: f32, persistence: f32) -> f32 {
        let mut sum: f32 = 0.0;
        let mut amplitude = amplitude;
        let mut frequency = frequency;
        for _ in 0..octaves {
            sum += amplitude * self.simplex((x * frequency) as f64, (y * frequency) as f64) as f32;
            frequency *= lacunarity;
            amplitude *= persistence;
        }
        sum
    }

    fn string_to_u32_seed(s: String) -> u32 {
        let mut hasher = DefaultHasher::new();
        s.hash(&mut hasher);
        (hasher.finish() & 0xFFFFFFFF) as u32
    }
}
