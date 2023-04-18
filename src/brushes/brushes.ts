import { AppState } from "../AppState";

type BrushDrawParams = {
  state: AppState;
};

export type Brush = {
  down?: (params: BrushDrawParams) => void;
  hold?: (params: BrushDrawParams) => void;
  up?: (params: BrushDrawParams) => void;
};
