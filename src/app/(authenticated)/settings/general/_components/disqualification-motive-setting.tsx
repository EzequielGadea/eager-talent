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
import { toast } from "~/components/ui/toast";

import { Trash2 } from "lucide-react";

import { Button } from "~/components/ui/button";

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

export default function DisqualificationMotiveSetting() {
  const [isAddingMotive, setIsAddingMotive] = useState(false);
  const [motiveName, setMotiveName] = useState("");
  const [motiveToDelete, setMotiveToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const utils = api.useUtils();

  const {
    data: motives,
    isLoading: isMotiveLoading,
    isError,
    refetch,
    isFetching,
  } = api.disqualificationMotive.getAllDisqualificationMotive.useQuery({});

  const createMotive =
    api.disqualificationMotive.createDisqualificationMotive.useMutation({
      onSuccess: async () => {
        setMotiveName("");
        setIsAddingMotive(false);
        await utils.disqualificationMotive.getAllDisqualificationMotive.invalidate();
        toast.add({ title: "Motivo creado con éxito", type: "success" });
      },
      onError: (error) => {
        toast.add({ title: error.message, type: "error" });
      },
    });

  const deleteMotive =
    api.disqualificationMotive.deleteDisqualificationMotive.useMutation({
      onSuccess: async () => {
        setMotiveToDelete(null);
        await utils.disqualificationMotive.getAllDisqualificationMotive.invalidate();
        toast.add({ title: "Motivo eliminado con éxito", type: "success" });
      },
      onError: (error) => {
        toast.add({ title: error.message, type: "error" });
      },
    });

  function handleCreateMotive(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = motiveName.trim();

    if (!name) {
      return;
    }

    const normalizedName = name.toLocaleLowerCase("es");
    const alreadyExists = motives?.some(
      (motive) => motive.name.trim().toLocaleLowerCase("es") === normalizedName,
    );

    if (alreadyExists) {
      toast.add({
        title: `Ya existe un motivo con el nombre "${name}".`,
        type: "error",
      });
      return;
    }

    createMotive.mutate({ name });
  }

  function handleDeleteMotive(id: string) {
    deleteMotive.mutate({ id });
  }

  function handleCancelMotive() {
    setIsAddingMotive(false);
    setMotiveName("");
  }

  useEffect(() => {
    if (!isAddingMotive) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleCancelMotive();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAddingMotive]);

  if (isMotiveLoading) {
    return (
      <GeneralSettingsCardSkeleton
        title="Motivos de descalificación"
        rows={4}
      />
    );
  }

  if (isError || !motives) {
    return (
      <SettingsFetchError
        title="Motivos de descalificación"
        message="No se pudo cargar la información. Por favor, inténtalo de nuevo."
        refetch={refetch}
        isFetching={isFetching}
      />
    );
  }

  return (
    <Card className="w-full rounded-xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          Motivos de descalificación
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          {motives?.map((motive) => {
            const hasApplications = motive._count.applications > 0;

            return (
              <div
                key={motive.id}
                className="flex items-center justify-between border-b border-border-default py-4"
              >
                <span className="text-sm font-medium text-text-primary">
                  {motive.name}
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
                        hasApplications
                          ? "No se puede eliminar porque está asociado a postulaciones"
                          : undefined
                      }
                    >
                      <DropdownMenuItem
                        className={cn(
                          "gap-2 text-danger hover:bg-danger-bg hover:text-tag-red-fg",
                        )}
                        disabled={hasApplications}
                        onClick={() =>
                          setMotiveToDelete({
                            id: motive.id,
                            name: motive.name,
                          })
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

          {isAddingMotive && (
            <form
              onSubmit={handleCreateMotive}
              className="flex flex-col gap-3 border-b border-border-default py-4 md:flex-row md:items-end"
            >
              <div className="w-full min-w-0 md:flex-1">
                <Input
                  type="text"
                  value={motiveName}
                  onChange={(event) => setMotiveName(event.target.value)}
                  placeholder="Motivo de descalificación"
                  autoFocus
                />
              </div>{" "}
              <Button
                type="submit"
                disabled={!motiveName.trim() || createMotive.isPending}
              >
                {createMotive.isPending ? "Guardando..." : "Crear motivo"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelMotive}
              >
                Cancelar
              </Button>
            </form>
          )}
        </div>
        {!isAddingMotive && (
          <button
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border-default py-3 text-[13px] font-medium text-text-tertiary transition-colors hover:bg-surface-hover"
            type="button"
            onClick={() => setIsAddingMotive(true)}
          >
            <Plus className="h-4 w-4" />
            Agregar motivo
          </button>
        )}
      </CardContent>
      <Dialog
        open={motiveToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleteMotive.isPending) {
            setMotiveToDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              ¿Eliminar el motivo “{motiveToDelete?.name}”?
            </DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" disabled={deleteMotive.isPending} />
              }
            >
              Cancelar
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                if (motiveToDelete) {
                  handleDeleteMotive(motiveToDelete.id);
                }
              }}
              disabled={deleteMotive.isPending}
            >
              {deleteMotive.isPending ? "Eliminando..." : "Eliminar motivo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
