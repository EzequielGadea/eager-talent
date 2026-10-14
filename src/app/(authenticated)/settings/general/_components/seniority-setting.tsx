"use client";

import { GripVertical, Plus, X } from "lucide-react";

import { useState } from "react";
import type { inferRouterOutputs } from "@trpc/server";

import { Button } from "~/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import { Input } from "~/components/ui/input";

import { toast } from "~/components/ui/toast";

import { api } from "~/lib/trpc/react";
import type { AppRouter } from "~/server/api/root";
import { GeneralSettingsCardSkeleton } from "./general-settings-card-skeleton";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

type Seniority = NonNullable<
  inferRouterOutputs<AppRouter>["seniority"]["getAllSeniorities"]
>[number];

export default function SenioritySetting() {
  const { data, isLoading } = api.seniority.getAllSeniorities.useQuery({});

  if (isLoading) {
    return <GeneralSettingsCardSkeleton title="Seniorities" rows={4} />;
  }

  if (!data) return null;

  return <SeniorityEditor key={JSON.stringify(data)} data={data} />;
}

function SeniorityEditor({ data }: { data: Seniority[] }) {
  const utils = api.useUtils();

  // ---STATES---
  const initialSeniorities = data.map((seniority) => ({ ...seniority }));
  const [seniorities, setSeniorities] =
    useState<Seniority[]>(initialSeniorities);
  const [savedSeniorities, setSavedSeniorities] =
    useState<Seniority[]>(initialSeniorities);
  const [isAddingSeniority, setIsAddingSeniority] = useState(false);
  const [seniorityName, setSeniorityName] = useState("");
  const [seniorityToDel, setSeniorityToDel] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const createSeniority = api.seniority.createSeniority.useMutation({
    onSuccess: async () => {
      setIsAddingSeniority(false);
      setSeniorityName("");
      await utils.seniority.getAllSeniorities.invalidate();
    },
  });

  const deleteSeniority = api.seniority.deleteSeniority.useMutation({
    onSuccess: async () => {
      await utils.seniority.getAllSeniorities.invalidate();
    },
  });

  function handleCreateSeniority(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = seniorityName.trim();

    if (!name) {
      return;
    }
    createSeniority.mutate({
      name,
      order: seniorities.length + 1,
      color: "#000000",
    });
  }

  function handleDeleteSeniority(id: string) {
    deleteSeniority.mutate({ id });
  }

  function handleCancelSeniority() {
    setIsAddingSeniority(false);
    setSeniorityName("");
  }

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
          <CardTitle className="text-sm font-semibold">Seniorities</CardTitle>
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
                  if (!isAddingSeniority) event.preventDefault();
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (isAddingSeniority) return;
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
                  draggable={!isAddingSeniority}
                  disabled={isAddingSeniority}
                  onDragStart={(event) => {
                    if (isAddingSeniority) {
                      event.preventDefault();
                      return;
                    }
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
                <span
                  className="flex"
                  title={
                    seniority._count.applicants > 0
                      ? "No se puede eliminar porque tiene candidatos asignados"
                      : undefined
                  }
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={seniority._count.applicants > 0}
                    onClick={() =>
                      setSeniorityToDel({
                        id: seniority.id,
                        name: seniority.name,
                      })
                    }
                  >
                    <X aria-hidden="true" />
                  </Button>
                </span>
              </li>
            );
          })}
          {isAddingSeniority && (
            <form
              className="flex items-end gap-3 border-b border-border-default
                        py-4"
              onSubmit={handleCreateSeniority}
            >
              <li className="flex items-center gap-2.5 rounded-lg border border-border-default px-2 py-2 w-full">
                <div className="flex-1">
                  <Input
                    type="text"
                    value={seniorityName}
                    onChange={(event) => setSeniorityName(event.target.value)}
                    placeholder="Nombre de seniority"
                    autoFocus
                  />
                </div>{" "}
                <Button
                  type="submit"
                  disabled={!seniorityName.trim() || createSeniority.isPending}
                >
                  {createSeniority.isPending
                    ? "Guardando..."
                    : "Crear seniority"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelSeniority}
                >
                  Cancelar
                </Button>
              </li>
            </form>
          )}
        </ol>

        {!isAddingSeniority && !hasChanges && (
          <button
            type="button"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border-default py-3 text-[13px] font-medium text-text-tertiary transition-colors hover:bg-surface-hover"
            onClick={() => setIsAddingSeniority(true)}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Agregar seniority
          </button>
        )}
        {hasChanges && (
          <div className="flex justify-end gap-2 border-t border-border-default pt-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={updateOrder.isPending}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={updateOrder.isPending}>
              Aceptar
            </Button>
          </div>
        )}
      </CardContent>
      <Dialog
        open={seniorityToDel !== null}
        onOpenChange={(open) => {
          if (!open && !deleteSeniority.isPending) {
            setSeniorityToDel(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              ¿Eliminar seniority &quot;{seniorityToDel?.name}&quot;?
            </DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={
                <Button
                  variant="outline"
                  disabled={deleteSeniority.isPending}
                />
              }
            >
              Cancelar
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                if (seniorityToDel) {
                  handleDeleteSeniority(seniorityToDel.id);
                }
              }}
              disabled={deleteSeniority.isPending}
            >
              {deleteSeniority.isPending
                ? "Eliminando..."
                : "Eliminar seniority"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
