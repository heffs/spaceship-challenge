uniform vec3 uColor;
varying vec2 vUv;

void main() {
    gl_FragColor = vec4(uColor.r * sin(vUv.x), uColor.g * sin(vUv.y), uColor.b * sin(vUv.x + vUv.y), 1.0);
}