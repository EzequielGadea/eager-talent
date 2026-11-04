"use client";

import { arrayMove } from "@dnd-kit/sortable";
import { Plus, X } from "lucide-react";

import {
  DragHandle,
  SortableList,
  type SortableRowState,
} from "~/components/sortable-list";
import { Button } from "~/components/ui/button";
import {
  ColorPicker,
  ColorPickerHex,
  ColorPickerInput,
} from "~/components/ui/color-picker";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  FORM_TO_PERSISTED_STAGE_TYPE,
  PERSISTED_TO_FORM_STAGE_TYPE,
  jobOpeningStageTypeSchema,
  type JobOpeningStageType,
  type PersistedStage,
} from "~/lib/validations/job-opening";
import { cn } from "~/lib/utils";

export type StageFlowItem = {
  id: string;
  name: string;
  type: JobOpeningStageType;
  color: string;
};

type StageChanges = Partial<Omit<StageFlowItem, "id">>;

const NEW_STAGE_COLORS = ["#64748B", "#2563EB", "#F59E0B", "#10B981"];

const STAGE_TYPES: Array<{
  value: JobOpeningStageType;
  label: string;
  className: string;
}> = [
  { value: "none", label: "Ninguna", className: "" },
  {
    value: "interview",
    label: "Entrevista",
    className: "bg-tag-blue-bg text-tag-blue-fg [&_svg]:text-tag-blue-fg",
  },
  {
    value: "offer",
    label: "Oferta",
    className: "bg-tag-amber-bg text-tag-amber-fg [&_svg]:text-tag-amber-fg",
  },
  {
    value: "hired",
    label: "Contratado",
    className: "bg-tag-green-bg text-tag-green-fg [&_svg]:text-tag-green-fg",
  },
];

const stageLabel = (stage: StageFlowItem, index: number) =>
  stage.name.trim() || String(index + 1);

function createStageFlowItem(position: number): StageFlowItem {
  return {
    id: crypto.randomUUID(),
    name: "",
    type: "none",
    color: NEW_STAGE_COLORS[position % NEW_STAGE_COLORS.length] ?? "#64748B",
  };
}

type StageControlProps<T> = {
  label: string;
  value: T;
  onChange: (value: T) => void;
};

function StageColorPicker({
  label,
  value,
  onChange,
}: StageControlProps<string>) {
  return (
    <Popover>
      <PopoverTrigger
        type="button"
        className="size-4 shrink-0 cursor-pointer rounded-full border border-border-default p-0"
        style={{ backgroundColor: value }}
        aria-label={`Elegir color de la etapa ${label}`}
      />
      <PopoverContent align="start" className="w-56 rounded-xl p-3">
        <ColorPicker>
          <ColorPickerHex color={value} onChange={onChange} />
          <ColorPickerInput
            type="text"
            aria-label={`Código de color de la etapa ${label}`}
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        </ColorPicker>
      </PopoverContent>
    </Popover>
  );
}

