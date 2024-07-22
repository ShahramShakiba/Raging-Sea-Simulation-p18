uniform float uWaveElevation;
uniform vec2 uFrequency;
uniform float uTime;

attribute float wRandom;

varying float vElevation;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  float elevation = 
    sin(modelPosition.x * uFrequency.x + uTime) *
    sin(modelPosition.z * uFrequency.y + uTime) *
    uWaveElevation;

  modelPosition.y += elevation;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  vElevation = elevation;
}