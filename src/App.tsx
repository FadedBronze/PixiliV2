import { render } from "react-dom";
import { BrushToolbar } from "./Components/BrushToolbar";
import { ColorPalette } from "./Components/ColorPalette";
import LayerViewer from "./Components/LayerViewer";
import { PixiliCanvas } from "./Components/PixiliCanvas";
import { useBrushState } from "./brushes/useBrushState";
import { useContext } from "react";
import { AppStateContext } from "./AppState";
import { useLayerState } from "./useLayerState";

export type Layer = {
  name: string;
  pixels: Map<string, string>;
  pixelsHistory: Map<string, string>[];
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
  const brushState = useBrushState();

  return (
    <div className="fixed top-0 left-0">
      <div className="max-h-full bg-slate-500 m-2 fixed top-0 bottom-0 right-0 w-fit">
        <ColorPalette></ColorPalette>
        <BrushToolbar
          selectedBrush={brushState.get().current}
          setSelectedBrush={(v) =>
            brushState.set((currentState) => {
              const newState = { ...currentState };
              newState.current = v as keyof typeof newState.brushes;
              return newState;
            })
          }
        ></BrushToolbar>
        <LayerViewer></LayerViewer>
      </div>
      <div className="fixed top-0 bottom-0 left-0 p-2"></div>
      <div className="fixed top-0 left-0 p-2">
        <ProjectOptions></ProjectOptions>
      </div>
      <div className="fixed top-12 left-0 p-2">
        <PropertyViewer></PropertyViewer>
      </div>
    </div>
  );
}

function ProjectOptions() {
  const appState = useContext(AppStateContext);
  const layerState = useLayerState();

  return (
    <div className="bg-slate-500 rounded-md h-10">
      <button className="m-1 p-1 rounded-md bg-green-300" onClick={() => {}}>
        Save
      </button>
      <button
        className="m-1 p-1 rounded-md bg-red-300"
        onClick={() => {
          if (!confirm("Delete all layers and data?")) return;

          appState.frame.splice(0, appState.frame.length);
          appState.frame.push({
            name: "brush",
            pixels: new Map(),
            pixelsHistory: [],
          });

          layerState.set((oldState) => {
            const newState = { ...oldState };

            newState.layers = [];

            return newState;
          });
        }}
      >
        Reset
      </button>
    </div>
  );
}

function PropertyViewer() {
  const brushState = useBrushState();
  const brushes = brushState.get().brushes;
  const selectedBrushName = brushState.get().current;
  const selectedBrush = brushes[selectedBrushName as keyof typeof brushes];

  if (selectedBrush === undefined) return <></>;

  return (
    <div className="p-2 flex gap-2 bg-slate-500 rounded-md pointer-events-auto w-full h-full">
      {Object.keys(selectedBrush).map((value) => {
        return (
          selectedBrush && (
            <BrushProperty
              name={value}
              setValue={(v) => {
                if (selectedBrush === undefined) {
                  return;
                }

                brushState.set((prevState) => {
                  const newState = { ...prevState };

                  const newSelectedBrush =
                    newState.brushes[
                      selectedBrushName as keyof typeof newState.brushes
                    ];

                  if (newSelectedBrush === undefined) return prevState;

                  newSelectedBrush[value as keyof typeof newSelectedBrush] =
                    v as any;

                  return newState;
                });
              }}
              key={selectedBrushName + value}
              value={selectedBrush[value as keyof typeof selectedBrush]}
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
            checked={value}
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
            value={value}
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
