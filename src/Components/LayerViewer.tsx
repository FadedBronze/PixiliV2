import { MouseEvent, useContext, useRef } from "react";
import { UILayer, useLayerState } from "../useLayerState";
import { AppStateContext } from "../AppState";
import {
  Droppable,
  DragDropContext,
  Draggable,
  DraggableProvided,
} from "@hello-pangea/dnd";

export default function LayerViewer() {
  const layerState = useLayerState();
  const layerStateVal = layerState.get();
  const appState = useContext(AppStateContext);

  return (
    <>
      <DragDropContext
        onDragEnd={(result) => {
          layerState.set((oldState) => {
            if (result.destination === null) return oldState;

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

            return newState;
          });
        }}
      >
        <LayerMenu></LayerMenu>
        <Droppable droppableId="layers">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="h-fit max-h-48 overflow-y-scroll w-full"
            >
              {[...layerStateVal.layers].reverse().map((layer, i) => (
                <Draggable key={layer.name} index={i} draggableId={layer.name}>
                  {(provided) => (
                    <Layer
                      provided={provided}
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
                        if (name === "") return;

                        if (appState.frame.some((layer) => layer.name === name))
                          return;

                        appState.frame.find(
                          ({ name }) => name === layer.name
                        )!.name = name;

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
    </>
  );
}

function Layer(props: {
  select: () => void;
  layer: UILayer;
  selected: boolean;
  setOpacity: (state: number) => void;
  setVisibility: (state: boolean) => void;
  setName: (state: string) => void;
  provided: DraggableProvided;
}) {
  const layerNameInputRef = useRef<HTMLInputElement>(null);

  const {
    layer,
    setName,
    setOpacity,
    setVisibility,
    selected,
    select,
    provided,
  } = props;
  return (
    <div
      {...provided.dragHandleProps}
      {...provided.draggableProps}
      ref={provided.innerRef}
      className={`p-2 bg-white bg-opacity-10 rounded-md m-2 ${
        selected ? "bg-opacity-20 border border-white border-opacity-40" : ""
      }`}
      onClick={() => select()}
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

function LayerMenu() {
  const layerState = useLayerState();
  const appState = useContext(AppStateContext);

  return (
    <div className="mx-2 bg-white bg-opacity-10 rounded-md">
      <LayerMenuButton
        onClick={(e: MouseEvent) => {
          layerState.set((oldState) => {
            const newState = { ...oldState };

            let layerNumber = 0;

            while (true) {
              if (
                !oldState.layers.find(
                  (layer) => layer.name === `layer ${layerNumber}`
                )
              ) {
                break;
              }

              layerNumber++;
            }

            oldState.layers.push({
              name: `layer ${layerNumber}`,
              opacity: 1,
              visible: true,
            });

            appState.frame.push({
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
      <LayerMenuButton onClick={(e: MouseEvent) => {}}>✕</LayerMenuButton>
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
