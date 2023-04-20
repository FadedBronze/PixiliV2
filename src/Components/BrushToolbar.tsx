import { useBrushState } from "../brushes/useBrushState";

export function BrushToolbar(props: {
  selectedBrush: string;
  setSelectedBrush: (value: string) => void;
}) {
  const brushState = useBrushState();

  const getState = brushState.get();

  return (
    <div className="p-2 gap-2 h-48 w-48 grid grid-cols-3 bg-slate-500 z-0 overflow-y-scroll overflow-x-hidden">
      {Object.keys(getState.brushes).map((brush) => {
        const currentBrush =
          getState.brushes[brush as keyof typeof getState.brushes];

        return (
          <BrushToolbarBrush
            name={currentBrush.brush.name}
            key={currentBrush.brush.name}
            selected={props.selectedBrush === currentBrush.brush.name}
            select={() => {
              brushState.set((v) => {
                const newState = { ...v };
                newState.current = brush;
                return newState;
              });
              props.setSelectedBrush(currentBrush.brush.name);
            }}
          ></BrushToolbarBrush>
        );
      })}
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
