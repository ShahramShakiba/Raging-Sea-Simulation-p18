uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

uniform vec3 fogColor; 
uniform float fogNear; 
uniform float fogFar;

varying float vElevation;

void main() {
    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);

    //====== Apply fog
    float fogFactor = 
        smoothstep(fogNear, fogFar, gl_FragCoord.z / gl_FragCoord.w);

    color = mix(color, fogColor, fogFactor);

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>;
}





/* *************  mixStrength
  - is created to control how much of the depth-color and surface-color should be mixed together to get the final color of the water at a specific point.
  
  - The mixing helps create a gradient effect where the color changes smoothly from the depth color to the surface color based on the elevation. */


/* *************  vElevation, uColorOffset, uColorMultiplier
  - vElevation: Represents the elevation (height) of a point on the surface.

  - uColorOffset: An offset is a value that shifts a "starting point". In this case, uColorOffset adjusts the starting point of the mix strength calculation. 
  
  - uColorMultiplier: Scales the influence of the elevation. 
  
  
  ? vElevation + uColorOffset
    - The addition shifts the vElevation values by a constant amount (uColorOffset)
    - This allows you to move the entire range of elevation values up or down, effectively changing the __starting point of the blend__.
  
  ? (vElevation + uColorOffset) * uColorMultiplier
    - The multiplication scales the adjusted elevation values by a factor (uColorMultiplier).
    - This controls how much influence the elevation (now shifted by the offset) has on the final mix strength.


    * If we scaled before adding the offset, the offset would not uniformly shift the starting-point for all elevation values, and it could lead to unintended blending behavior.
*/


/* ************* mix()
mix(value1, value2, value3)
   if value3 = 0 -> mix will be value1
   if value3 = 1 -> mix will be value2
   if value3 = 0.5 -> mix will be a range between value1 and value2 
   
   If mixStrength is 0, the color is fully uDepthColor.
   If mixStrength is 1, the color is fully uSurfaceColor.
   Values between 0 and 1 result in a blend of the two colors. */


/* *************  fogFactor 
  - This mechanism ensures a gradual and realistic transition of fog based on distance.

  ? gl_FragCoord.z / gl_FragCoord.w
    - is a built-in GLSL variable that contains the window-relative coordinates of the fragment.
    - computes the normalized depth value of the fragment, ranging from 0.0 (near plane) to 1.0 (far plane).

  ? gl_FragCoord.z :
    - is the depth of the fragment in window coordinates.
  ? gl_FragCoord.w :
    - is the clip space w coordinate, used here to normalize the depth value.


  ? smoothstep(edge0, edge1, x) :
    - This is a GLSL function that performs smooth Hermite interpolation.

    - "edge0" and "edge1" are the start and end points of the interpolation range.

    - x is the value to be interpolated.

    - smoothstep returns 0.0 if x is less than edge0, 1.0 if x is greater than edge1, and smoothly interpolates between 0.0 and 1.0 if x is between edge0 and edge1. 
*/


/* ************* #include <colorspace_fragment>;
- In the latest versions of Three.js, we need to output the colors in sRGB color space.

- In GLSL shaders, the directive #include <colorspace_fragment> is used to include predefined or custom shader code that handles color space conversions or other related operations. 

- This inclusion helps in managing the color-outputs of the shader to ensure they are rendered correctly on the screen. */