function StageTypeSelect({
  label,
  value,
  onChange,
  disabled,
}: StageControlProps<JobOpeningStageType> & { disabled: boolean }) {
  return (
    <Select
      value={value}
      items={STAGE_TYPES}
      disabled={disabled}
      onValueChange={(next) => {
        const type = jobOpeningStageTypeSchema.safeParse(next);

        if (type.success) onChange(type.data);
      }}
    >
      <SelectTrigger
        size="sm"
        aria-label={`Tipo de etapa de ${label}`}
        className={cn(
          "col-start-4 row-start-2 w-full min-w-0 rounded-full text-xs md:col-start-auto md:row-start-auto md:w-28",
          STAGE_TYPES.find((type) => type.value === value)?.className,
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectGroup>
          {STAGE_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

type StageRowProps = {
  stage: StageFlowItem;
  index: number;
  locked: boolean;
  row: SortableRowState;
  nameError?: string;
  onUpdate: (changes: StageChanges) => void;
  onRemove: () => void;
};

function StageRow({
  stage,
  index,
  locked,
  row,
  nameError,
  onUpdate,
  onRemove,
}: StageRowProps) {
  const label = stageLabel(stage, index);

  return (
    <li
      {...row.rowProps}
      className={cn(
        "grid grid-cols-[auto_auto_auto_minmax(0,1fr)_auto] items-center gap-2.5 rounded-lg border border-border-default px-2 py-2 md:grid-cols-[auto_auto_auto_minmax(0,1fr)_auto_auto]",
        row.rowProps.className,
      )}
    >
      <DragHandle {...row.handle} label={`etapa ${label}`} />

      <span className="w-3.5 text-center font-mono text-label tabular-nums text-text-tertiary">
        {index + 1}
      </span>

      {/* The color can always be changed, even when the flow is locked. */}
      <StageColorPicker
        label={label}
        value={stage.color}
        onChange={(color) => onUpdate({ color })}
      />

      <div className="min-w-0 flex-1">
        <Input
          aria-label={`Nombre de la etapa ${index + 1}`}
          placeholder="Nombre de la etapa"
          autoComplete="off"
          maxLength={80}
          value={stage.name}
          disabled={locked}
          className={cn(
            "h-7 px-1 font-medium shadow-none",
            !locked &&
              "border-transparent bg-transparent hover:border-border-default",
          )}
          errorMessage={nameError}
          onChange={(event) => onUpdate({ name: event.target.value })}
        />
      </div>

      <StageTypeSelect
        label={label}
        value={stage.type}
        disabled={locked}
        onChange={(type) => onUpdate({ type })}
      />

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="col-start-5 row-start-1 md:col-start-auto md:row-start-auto"
        disabled={locked}
        aria-label={
          locked
            ? `No se puede eliminar la etapa ${label}`
            : `Eliminar etapa ${label}`
        }
        onClick={onRemove}
      >
        <X aria-hidden="true" />
      </Button>
    </li>
  );
}

type StageFlowEditorProps = {
  stages: StageFlowItem[];
  // Stages that can't be renamed, retyped or removed (but can be reordered).
  lockedIds?: ReadonlySet<string>;
  // Blocks structural edits (rename, type, remove, reorder, add). Colors stay editable.
  disabled?: boolean;
  getNameError?: (index: number) => string | undefined;
  onUpdate: (index: number, changes: StageChanges) => void;
  onInsert: (index: number, stage: StageFlowItem) => void;
  onRemove: (index: number) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
};

export function StageFlowEditor({
  stages,
  lockedIds,
  disabled = false,
  getNameError,
  onUpdate,
  onInsert,
  onRemove,
  onMove,
}: StageFlowEditorProps) {
  return (
    <div className="flex flex-col gap-3">
      <SortableList
        items={stages}
        fixedEnds
        disabled={disabled}
        onMove={onMove}
        getLabel={(stage, index) => `la etapa ${stageLabel(stage, index)}`}
        renderRow={(stage, index, row) => (
          <StageRow
            stage={stage}
            index={index}
            row={row}
            // The fixed first and last stages (and everything while the flow
            // is disabled) can't be dragged, and can't be edited either.
            locked={!row.handle.draggable || Boolean(lockedIds?.has(stage.id))}
            nameError={getNameError?.(index)}
            onUpdate={(changes) => onUpdate(index, changes)}
            onRemove={() => onRemove(index)}
          />
        )}
      />

      <button
        type="button"
        disabled={disabled}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border-default py-3 text-small font-medium text-text-tertiary transition-colors hover:bg-surface-hover disabled:pointer-events-none disabled:opacity-50"
        onClick={() =>
          onInsert(
            Math.max(stages.length - 1, 0),
            createStageFlowItem(stages.length),
          )
        }
      >
        <Plus className="size-4" aria-hidden="true" />
        Agregar etapa
      </button>
    </div>
  );
}

type PersistedStageFlowEditorProps = {
  stages: PersistedStage[];
  onChange: (stages: PersistedStage[]) => void;
  lockedKeys?: ReadonlySet<string>;
  disabled?: boolean;
};

// Adapter for flows kept as plain PersistedStage arrays in local state.
export function PersistedStageFlowEditor({
  stages,
  onChange,
  lockedKeys,
  disabled,
}: PersistedStageFlowEditorProps) {
  return (
    <StageFlowEditor
      stages={stages.map((stage) => ({
        id: stage.key,
        name: stage.name,
        type: PERSISTED_TO_FORM_STAGE_TYPE[stage.type],
        color: stage.color,
      }))}
      lockedIds={lockedKeys}
      disabled={disabled}
      onUpdate={(index, { type, ...changes }) =>
        onChange(
          stages.map((stage, stageIndex) =>
            stageIndex === index
              ? {
                  ...stage,
                  ...changes,
                  ...(type && { type: FORM_TO_PERSISTED_STAGE_TYPE[type] }),
                }
              : stage,
          ),
        )
      }
      onInsert={(index, item) =>
        onChange([
          ...stages.slice(0, index),
          {
            key: item.id,
            name: item.name,
            type: FORM_TO_PERSISTED_STAGE_TYPE[item.type],
            label: "text",
            color: item.color,
          },
          ...stages.slice(index),
        ])
      }
      onRemove={(index) =>
        onChange(stages.filter((_, stageIndex) => stageIndex !== index))
      }
      onMove={(fromIndex, toIndex) =>
        onChange(arrayMove(stages, fromIndex, toIndex))
      }
    />
  );
}
