import { AmbientLight, BoxGeometry, DirectionalLight, Mesh, MeshStandardMaterial } from 'three';
import { Game } from './game';

const container = document.getElementById('app');
if (!container) {
  throw new Error('Missing #app container');
}

const game = new Game(container);
game.camera.position.z = 3;

game.scene.add(new AmbientLight(0xffffff, 0.5));
const light = new DirectionalLight(0xffffff, 2);
light.position.set(2, 3, 4);
game.scene.add(light);

const box = new Mesh(new BoxGeometry(1, 1, 1), new MeshStandardMaterial({ color: 0x4488ff }));
game.scene.add(box);

game.addUpdate((dt) => {
  box.rotation.x += dt / 2;
  box.rotation.y += dt;
});

game.start();
