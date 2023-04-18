import { createContext } from "react";
import { Vector2 } from "./App";

type appState = {
  zoom: number;
  viewportPos: Vector2;
  mousePos: Vector2;
};

const defaultAppState = {
  zoom: 0.5,
  viewportPos: { x: 0, y: 0 },
  mousePos: { x: 0, y: 0 },
};

export const AppStateContext = createContext<appState>({ ...defaultAppState });

export function AppStateContextProvider(props: { children: JSX.Element }) {
  return (
    <AppStateContext.Provider value={{ ...defaultAppState }}>
      {props.children}
    </AppStateContext.Provider>
  );
}
