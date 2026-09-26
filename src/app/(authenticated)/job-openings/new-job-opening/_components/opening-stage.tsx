"use client";

import { JobOpeningFormValues } from "./new-job-opening-form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Controller, useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { GripVertical, X, Plus, Info, ChevronDown } from "lucide-react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useRef, useState } from "react";

type Stage = {
  id:string,
  name:string,
  type:string,
  index:number
}

export default function OpeningStage() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<JobOpeningFormValues>();

  //TODO esto debe venir del flujo por defecto originalmente
  const stagesDefault = [
    { id:"0", name: "Revisión Inicial", type: "Entrevista", index:0 },
    { id:"1", name: "Entrevista Técnica", type: "Entrevista", index:1 },
    { id:"2", name: "Entrevista Cultural", type: "Entrevista",index:2 },
    { id:"3", name: "Oferta", type: "Entrevista", index:3 },
  ];

  function getStage(id: string) {
    return stagesDefault[stages.findIndex(stage => stage.id === id)]
  } 
  const [stages, setStages] = useState(stagesDefault)

  function reorderStages(dragId:string, dropId:string){
    setStages((currentStages) => {
      const dragIndex = currentStages.findIndex((stage) => stage.id === dragId)
      const dropIndex = currentStages.findIndex((stage) => stage.id === dropId)
      if (dragIndex === -1 || dropIndex === -1 || dragIndex === dropIndex) {
        return currentStages;
      }
      const newStages = [...currentStages];
      const [moved] = newStages.splice(dragIndex,1);
      newStages.splice(dropIndex,0,moved);
      return newStages;
    });
  };

  return (
    <Card className="w-full rounded-x1 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          Flujo del proceso{" "}
          <span className="ml-2 align-middle text-xs font-normal text-text-tertiary">
            arrastrá para reordenar
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid flex-1 grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-1">
          <div className="space-y-2">
            <DndProvider backend={HTML5Backend}>
              {stages.map((stage) => (
                <IndividualStage key={stage.id} stage={stage} onDrop={reorderStages} getStage={getStage}/>
              ))}
            </DndProvider>
          </div>
          <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border-default py-3 text-[13px] font-medium text-text-tertiary transition-colors hover:bg-surface-hover">
            <Plus className="h-4 w-4" />
            Agregar etapa
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function IndividualStage(props:{stage:Stage, onDrop:(dragged:string, dropedOn:string)=>void, getStage:(id:string)=>Stage}){

  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'stage',
    item: { 
      id: props.stage.id
    },
    collect: (monitor) => ({
        isDragging: monitor.isDragging(),
    }),
  }));
  const [, drop] = useDrop(() => ({
    accept: "stage",

    hover(item: { id: string }, monitor) {
      if (!ref.current) return;

      if (item.id === props.stage.id) {
        return;
      }

      const dragIndex = props.getStage(item.id).index;
      const hoverIndex = props.getStage(props.stage.id).index;

      const rect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (rect.bottom - rect.top) / 2;

      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const hoverClientY = clientOffset.y - rect.top;


      if (
        dragIndex < hoverIndex &&
        hoverClientY < hoverMiddleY
      ) {
        return;
      }

      // Dragging upward: don't move until cursor crosses midpoint.
      if (
        dragIndex> hoverIndex &&
        hoverClientY > hoverMiddleY
      ) {
        return;
      }
      props.onDrop(item.id, props.stage.id);
    },
  }));

  drag(drop(ref))
  return (
    <div
      ref={ref}
      data-stage-id={props.stage.id}
      className="flex h-12 items-center gap-4 rounded-lg border border-border-default bg-surface-card p-3 transition-colors hover:bg-surface-hover "
    >
      <GripVertical className="h-4 w-4 cursor-grab text-text-tertiary hover:text-text-secondary" />
      <span className="w-4 text-[13px] font-medium text-text-tertiary">
        {props.stage.index + 1}
      </span>
      <div className="h-2 w-2 rounded-full bg-blue-500" />
      <span className="flex-1 text-[13px] font-medium text-text-primary">
        {props.stage.name}
      </span>
      <div className="flex items-center gap-1 flex-nowrap rounded-full border border-border-default px-3 py-1 text-[12px] font-medium text-text-secondary">
        {props.stage.type}
        <ChevronDown className="h-3 w-3 text-text-tertiary" />
      </div>
      <button className="flex items-center justify-center rounded-md p-1 hover:bg-surface-sunken">
        <X className="h-4 w-4 text-text-tertiary hover:text-text-secondary" />
      </button>
    </div>
  )
}