import { Mesh, type Sprite } from 'three';
import { describe, expect, it } from 'vitest';
import { createBot } from '../entities/bot';
import { buildBotModel, updateBotModel } from './bot-model';

/** A canvas that records the text drawn on it, since tests run without a browser. */
function fakeCanvas() {
  const drawn: string[] = [];
  const g = {
    fillStyle: '',
    font: '',
    textAlign: '',
    textBaseline: '',
    fillRect: () => undefined,
    fillText: (text: string) => drawn.push(text),
  };
  const canvas = { width: 0, height: 0, getContext: () => g } as unknown as HTMLCanvasElement;
  return { canvas, drawn };
}

const make = (name = 'Anh Ba Xe Ôm') => {
  const { canvas, drawn } = fakeCanvas();
  const bot = createBot(0, name, 10, -20);
  return { bot, drawn, model: buildBotModel(bot, () => canvas) };
};

describe('buildBotModel', () => {
  it('has a body, a head and a conical hat', () => {
    const { model } = make();
    for (const name of ['bot-body', 'bot-head', 'bot-hat']) {
      expect(model.getObjectByName(name)).toBeInstanceOf(Mesh);
    }
    const hat = model.getObjectByName('bot-hat') as Mesh;
    expect(hat.geometry.type).toBe('ConeGeometry');
    const head = model.getObjectByName('bot-head') as Mesh;
    expect(hat.position.y).toBeGreaterThan(head.position.y);
  });

  it('shows the bot name, in Vietnamese, on a label above its head', () => {
    const { model, drawn } = make('Cô Năm Mì Quảng');
    const label = model.getObjectByName('bot-label') as Sprite;
    expect(label.userData.text).toBe('Cô Năm Mì Quảng');
    expect(drawn).toEqual(['Cô Năm Mì Quảng']);
    expect(label.position.y).toBeGreaterThan(2);
  });

  it('has a parachute', () => {
    expect(make().model.getObjectByName('canopy')).toBeDefined();
  });
});

describe('updateBotModel', () => {
  it('places the model at the bot and turns it the way it faces', () => {
    const { bot, model } = make();
    bot.yaw = 1.2;
    bot.feetY = 30;
    updateBotModel(model, bot);
    expect(model.position.toArray()).toEqual([10, 30, -20]);
    expect(model.rotation.y).toBe(1.2);
  });

  it('shows the parachute while falling and hides it after landing', () => {
    const { bot, model } = make();
    const canopy = model.getObjectByName('canopy')!;
    updateBotModel(model, bot);
    expect(canopy.visible).toBe(true);
    bot.parachuting = false;
    updateBotModel(model, bot);
    expect(canopy.visible).toBe(false);
  });

  it('hides a dead bot', () => {
    const { bot, model } = make();
    bot.health.damage(500, 'flood');
    updateBotModel(model, bot);
    expect(model.visible).toBe(false);
  });
});
