//===================================================
/* "It is not an actual project; therefore,
I rely on comments to assess the code." */
//===================================================
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import * as THREE from 'three';
import waterVertex from './Shaders/water/vertexWater.glsl';
import waterFragment from './Shaders/water/fragmentWater.glsl';

const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
const gui = new GUI();
const debugObj = {};

let width = window.innerWidth;
let height = window.innerHeight;

//================== Object - Water ========================
//========== Geometry
const waterGeometry = new THREE.PlaneGeometry(2, 2, 512, 512);

//=== Color
debugObj.depthColor = '#186691';
debugObj.surfaceColor = '#9bd8ff';

//========== Material
const waterMaterial = new THREE.ShaderMaterial({
  vertexShader: waterVertex,
  fragmentShader: waterFragment,
  side: THREE.DoubleSide,

  uniforms: {
    uTime: { value: 0 },

    uBigWavesElevation: { value: 0.2 },
    uBigFrequency: { value: new THREE.Vector2(4, 1.5) },
    uBigWavesSpeed: { value: 0.75 },

    uSmallWavesElevation: { value: 0.15 },
    uSmallFrequency: { value: 3 },
    uSmallWavesSpeed: { value: 0.2 },
    uSmallWaveIteration: { value: 4 },

    uDepthColor: { value: new THREE.Color(debugObj.depthColor) },
    uSurfaceColor: { value: new THREE.Color(debugObj.surfaceColor) },
    uColorOffset: { value: 0.08 },
    uColorMultiplier: { value: 5 },
  },
});

//============= Debug GUI
//=== Big Wave
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

//=== Small Wave
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

//=== Color
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

//========== Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI * 0.5;
scene.add(water);

//===================== Camera =========================
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
camera.position.set(1, 1, 1);
scene.add(camera);

//================ Orbit Controls ======================
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

//==================== Renderer ========================
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//================ Resize Listener ====================
window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

//=================== Animate =======================
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  waterMaterial.uniforms.uTime.value = elapsedTime;

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();
