import { useHookstate, hookstate } from "@hookstate/core";

export type UILayer = {
  visible: boolean;
  opacity: number;
  name: string;
};

export type LayerState = {
  editingLayerName: string;
  layers: UILayer[];
};

const layerState = hookstate<LayerState>({
  editingLayerName: "layer 1",
  layers: [
    {
      visible: true,
      opacity: 0.5,
      name: "layer 1",
    },
    {
      visible: true,
      opacity: 1,
      name: "background",
    },
  ],
});

export const useLayerState = () => useHookstate(layerState);
