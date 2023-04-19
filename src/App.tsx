import { MouseEvent, useContext, useEffect, useRef, useState } from "react";
import useWindowSize from "./hooks/useWindowSize";
import { AppStateContext } from "./AppState";
import { Brush } from "./brushes/brushes";
import { pixelBrush } from "./brushes/pixelBrush";
import { eraserBrush } from "./brushes/eraserBrush";
import { BrushToolbar } from "./Components/BrushToolbar";
import { ColorPalette } from "./Components/ColorPallete";

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
      <BrushManager></BrushManager>
      <PixiliCanvas />
      <div className="w-1/6 bg-slate-500 bottom-0 absolute right-0 top-0 m-3">
        <ColorPalette></ColorPalette>
      </div>
    </div>
  );
}

export const getMouseGridPos = (
  mousePos: Vector2,
  zoom: number,
  viewportPos: Vector2
) => {
  const pixelSize = zoom * 100;

  return {
    x: Math.round(
      (mousePos.x - (mousePos.x % pixelSize)) / pixelSize - viewportPos.x
    ),
    y: Math.round(
      (mousePos.y - (mousePos.y % pixelSize)) / pixelSize - viewportPos.y
    ),
  };
};

function PixiliCanvas(props: {}) {
  const appState = useContext(AppStateContext);
  const [width, height] = useWindowSize();

  const canvasSize = { x: width, y: height };

  useEffect(() => {
    render();
  }, [width]);

  const getMousePos = (e: MouseEvent) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const renderFrame = (
    frame: Frame,
    viewportPos: Vector2,
    zoom: number,
    ctx: CanvasRenderingContext2D,
    viewPortSize: Vector2
  ) => {
    const pixelSize = zoom * 100;

    ctx.clearRect(0, 0, viewPortSize.x, viewPortSize.y);

    frame.forEach((layer) => {
      for (const [position, color] of layer.strayPixels) {
        const gridPosition = {
          x: parseInt(position.split("_")[0], 10),
          y: parseInt(position.split("_")[1], 10),
        };

        ctx.fillStyle = color;

        ctx.fillRect(
          pixelSize * (gridPosition.x + viewportPos.x),
          pixelSize * (gridPosition.y + viewportPos.y),
          pixelSize,
          pixelSize
        );
      }
    });
  };

  const render = () => {
    const ctx = canvasRef.current?.getContext("2d");

    if (ctx === null || ctx === undefined) return;

    renderFrame(
      appState.frame,
      appState.viewportPos.value,
      appState.zoom,
      ctx,
      {
        x: canvasSize.x,
        y: canvasSize.y,
      }
    );
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <canvas
      className="h-full w-full"
      tabIndex={0}
      onWheel={(e) => {
        const getRawMouseGridPos = (mousePos: Vector2) => {
          const pixelSize = appState.zoom * 100;

          return {
            x: mousePos.x / pixelSize - appState.viewportPos.value.x,
            y: mousePos.y / pixelSize - appState.viewportPos.value.y,
          };
        };

        if (!canvasRef.current) return;
        const zoomDelta = e.deltaY * 0.0001;
        const oldMouseGridPos = getRawMouseGridPos(appState.mousePos);
        appState.zoom = Math.min(Math.max(appState.zoom - zoomDelta, 0.1), 1);
        const MouseGridPos = getRawMouseGridPos(appState.mousePos);

        const mouseGridPosDiffX = MouseGridPos.x - oldMouseGridPos.x;
        const mouseGridPosDiffY = MouseGridPos.y - oldMouseGridPos.y;

        appState.viewportPos.value.x += mouseGridPosDiffX;
        appState.viewportPos.value.y += mouseGridPosDiffY;

        render();
      }}
      onKeyDown={(e) => {
        switch (e.code) {
          case "KeyS":
            appState.viewportPos.value.y -= 1;
            break;
          case "KeyW":
            appState.viewportPos.value.y += 1;
            break;
          case "KeyD":
            appState.viewportPos.value.x -= 1;
            break;
          case "KeyA":
            appState.viewportPos.value.x += 1;
            break;
        }

        if (e.code === "KeyZ" && e.ctrlKey) {
          const layer = appState.editingLayer;
          if (layer.strayPixelsHistory.length > 0) {
            layer.strayPixels =
              layer.strayPixelsHistory.shift() as Layer["strayPixels"];
            render();
          }
        }

        render();
      }}
      width={canvasSize.x}
      height={canvasSize.y}
      ref={canvasRef}
      onMouseMove={(e: MouseEvent) => {
        appState.mousePos = getMousePos(e);

        appState.brush.hold?.({ state: appState });

        render();
      }}
      onMouseUp={() => {
        appState.mouseDown = false;
        appState.brush.up?.({ state: appState });
      }}
      onMouseDown={(e: MouseEvent) => {
        appState.editingLayer.strayPixelsHistory.unshift(
          new Map(appState.editingLayer.strayPixels)
        );
        appState.mouseDown = true;
        appState.brush.down?.({ state: appState });
      }}
    ></canvas>
  );
}

function BrushManager() {
  const appState = useContext(AppStateContext);
  const [selectedBrush, setSelectedBrush] = useState(appState.brush.name);

  return (
    <div className="w-fit bottom-0 m-3 gap-3 absolute left-0 top-0 flex flex-grow-0 items-start">
      <BrushToolbar
        selectedBrush={selectedBrush}
        setSelectedBrush={setSelectedBrush}
      ></BrushToolbar>
      <PropertyViewer selectedBrush={selectedBrush}></PropertyViewer>
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
    <div className="p-2 flex gap-2 bg-slate-500">
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
