import { useBrushState } from "../brushes/useBrushState";

export function BrushToolbar(props: {
  selectedBrush: string;
  setSelectedBrush: (value: string) => void;
}) {
  const brushState = useBrushState();

  const getState = brushState.get();

  return (
    <div className="m-2 bg-white rounded-md bg-opacity-10 p-2 h-fit min-h-48 gap-2 w-48 grid grid-cols-3 flex-wrap items-start z-0 overflow-y-scroll overflow-x-hidden">
      {Object.keys(getState.brushes).map((brush) => {
        return (
          <BrushToolbarBrush
            name={brush}
            key={brush}
            selected={props.selectedBrush === brush}
            select={() => {
              brushState.set((v) => {
                const newState = { ...v };
                newState.current = brush as keyof typeof newState.brushes;
                return newState;
              });
              props.setSelectedBrush(brush);
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
      className={`bg-slate-300 bg-opacity-30 text-white rounded-md flex justify-center items-center w-14 h-14 ${
        props.selected ? "bg-opacity-50" : ""
      }`}
    >
      {props.name}
    </button>
  );
}
