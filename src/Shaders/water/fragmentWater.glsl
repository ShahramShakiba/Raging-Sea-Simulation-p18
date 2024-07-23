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





/********** #include <colorspace_fragment>;
- In the latest versions of Three.js, we need to output the colors in sRGB color space. */

/********** mix()
mix(value1, value2, value3)
   if value3 = 0 -> mix will be value1
   if value3 = 1 -> mix will be value2
   if value3 = 0.5 -> mix will be a range between value1 and value2 */
