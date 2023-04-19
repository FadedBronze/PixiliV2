import { createContext, useRef } from "react";
import { Frame, Layer, Vector2 } from "./App";
import { useBetterState } from "./hooks/useBetterState";
import { Brush } from "./brushes/brushes";
import { pixelBrush } from "./brushes/pixelBrush";

export type AppState = {
  mouseDown: boolean;
  zoom: number;
  viewportPos: Vector2;
  mousePos: Vector2;
  editingLayerName: { value: string };
  color: { value: string };
  brush: Brush;
  frame: Frame;
  editingLayer: Layer;
  brushLayer: Layer;
};

export const AppStateContext = createContext<AppState>({} as AppState);

export function AppStateContextProvider(props: { children: JSX.Element }) {
  const mouseDownRef = useRef(false);
  const brushRef = useRef(pixelBrush);
  const viewPortRef = useRef({ x: 0, y: 0 });
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
        mouseDown: mouseDownRef.current,
        brush: brushRef.current,
        zoom: 0.5,
        viewportPos: viewPortRef.current,
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
