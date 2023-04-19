import { MouseEvent, useContext, useEffect, useRef, useState } from "react";
import useWindowSize from "./hooks/useWindowSize";
import { AppStateContext } from "./AppState";
import { Brush } from "./brushes/brushes";
import { pixelBrush } from "./brushes/pixelBrush";
import { eraserBrush } from "./brushes/eraserBrush";

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
    <div className="w-full h-full flex">
      <div className="w-fit bg-slate-500 h-full">
        <BrushToolbar></BrushToolbar>
      </div>
      <PixiliCanvas />
      <div className="w-1/5 bg-slate-500">
        <ColorViewer></ColorViewer>
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

  const canvasSize = { x: width * 0.6, y: height };

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
    viewPortPos: Vector2,
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
          pixelSize * (gridPosition.x + viewPortPos.x),
          pixelSize * (gridPosition.y + viewPortPos.y),
          pixelSize,
          pixelSize
        );
      }
    });
  };

  const render = () => {
    const ctx = canvasRef.current?.getContext("2d");

    if (ctx === null || ctx === undefined) return;

    renderFrame(appState.frame, appState.viewportPos, appState.zoom, ctx, {
      x: canvasSize.x,
      y: canvasSize.y,
    });
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <canvas
      className="h-full w-4/5"
      tabIndex={0}
      onWheel={(e) => {
        const getRawMouseGridPos = (mousePos: Vector2) => {
          const pixelSize = appState.zoom * 100;

          return {
            x: mousePos.x / pixelSize - appState.viewportPos.x,
            y: mousePos.y / pixelSize - appState.viewportPos.y,
          };
        };

        if (!canvasRef.current) return;
        const zoomDelta = e.deltaY * 0.0001;
        const oldMouseGridPos = getRawMouseGridPos(appState.mousePos);
        appState.zoom = Math.min(Math.max(appState.zoom - zoomDelta, 0.1), 1);
        const MouseGridPos = getRawMouseGridPos(appState.mousePos);

        const mouseGridPosDiffX = MouseGridPos.x - oldMouseGridPos.x;
        const mouseGridPosDiffY = MouseGridPos.y - oldMouseGridPos.y;

        appState.viewportPos.x += mouseGridPosDiffX;
        appState.viewportPos.y += mouseGridPosDiffY;

        render();
      }}
      onKeyDown={(e) => {
        switch (e.code) {
          case "KeyS":
            appState.viewportPos.y -= 1;
            break;
          case "KeyW":
            appState.viewportPos.y += 1;
            break;
          case "KeyD":
            appState.viewportPos.x -= 1;
            break;
          case "KeyA":
            appState.viewportPos.x += 1;
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

function BrushToolbar() {
  const appState = useContext(AppStateContext);

  const brushStates = [
    {
      name: "eraser",
      brush: eraserBrush,
    },
    {
      name: "pixel",
      brush: pixelBrush,
    },
  ];

  const [selectedBrush, setSelectedBrush] = useState("pixel");

  return (
    <div className="p-4 flex flex-wrap grow w-full gap-2 justify-top flex-col align-center">
      {brushStates.map(({ name, brush }) => (
        <BrushToolbarBrush
          name={name}
          key={name}
          selected={selectedBrush === name}
          select={() => {
            appState.brush = brush;
            setSelectedBrush(name);
          }}
        ></BrushToolbarBrush>
      ))}
    </div>
  );
}

function BrushToolbarBrush(props: {
  selected: boolean;
  select: () => void;
  name: string;
}) {
  return (
    <button
      onClick={() => props.select()}
      className={`bg-slate-300 rounded-md flex justify-center items-center w-12 h-12 ${
        props.selected ? "border-4 border-slate-100" : ""
      }`}
    >
      {props.name}
    </button>
  );
}

function ColorViewer() {
  const appState = useContext(AppStateContext);

  const [colors, setColors] = useState([
    "#FF00FF",
    "#FF0000",
    "#FFFF00",
    "#00FF00",
    "#00FFFF",
    "#0000FF",
  ]);

  const [selectedColor, setSelectedColor] = useState("#0000FF");

  const addColor = (color: string) => {
    if (colors.includes(color.toLocaleUpperCase())) return;
    setColors([...colors, color.toLocaleUpperCase()]);
  };

  return (
    <div className="p-2">
      <div className="w-full flex justify-center items-center aspect-square border-b border-white">
        <input
          className=""
          type="color"
          value={appState.color.value}
          onChange={(e) => {
            appState.color.value = e.currentTarget.value;
          }}
        />
      </div>
      <div className="flex border-b border-white p-2 flex-wrap">
        {colors.map((color) => (
          <ColorOption
            selected={selectedColor === color}
            select={() => setSelectedColor(color)}
            delete={() =>
              setColors(colors.filter((newColor) => newColor !== color))
            }
            setColor={() => (appState.color.value = color)}
            color={color}
            key={color}
          />
        ))}
        <button
          className="w-1/4 aspect-square bg-slate-500 text-white"
          onClick={() => {
            addColor(appState.color.value);
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}

function ColorOption(props: {
  color: string;
  setColor: () => void;
  selected: boolean;
  select: () => void;
  delete: () => void;
}) {
  return (
    <button
      className={`w-1/4 aspect-square ${
        props.selected ? "border-2 border-white" : ""
      }`}
      onClick={() => {
        if (props.selected) props.delete();

        props.select();
        props.setColor();
      }}
      style={{
        backgroundColor: props.color,
      }}
    ></button>
  );
}

export default App;
