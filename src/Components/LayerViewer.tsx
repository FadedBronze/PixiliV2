import { UILayer, useLayerState } from "../useLayerState";

export default function LayerViewer() {
  const layerState = useLayerState();
  const layerStateVal = layerState.get();

  return (
    <div className="h-96">
      {layerStateVal.layers.map((layer) => (
        <Layer key={layer.name} layer={layer}></Layer>
      ))}
    </div>
  );
}

function Layer(props: { layer: UILayer }) {
  const { layer } = props;
  return (
    <div
      className="p-2 bg-white bg-opacity-10 rounded-md m-2"
      style={{
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="flex justify-between">
        <input
          className="w-24 bg-transparent outline-none"
          type="text"
          defaultValue={layer.name}
        />
        <input type="checkbox" defaultChecked={layer.visible}></input>
      </div>
      <input
        className="opacity w-full bg-transparent block"
        type="range"
        onChange={() => {}}
        value={layer.opacity * 100}
      ></input>
    </div>
  );
}
