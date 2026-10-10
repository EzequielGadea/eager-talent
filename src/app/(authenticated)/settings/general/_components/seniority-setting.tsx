"use client";

import { GripVertical, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toast } from "~/components/ui/toast";
import { api } from "~/lib/trpc/react";
import { seniorityRouter } from "~/server/api/routers/seniority";

export default function SenioritySetting() {
  const { data, isLoading } = api.seniority.getAllSeniorities.useQuery({});

  type Seniority = NonNullable<typeof data>[number];
  const [seniorities, setSeniorities] = useState<Seniority[]>([]);
  const [savedSeniorities, setSavedSeniorities] = useState<Seniority[]>([]);

  useEffect(() => {
    if (!data) return;

    const nextSeniorities = data.map((seniority) => ({
      ...seniority,
    }));
    setSeniorities(nextSeniorities);
    setSavedSeniorities(nextSeniorities);
  }, [data]);

  const hasChanges =
    JSON.stringify(seniorities.map((seniority) => seniority.id)) !==
    JSON.stringify(savedSeniorities.map((seniority) => seniority.id));

  function moveSeniority(fromIndex: number, toIndex: number) {
    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= seniorities.length ||
      toIndex >= seniorities.length
    ) {
      return;
    }
    setSeniorities((current) => {
      const next = [...current];
      const [seniority] = next.splice(fromIndex, 1);
      if (seniority) next.splice(toIndex, 0, seniority);
      return next;
    });
  }

  const updateOrder = api.seniority.updateOrderSeniority.useMutation({
    onSuccess: () => {
      setSavedSeniorities(seniorities.map((seniority) => ({ ...seniority })));
      toast.add({ title: "Seniorities actualizada", type: "success" });
    },
    onError: (error) => {
      toast.add({ title: error.message, type: "error" });
    },
  });

  function handleCancel() {
    setSeniorities(savedSeniorities.map((seniority) => ({ ...seniority })));
  }

  function handleSave() {
    if (!data || !hasChanges) return;
    updateOrder.mutate({
      seniorities: seniorities.map((seniority, index) => ({
        id: seniority.id,
        name: seniority.name,
        order: index + 1,
      })),
    });
  }

  return (
    <Card className="w-full rounded-xl shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-baseline gap-2">
          <CardTitle className="text-sm font-semibold">
            Motivos de descalificación
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        <ol className="flex flex-col gap-2">
          {seniorities?.map((seniority, index) => {
            return (
              <li
                key={seniority.id}
                className="flex items-center gap-2.5 rounded-lg border border-border-default px-2 py-2 w-full"
                onDragOver={(event) => {
                  event.preventDefault();
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  moveSeniority(
                    Number(event.dataTransfer.getData("text/plain")),
                    index,
                  );
                }}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  draggable={true}
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", String(index));
                  }}
                >
                  <GripVertical aria-hidden="true" />
                </Button>
                <span className="w-3.5 text-center font-mono text-[11px] text-text-tertiary">
                  {" "}
                  {index + 1}
                </span>
                <span
                  aria-hidden="true"
                  className="size-2.5 shrink-0 rounded-full"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-text-primary">
                    {seniority.name}
                  </span>
                </div>
                <Button type="button" variant="ghost" size="icon-sm">
                  <X aria-hidden="true" />
                </Button>
              </li>
            );
          })}
        </ol>
        <button
          type="button"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border-default py-3 text-[13px] font-medium text-text-tertiary transition-colors hover:bg-surface-hover"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Agregar etapa
        </button>
        {hasChanges && (
          <div className="flex justify-end gap-2 border-t border-border-default pt-3">
            <Button onClick={handleCancel} disabled={updateOrder.isPending}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={updateOrder.isPending}>
              Aceptar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
