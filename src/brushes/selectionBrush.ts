import { getMouseGridPos } from "../Components/PixiliCanvas";
import fillRect from "../helpers/fillRect";
import getPixelsRect from "../helpers/getPixelsRect";
import renderPixels from "../helpers/renderRect";
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
        state.selection = getPixelsRect({
          scale: getMouseGridPos(
            state.mousePos,
            state.zoom.value,
            state.viewportPos.value
          ),
          layer: state.editingLayer,
          position: state.selectionStart,
        });

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
    state.brushLayer.pixels.clear();

    const mouseGridPos = getMouseGridPos(
      state.mousePos,
      state.zoom.value,
      state.viewportPos.value
    );

    switch (state.selectMode) {
      case "not selecting":
        fillRect({
          scale: {
            x: 1,
            y: 1,
          },
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
