import { useHookstate, hookstate } from "@hookstate/core";
import { pixelBrushState } from "./pixelBrush";
import { eraserBrushState } from "./eraserBrush";

type Brushes = {
  pixel: pixelBrushState;
  eraser: eraserBrushState;
  fill: undefined;
};

export type BrushState = {
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
