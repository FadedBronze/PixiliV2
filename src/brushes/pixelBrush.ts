import { clearLayer, fillRect } from "../helpers/fillMethods";
import { getMouseGridPos } from "../helpers/getMouseGridPos";
import { Brush } from "./brushes";

export type pixelBrushState = {
  pixelPerfect: boolean;
  scale: number;
};

export const pixelBrush: Brush = {
  name: "pixelBrush",
  down({ state, brushState }) {
    brushState.brushes.pixel.scale;

    const mouseGridPos = getMouseGridPos(
      state.mousePos,
      state.zoom.value,
      state.viewportPos.value
    );

    fillRect({
      scale: {
        x: brushState.brushes.pixel.scale,
        y: brushState.brushes.pixel.scale,
      },
      layer: state.editingLayer,
      color: state.color.value,
      position: mouseGridPos,
    });
  },
  hold({ state, brushState }) {
    clearLayer(state.brushLayer);
    const mouseGridPos = getMouseGridPos(
      state.mousePos,
      state.zoom.value,
      state.viewportPos.value
    );

    fillRect({
      scale: {
        x: brushState.brushes.pixel.scale,
        y: brushState.brushes.pixel.scale,
      },
      layer: state.brushLayer,
      color: state.color.value,
      position: mouseGridPos,
    });

    if (state.mouseDown) {
      fillRect({
        scale: {
          x: brushState.brushes.pixel.scale,
          y: brushState.brushes.pixel.scale,
        },
        layer: state.editingLayer,
        color: state.color.value,
        position: mouseGridPos,
      });
    }
  },
  up() {},
};
