import { getMouseGridPos } from "../Components/PixiliCanvas";
import { Brush } from "./brushes";

export type pixelBrushState = {
  pixelPerfect: boolean;
  scale: number;
};

export const pixelBrush: Brush = {
  name: "pixel",
  down({ state }) {
    const mouseGridPos = getMouseGridPos(
      state.mousePos,
      state.zoom.value,
      state.viewportPos.value
    );

    state.editingLayer.strayPixels.set(
      `${mouseGridPos.x}_${mouseGridPos.y}`,
      state.color.value
    );
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
