import GUI from 'lil-gui';

const debugObj = {
  depthColor: '#10222d',
  surfaceColor: '#04151f',
  fogColor: '#4f4d4a', 
};

const debugGUI = (waterMaterial, scene, THREE) => {
  const gui = new GUI().title('Raging Sea');

 //====== Fog Color
 gui
 .addColor(debugObj, 'fogColor')
 .name('Fog Color')
 .onChange(() => {
   const color = new THREE.Color(debugObj.fogColor);
   scene.fog.color.set(color);
   scene.background = color;
   waterMaterial.uniforms.fogColor.value.set(color);
 });

  //====== Big Waves
  gui
    .add(waterMaterial.uniforms.uBigWavesElevation, 'value', 0, 1, 0.001)
    .name('Big Wave Elevation');
  gui
    .add(waterMaterial.uniforms.uBigFrequency.value, 'x', 0, 20, 0.001)
    .name('Big Wave Frequency-X');
  gui
    .add(waterMaterial.uniforms.uBigFrequency.value, 'y', 0, 20, 0.001)
    .name('Big Wave Frequency-Y');
  gui
    .add(waterMaterial.uniforms.uBigWavesSpeed, 'value', 0, 10, 0.001)
    .name('Big Wave Speed');

  //====== Small Waves
  gui
    .add(waterMaterial.uniforms.uSmallWavesElevation, 'value', 0, 1, 0.001)
    .name('Small Wave Elevation');
  gui
    .add(waterMaterial.uniforms.uSmallFrequency, 'value', 0, 30, 0.001)
    .name('Small Wave Frequency');
  gui
    .add(waterMaterial.uniforms.uSmallWavesSpeed, 'value', 0, 4, 0.001)
    .name('Small Wave Speed');
  gui
    .add(waterMaterial.uniforms.uSmallWaveIteration, 'value', 0, 5, 1)
    .name('Small Wave Iteration');

  //====== Color
  gui
    .addColor(debugObj, 'depthColor')
    .name('Depth Color')
    .onChange(() => {
      waterMaterial.uniforms.uDepthColor.value.set(debugObj.depthColor);
    });
  gui
    .addColor(debugObj, 'surfaceColor')
    .name('Surface Color')
    .onChange(() => {
      waterMaterial.uniforms.uSurfaceColor.value.set(debugObj.surfaceColor);
    });
  gui
    .add(waterMaterial.uniforms.uColorOffset, 'value', 0, 1, 0.001)
    .name('Color Offset');
  gui
    .add(waterMaterial.uniforms.uColorMultiplier, 'value', 0, 10, 0.001)
    .name('Color Multiplier');

  return gui;
};

export { debugGUI, debugObj };
