import { MouseEvent, useContext, useEffect, useRef, useState } from "react";
import useWindowSize from "./hooks/useWindowSize";
import { AppStateContext } from "./AppState";
import { Brush } from "./brushes/brushes";
import { pixelBrush } from "./brushes/pixelBrush";
import { eraserBrush } from "./brushes/eraserBrush";
import { BrushToolbar } from "./Components/BrushToolbar";
import { ColorPalette } from "./Components/ColorPallete";
import { PixiliCanvas } from "./Components/PixiliCanvas";

type Chunk = string[][];
export type Layer = {
  name: string;
  strayPixels: Map<string, string>;
  strayPixelsHistory: Map<string, string>[];
  chunks: Chunk[];
  chunksHistory: Chunk[][];
};
export type Frame = Layer[];
export type Vector2 = {
  x: number;
  y: number;
};

function App() {
  return (
    <div className="w-full h-full relative">
      <PixiliCanvas />
      <OverlayUI></OverlayUI>
    </div>
  );
}

function OverlayUI() {
  const appState = useContext(AppStateContext);

  return (
    <div className="fixed top-0 left-0">
      <div className="max-h-full bg-slate-500 m-2 fixed top-0 bottom-0 right-0 w-fit">
        <ColorPalette></ColorPalette>
        <BrushToolbar
          selectedBrush={appState.currentBrush.value}
          setSelectedBrush={(v) => (appState.currentBrush.value = v)}
        ></BrushToolbar>
      </div>
      <div className="fixed top-0 bottom-0 left-0 p-2"></div>
      <div className="fixed top-0 left-0 p-2">
        <PropertyViewer
          selectedBrush={appState.currentBrush.value}
        ></PropertyViewer>
      </div>
    </div>
  );
}

function PropertyViewer(props: { selectedBrush: string }) {
  const appState = useContext(AppStateContext);

  const selectedBrushState = appState.brushStates.find(
    ({ brush }) => brush.name === props.selectedBrush
  );

  if (selectedBrushState?.state === undefined) {
    return <div></div>;
  }

  return (
    <div className="p-2 flex gap-2 bg-slate-500 pointer-events-auto w-full h-full">
      {Object.keys(selectedBrushState.state.value).map((value) => {
        return (
          selectedBrushState.state && (
            <BrushProperty
              name={value}
              setValue={(v) => {
                if (selectedBrushState?.state === undefined) {
                  return;
                }

                (selectedBrushState.state.value[
                  value as keyof typeof selectedBrushState.state.value
                ] as any) = v;
              }}
              key={selectedBrushState.brush.name + value}
              value={
                selectedBrushState.state.value[
                  value as keyof typeof selectedBrushState.state.value
                ]
              }
            ></BrushProperty>
          )
        );
      })}
    </div>
  );
}

function BrushProperty(props: {
  name: string;
  value: boolean | number;
  setValue: (value: boolean | number) => void;
}) {
  const { name, value, setValue } = props;

  return (
    <>
      {typeof value == "boolean" && (
        <div className="flex gap-2 text-slate-100 border-r pr-2">
          <p>{name}</p>
          <input
            type="checkbox"
            defaultChecked={value}
            onChange={(e) => {
              setValue(e.currentTarget.checked);
            }}
          ></input>
        </div>
      )}
      {typeof value == "number" && (
        <div className="flex gap-2 text-slate-100 border-r pr-2 ">
          <p>{name}</p>
          <input
            defaultValue={value}
            type="number"
            onChange={(e) => {
              setValue(parseInt(e.currentTarget.value) ?? 1);
            }}
            className="w-8 bg-slate-700"
          ></input>
        </div>
      )}
    </>
  );
}

export default App;
