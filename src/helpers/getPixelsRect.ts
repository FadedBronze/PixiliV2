import { Layer, Vector2 } from "../App";

export default function getPixelsRect(params: {
  scale: Vector2;
  layer: Layer;
  position: Vector2;
}) {
  const { scale, layer, position } = params;

  const pixels = new Map();

  for (let i = 0; i < scale.x; i++) {
    for (let j = 0; j < scale.y; j++) {
      const pixel = layer.pixels.get(`${position.x + i}_${position.y + j}`);

      if (pixel !== undefined) {
        pixels.set(`${i}_${j}`, pixel);
      }
    }
  }

  return pixels;
}
