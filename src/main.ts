import { initScene, renderer, camera, scene, controls } from './scene';
import { initGlobes } from './globe';
import { initUI } from './ui';

initScene();
initGlobes();
initUI();
onWindowResize();
animate();

window.addEventListener('resize', onWindowResize, false);

function onWindowResize(): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(): void {
  camera.lookAt(scene.position);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
