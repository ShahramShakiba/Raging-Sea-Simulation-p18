//===================================================
/* "It is not an actual project; therefore,
I rely on comments to assess the code." */
//===================================================
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import * as THREE from 'three';

const canvas = document.querySelector('canvas.webgl');
const gui = new GUI();
const scene = new THREE.Scene();

let width = window.innerWidth;
let height = window.innerHeight;

//================== Object - Water ========================
//========== Geometry
const waterGeometry = new THREE.PlaneGeometry(2, 2, 128, 128);

//========== Material
const waterMaterial = new THREE.MeshBasicMaterial();

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

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();
