import { Layer, Vector2 } from "../App";

export default function fillRect(params: {
  scale: Vector2;
  layer: Layer;
  position: Vector2;
  color?: string;
}) {
  const { scale, layer, position, color } = params;

  for (let i = 0; i < scale.x; i++) {
    for (let j = 0; j < scale.y; j++) {
      if (color === undefined) {
        if (layer.strayPixels.has(`${position.x + i}_${position.y + j}`)) {
          layer.strayPixels.delete(`${position.x + i}_${position.y + j}`);
        }
      } else {
        layer.strayPixels.set(`${position.x + i}_${position.y + j}`, color);
      }
    }
  }
}
