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
const gui = new GUI();
const scene = new THREE.Scene();

let width = window.innerWidth;
let height = window.innerHeight;

//================== Object - Water ========================
//========== Geometry
const waterGeometry = new THREE.PlaneGeometry(2, 2, 128, 128);

const count = waterGeometry.attributes.position.count;
const randoms = new Float32Array(count);

for (let i = 0; i < count; i++) {
  randoms[i] = Math.random();
}

waterGeometry.setAttribute('wRandom', new THREE.BufferAttribute(randoms, 1));

//========== Material
const waterMaterial = new THREE.ShaderMaterial({
  vertexShader: waterVertex,
  fragmentShader: waterFragment,
  side: THREE.DoubleSide,

  uniforms: {
    uWaveElevation: { value: 0.2 },
    uFrequency: { value: new THREE.Vector2(5, 10) },
    uTime: { value: 0 },
    uWaveSpeed: { value: 0.75 },
  },
});

//====== Debug GUI
gui
  .add(waterMaterial.uniforms.uWaveElevation, 'value', 0, 1, 0.001)
  .name('Wave Elevation');
  gui
  .add(waterMaterial.uniforms.uFrequency.value, 'x', 0, 20, 0.001)
  .name('Wave Frequency-X');
  gui
  .add(waterMaterial.uniforms.uFrequency.value, 'y', 0, 20, 0.001)
  .name('Wave Frequency-Y');
  gui
    .add(waterMaterial.uniforms.uWaveSpeed, 'value', 0, 10, 0.001)
    .name('Wave Speed');

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
