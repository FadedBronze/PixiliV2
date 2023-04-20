import { createContext, useRef } from "react";
import { Frame, Layer, Vector2 } from "./App";
import { useBetterState } from "./hooks/useBetterState";
import { Brush } from "./brushes/brushes";
import { pixelBrush, pixelBrushState } from "./brushes/pixelBrush";
import { eraserBrush, eraserBrushState } from "./brushes/eraserBrush";
import { fillBrush } from "./brushes/fillBrush";

export type AppState = {
  mouseDown: boolean;
  zoom: { value: number };
  viewportPos: { value: Vector2 };
  mousePos: Vector2;
  backgroundColor: { value: string };
  editingLayerName: { value: string };
  color: { value: string };
  brush: { value: Brush };
  frame: Frame;
  editingLayer: Layer;
  brushLayer: Layer;
};

export const AppStateContext = createContext<AppState>({} as AppState);

export function AppStateContextProvider(props: { children: JSX.Element }) {
  const mouseDownRef = useRef(false);
  const brushRef = useRef({ value: pixelBrush });
  const mousePosRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef({ value: 0.5 });
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
        backgroundColor: useBetterState("black"),
        mouseDown: mouseDownRef.current,
        brush: brushRef.current,
        zoom: zoomRef.current,
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
      }}
    >
      {props.children}
    </AppStateContext.Provider>
  );
}
