import { useContext, useEffect, useRef } from "react";
import { Vector2, Frame, Layer } from "../App";
import { AppStateContext } from "../AppState";
import useWindowSize from "../hooks/useWindowSize";
import { MouseEvent } from "react";
import { useBrushState } from "../brushes/useBrushState";
import { brushes } from "../brushes/brushes";

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
      for (const [position, color] of layer.pixels) {
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

  const brushState = useBrushState();

  return (
    <canvas
      className="h-full w-full"
      style={{
        backgroundColor: appState.backgroundColor.value,
      }}
      tabIndex={0}
      onWheel={(e) => {
        if (e.shiftKey) {
          const brushes = brushState.get().brushes;
          const selectedBrushName = brushState.get().current;

          brushState.set((prevState) => {
            const newState = { ...prevState };

            const selectedBrush =
              newState.brushes[
                selectedBrushName as keyof typeof newState.brushes
              ];

            if (selectedBrush && "scale" in selectedBrush) {
              selectedBrush.scale += Math.round(e.deltaY * 0.005);

              return newState;
            }

            return prevState;
          });
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
          if (layer.pixelsHistory.length > 0) {
            layer.pixels = layer.pixelsHistory.shift() as Layer["pixels"];
          }
        }

        render();
      }}
      width={canvasSize.x}
      height={canvasSize.y}
      ref={canvasRef}
      onMouseMove={(e: MouseEvent) => {
        appState.mousePos = getMousePos(e);
        brushes()[brushState.get().current].hold?.({
          state: appState,
          brushState: brushState.get(),
        });
        render();
      }}
      onMouseUp={() => {
        appState.mouseDown = false;
        brushes()[brushState.get().current].up?.({
          state: appState,
          brushState: brushState.get(),
        });
      }}
      onMouseDown={() => {
        appState.editingLayer.pixelsHistory.unshift(
          new Map(appState.editingLayer.pixels)
        );
        appState.mouseDown = true;

        brushes()[brushState.get().current].down?.({
          state: appState,
          brushState: brushState.get(),
        });
      }}
    ></canvas>
  );
}
