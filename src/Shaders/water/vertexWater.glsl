//======== Import the perlin noise fn
#include "perlinNoise.glsl"

uniform float uTime;
uniform float uBigWavesElevation;
uniform vec2 uBigFrequency;
uniform float uBigWavesSpeed;
uniform float uSmallWavesElevation;
uniform float uSmallFrequency;
uniform float uSmallWavesSpeed;
uniform float uSmallWaveIteration;
uniform float uNoiseScale; 
uniform float uNoiseStrength; 

varying float vElevation;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float bigWaveElevation = 
        sin(modelPosition.x * uBigFrequency.x + uTime * uBigWavesSpeed) * 
        sin(modelPosition.z * uBigFrequency.y + uTime * uBigWavesSpeed) * uBigWavesElevation;

    float smallWaveElevation = 0.0;
    for (float i = 1.0; i <= uSmallWaveIteration; i++) {
        smallWaveElevation -= 
          abs(
            cnoise(
              vec3(
                modelPosition.xz * uSmallFrequency * i, uTime * uSmallWavesSpeed
              )
            )
          ) * uSmallWavesElevation / i;
    }

    //===== Add Perlin noise for more randomness
    float noise = 
      cnoise(
        vec3(
          modelPosition.xz * uNoiseScale, uTime * 0.1
          )
      ) * uNoiseStrength;

    float elevation = bigWaveElevation + smallWaveElevation + noise;

    modelPosition.y += elevation;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    
    vElevation = elevation;

    gl_Position = projectionPosition;
}




/********** cnoise(vec3(modelPosition.xz * 3.0, uTime / 2.0)) * 0.15;
1. modelPosition.xz * 3.0 * i = control frequency of the wave

2. i, uTime / 2.0 = control speed

1. * 0.15 = wave is too high, that's why we multiply it with a smaller number
            control the elevation

2. abs() = realistic waves have rounded troughs and high crests */