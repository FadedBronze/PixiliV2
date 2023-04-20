import { useContext, useEffect, useRef } from "react";
import { Vector2, Frame, Layer } from "../App";
import { AppStateContext } from "../AppState";
import useWindowSize from "../hooks/useWindowSize";
import { MouseEvent } from "react";

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

export function PixiliCanvas(props: {}) {
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
      appState.zoom.value,
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
      style={{
        backgroundColor: appState.backgroundColor.value,
      }}
      tabIndex={0}
      onWheel={(e) => {
        if (e.shiftKey) {
          const brushState = appState.brushStates.find(
            ({ brush }) => brush.name === appState.currentBrush.value
          )?.state;

          if (brushState?.value === undefined) return;

          if ("scale" in brushState.value) {
            brushState.value = {
              ...brushState.value,
              scale:
                (brushState.value.scale as number) +
                Math.round(e.deltaY * 0.005),
            };
          }

          return;
        }

        const getRawMouseGridPos = (mousePos: Vector2) => {
          const pixelSize = appState.zoom.value * 100;

          return {
            x: mousePos.x / pixelSize - appState.viewportPos.value.x,
            y: mousePos.y / pixelSize - appState.viewportPos.value.y,
          };
        };

        if (!canvasRef.current) return;
        const zoomDelta = e.deltaY * 0.0001;
        const oldMouseGridPos = getRawMouseGridPos(appState.mousePos);
        appState.zoom.value = Math.min(
          Math.max(appState.zoom.value - zoomDelta, 0.02),
          1
        );
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

        appState.brush.value.hold?.({ state: appState });

        render();
      }}
      onMouseUp={() => {
        appState.mouseDown = false;
        appState.brush.value.up?.({ state: appState });
      }}
      onMouseDown={(e: MouseEvent) => {
        appState.editingLayer.strayPixelsHistory.unshift(
          new Map(appState.editingLayer.strayPixels)
        );
        appState.mouseDown = true;
        appState.brush.value.down?.({ state: appState });
      }}
    ></canvas>
  );
}
