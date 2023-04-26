import { render } from "react-dom";
import { BrushToolbar } from "./Components/BrushToolbar";
import { ColorPalette } from "./Components/ColorPalette";
import LayerViewer from "./Components/LayerViewer";
import { PixiliCanvas, renderFrame } from "./Components/PixiliCanvas";
import { useBrushState } from "./brushes/useBrushState";
import { useContext, useEffect, useRef, useState } from "react";
import { AppStateContext } from "./AppState";
import { UILayer, useLayerState } from "./useLayerState";
import React from "react";
import useWindowSize from "./hooks/useWindowSize";
import mergeLayers from "./helpers/mergeLayers";

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

type exportData = {
  name: string;
  opacity: number;
  visible: boolean;
  pixels: {
    position: {
      x: number;
      y: number;
    };
    color: string;
  }[];
}[];

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

function Downloader(props: {
  buttonProps: React.HTMLProps<HTMLButtonElement>;
  fileName: string;
  onClick: () => string;
}) {
  const downloadTxtFile = (value: string) => {
    const element = document.createElement("a");
    const file = new Blob([value], {
      type: "text/plain;charset=utf-8",
    });
    element.href = URL.createObjectURL(file);
    element.download = props.fileName;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <button
      {...props.buttonProps}
      type="button"
      onClick={() => {
        downloadTxtFile(props.onClick());
      }}
    >
      Download
    </button>
  );
}

function download(canvas: HTMLCanvasElement, filename: string) {
  /// create an "off-screen" anchor tag
  var lnk = document.createElement("a"),
    e;

  /// the key here is to set the download attribute of the a tag
  lnk.download = filename;

  /// convert canvas content to data-uri for link. When download
  /// attribute is set the content pointed to by link will be
  /// pushed as "download" in HTML5 capable browsers
  lnk.href = canvas.toDataURL("image/png;base64");

  lnk.click();
}

function PngDownloader(props: { onClick: () => exportData; name: string }) {
  return (
    <button
      className="m-1 p-1 rounded-md bg-cyan-300"
      onClick={() => {
        const data = props.onClick()[0].pixels;

        const canvas = document.createElement("canvas");
        canvas.width = 2000;
        canvas.height = 2000;
        const ctx = canvas.getContext("2d")!;

        if (data.length < 1) {
          alert("no image has been drawn");
          return;
        }

        for (const pixel of data) {
          ctx.fillStyle = pixel.color;
          ctx.fillRect(
            pixel.position.x * 5 + 1000,
            pixel.position.y * 5 + 1000,
            5,
            5
          );
        }

        download(canvas, props.name + ".png");
      }}
    >
      Download png
    </button>
  );
}

function ProjectOptions() {
  const appState = useContext(AppStateContext);
  const layerState = useLayerState();
  const [name, setName] = useState("untitled.pixili");

  const prepareDataForExport = (exports: Layer[]) => {
    const layerStateValue = layerState.get();

    const exportsArray: exportData = exports
      .filter(({ name }) => name !== "brush")
      .map((layer) => {
        const exportValue = [];
        const UILayer = layerStateValue.layers.find(
          ({ name }) => name === layer.name
        )!;

        for (const [position, color] of layer.pixels) {
          exportValue.push({
            position: {
              x: parseInt(position.split("_")[0], 10),
              y: parseInt(position.split("_")[1], 10),
            },
            color,
          });
        }

        return {
          name: layer.name,
          pixels: exportValue,
          opacity: UILayer.opacity,
          visible: UILayer.visible,
        };
      });

    return exportsArray;
  };

  const clear = () => {
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
  };

  const getFile = () => {
    return new Promise<{ name: string; data: string | null | ArrayBuffer }>(
      (resolve, reject) => {
        const input = document.createElement("input");
        input.type = "file";
        input.addEventListener("change", () => {
          if (input.files === null) return;
          const file = input.files[0];
          const reader = new FileReader();
          reader.addEventListener("load", () => {
            resolve({ name: file.name, data: reader.result });
          });
          reader.addEventListener("error", () => {
            reject(new Error("Error reading file."));
          });
          reader.readAsText(file);
        });
        input.click();
      }
    );
  };

  return (
    <div className="bg-slate-500 rounded-md h-10">
      <input
        className="rounded-md m-1 p-1"
        type="text"
        onChange={(e) => {
          if (e.currentTarget.value === "") {
            setName(`untitled.pixili`);
          } else {
            setName(`${e.currentTarget?.value ?? "untitled"}.pixili`);
          }
        }}
      />
      <Downloader
        fileName={name}
        onClick={() => JSON.stringify(prepareDataForExport(appState.frame))}
        buttonProps={{
          className: "m-1 p-1 rounded-md bg-green-300",
        }}
      ></Downloader>
      <PngDownloader
        onClick={() => prepareDataForExport([mergeLayers(...appState.frame)])}
        name={name}
      ></PngDownloader>
      <button
        className="m-1 p-1 rounded-md bg-orange-300"
        onClick={() => {
          if (!confirm("Importing will delete all existing layers")) return;
          clear();

          getFile()
            .then((value) => {
              if (typeof value.data === "string") {
                const parsedValue = JSON.parse(value.data) as exportData;

                return { data: parsedValue, name: value.name };
              } else {
                throw new Error("payload is not a string");
              }
            })
            .then((value) => {
              const frame: Frame = [];
              const uiLayers: UILayer[] = [];

              for (const layer of value.data) {
                const pixels = new Map();

                for (const pixel of layer.pixels) {
                  pixels.set(
                    `${pixel.position.x}_${pixel.position.y}`,
                    pixel.color
                  );
                }

                uiLayers.push({
                  name: layer.name,
                  opacity: layer.opacity,
                  visible: layer.visible,
                });

                frame.push({
                  name: layer.name,
                  pixels: pixels,
                  pixelsHistory: [],
                });
              }

              return { frame, uiLayers };
            })
            .then(({ frame, uiLayers }) => {
              frame.forEach((layer) => {
                appState.frame.push(layer);
              });

              layerState.set((oldState) => {
                const newState = { ...oldState };

                newState.layers = uiLayers;

                return newState;
              });
            });
        }}
      >
        Import
      </button>
      <button
        className="m-1 p-1 rounded-md bg-red-300"
        onClick={() => {
          if (!confirm("Delete all layers and data?")) return;
          clear();
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
