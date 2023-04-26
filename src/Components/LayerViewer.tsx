import { MouseEvent, useContext, useRef, useState } from "react";
import { UILayer, useLayerState } from "../useLayerState";
import { AppStateContext } from "../AppState";
import {
  Droppable,
  DragDropContext,
  Draggable,
  DraggableProvided,
} from "@hello-pangea/dnd";
import mergeLayers from "../helpers/mergeLayers";
import { Layer } from "../App";

export default function LayerViewer() {
  const layerState = useLayerState();
  const layerStateVal = layerState.get();
  const appState = useContext(AppStateContext);
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <div
      onMouseLeave={(e) => {
        setSelected([]);
      }}
    >
      <LayerMenu selected={selected}></LayerMenu>
      <DragDropContext
        onDragEnd={(result) => {
          layerState.set((oldState) => {
            if (!result.destination) return oldState;
            console.log(oldState);

            const newState = { ...oldState };

            const [reorderedItem] = newState.layers.splice(
              result.source.index,
              1
            );
            newState.layers.splice(result.destination.index, 0, reorderedItem);

            const [reorderedItem2] = appState.frame.splice(
              result.source.index,
              1
            );
            appState.frame.splice(result.destination.index, 0, reorderedItem2);

            console.log(newState);

            return newState;
          });
        }}
      >
        <Droppable droppableId="layers">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="h-fit max-h-48 overflow-y-scroll w-full"
            >
              {layerStateVal.layers.map((layer, i) => (
                <Draggable key={layer.name} index={i} draggableId={layer.name}>
                  {(provided) => (
                    <Layer
                      provided={provided}
                      selected={
                        selected.find((name) => name === layer.name) !==
                        undefined
                      }
                      select={(deselect: boolean) => {
                        if (deselect) {
                          setSelected((oldState) => {
                            return oldState.filter(
                              (name) => name !== layer.name
                            );
                          });

                          return;
                        }

                        if (!selected.some((name) => name === layer.name)) {
                          setSelected((oldState) => {
                            const newState = [...oldState];

                            newState.push(layer.name);

                            return newState;
                          });
                        }
                      }}
                      selectAsCurrent={() => {
                        appState.editingLayerName.value = layer.name;

                        layerState.set((oldState) => {
                          const newState = { ...oldState };

                          newState.editingLayerName = layer.name;
                          return newState;
                        });
                      }}
                      selectedAsCurrent={
                        layerStateVal.editingLayerName === layer.name
                      }
                      setName={(name) => {
                        if (name === "") return;

                        if (appState.frame.some((layer) => layer.name === name))
                          return;

                        const layerWithName = appState.frame.find(
                          ({ name }) => name === layer.name
                        );

                        if (layerWithName === undefined) return;

                        layerWithName.name = name;

                        layerState.set((oldState) => {
                          const newState = { ...oldState };
                          const currentLayer = newState.layers.find(
                            ({ name }) => name === layer.name
                          )!;

                          currentLayer.name = name;

                          if (layerStateVal.editingLayerName === layer.name) {
                            appState.editingLayerName.value = name;
                            newState.editingLayerName = name;
                          }
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
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

function Layer(props: {
  selectAsCurrent: () => void;
  layer: UILayer;
  selectedAsCurrent: boolean;
  setOpacity: (state: number) => void;
  setVisibility: (state: boolean) => void;
  setName: (state: string) => void;
  provided: DraggableProvided;
  select: (deselect: boolean) => void;
  selected: boolean;
}) {
  const layerNameInputRef = useRef<HTMLInputElement>(null);

  const {
    layer,
    setName,
    setOpacity,
    setVisibility,
    selectedAsCurrent,
    selectAsCurrent,
    provided,
    select,
    selected,
  } = props;

  return (
    <div
      {...provided.dragHandleProps}
      {...provided.draggableProps}
      ref={provided.innerRef}
      className={`p-2 bg-white bg-opacity-10 rounded-md outline-none m-2 mt-0 ${
        selectedAsCurrent ? "bg-opacity-20   " : ""
      } ${selected ? "border-white border border-opacity-40" : ""}`}
      onClick={(e) => {
        if (e.shiftKey) {
          select(selected);
          return;
        }
        selectAsCurrent();
      }}
    >
      <div className="flex justify-between">
        <input
          className="w-24 bg-transparent outline-none"
          type="text"
          defaultValue={layer.name}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (layerNameInputRef.current === null) return;

              setName(layerNameInputRef.current.value ?? layer.name);

              layerNameInputRef.current.value = layer.name;
            }
          }}
          onMouseOut={() => {
            if (layerNameInputRef.current === null) return;

            setName(layerNameInputRef.current?.value ?? layer.name);

            layerNameInputRef.current.value = layer.name;
          }}
          ref={layerNameInputRef}
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

function LayerMenu(props: { selected: string[] }) {
  const { selected } = props;
  const layerState = useLayerState();
  const appState = useContext(AppStateContext);

  return (
    <div className="mx-2 mb-2 bg-white bg-opacity-10 rounded-md">
      <LayerMenuButton
        onClick={(e: MouseEvent) => {
          layerState.set((oldState) => {
            const newState = { ...oldState };

            let layerNumber = 0;

            while (true) {
              if (
                !newState.layers.find(
                  (layer) => layer.name === `layer ${layerNumber}`
                )
              ) {
                break;
              }

              layerNumber++;
            }

            newState.layers.unshift({
              name: `layer ${layerNumber}`,
              opacity: 1,
              visible: true,
            });

            appState.frame.unshift({
              name: `layer ${layerNumber}`,
              pixels: new Map(),
              pixelsHistory: [],
            });

            return newState;
          });
        }}
      >
        +
      </LayerMenuButton>
      <LayerMenuButton
        onClick={(e: MouseEvent) => {
          layerState.set((oldState) => {
            const newState = { ...oldState };

            newState.layers = newState.layers.filter(
              ({ name }) => !selected.includes(name)
            );

            for (let i = appState.frame.length - 1; i >= 0; i--) {
              const layer = appState.frame[i];
              if (selected.includes(layer.name)) {
                appState.frame.splice(i, 1);
              }
            }

            if (
              !appState.frame.some(
                ({ name }) => name === appState.editingLayerName.value
              )
            ) {
              appState.editingLayerName.value = appState.frame[0].name;
              newState.editingLayerName = appState.frame[0].name;
            }

            return newState;
          });
          selected;
        }}
      >
        ✕
      </LayerMenuButton>
      <LayerMenuButton
        onClick={() => {
          const mergingLayers: Layer[] = [];

          for (let i = appState.frame.length - 1; i >= 0; i--) {
            const layer = appState.frame[i];
            if (selected.includes(layer.name)) {
              appState.frame.splice(i, 1);

              layerState.set((oldState) => {
                const newState = { ...oldState };
                newState.layers.splice(i, 1);
                return newState;
              });
              mergingLayers.push(layer);
            }
          }

          appState.frame.push(mergeLayers(...mergingLayers));

          layerState.set((oldState) => {
            const newState = { ...oldState };

            newState.layers.push({
              name: mergingLayers[0].name,
              opacity: 1,
              visible: true,
            });

            return newState;
          });
        }}
      >
        M
      </LayerMenuButton>
    </div>
  );
}

function LayerMenuButton(props: {
  children: React.ReactNode;
  onClick: (e: MouseEvent) => void;
}) {
  const { children, onClick } = props;
  return (
    <button
      onClick={onClick}
      className="rounded-full h-6 my-2 ml-2 bg-white aspect-square bg-opacity-20 text-xs"
    >
      {children}
    </button>
  );
}
