import _ from "lodash";
import { clearLayer, fillLine, fillPixel } from "../helpers/fillMethods";
import { getMouseGridPos } from "../helpers/getMouseGridPos";
import { Brush } from "./brushes";

export type lineState = undefined;

export const lineBrush: Brush = {
  name: "line",
  down({ state }) {
    state.lineStart = getMouseGridPos(
      state.mousePos,
      state.zoom.value,
      state.viewportPos.value
    );

    state.drawingLine = !state.drawingLine;
  },
  hold({ state }) {
    clearLayer(state.brushLayer);

    const mouseGridPos = getMouseGridPos(
      state.mousePos,
      state.zoom.value,
      state.viewportPos.value
    );

    if (state.mouseDown) {
      fillLine(
        state.lineStart,
        mouseGridPos,
        state.color.value,
        state.brushLayer
      );
    } else {
      fillPixel({
        layer: state.brushLayer,
        color: state.color.value,
        position: mouseGridPos,
      });

      if (state.drawingLine) {
        fillLine(
          state.lineStart,
          mouseGridPos,
          state.color.value,
          state.editingLayer
        );
        state.drawingLine = false;
      }
    }
  },
  up({ state }) {},
};
