import { createContext, useRef } from "react";
import { Frame, Layer, Vector2 } from "./App";
import { useBetterState } from "./hooks/useBetterState";
import { Brush } from "./brushes/brushes";
import { pixelBrush, pixelBrushState } from "./brushes/pixelBrush";
import { eraserBrush, eraserBrushState } from "./brushes/eraserBrush";

export type AppState = {
  mouseDown: boolean;
  zoom: number;
  viewportPos: { value: Vector2 };
  mousePos: Vector2;
  editingLayerName: { value: string };
  color: { value: string };
  brush: Brush;
  frame: Frame;
  editingLayer: Layer;
  brushLayer: Layer;
  pixelBrushState: { value: pixelBrushState };
  eraserState: { value: eraserBrushState };
  brushStates: {
    brush: Brush;
    state?: {
      value: object;
    };
  }[];
};

export const AppStateContext = createContext<AppState>({} as AppState);

export function AppStateContextProvider(props: { children: JSX.Element }) {
  const mouseDownRef = useRef(false);
  const brushRef = useRef(pixelBrush);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef([
    {
      chunks: [],
      chunksHistory: [],
      name: "layer 1",
      strayPixels: new Map(),
      strayPixelsHistory: [],
    },
    {
      chunks: [],
      chunksHistory: [],
      name: "brush",
      strayPixels: new Map(),
      strayPixelsHistory: [],
    },
  ]);

  return (
    <AppStateContext.Provider
      value={{
        pixelBrushState: useBetterState({
          pixelPerfect: false,
          scale: 1,
        }),
        eraserState: useBetterState({ scale: 0 }),
        mouseDown: mouseDownRef.current,
        brush: brushRef.current,
        zoom: 0.5,
        viewportPos: useBetterState({ x: 0, y: 0 }),
        mousePos: mousePosRef.current,
        editingLayerName: useBetterState("layer 1"),
        color: useBetterState("red"),
        frame: frameRef.current,
        get brushLayer() {
          return this.frame.find(({ name }) => name === "brush") as Layer;
        },
        get editingLayer() {
          return this.frame.find(
            ({ name }) => name === this.editingLayerName.value
          ) as Layer;
        },
        get brushStates() {
          return [
            {
              brush: eraserBrush,
              state: this.eraserState,
            },
            {
              brush: pixelBrush,
              state: this.pixelBrushState,
            },
          ];
        },
      }}
    >
      {props.children}
    </AppStateContext.Provider>
  );
}
