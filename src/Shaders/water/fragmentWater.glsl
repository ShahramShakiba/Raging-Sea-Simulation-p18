varying float vElevation;

void main() {

  gl_FragColor = vec4(0.2, 0.55, 1.0, 1.0);
  gl_FragColor.rgb *= vElevation * 5.5;

  #include <colorspace_fragment>;
}


/******* #include <colorspace_fragment>;
- In the latest versions of Three.js, we need to output the colors in sRGB color space. */