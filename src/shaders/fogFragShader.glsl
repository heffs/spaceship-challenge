#include "includes/noise.glsl"
// Convert depth buffer value (0-1) to linear view-space depth for perspective projection
// This is the standard formula for perspective depth conversion
float perspectiveDepthToViewZ(const in float depth, const in float near, const in float far) {
    // Depth buffer stores values where 0 = near, 1 = far
    // Convert to NDC z (ranges from -1 to 1)
    float ndcZ = depth * 2.0 - 1.0;
    // Convert NDC z to view-space z
    return (2.0 * near * far) / (far + near - ndcZ * (far - near));
}

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
    // DEBUG: Uncomment to visualize raw depth value
    // If this shows uniform color, depth isn't being passed correctly
    // outputColor = vec4(depth, depth, depth, 1.0);
    // return;
    
    // Convert depth buffer value to linear view-space depth
    float viewZ = perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
    
    // Convert to positive distance (camera looks down -Z, so viewZ is negative)
    float linearDepth = abs(viewZ);
    
    // Normalize to 0-1 range for fog calculation
    // Adjust the divisor to control fog distance (e.g., use cameraFar or a custom fog distance)
    float fogDistance = cameraFar * 0.25; // Fog starts appearing at 30% of far plane
    float normalizedDepth = clamp(linearDepth / fogDistance, 0.0, 1.0);
    
    // Calculate fog amount (more fog as distance increases)
    // float fog = smoothstep(0.0, 1.0, normalizedDepth) * (noise(vec2(linearDepth * 0.01, linearDepth * 0.01 + time * 0.01)) * 0.5 + 0.5);
    float fog = smoothstep(0.0, 1.0, normalizedDepth);
    
    // DEBUG: Uncomment to visualize linear depth
    // outputColor = vec4(normalizedDepth, normalizedDepth, normalizedDepth, 1.0);
    // return;
    
    // Apply fog (mix between original color and fog color)
    vec3 fogColor = vec3(0.92, 0.69, 0.55); // Light gray-blue fog
    outputColor = mix(inputColor, vec4(fogColor, 1.0), fog);
}