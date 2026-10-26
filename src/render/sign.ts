import { CanvasTexture, DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three';

export interface SignOptions {
  text: string;
  width: number;
  height: number;
  background: string;
  foreground: string;
}

/**
 * A flat sign showing text. The text is drawn on a canvas when a document exists; without one
 * (unit tests in Node) the sign is a plain colored plane and the text stays in `userData.text`.
 */
export function createSign(options: SignOptions): Mesh {
  const { text, width, height, background, foreground } = options;
  const material = new MeshBasicMaterial({ color: background, side: DoubleSide });

  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = Math.max(64, Math.round((512 * height) / width));
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = foreground;
      context.font = `bold ${Math.round(canvas.height * 0.62)}px sans-serif`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text, canvas.width / 2, canvas.height / 2);
      material.map = new CanvasTexture(canvas);
      material.color.set(0xffffff);
    }
  }

  const sign = new Mesh(new PlaneGeometry(width, height), material);
  sign.name = 'sign';
  sign.userData.text = text;
  return sign;
}
