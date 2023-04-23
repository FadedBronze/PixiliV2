import { useContext, useEffect, useRef } from "react";
import { Vector2, Frame, Layer } from "../App";
import { AppStateContext } from "../AppState";
import useWindowSize from "../hooks/useWindowSize";
import { MouseEvent } from "react";
import { useBrushState } from "../brushes/useBrushState";
import { brushes } from "../brushes/brushes";
import { roundToNearestPow } from "../helpers/roundToNearestPower";
import { useLayerState } from "../useLayerState";
import { changeHexOpacity } from "../helpers/changeHexOpacity";

export function PixiliCanvas() {
  const appState = useContext(AppStateContext);
  const [width, height] = useWindowSize();

  const canvasSize = { x: width, y: height };

  useEffect(() => render(), [width]);

  const getMousePosFromCanvasEvent = (e: MouseEvent) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const layerState = useLayerState();

  const renderFrame = (
    frame: Frame,
    viewportPos: Vector2,
    zoom: number,
    ctx: CanvasRenderingContext2D,
    viewPortSize: Vector2
  ) => {
    const pixelSize = zoom * 100;
    const layerData = layerState.get();

    ctx.clearRect(0, 0, viewPortSize.x, viewPortSize.y);

    frame.forEach((layer) => {
      if (
        layerData.layers.find(({ name }) => name === layer.name)?.visible ===
        false
      )
        return;

      for (const [position, color] of layer.pixels) {
        const gridPosition = {
          x: parseInt(position.split("_")[0], 10),
          y: parseInt(position.split("_")[1], 10),
        };

        const opacity = layerData.layers.find(
          ({ name }) => name === layer.name
        )?.opacity;

        if (opacity === undefined) {
          ctx.fillStyle = color;
        } else {
          ctx.fillStyle = changeHexOpacity(color, opacity * 100);
        }

        ctx.fillRect(
          pixelSize * (gridPosition.x + viewportPos.x),
          pixelSize * (gridPosition.y + viewportPos.y),
          pixelSize,
          pixelSize
        );
      }
    });
  };

  const gridLines = (
    zoom: number,
    ctx: CanvasRenderingContext2D,
    viewportPos: Vector2
  ) => {
    const inverseLinearInterpolation = (a: number, b: number, v: number) => {
      return (v - b) / (a - b);
    };

    const pixelSize = zoom * 100;
    const pixelsOnScreen = Math.floor(width / pixelSize);

    const val = pixelsOnScreen / 8;
    const pixelsInChunkGridCeil = roundToNearestPow(val, 4, "ceil");

    const pixelsInChunkGridFloor = roundToNearestPow(val, 4, "floor");

    const gridVisibilityInterpolation = inverseLinearInterpolation(
      pixelsInChunkGridCeil,
      pixelsInChunkGridFloor,
      val
    );

    createGridLines({
      ctx,
      pixelsInChunkGrid: pixelsInChunkGridCeil,
      pixelSize,
      viewportPos,
      color: `rgba(125, 125, 125, ${gridVisibilityInterpolation})`,
    });

    createGridLines({
      ctx,
      pixelsInChunkGrid: pixelsInChunkGridFloor,
      pixelSize,
      viewportPos,
      color: `rgba(125, 125, 125, ${Math.abs(
        gridVisibilityInterpolation - 1
      )})`,
    });
  };

  const createGridLines = (params: {
    pixelSize: number;
    pixelsInChunkGrid: number;
    ctx: CanvasRenderingContext2D;
    viewportPos: Vector2;
    color: string;
  }) => {
    const { ctx, pixelSize, pixelsInChunkGrid, viewportPos, color } = params;

    ctx.lineWidth = 0.5;
    ctx.strokeStyle = color;

    for (let i = 0; i < width; i += pixelSize * pixelsInChunkGrid) {
      ctx.beginPath();
      ctx.moveTo(
        i + ((viewportPos.x * pixelSize) % (pixelSize * pixelsInChunkGrid)),
        0
      );
      ctx.lineTo(
        i + ((viewportPos.x * pixelSize) % (pixelSize * pixelsInChunkGrid)),
        height
      );
      ctx.stroke();
    }

    for (let i = 0; i < height; i += pixelSize * pixelsInChunkGrid) {
      ctx.beginPath();
      ctx.moveTo(
        0,
        i + ((viewportPos.y * pixelSize) % (pixelSize * pixelsInChunkGrid))
      );
      ctx.lineTo(
        width,
        i + ((viewportPos.y * pixelSize) % (pixelSize * pixelsInChunkGrid))
      );
      ctx.stroke();
    }
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

    gridLines(appState.zoom.value, ctx, appState.viewportPos.value);
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const brushState = useBrushState();

  const editingLayer = appState.editingLayer;

  return (
    <canvas
      className="h-full w-full"
      style={{
        backgroundColor: appState.backgroundColor.value,
      }}
      tabIndex={0}
      onWheel={(e) => {
        if (e.shiftKey) {
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

        //gets the unrounded value of the mousePosition in pixel coordinates
        const getRawMouseGridPos = (mousePos: Vector2) => {
          const pixelSize = appState.zoom.value * 100;

          return {
            x: mousePos.x / pixelSize - appState.viewportPos.value.x,
            y: mousePos.y / pixelSize - appState.viewportPos.value.y,
          };
        };

        //finds the difference between the old raw
        //mouse grid position and new mouse grid position
        //and adds the difference to the viewport position

        if (!canvasRef.current) return;

        const zoomDelta = e.deltaY * 0.0005 * appState.zoom.value;
        const oldMouseGridPos = getRawMouseGridPos(appState.mousePos);
        appState.zoom.value = Math.min(
          Math.max(appState.zoom.value - zoomDelta, 0.002),
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
          console.log(editingLayer.pixelsHistory.length);
          if (editingLayer.pixelsHistory.length > 0) {
            editingLayer.pixels =
              editingLayer.pixelsHistory.shift() as Layer["pixels"];
          }
        }

        render();
      }}
      width={canvasSize.x}
      height={canvasSize.y}
      ref={canvasRef}
      onMouseEnter={() => {
        canvasRef.current?.focus();
      }}
      onMouseMove={(e: MouseEvent) => {
        appState.mousePos = getMousePosFromCanvasEvent(e);
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
        console.log(editingLayer);
        editingLayer.pixelsHistory.unshift(new Map(editingLayer.pixels));
        appState.mouseDown = true;

        brushes()[brushState.get().current].down?.({
          state: appState,
          brushState: brushState.get(),
        });
      }}
    ></canvas>
  );
}
