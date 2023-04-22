import { clearLayer, fillRect } from "../helpers/fillMethods";
import { getMouseGridPos } from "../helpers/getMouseGridPos";
import { Brush } from "./brushes";

export type eraserBrushState = {
  scale: number;
};

export const eraserBrush: Brush = {
  name: "eraserBrush",
  down({ state }) {},
  hold({ state, brushState }) {
    clearLayer(state.brushLayer);
    const mouseGridPos = getMouseGridPos(
      state.mousePos,
      state.zoom.value,
      state.viewportPos.value
    );
    fillRect({
      scale: {
        x: brushState.brushes.eraser.scale,
        y: brushState.brushes.eraser.scale,
      },
      layer: state.brushLayer,
      position: mouseGridPos,
      color: "rgba(255, 255, 255, 0.5)",
    });

    if (state.mouseDown) {
      fillRect({
        scale: {
          x: brushState.brushes.eraser.scale,
          y: brushState.brushes.eraser.scale,
        },
        layer: state.editingLayer,
        position: mouseGridPos,
      });
    }
  },
  up() {},
};
