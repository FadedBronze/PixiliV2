import { useHookstate, hookstate } from "@hookstate/core";
import { pixelBrush, pixelBrushState } from "./pixelBrush";
import { eraserBrush, eraserBrushState } from "./eraserBrush";
import { fillBrush } from "./fillBrush";

type Brushes = {
  pixel: pixelBrushState;
  eraser: eraserBrushState;
  fill: undefined;
};

type BrushState = {
  current: keyof Brushes;
  brushes: Brushes;
};

const brushState = hookstate<BrushState>({
  current: "pixel",
  brushes: {
    pixel: {
      pixelPerfect: false,
      scale: 1,
    },
    eraser: {
      scale: 1,
    },
    fill: undefined,
  },
});

export function useBrushState() {
  const state = useHookstate(brushState);

  return state;
}
