import { Layer, Vector2 } from "../App";
import * as _ from "lodash";

export const fillRect = (params: {
  scale: Vector2;
  layer: Layer;
  position: Vector2;
  color?: string;
}) => {
  const { scale, layer, position, color } = params;

  for (const i of _.range(0, scale.x)) {
    for (const j of _.range(0, scale.y)) {
      if (color === undefined) {
        if (layer.pixels.has(`${position.x + i}_${position.y + j}`)) {
          layer.pixels.delete(`${position.x + i}_${position.y + j}`);
        }
      } else {
        layer.pixels.set(`${position.x + i}_${position.y + j}`, color);
      }
    }
  }
};

export const fillPixel = (params: {
  layer: Layer;
  position: Vector2;
  color?: string;
}) => {
  const { layer, position, color } = params;

  if (color === undefined) {
    if (layer.pixels.has(`${position.x}_${position.y}`)) {
      layer.pixels.delete(`${position.x}_${position.y}`);
    }
  } else {
    layer.pixels.set(`${position.x}_${position.y}`, color);
  }
};

export const renderPixels = (params: {
  layer: Layer;
  selection: Map<string, string>;
  position: Vector2;
}) => {
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
};

export const getPixelsRect = (params: {
  scale: Vector2;
  layer: Layer;
  position: Vector2;
}) => {
  const { scale, layer, position } = params;
  console.log(params);

  const pixels = new Map();

  for (const i of _.range(0, scale.x)) {
    for (const j of _.range(0, scale.y)) {
      const pixel = layer.pixels.get(`${position.x + i}_${position.y + j}`);

      if (pixel !== undefined) {
        pixels.set(`${i}_${j}`, pixel);
      }
    }
  }

  return pixels;
};

export const getPixel = (params: { layer: Layer; position: Vector2 }) => {
  const { layer, position } = params;

  return layer.pixels.get(`${position.x}_${position.y}`);
};

export const clearLayer = (layer: Layer) => {
  layer.pixels.clear();
};
