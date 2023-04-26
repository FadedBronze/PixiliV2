import { Layer } from "../App";

export default function mergeLayers(...layers: Layer[]) {
  let pixels = new Map<string, string>();
  const pixelsHistory: Layer["pixelsHistory"] = [];

  for (const layer of layers) {
    if (layer.name === "brush") continue;
    pixels = new Map(mergeTwoLayers(new Map(layer.pixels), new Map(pixels)));
  }

  const result: Layer = {
    name: layers[0].name,
    pixels,
    pixelsHistory,
  };

  return result;
}

function mergeTwoLayers(
  layer1: Map<string, string>,
  layer2: Map<string, string>
) {
  for (const [position, color] of layer1) {
    layer2.delete(position);
    layer2.set(position, color);
  }

  return layer2;
}
