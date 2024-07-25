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
const clock = new THREE.Clock();

//================= Textures =======================
const textureLoader = new THREE.TextureLoader();
const rainTexture = textureLoader.load('./textures/rain.png');

//=================== Fog ==========================
const fogColor = new THREE.Color(debugObj.fogColor);
scene.fog = new THREE.Fog(fogColor, 0.1, 14);
scene.background = fogColor;

//============== Object - Water ====================
//========== Geometry
const waterGeometry = new THREE.PlaneGeometry(30, 30, 364, 364);

//========== Material
const waterMaterial = new THREE.ShaderMaterial({
  vertexShader: waterVertex,
  fragmentShader: waterFragment,
  side: THREE.DoubleSide,

  uniforms: {
    uTime: { value: 0 },

    uBigFrequency: { value: new THREE.Vector2(2, 1.1) },
    uBigWavesElevation: { value: 0.38 },
    uBigWavesSpeed: { value: 1.427 },

    uSmallFrequency: { value: 3.123 },
    uSmallWavesElevation: { value: 0.201 },
    uSmallWavesSpeed: { value: 0.506 },
    uSmallWaveIteration: { value: 4 },

    uNoiseScale: { value: 1.043 },
    uNoiseStrength: { value: 0.275 },

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

//=============== Rain Particles ==================
const rainParticleCount = 4000;
const rainParticles = new THREE.BufferGeometry();
const particlePositions = new Float32Array(rainParticleCount * 3);

for (let i = 0; i < rainParticleCount; i++) {
  const i3 = i * 3;

  //=== initial position
  particlePositions[i3] = (Math.random() - 0.5) * 10; // value: -5 & 5
  particlePositions[i3 + 1] = Math.random() * 10;
  particlePositions[i3 + 2] = (Math.random() - 0.5) * 10;
}

rainParticles.setAttribute(
  'position',
  new THREE.BufferAttribute(particlePositions, 3)
);

const particleMaterial = new THREE.PointsMaterial({
  map: rainTexture,
  color: 0xaaaaaa,
  size: 0.025,
  transparent: true,
  alphaTest: 0.5,
});

const rainSystem = new THREE.Points(rainParticles, particleMaterial);
scene.add(rainSystem);

//=================== Camera =======================
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
camera.position.set(1, 0.7, 3);
scene.add(camera);

//============== Orbit Controls ====================
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

//================== Renderer ======================
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: false,
});
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//============== Resize Listener ===================
let resizeTimeout;

const onWindowResize = () => {
  clearTimeout(resizeTimeout);

  resizeTimeout = setTimeout(() => {
    width = window.innerWidth;
    height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  }, 200);
};

window.addEventListener('resize', onWindowResize);

//=============== Wave Sound ======================
const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
audioLoader.load('./music/Thunderstorm.mp3', (buffer) => {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(0.3);
  sound.play();
});

//================= Animate ======================
//=== Wind speed
const windSpeedX = -0.02;
const windSpeedZ = -0.02;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  //=== Update water material time
  waterMaterial.uniforms.uTime.value = elapsedTime;

  //=== Update particles-rain position
  const positions = rainParticles.attributes.position.array;

  for (let i = 0; i < rainParticleCount; i++) {
    const i3 = i * 3;

    positions[i3 + 1] -= 0.1; // Move rainParticles down
    positions[i3] += windSpeedX;
    positions[i3 + 2] += windSpeedZ;

    // Reset rain position if they hit the ground or go out of bounds
    if (positions[i3 + 1] < 0) {
      // moving the particle back above the ground
      positions[i3 + 1] = Math.random() * 10;
      positions[i3] = (Math.random() - 0.5) * 10;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;
    }
  }
  rainParticles.attributes.position.needsUpdate = true;

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();

//============= Pause and Resume ==================
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

//====== Handle visibility change - tab change
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    pause();
  } else {
    resume();
  }
});

//=============== Destroy Method ===================
const destroy = () => {
  waterGeometry.dispose();

  waterMaterial.dispose();
  particleMaterial.dispose();

  rainTexture.dispose();

  if (sound.isPlaying) {
    sound.stop();
  }

  //=== Remove the mesh
  scene.remove(water);
  scene.remove(rainSystem);

  //=== Remove the audio-listener
  camera.remove(listener);

  //=== Remove the resize event listener
  window.removeEventListener('resize', onWindowResize);

  renderer.dispose();
};

window.addEventListener('beforeunload', destroy);

/************* resizeTimeout
 - Optimize Event Listeners: It waits 200 milliseconds after resizing stops before making the adjustments to avoid excessive updates during resizing. */

/************ animationFrameId
  - is a variable that stores the ID returned by the "requestAnimationFrame" function. This ID is unique for each frame requested and is used to cancel the animation frame request if needed. */

/************* cancelAnimationFrame
 -  is a function that takes the ID of an animation frame request (the one stored in animationFrameId) and cancels it. This stops the callback associated with that request from being called. */

/************ beforeunload
  - is a browser event that is triggered just before a user leaves the page, such as by closing the tab or navigating to a different URL. 
  
  - This event gives developers the opportunity to run cleanup operations or prompt the user with a message before they leave the page. */
