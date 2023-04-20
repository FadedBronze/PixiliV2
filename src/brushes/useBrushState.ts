import { useHookstate, hookstate } from "@hookstate/core";
import { pixelBrush, pixelBrushState } from "./pixelBrush";
import { eraserBrush, eraserBrushState } from "./eraserBrush";
import { Brush } from "./brushes";
import { fillBrush } from "./fillBrush";

type BrushState = {
  current: string;
  brushes: {
    pixelBrush: {
      brush: Brush;
      state: pixelBrushState;
    };
    eraser: {
      brush: Brush;
      state: eraserBrushState;
    };
    fill: {
      brush: Brush;
      state: undefined;
    };
  };
};

const brushState = hookstate<BrushState>({
  current: "pixel",
  brushes: {
    pixelBrush: {
      state: {
        pixelPerfect: false,
        scale: 1,
      },
      brush: pixelBrush,
    },
    eraser: {
      state: {
        scale: 1,
      },
      brush: eraserBrush,
    },
    fill: {
      brush: fillBrush,
      state: undefined,
    },
  },
});

export function useBrushState() {
  const state = useHookstate(brushState);

  return state;
}
