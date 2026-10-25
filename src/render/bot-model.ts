import {
  BoxGeometry,
  CanvasTexture,
  ConeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
} from 'three';
import { config } from '../config';
import type { Bot } from '../entities/bot';
import { buildCanopy } from './parachute';

const SKIN = 0xe0b48a;
const SHIRT_COLORS = [0x2f7d5b, 0xc2552f, 0x2b5f9e, 0xb8963a, 0x7a3f8f];
const PANTS = 0x3a3a46;
const HAT = 0xe9d9a0;
const LABEL_HEIGHT = 2.5;
/** How far above the feet the canopy hangs: the eye height plus the canopy's own drop. */
const CANOPY_OFFSET = config.player.eyeHeight + 6.5;

type CanvasFactory = () => HTMLCanvasElement;

const part = (mesh: Mesh, name: string, x: number, y: number, z = 0): Mesh => {
  mesh.name = name;
  mesh.position.set(x, y, z);
  return mesh;
};

/** The bot's name as white text on a dark pill, drawn on a canvas. */
function buildLabel(name: string, makeCanvas: CanvasFactory): Sprite {
  const canvas = makeCanvas();
  canvas.width = 256;
  canvas.height = 48;
  const g = canvas.getContext('2d');
  if (g) {
    g.fillStyle = 'rgba(0, 0, 0, 0.55)';
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.fillStyle = '#ffffff';
    g.font = '24px system-ui, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(name, canvas.width / 2, canvas.height / 2, canvas.width - 12);
  }
  const label = new Sprite(
    new SpriteMaterial({ map: new CanvasTexture(canvas), transparent: true, depthTest: false }),
  );
  label.name = 'bot-label';
  label.userData.text = name;
  label.scale.set(2.4, 0.45, 1);
  label.position.y = LABEL_HEIGHT;
  return label;
}

/**
 * A simple bot: a body in a coloured shirt, legs, a head, a conical hat (nón lá), a name label
 * and the parachute. Its origin is at the feet. `updateBotModel` places it and toggles the canopy.
 */
export function buildBotModel(
  bot: Bot,
  makeCanvas: CanvasFactory = () => document.createElement('canvas'),
): Group {
  const model = new Group();
  model.name = bot.id;
  const shirt = SHIRT_COLORS[Number(bot.id.replace(/\D/g, '')) % SHIRT_COLORS.length]!;

  model.add(
    part(
      new Mesh(new BoxGeometry(0.6, 0.75, 0.35), new MeshStandardMaterial({ color: shirt })),
      'bot-body',
      0,
      1.12,
    ),
    part(
      new Mesh(new BoxGeometry(0.5, 0.75, 0.3), new MeshStandardMaterial({ color: PANTS })),
      'bot-legs',
      0,
      0.375,
    ),
    part(
      new Mesh(new SphereGeometry(0.2, 12, 8), new MeshStandardMaterial({ color: SKIN })),
      'bot-head',
      0,
      1.72,
    ),
    part(
      new Mesh(
        new ConeGeometry(0.45, 0.25, 16),
        new MeshStandardMaterial({ color: HAT, roughness: 0.9 }),
      ),
      'bot-hat',
      0,
      1.98,
    ),
  );

  const canopy = buildCanopy();
  canopy.position.y = CANOPY_OFFSET;
  model.add(canopy);
  model.add(buildLabel(bot.name, makeCanvas));
  return model;
}

/** Put the model where the bot is, facing the way it faces; the canopy shows only while it falls. */
export function updateBotModel(model: Group, bot: Bot): void {
  model.position.set(bot.x, bot.feetY, bot.z);
  model.rotation.y = bot.yaw;
  const canopy = model.getObjectByName('canopy');
  if (canopy) canopy.visible = bot.parachuting;
  model.visible = !bot.health.dead;
}
