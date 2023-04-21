import { Layer, Vector2 } from "../App";

export default function renderPixels(params: {
  layer: Layer;
  selection: Map<string, string>;
  position: Vector2;
}) {
  const { layer, selection, position } = params;

  for (const [pixelPosition, color] of selection) {
    const gridPosition = {
      x: parseInt(pixelPosition.split("_")[0], 10),
      y: parseInt(pixelPosition.split("_")[1], 10),
    };

    layer.pixels.set(
      `${gridPosition.x + position.x}_${gridPosition.y + position.y}`,
      color
    );
  }
}
