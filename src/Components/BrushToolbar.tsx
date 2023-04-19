import { useContext, useState } from "react";
import { AppStateContext } from "../AppState";

export function BrushToolbar(props: {
  selectedBrush: string;
  setSelectedBrush: (value: string) => void;
}) {
  const appState = useContext(AppStateContext);

  return (
    <div className="p-4 h-full flex flex-wrap grow  w-full gap-2 justify-top flex-col align-center bg-slate-500">
      {appState.brushStates.map(({ brush }) => (
        <BrushToolbarBrush
          name={brush.name}
          key={brush.name}
          selected={props.selectedBrush === brush.name}
          select={() => {
            appState.brush = brush;
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
