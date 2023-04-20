import { getMouseGridPos } from "../Components/PixiliCanvas";
import { Brush } from "./brushes";

export const fillBrush: Brush = {
  name: "fill",
  down({ state }) {
    const gridPos = getMouseGridPos(
      state.mousePos,
      state.zoom.value,
      state.viewportPos.value
    );
    const strayPixels = state.editingLayer.strayPixels;

    const replacingColor = strayPixels.get(`${gridPos.x}_${gridPos.y}`);

    if (replacingColor === undefined) return;

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
    state.brushLayer.strayPixels.clear();
    const mouseGridPos = getMouseGridPos(
      state.mousePos,
      state.zoom.value,
      state.viewportPos.value
    );
    state.brushLayer.strayPixels.set(
      `${mouseGridPos.x}_${mouseGridPos.y}`,
      "rgba(255, 255, 255, 0.5)"
    );
  },
  up({ state }) {},
};
