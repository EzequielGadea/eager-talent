"use client";

import { JobOpeningFormValues } from "./new-job-opening-form";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { GripVertical, X, Plus, ChevronDown } from "lucide-react";
import { useDrag, useDrop } from "react-dnd";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { Stage, Stages } from "../utils";
import { useForm } from "react-hook-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { Button } from "@base-ui/react";
import {
  ColorPicker,
  ColorPickerHex,
  ColorPickerInput,
} from "~/components/ui/color-picker";

const types = [
  { name: "Ninguna", key: 0 },
  { name: "Entrevista", key: 1 },
  { name: "Oferta", key: 2 },
  { name: "Contratado", key: 3 },
];

export default function OpeningStage(props: {
  stages: Stages;
  setStages: Dispatch<SetStateAction<Stages>>;
  form: ReturnType<typeof useForm<JobOpeningFormValues>>;
}) {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<JobOpeningFormValues>();
  const { fields, replace, remove, insert } = useFieldArray({
    control,
    name: "stages",
  });
  const startKey = props.stages[0].key;
  const endKey = props.stages[props.stages.length - 1].key;

  function getStageIndex(key: string) {
    return props.stages.findIndex((stage) => stage.key === key);
  }

  function reorderStages(dragKey: string, dropKey: string) {
    props.setStages((currentStages: Stages) => {
      const dragIndex = currentStages.findIndex(
        (stage) => stage.key === dragKey,
      );
      const dropIndex = currentStages.findIndex(
        (stage) => stage.key === dropKey,
      );
      if (dragIndex === -1 || dropIndex === -1 || dragIndex === dropIndex) {
        return currentStages;
      }
      const newStages = [...currentStages];
      const [moved] = newStages.splice(dragIndex, 1);
      newStages.splice(dropIndex, 0, moved);
      return newStages;
    });
  }

  function handleDragEnd() {
    replace(props.stages);
  }

  function newStage() {
    const key = crypto.randomUUID();
    const added = {
      key: key,
      name: "nueva etapa",
      type: "Ninguna",
      label: "text",
      color: "rgb(34, 42, 180)",
    };
    props.setStages((currentStages: Stages) => {
      const newStages = [...currentStages];
      newStages.splice(currentStages.length - 1, 0, added);
      return newStages;
    });
    insert(fields.length - 1, added);
  }

  function removeStage(key: string) {
    const index = props.stages.findIndex((stage) => stage.key === key);
    props.setStages((currentStages: Stages) => {
      const newStages = [...currentStages];
      newStages.splice(index, 1);
      return newStages;
    });
    remove(index);
  }

  const [openType, setOpenType] = useState<string | null>(null);
  function updateType(stageKey: string, typeKey: number) {
    const newType = types[typeKey].name;
    const index = getStageIndex(stageKey);
    props.setStages((currentStages: Stages) => {
      const newStages = currentStages.map((stage) => {
        return stage.key === stageKey ? { ...stage, type: newType } : stage;
      });
      return newStages;
    });
    setValue(`stages.${index}.type`, newType);
  }

  const [openColor, setOpenColor] = useState<string | null>(null);
  function updateColor(stageKey: string, value: string) {
    const index = getStageIndex(stageKey);
    props.setStages((currentStages: Stages) => {
      const newStages = currentStages.map((stage) => {
        return stage.key === stageKey ? { ...stage, color: value } : stage;
      });
      return newStages;
    });
    setValue(`stages.${index}.color`, value);
  }

  function updateName(stageKey: string, value: string) {
    const index = getStageIndex(stageKey);
    props.setStages((current: Stages) =>
      current.map((s) => (s.key === stageKey ? { ...s, name: value } : s)),
    );
    setValue(`stages.${index}.name`, value);
  }
  
  return (
    <Card className="w-full rounded-x1 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          Flujo del proceso{" "}
          <span className="ml-2 align-middle text-xs font-normal text-text-tertiary">
            arrastrá para reordenar
          </span>
        </CardTitle>
        {errors.stages && (
          <p className="text-xs text-danger whitespace-pre-line">
            {errors.stages?.message}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid flex-1 grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-1">
          <div className="space-y-2">
            {props.stages.map((stage) => (
              <IndividualStage
                key={stage.key}
                stage={stage}
                onDrop={reorderStages}
                getStageIndex={getStageIndex}
                startKey={startKey}
                endKey={endKey}
                onDragEnd={handleDragEnd}
                removeStage={removeStage}
                setOpenType={setOpenType}
                openType={openType}
                updateType={updateType}
                updateColor={updateColor}
                setOpenColor={setOpenColor}
                openColor={openColor}
                updateName={updateName}
              />
            ))}
          </div>
          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border-default py-3 text-[13px] font-medium text-text-tertiary transition-colors hover:bg-surface-hover"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              newStage();
            }}
            type="button"
          >
            <Plus className="h-4 w-4" />
            Agregar etapa
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function IndividualStage(props: {
  stage: Stage;
  onDrop: (dragged: string, dropedOn: string) => void;
  getStageIndex: (key: string) => number;
  startKey: string;
  endKey: string;
  onDragEnd: () => void;
  removeStage: (key: string) => void;
  openType: string | null;
  setOpenType: (key: string | null) => void;
  updateType: (stageKey: string, typeKey: number) => void;
  updateColor: (stageKey: string, colorValue: string) => void;
  openColor: string | null;
  setOpenColor: (key: string | null) => void;
  updateName: (stageKey: string, name: string) => void;
}) {
  const isDraggable = !(
    props.stage.key == props.startKey || props.stage.key == props.endKey
  );
  const ref = useRef<HTMLDivElement>(null);

  const [, drag] = useDrag(
    () => ({
      type: "stage",
      item: () => ({ key: props.stage.key /*latest.current.stage.key */ }),
      canDrag: () => {
        return (
          props.stage.key !== props.startKey && props.stage.key !== props.endKey
        );
      },
      end: () => {
        props.onDragEnd();
      },
    }),
    [],
  );

  const [, drop] = useDrop(
    () => ({
      accept: "stage",
      hover(item: { key: string }, monitor) {
        if (
          props.stage.key === props.startKey ||
          props.stage.key === props.endKey
        )
          return; // can't drop on fixed stages
        if (!ref.current) return;
        if (item.key === props.stage.key) return;

        const dragIndex = props.getStageIndex(item.key);
        const hoverIndex = props.getStageIndex(props.stage.key);

        const rect = ref.current.getBoundingClientRect();
        const hoverMiddleY = (rect.bottom - rect.top) / 2;
        const clientOffset = monitor.getClientOffset();
        if (!clientOffset) return;
        const hoverClientY = clientOffset.y - rect.top;

        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

        props.onDrop(item.key, props.stage.key);
      },
    }),
    [],
  );

  const setRef = (node: HTMLDivElement | null) => {
    ref.current = node;
    if (node) drag(drop(node));
  };

  return (
    <div
      ref={setRef}
      data-stage-key={props.stage.key}
      className="flex h-12 items-center gap-4 rounded-lg border border-border-default bg-surface-card p-3 transition-colors hover:bg-surface-hover "
    >
      {isDraggable ? (
        <GripVertical className="h-4 w-4 cursor-grab text-text-tertiary hover:text-text-secondary" />
      ) : (
        <div className="pl-4" />
      )}
      <span className="w-4 text-[13px] font-medium text-text-tertiary">
        {props.getStageIndex(props.stage.key) + 1}
      </span>
      <Popover
        key={props.stage.key}
        open={props.openColor === props.stage.key}
        onOpenChange={(open) => {
          props.setOpenColor(open ? props.stage.key : null);
        }}
      >
        <PopoverTrigger
          type="button"
          className="h-3 w-3 cursor-pointer rounded-full border-0 p-0"
          style={{ backgroundColor: props.stage.color }}
          aria-label="Elegir color"
        />
        <PopoverContent align="start" className="w-56 rounded-xl p-3">
          <ColorPicker>
            <ColorPickerHex
              color={props.stage.color}
              onChange={(colorValue) =>
                props.updateColor(props.stage.key, colorValue)
              }
            />
            <ColorPickerInput
              type="text"
              value={props.stage.color}
              onChange={(e) =>
                props.updateColor(props.stage.key, e.target.value)
              }
            />
          </ColorPicker>
        </PopoverContent>
      </Popover>
      {isDraggable ? (
        <>
          <div className="flex-1">
            <input
              value={props.stage.name}
              onChange={(e) =>
                props.updateName(props.stage.key, e.target.value)
              }
              className="w-auto rounded-md border border-border-default bg-transparent px-2 py-1 text-[13px]"
            />
          </div>

          {/*combobox type*/}
          <Popover
            key={props.stage.key}
            open={props.openType === props.stage.key}
            onOpenChange={(open) => {
              props.setOpenType(open ? props.stage.key : null);
            }}
          >
            <PopoverTrigger
              className={cn(
                "flex h-8.5 items-center gap-2 rounded-lg border border-dashboard-border bg-white px-4 text-[13px] font-normal text-dashboard-text-muted shadow-none transition-colors hover:bg-dashboard-success-light hover:text-dashboard-success-text",
              )}
            >
              <span>{props.stage.type}</span>
              <ChevronDown
                size={14}
                className={cn("text-dashboard-text-muted")}
              />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-56 rounded-xl p-3">
              {types.map((type) => (
                <Button
                  key={type.key}
                  type="button"
                  className="flex cursor-pointer items-center gap-2"
                  onClick={() => {
                    props.updateType(props.stage.key, type.key);
                    props.setOpenType(null);
                  }}
                >
                  {type.name}
                </Button>
              ))}
            </PopoverContent>
          </Popover>
          <button
            className="flex items-center justify-center rounded-md p-1 hover:bg-surface-sunken"
            onClick={() => {
              props.removeStage(props.stage.key);
            }}
            type="button"
          >
            <X className="h-4 w-4 text-text-tertiary hover:text-text-secondary" />
          </button>
        </>
      ) : (
        <span>{props.stage.name}</span>
      )}
    </div>
  );
}
