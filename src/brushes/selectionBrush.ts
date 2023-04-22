import {
  clearLayer,
  fillPixel,
  fillRect,
  getPixelsRect,
} from "../helpers/fillMethods";
import { getMouseGridPos } from "../helpers/getMouseGridPos";
import { renderPixels } from "../helpers/fillMethods";
import { Brush } from "./brushes";

export type selectionState = undefined;

export const selectionBrush: Brush = {
  name: "select",
  down({ state }) {
    switch (state.selectMode) {
      case "not selecting":
        state.selectMode = "selecting";
        break;
      case "selecting":
        const gridMousePos = getMouseGridPos(
          state.mousePos,
          state.zoom.value,
          state.viewportPos.value
        );

        state.selection = getPixelsRect({
          scale: {
            x: gridMousePos.x - state.selectionStart.x,
            y: gridMousePos.y - state.selectionStart.y,
          },
          layer: state.editingLayer,
          position: state.selectionStart,
        });

        console.log(state.selection);

        state.selectMode = "selected";
        break;
      case "selected":
        renderPixels({
          layer: state.editingLayer,
          selection: state.selection,
          position: getMouseGridPos(
            state.mousePos,
            state.zoom.value,
            state.viewportPos.value
          ),
        });
        state.selectMode = "not selecting";
        break;
    }

    state.selectionStart = getMouseGridPos(
      state.mousePos,
      state.zoom.value,
      state.viewportPos.value
    );
  },
  hold({ state }) {
    clearLayer(state.brushLayer);

    const mouseGridPos = getMouseGridPos(
      state.mousePos,
      state.zoom.value,
      state.viewportPos.value
    );

    switch (state.selectMode) {
      case "not selecting":
        fillPixel({
          layer: state.brushLayer,
          color: "rgba(255, 255, 255, 0.1)",
          position: mouseGridPos,
        });
        break;
      case "selecting":
        fillRect({
          scale: {
            x: mouseGridPos.x - state.selectionStart.x,
            y: mouseGridPos.y - state.selectionStart.y,
          },
          layer: state.brushLayer,
          color: "rgba(255, 255, 255, 0.1)",
          position: state.selectionStart,
        });
        break;
      case "selected":
        renderPixels({
          layer: state.brushLayer,
          selection: state.selection,
          position: mouseGridPos,
        });
        break;
    }
  },
  up({ state }) {},
};
