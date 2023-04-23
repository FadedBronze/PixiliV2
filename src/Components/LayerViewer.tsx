import { useContext } from "react";
import { UILayer, useLayerState } from "../useLayerState";
import { AppStateContext } from "../AppState";

export default function LayerViewer() {
  const layerState = useLayerState();
  const layerStateVal = layerState.get();
  const appState = useContext(AppStateContext);

  return (
    <div className="h-96">
      {layerStateVal.layers.map((layer) => (
        <Layer
          select={() => {
            appState.editingLayerName.value = layer.name;

            layerState.set((oldState) => {
              const newState = { ...oldState };

              newState.editingLayerName = layer.name;
              return newState;
            });
          }}
          selected={layerStateVal.editingLayerName === layer.name}
          setName={(name) => {
            appState.frame.find(({ name }) => name === layer.name)!.name = name;

            layerState.set((oldState) => {
              const newState = { ...oldState };
              const currentLayer = newState.layers.find(
                ({ name }) => name === layer.name
              )!;

              currentLayer.name = name;
              return newState;
            });
          }}
          setVisibility={(visibility) => {
            layerState.set((oldState) => {
              const newState = { ...oldState };
              const currentLayer = newState.layers.find(
                ({ name }) => name === layer.name
              )!;

              currentLayer.visible = visibility;
              return newState;
            });
          }}
          setOpacity={(opacity) => {
            layerState.set((oldState) => {
              const newState = { ...oldState };
              const currentLayer = newState.layers.find(
                ({ name }) => name === layer.name
              )!;

              currentLayer.opacity = opacity;
              return newState;
            });
          }}
          key={layer.name}
          layer={layer}
        ></Layer>
      ))}
    </div>
  );
}

function Layer(props: {
  select: () => void;
  layer: UILayer;
  selected: boolean;
  setOpacity: (state: number) => void;
  setVisibility: (state: boolean) => void;
  setName: (state: string) => void;
}) {
  const { layer, setName, setOpacity, setVisibility, selected, select } = props;
  return (
    <div
      className={`p-2 bg-white bg-opacity-10 rounded-md m-2 ${
        selected ? "bg-opacity-20 border border-white border-opacity-40" : ""
      }`}
      style={{
        backdropFilter: "blur(10px)",
      }}
      onClick={() => select()}
    >
      <div className="flex justify-between">
        <input
          className="w-24 bg-transparent outline-none"
          type="text"
          value={layer.name}
          onChange={(e) => setName(e.currentTarget.value)}
        />
        <input
          type="checkbox"
          onChange={(e) => setVisibility(e.currentTarget.checked)}
          checked={layer.visible}
        ></input>
      </div>
      <input
        className="opacity w-full bg-transparent block"
        type="range"
        onChange={(e) => setOpacity(parseFloat(e.currentTarget.value) / 100)}
        value={layer.opacity * 100}
      ></input>
    </div>
  );
}
