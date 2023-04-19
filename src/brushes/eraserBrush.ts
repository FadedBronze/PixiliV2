import { getMouseGridPos } from "../App";
import { Brush } from "./brushes";

export type eraserBrushState = {
  scale: number;
};

export const eraserBrush: Brush = {
  name: "eraser",
  down({ state }) {},
  hold({ state }) {
    state.brushLayer.strayPixels.clear();
    const mouseGridPos = getMouseGridPos(
      state.mousePos,
      state.zoom,
      state.viewportPos.value
    );
    state.brushLayer.strayPixels.set(
      `${mouseGridPos.x}_${mouseGridPos.y}`,
      "rgba(255, 255, 255, 0.5)"
    );
    if (
      state.mouseDown &&
      state.editingLayer.strayPixels.has(`${mouseGridPos.x}_${mouseGridPos.y}`)
    ) {
      state.editingLayer.strayPixels.delete(
        `${mouseGridPos.x}_${mouseGridPos.y}`
      );
    }
  },
  up() {},
};
