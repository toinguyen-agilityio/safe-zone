import {
  AmbientLight,
  BoxGeometry,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';

const container = document.getElementById('app');
if (!container) {
  throw new Error('Missing #app container');
}

const scene = new Scene();
const camera = new PerspectiveCamera(60, 1, 0.1, 100);
camera.position.z = 3;

const renderer = new WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

scene.add(new AmbientLight(0xffffff, 0.5));
const light = new DirectionalLight(0xffffff, 2);
light.position.set(2, 3, 4);
scene.add(light);

const box = new Mesh(new BoxGeometry(1, 1, 1), new MeshStandardMaterial({ color: 0x4488ff }));
scene.add(box);

function resize(): void {
  const { clientWidth: w, clientHeight: h } = container!;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

renderer.setAnimationLoop((time: number) => {
  box.rotation.x = time / 2000;
  box.rotation.y = time / 1000;
  renderer.render(scene, camera);
});
