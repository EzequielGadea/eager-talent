"use client";

import { useEffect, useState } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { api } from "~/lib/trpc/react";
import { cn } from "~/lib/utils";

import { Trash2 } from "lucide-react";

import { Button } from "~/components/ui/button";

import { toast } from "~/components/ui/toast";

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
import { SettingsFetchError } from "./settings-fetch-error";

export default function AreaSetting() {
  const [isAddingArea, setIsAddingArea] = useState(false);
  const [areaName, setAreaName] = useState("");
  const [areaToDelete, setAreaToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const utils = api.useUtils();

  const { data: areas, isLoading: isAreasLoading,  isError, refetch, isFetching } =
    api.area.getAllAreas.useQuery({});

  const createArea = api.area.createArea.useMutation({
    onSuccess: async () => {
      setAreaName("");
      setIsAddingArea(false);
      toast.add({ title: "Area creada con exito", type: "success" });
      await utils.area.getAllAreas.invalidate();
    },
    onError: (error) => {
      toast.add({ title: error.message, type: "error" });
    },
  });

  const deleteArea = api.area.deleteArea.useMutation({
    onSuccess: async () => {
      setAreaToDelete(null);
      toast.add({ title: "Área eliminada con éxito", type: "success" });
      await utils.area.getAllAreas.invalidate();
    },
    onError: (error) => {
      toast.add({ title: error.message, type: "error" });
    },
  });

  function handleCreateArea(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = areaName.trim();

    if (!name) {
      return;
    }

    const normalizedName = name.toLocaleLowerCase();

    const alreadyExists = areas?.some(
      (area) => area.name.trim().toLocaleLowerCase() === normalizedName,
    );

    if (alreadyExists) {
      toast.add({
        title: `Ya existe un área con el nombre "${name}".`,
        type: "error",
      });
      return;
    }

    createArea.mutate({ name });
  }

  function handleDeleteArea(id: string) {
    deleteArea.mutate({ id });
  }

  function handleCancelArea() {
    setIsAddingArea(false);
    setAreaName("");
  }

  useEffect(() => {
    if (!isAddingArea) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleCancelArea();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAddingArea]);

  if (isAreasLoading) {
    return <GeneralSettingsCardSkeleton title="Áreas" rows={4} />;
  }

    if (isError || !areas) {
      return (
        <SettingsFetchError
          title="Áreas"
          message="No se pudo cargar la información. Por favor, inténtalo de nuevo."
          refetch={refetch}
          isFetching={isFetching}
        />
      );
    }

  return (
    <Card className="w-full rounded-xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Áreas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          {areas?.map((area) => {
            const deleteRestrictions = [
              area._count.applicants > 0 ? "candidatos asignados" : null,
              area._count.jobOpenings > 0 ? "vacantes asociadas" : null,
            ].filter(
              (restriction): restriction is string => restriction !== null,
            );
            const isDeleteDisabled = deleteRestrictions.length > 0;

            return (
              <div
                key={area.id}
                className="flex items-center justify-between border-b border-border-default py-4"
              >
                <span className="text-sm font-medium text-text-primary">
                  {area.name}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="h-4 w-4 text-text-tertiary" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent>
                    <span
                      className="block"
                      title={
                        isDeleteDisabled
                          ? `No se puede eliminar: ${deleteRestrictions.join(
                              " y ",
                            )}.`
                          : undefined
                      }
                    >
                      <DropdownMenuItem
                        className={cn(
                          "gap-2 text-danger hover:bg-danger-bg hover:text-tag-red-fg",
                        )}
                        disabled={isDeleteDisabled}
                        onClick={() =>
                          setAreaToDelete({ id: area.id, name: area.name })
                        }
                      >
                        <Trash2 className="size-4" />
                        <span>Eliminar</span>
                      </DropdownMenuItem>
                    </span>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}

          {isAddingArea && (
            <form
              onSubmit={handleCreateArea}
              className="flex items-end gap-3 border-b border-border-default
              py-4"
            >
              <div className="flex-1">
                <Input
                  type="text"
                  value={areaName}
                  onChange={(event) => setAreaName(event.target.value)}
                  placeholder="Nombre del área"
                  autoFocus
                />
              </div>{" "}
              <Button
                type="submit"
                disabled={!areaName.trim() || createArea.isPending}
              >
                {createArea.isPending ? "Guardando..." : "Crear area"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelArea}
              >
                Cancelar
              </Button>
            </form>
          )}
        </div>
        {!isAddingArea && (
          <button
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border-default py-3 text-[13px] font-medium text-text-tertiary transition-colors hover:bg-surface-hover"
            type="button"
            onClick={() => setIsAddingArea(true)}
          >
            <Plus className="h-4 w-4" />
            Agregar área
          </button>
        )}
      </CardContent>
      <Dialog
        open={areaToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleteArea.isPending) {
            setAreaToDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar el área “{areaToDelete?.name}”?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" disabled={deleteArea.isPending} />
              }
            >
              Cancelar
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                if (areaToDelete) {
                  handleDeleteArea(areaToDelete.id);
                }
              }}
              disabled={deleteArea.isPending}
            >
              {deleteArea.isPending ? "Eliminando..." : "Eliminar área"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
