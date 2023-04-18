import { MouseEvent, useContext, useEffect, useRef, useState } from "react";
import useWindowSize from "./hooks/useWindowSize";
import { AppStateContext } from "./AppState";

type Chunk = string[][];
export type Layer = {
  name: string;
  strayPixels: Set<string>;
  chunks: Chunk[];
};
export type Frame = Layer[];
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

  const canvasSize = { x: width * 0.8, y: height };

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

    renderFrame(appState.frame, appState.viewportPos, appState.zoom, ctx, {
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

        appState.brush.hold?.({ state: appState });

        render();
      }}
      onMouseUp={() => {
        appState.mouseDown = false;
        appState.brush.up?.({ state: appState });
      }}
      onMouseDown={(e: MouseEvent) => {
        appState.mouseDown = true;
        appState.brush.down?.({ state: appState });
      }}
    ></canvas>
  );
}

export default App;
