import { createContext, useRef } from "react";
import { Frame, Layer, Vector2 } from "./App";
import { useBetterState } from "./hooks/useBetterState";

export type AppState = {
  mouseDown: boolean;
  zoom: { value: number };
  viewportPos: { value: Vector2 };
  mousePos: Vector2;
  backgroundColor: { value: string };
  editingLayerName: { value: string };
  color: { value: string };
  frame: Frame;
  editingLayer: Layer;
  brushLayer: Layer;
  selection: Map<string, string>;
  selectMode: "selecting" | "selected" | "not selecting";
  selectionStart: Vector2;
};

export const AppStateContext = createContext<AppState>({} as AppState);

export function AppStateContextProvider(props: { children: JSX.Element }) {
  const mouseDownRef = useRef(false);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef({ value: 0.5 });
  const frameRef = useRef([
    {
      name: "layer 1",
      pixels: new Map(),
      pixelsHistory: [],
    },
    {
      name: "background",
      pixels: new Map(),
      pixelsHistory: [],
    },
    {
      name: "brush",
      pixels: new Map(),
      pixelsHistory: [],
    },
  ]);
  const selectionStartRef = useRef({ x: 0, y: 0 });
  const selectModeRef = useRef<AppState["selectMode"]>("not selecting");

  return (
    <AppStateContext.Provider
      value={{
        selectMode: selectModeRef.current,
        selectionStart: selectionStartRef.current,
        backgroundColor: useBetterState("rgb(30, 30, 30)"),
        mouseDown: mouseDownRef.current,
        zoom: zoomRef.current,
        viewportPos: useBetterState({ x: 0, y: 0 }),
        mousePos: mousePosRef.current,
        editingLayerName: useBetterState("layer 1"),
        color: useBetterState("red"),
        frame: frameRef.current,
        selection: new Map(),
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
