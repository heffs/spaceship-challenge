varying vec2 vUv;

#include "includes/noise.glsl"

float getElevation(vec2 position) {
    float elevation = fbm(position * 0.01);
    return elevation;
}

void main() {
    vec3 worldPosition = position + vec3(0, 0, getElevation(position.xy) * 50.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPosition, 1.0);
    vUv = uv;
}