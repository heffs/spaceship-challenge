uniform vec2 uResolution;
uniform float uTime;
uniform sampler2D uNoiseTexture;
uniform float uPower;
varying vec2 vUv;

const float cAngle = 0.0;
const float cSpeed = 1.0;
// const float cPower = 100.0;
const float cSize = 80.0;
const int cNoiseDepth = 5;
const float cNoiseStrength = 0.35;
const float cNoiseScale = 0.75;
const float cNoiseSize = 3.0;
// const vec4 cColor = vec4(1.0, 0.45, 0.8, 1.0);
const vec4 cColor = vec4(0.1, 0.2, 1.0, 1.0);

// Code taken from Effect Texture Maker

void main() {
    vec2 uv = vUv;

    // Compute flame area
    vec2 position = vec2((cAngle + 1.0) * 0.5, 0.0);
    float xinc = clamp(mod(uTime, 6.0) - 3.0, -3.0, 3.0);
    float yinc = clamp(mod(-uTime, 6.0) + 3.0, -3.0, 3.0);

    float inc = -cAngle;
    float xSlope = uv.x - position.x;
    float ySlope = uv.y - position.y;
    float slope = 0.0;
    if (ySlope != 0.0) {
        slope = xSlope / ySlope;
    } else {
        slope = 0.1;
    }
    float xdif = xinc / max(xSlope, 0.1);
    float ydif = yinc / max(ySlope, 0.1);

    float dist = distance (position, uv);
    dist = abs(slope - inc) * 0.1 + dist/(2.0 * uPower);
    if (inc > 2.0 || inc < -2.0) dist *= dist;
    if ((xdif < 0.0 && ydif < 0.0) || (ydif < 0.0 && xdif > 0.0)) dist = 10.0;

    // Flame noise
    float noise = 0.0;
    vec2 noiseUv = cNoiseSize * (uv - position) / uResolution.y - vec2(xinc * cSpeed * uTime, yinc * cSpeed * uTime);
    for (int i = 0; i < 10; i++) {
        noiseUv = vec2(mod(noiseUv.x, 1.0), mod(noiseUv.y, 1.0));
        if (i > cNoiseDepth) break;
        noise += texture2D(uNoiseTexture, noiseUv * pow(2.0, float(i))).r;
        noiseUv *= cNoiseScale;
    }
    float intensity = mix(-(100.0 - cSize) * dist, noise, cNoiseStrength);
    vec4 d = intensity + cColor;

    
    // Set alpha based on intensity - make transparent when intensity is low/negative
    d.a = max(0.0, intensity) - (uv.y * uv.y);

    d = clamp(d, 0.0, 1.0);

    gl_FragColor = d;
}