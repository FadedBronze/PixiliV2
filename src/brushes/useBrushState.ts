import { useHookstate, hookstate } from "@hookstate/core";
import { pixelBrushState } from "./pixelBrush";
import { eraserBrushState } from "./eraserBrush";
import { selectionState } from "./selectionBrush";
import { fillState } from "./fillBrush";
import { lineState } from "./lineBrush";

type Brushes = {
  pixel: pixelBrushState;
  eraser: eraserBrushState;
  fill: fillState;
  select: selectionState;
  line: lineState;
};

export type BrushState = {
  current: keyof Brushes;
  brushes: Brushes;
};

const brushState = hookstate<BrushState>({
  current: "pixel",
  brushes: {
    pixel: {
      scale: 1,
    },
    eraser: {
      scale: 1,
    },
    fill: undefined,
    select: undefined,
    line: undefined,
  },
});

export function useBrushState() {
  const state = useHookstate(brushState);

  return state;
}
