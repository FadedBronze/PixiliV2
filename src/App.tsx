import { MouseEvent, useEffect, useRef, useState } from "react";
import useWindowSize from "./hooks/useWindowSize";

type Chunk = string[][];
type Layer = {
  name: string;
  strayPixels: Set<string>;
  chunks: Chunk[];
};
type Frame = Layer[];
type Vector2 = {
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
  const [zoom, setZoom] = useState(0.5);
  const [viewPortPos, setViewPortPos] = useState({
    x: 0,
    y: 0,
  });
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
      strayPixels: new Set(["10_15", "10_10"]),
    },
  ]);

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
        const position = {
          x: parseInt(value.split("_")[0], 10),
          y: parseInt(value.split("_")[1], 10),
        };

        ctx.fillStyle = "red";

        ctx.fillRect(
          pixelSize * (position.x + viewPortPos.x),
          pixelSize * (position.y + viewPortPos.y),
          pixelSize,
          pixelSize
        );
      }
    });
  };

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");

    if (ctx === null || ctx === undefined) return;

    renderFrame(frame.current, viewPortPos, zoom, ctx, {
      x: canvasRef.current!.width,
      y: canvasRef.current!.height,
    });
  }, []);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <canvas
      className="h-full w-4/5"
      tabIndex={0}
      onWheel={(e) => {
        setZoom(Math.max(Math.min(zoom + e.deltaY * 0.0001, 1), 0.1));

        const ctx = canvasRef.current?.getContext("2d");

        if (ctx === null || ctx === undefined) return;

        renderFrame(frame.current, viewPortPos, zoom, ctx, {
          x: canvasRef.current!.width,
          y: canvasRef.current!.height,
        });
      }}
      onKeyDown={(e) => {
        if (e.code === "KeyS") {
          setViewPortPos({
            x: viewPortPos.x,
            y: viewPortPos.y - 0.5,
          });
        }

        if (e.code === "KeyW") {
          setViewPortPos({
            x: viewPortPos.x,
            y: viewPortPos.y + 0.5,
          });
        }

        if (e.code === "KeyD") {
          setViewPortPos({
            x: viewPortPos.x - 0.5,
            y: viewPortPos.y,
          });
        }

        if (e.code === "KeyA") {
          setViewPortPos({
            x: viewPortPos.x + 0.5,
            y: viewPortPos.y,
          });
        }

        const ctx = canvasRef.current?.getContext("2d");

        if (ctx === null || ctx === undefined) return;

        renderFrame(frame.current, viewPortPos, zoom, ctx, {
          x: canvasRef.current!.width,
          y: canvasRef.current!.height,
        });
      }}
      width={width * 0.8}
      height={height}
      ref={canvasRef}
      onMouseMove={(e: MouseEvent) => {
        const brushLayer = frame.current.find(({ name }) => name === "brush")!;
        const mousePos = getMousePos(e);
        const pixelSize = zoom * 100;

        const mouseGridPos = {
          x: Math.round(
            (mousePos.x - (mousePos.x % pixelSize)) / pixelSize - viewPortPos.x
          ),
          y: Math.round(
            (mousePos.y - (mousePos.y % pixelSize)) / pixelSize - viewPortPos.y
          ),
        };

        console.log(mouseGridPos);

        brushLayer.strayPixels.clear();
        brushLayer.strayPixels.add(`${mouseGridPos.x}_${mouseGridPos.y}`);

        const ctx = canvasRef.current?.getContext("2d");

        if (ctx === null || ctx === undefined) return;

        renderFrame(frame.current, viewPortPos, zoom, ctx, {
          x: canvasRef.current!.width,
          y: canvasRef.current!.height,
        });
      }}
    ></canvas>
  );
}

export default App;
