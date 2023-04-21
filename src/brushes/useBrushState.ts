import { useHookstate, hookstate } from "@hookstate/core";
import { pixelBrush, pixelBrushState } from "./pixelBrush";
import { eraserBrush, eraserBrushState } from "./eraserBrush";
import { fillBrush } from "./fillBrush";

type BrushState = {
  current: string;
  brushes: {
    pixel: pixelBrushState;
    eraser: eraserBrushState;
    fill: undefined;
  };
};

const brushState = hookstate<BrushState>({
  current: "pixelBrush",
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
