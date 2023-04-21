import { getMouseGridPos } from "../Components/PixiliCanvas";
import { Brush } from "./brushes";

export const fillBrush: Brush = {
  name: "fillBrush",
  down({ state }) {
    const gridPos = getMouseGridPos(
      state.mousePos,
      state.zoom.value,
      state.viewportPos.value
    );
    const strayPixels = state.editingLayer.pixels;

    const replacingColor = strayPixels.get(`${gridPos.x}_${gridPos.y}`);

    if (replacingColor === undefined) {
      state.backgroundColor.value = state.color.value;
      return;
    }

    const floodFill = (x: number, y: number) => {
      if (strayPixels.get(`${x}_${y}`) !== replacingColor) return;

      strayPixels.set(`${x}_${y}`, state.color.value);

      floodFill(x + 1, y);
      floodFill(x - 1, y);
      floodFill(x, y + 1);
      floodFill(x, y - 1);
    };

    floodFill(gridPos.x, gridPos.y);
  },
  hold({ state }) {
    state.brushLayer.pixels.clear();
    const mouseGridPos = getMouseGridPos(
      state.mousePos,
      state.zoom.value,
      state.viewportPos.value
    );
    state.brushLayer.pixels.set(
      `${mouseGridPos.x}_${mouseGridPos.y}`,
      "rgba(255, 255, 255, 0.5)"
    );
  },
  up({ state }) {},
};
