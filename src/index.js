//===================================================
/* "It is not an actual project; therefore,
I rely on comments to assess the code." */
//===================================================
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';
import waterVertex from './Shaders/water/vertexWater.glsl';
import waterFragment from './Shaders/water/fragmentWater.glsl';
import { debugGUI, debugObj } from './debugGUI';

const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();

let width = window.innerWidth;
let height = window.innerHeight;

//==================== Fog ============================
const fogColor = new THREE.Color(debugObj.fogColor);
scene.fog = new THREE.Fog(fogColor, 0.1, 8);
scene.background = fogColor;

//================ Object - Water =====================
//========== Geometry
const waterGeometry = new THREE.PlaneGeometry(30, 30, 720, 720);

//========== Material
const waterMaterial = new THREE.ShaderMaterial({
  vertexShader: waterVertex,
  fragmentShader: waterFragment,
  side: THREE.DoubleSide,

  uniforms: {
    uTime: { value: 0 },

    uBigWavesElevation: { value: 0.35 },
    uBigFrequency: { value: new THREE.Vector2(2, 1.1) },
    uBigWavesSpeed: { value: 1.327 },

    uSmallWavesElevation: { value: 0.159 },
    uSmallFrequency: { value: 3.885 },
    uSmallWavesSpeed: { value: 0.606 },
    uSmallWaveIteration: { value: 5 },

    uDepthColor: { value: new THREE.Color(debugObj.depthColor) },
    uSurfaceColor: { value: new THREE.Color(debugObj.surfaceColor) },
    uColorOffset: { value: 0.236 },
    uColorMultiplier: { value: 4.1 },

    fogColor: { value: fogColor },
    fogNear: { value: scene.fog.near },
    fogFar: { value: scene.fog.far },
  },
});

//=== Debug GUI
debugGUI(waterMaterial, scene, THREE);

//========== Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI * 0.5;
scene.add(water);

//===================== Camera =========================
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
camera.position.set(1, 0.7, 3);
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

//================= Wave Sound ======================
const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
audioLoader.load('./music/Thunderstorm.mp3', (buffer) => {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(0.5);
  sound.play();
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
