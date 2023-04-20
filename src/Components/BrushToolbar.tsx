import { useContext, useState } from "react";
import { AppStateContext } from "../AppState";

export function BrushToolbar(props: {
  selectedBrush: string;
  setSelectedBrush: (value: string) => void;
}) {
  const appState = useContext(AppStateContext);

  return (
    <div className="p-2 gap-2 h-48 w-48 grid grid-cols-3 bg-slate-500 z-0 overflow-y-scroll overflow-x-hidden">
      {appState.brushStates.map(({ brush }) => (
        <BrushToolbarBrush
          name={brush.name}
          key={brush.name}
          selected={props.selectedBrush === brush.name}
          select={() => {
            appState.brush.value = brush;
            props.setSelectedBrush(brush.name);
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
