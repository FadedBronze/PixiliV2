import { getMouseGridPos } from "../Components/PixiliCanvas";
import fillRect from "../helpers/fillRect";
import { Brush } from "./brushes";

export type selectionState = undefined;

export const selectionBrush: Brush = {
  name: "select",
  down({ state }) {},
  hold({ state }) {
    const mouseGridPos = getMouseGridPos(
      state.mousePos,
      state.zoom.value,
      state.viewportPos.value
    );

    fillRect({
      scale: {
        x: 1,
        y: 1,
      },
      layer: state.brushLayer,
      color: state.color.value,
      position: mouseGridPos,
    });

    if (state.mouseDown) {
    }
  },
  up({ state }) {},
};
