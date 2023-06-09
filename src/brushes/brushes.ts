import { AppState } from "../AppState";
import { eraserBrush } from "./eraserBrush";
import { fillBrush } from "./fillBrush";
import { pixelBrush } from "./pixelBrush";
import { BrushState } from "./useBrushState";
import { selectionBrush } from "./selectionBrush";
import { lineBrush } from "./lineBrush";

type BrushDrawParams = {
  state: AppState;
  brushState: BrushState;
};

export type Brush = {
  name: string;
  down?: (params: BrushDrawParams) => void;
  hold?: (params: BrushDrawParams) => void;
  up?: (params: BrushDrawParams) => void;
};

export function brushes() {
  return {
    eraser: eraserBrush,
    fill: fillBrush,
    pixel: pixelBrush,
    select: selectionBrush,
    line: lineBrush,
  };
}
