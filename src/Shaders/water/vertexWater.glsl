//======== Import the perlin noise fn
#include "perlinNoise.glsl"

uniform vec2 uBigFrequency;
uniform float uBigWavesElevation;
uniform float uTime;
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
        smallWaveElevation += 
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





/* ****************  Elevation (height)
- Controls the height of the waves.
- To create a dynamic wave effect on the water surface. */


/* ****************  Frequency
- Controls the number of waves across the surface.
- Sets the frequency of the waves in x and z directions.

* For example:  
  ? modelPosition.x * uBigFrequency.x
  - This term varies the wave pattern along the x-axis 

  ? - uTime * uBigWavesSpeed
  - This term animates the wave over time 

  ? sin(...x...) * sin(...z...)
  - This results in a combination of waves intersecting in both the x and z directions.

  ? uBigWavesElevation
  - The final product of the sine functions is multiplied by this to scale the wave height. */


/* ****************  for (float i = 1.0; i <= uSmallWaveIteration; i++){}
  - Starting i from 1.0 ensures no division by zero and creates a series of wave layers with progressively smaller influences, adding complexity to the wave pattern in a stable and natural way. */


/* ****************  smallWaveElevation -= or +=
  - -= : Accumulates the small wave effect by "reducing" the height slightly in each iteration.
  - += : This line adds the calculated height for each small wave iteration to the total smallWaveElevation. */


/* ****************  abs(...)
  - Ensures all wave heights are positive, contributing to the overall elevation. */


/* ****************  cnoise(vec3(...))
  - Generates smooth, natural-looking variations for the wave pattern. */


/* ** vec3(modelPosition.xz * uSmallFrequency * i, uTime * uSmallWavesSpeed)
  - The 3D vector ensures the noise function produces varying values over the surface and over time.

  * modelPosition.xz * uSmallFrequency * i: 
    - This expression scales the model's x and z coordinates by the frequency and iteration number to create different wave patterns at each iteration.

    - It adjusts the x and z positions to create varying wave patterns, making each wave layer unique. it's a vec2. */


/* ****************  uSmallWavesElevation / i
  * uSmallWavesElevation: 
    - A value that determines how high the small waves can be.

  * / i: 
    - Divides this wave height by the current iteration number.

  - Ensures that each layer of small waves contributes less to the overall wave pattern, making the surface look more natural and detailed.

  - It reduces the height of each wave layer as the number of layers (iterations) increases, creating a natural and detailed wave pattern. */
