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
scene.fog = new THREE.Fog(fogColor, 0.1, 10);
scene.background = fogColor;

//================ Object - Water =====================
//========== Geometry
const waterGeometry = new THREE.PlaneGeometry(30, 30, 364, 364);

//========== Material
const waterMaterial = new THREE.ShaderMaterial({
  vertexShader: waterVertex,
  fragmentShader: waterFragment,
  side: THREE.DoubleSide,

  uniforms: {
    uTime: { value: 0 },

    uBigWavesElevation: { value: 0.38 },
    uBigFrequency: { value: new THREE.Vector2(2, 1.1) },
    uBigWavesSpeed: { value: 1.327 },

    uSmallWavesElevation: { value: 0.159 },
    uSmallFrequency: { value: 5.123 },
    uSmallWavesSpeed: { value: 0.706 },
    uSmallWaveIteration: { value: 4 },

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
  antialias: false,
});
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//================ Resize Listener ====================
let resizeTimeout;

function onWindowResize() {
  clearTimeout(resizeTimeout);

  resizeTimeout = setTimeout(() => {
    width = window.innerWidth;
    height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  }, 200);
}

window.addEventListener('resize', onWindowResize);

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

//================= Rain Particles ====================
const particleCount = 7000;
const particles = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3] = (Math.random() - 0.5) * 30; // X position
  particlePositions[i * 3 + 1] = Math.random() * 10; // Y position
  particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 30; // Z position
}

particles.setAttribute(
  'position',
  new THREE.BufferAttribute(particlePositions, 3)
);

// Load the raindrop texture
const textureLoader = new THREE.TextureLoader();
const rainTexture = textureLoader.load('./textures/rain.png');

const particleMaterial = new THREE.PointsMaterial({
  map: rainTexture,
  color: 0xaaaaaa,
  size: 0.025,
  transparent: true,
  alphaTest: 0.5,
});

const particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

//=================== Animate =======================
const clock = new THREE.Clock();

//==== Wind speed
const windSpeedX = -0.02;
const windSpeedZ = -0.02;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  //====== Update water material time
  waterMaterial.uniforms.uTime.value = elapsedTime;

  //====== Update particles-rain position
  const positions = particles.attributes.position.array;

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;

    positions[i3 + 1] -= 0.1; // Move particles down
    positions[i3] += windSpeedX; // Apply wind effect in the x direction
    positions[i3 + 2] += windSpeedZ; // Apply wind effect in the z direction

    // Reset particles position when they reach the ground or move out of bounds
    if (positions[i3 + 1] < 0) {
      positions[i3 + 1] = Math.random() * 5;
      positions[i3] = (Math.random() - 0.5) * 30; // Reset X position
      positions[i3 + 2] = (Math.random() - 0.5) * 30; // Reset Z position
    }
  }
  particles.attributes.position.needsUpdate = true;

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();

//================= Pause and Resume ======================
const pause = () => {
  if (sound.isPlaying) {
    sound.pause();
  }
  if (animationFrameId) {
    window.cancelAnimationFrame(animationFrameId);
  }
};

const resume = () => {
  if (!sound.isPlaying) {
    sound.play();
  }
  tick();
};

// Handle visibility change
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    pause();
  } else {
    resume();
  }
});

//================= Destroy Method ======================
const destroy = () => {
  // Dispose of geometry
  waterGeometry.dispose();

  // Dispose of materials
  waterMaterial.dispose();
  particleMaterial.dispose();

  // Dispose of textures
  rainTexture.dispose();

  // Stop audio
  if (sound.isPlaying) {
    sound.stop();
  }

  // Remove the mesh from the scene
  scene.remove(water);
  scene.remove(particleSystem);

  // Remove the audio listener from the camera
  camera.remove(listener);

  // Remove the resize event listener
  window.removeEventListener('resize', onWindowResize);

  // Dispose of renderer
  renderer.dispose();
};

// Attach destroy method to beforeunload event
window.addEventListener('beforeunload', destroy);

/********** resizeTimeout
 - Optimize Event Listeners: Debounce or throttle resize and other event listeners to prevent excessive calls. */
