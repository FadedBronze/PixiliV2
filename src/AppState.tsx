import { createContext } from "react";
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
  brush: Brush;
  frame: Frame;
  editingLayer: Layer;
  brushLayer: Layer;
};

export const AppStateContext = createContext<AppState>({} as AppState);

export function AppStateContextProvider(props: { children: JSX.Element }) {
  return (
    <AppStateContext.Provider
      value={{
        mouseDown: false,
        brush: pixelBrush,
        zoom: 0.5,
        viewportPos: { x: 0, y: 0 },
        mousePos: { x: 0, y: 0 },
        editingLayerName: useBetterState("layer 1"),
        frame: [
          {
            chunks: [],
            name: "brush",
            strayPixels: new Set(),
          },
          {
            chunks: [],
            name: "layer 1",
            strayPixels: new Set(["10_15", "10_10", "-10_-15", "-10_-10"]),
          },
        ],
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
