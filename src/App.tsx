import { MouseEvent, useContext, useEffect, useRef, useState } from "react";
import useWindowSize from "./hooks/useWindowSize";
import { AppStateContext } from "./AppState";

type Chunk = string[][];
type Layer = {
  name: string;
  strayPixels: Set<string>;
  chunks: Chunk[];
};
type Frame = Layer[];
export type Vector2 = {
  x: number;
  y: number;
};

function App() {
  return (
    <div className="w-full h-full flex">
      <div className="w-1/5 bg-slate-500 h-full"></div>
      <PixiliCanvas />
    </div>
  );
}

function PixiliCanvas(props: {}) {
  const appState = useContext(AppStateContext);
  const [width, height] = useWindowSize();
  const frame = useRef<Frame>([
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
  ]);
  const canvasSize = { x: width * 0.8, y: height };

  const getMousePos = (e: MouseEvent) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const getMouseGridPos = (mousePos: Vector2) => {
    const pixelSize = appState.zoom * 100;

    return {
      x: Math.round(
        (mousePos.x - (mousePos.x % pixelSize)) / pixelSize -
          appState.viewportPos.x
      ),
      y: Math.round(
        (mousePos.y - (mousePos.y % pixelSize)) / pixelSize -
          appState.viewportPos.y
      ),
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
      for (const value of layer.strayPixels) {
        const gridPosition = {
          x: parseInt(value.split("_")[0], 10),
          y: parseInt(value.split("_")[1], 10),
        };

        ctx.fillStyle = "red";

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

    renderFrame(frame.current, appState.viewportPos, appState.zoom, ctx, {
      x: canvasRef.current!.width,
      y: canvasRef.current!.height,
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

        render();
      }}
      width={canvasSize.x}
      height={canvasSize.y}
      ref={canvasRef}
      onMouseMove={(e: MouseEvent) => {
        appState.mousePos = getMousePos(e);

        const brushLayer = frame.current.find(({ name }) => name === "brush")!;
        const mouseGridPos = getMouseGridPos({
          x: appState.mousePos.x,
          y: appState.mousePos.y,
        });

        brushLayer.strayPixels.clear();
        brushLayer.strayPixels.add(`${mouseGridPos.x}_${mouseGridPos.y}`);

        render();
      }}
    ></canvas>
  );
}

export default App;
