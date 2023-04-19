import { getMouseGridPos } from "../App";
import { Brush } from "./brushes";

export const pixelBrush: Brush = {
  down({ state }) {},
  hold({ state }) {
    state.brushLayer.strayPixels.clear();
    const mouseGridPos = getMouseGridPos(
      state.mousePos,
      state.zoom,
      state.viewportPos
    );
    state.brushLayer.strayPixels.set(
      `${mouseGridPos.x}_${mouseGridPos.y}`,
      state.color.value
    );
    if (state.mouseDown) {
      state.editingLayer.strayPixels.set(
        `${mouseGridPos.x}_${mouseGridPos.y}`,
        state.color.value
      );
    }
  },
  up() {},
};
