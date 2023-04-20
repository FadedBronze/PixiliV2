import { useContext, useState } from "react";
import { AppStateContext } from "../AppState";

export function ColorPalette() {
  const appState = useContext(AppStateContext);

  const [colors, setColors] = useState([
    "#FF00FF",
    "#FF0000",
    "#FFFF00",
    "#00FF00",
    "#00FFFF",
    "#0000FF",
  ]);

  const [selectedColor, setSelectedColor] = useState("#0000FF");

  const addColor = (color: string) => {
    if (colors.includes(color.toLocaleUpperCase())) return;
    setColors([...colors, color.toLocaleUpperCase()]);
  };

  return (
    <div className=" bg-slate-500">
      <div className="w-full flex justify-center items-center aspect-square border-b border-white">
        <input
          className=""
          type="color"
          value={appState.color.value}
          onChange={(e) => {
            appState.color.value = e.currentTarget.value;
          }}
        />
      </div>
      <div className="flex border-b border-white p-2 flex-wrap">
        {colors.map((color) => (
          <ColorOption
            selected={selectedColor === color}
            select={() => setSelectedColor(color)}
            delete={() =>
              setColors(colors.filter((newColor) => newColor !== color))
            }
            setColor={() => (appState.color.value = color)}
            color={color}
            key={color}
          />
        ))}
        <button
          className="w-1/4 aspect-square bg-slate-500 text-white"
          onClick={() => {
            addColor(appState.color.value);
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}

function ColorOption(props: {
  color: string;
  setColor: () => void;
  selected: boolean;
  select: () => void;
  delete: () => void;
}) {
  return (
    <button
      className={`w-1/4 aspect-square ${
        props.selected ? "border-2 border-white" : ""
      }`}
      onClick={() => {
        if (props.selected) props.delete();

        props.select();
        props.setColor();
      }}
      style={{
        backgroundColor: props.color,
      }}
    ></button>
  );
}
