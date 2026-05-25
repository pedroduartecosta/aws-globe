import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  PointLight,
  Fog,
  Color,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export let renderer!: WebGLRenderer;
export let camera!: PerspectiveCamera;
export let scene!: Scene;
export let controls!: OrbitControls;

export function initScene(): void {
  renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene = new Scene();
  scene.add(new AmbientLight(0xbbbbbb, Math.PI));
  scene.background = new Color(0x191b20);

  camera = new PerspectiveCamera();
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  const dLight = new DirectionalLight(0xd4dada, 2.5 * Math.PI);
  dLight.position.set(-800, 2000, 400);
  camera.add(dLight);

  const dLight1 = new DirectionalLight(0xd4dada, 0.1 * Math.PI);
  dLight1.position.set(-200, 500, 200);
  camera.add(dLight1);

  const dLight2 = new PointLight(0xd4dada, 1 * Math.PI);
  dLight2.position.set(-200, 500, 200);
  camera.add(dLight2);

  camera.position.z = 300;
  camera.position.x = 0;
  camera.position.y = 150;

  scene.add(camera);
  scene.fog = new Fog(0x535ef3, 400, 2000);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.01;
  controls.enablePan = false;
  controls.minDistance = 170;
  controls.maxDistance = 500;
  controls.rotateSpeed = 0.8;
  controls.zoomSpeed = 0.5;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.05;
}
