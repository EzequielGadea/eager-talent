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

import { Pencil } from "lucide-react";

export default function AreaSetting() {
  const [isAddingArea, setIsAddingArea] = useState(false);
  const [areaName, setAreaName] = useState("");

  const utils = api.useUtils();

  const { data: areas } = api.area.getAllAreas.useQuery({});

  const createArea = api.area.createArea.useMutation({
    onSuccess: async () => {
      setAreaName("");
      setIsAddingArea(false);
      await utils.area.getAllAreas.invalidate();
    },
  });

  const deleteArea = api.area.deleteArea.useMutation({
    onSuccess: async () => {
      await utils.area.getAllAreas.invalidate();
    },
  });

  function handleCreateArea(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = areaName.trim();

    if (!name) {
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

  return (
    <Card className="w-full rounded-xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Áreas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          {areas?.map((area) => (
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
                  <DropdownMenuItem>
                    <Pencil className="size-4" />
                    <span>Editar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={cn(
                      "gap-2 text-danger hover:bg-danger-bg hover:text-tag-red-fg",
                    )}
                    onClick={() => handleDeleteArea(area.id)}
                  >
                    <Trash2 className="size-4" />
                    <span>Eliminar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}

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
    </Card>
  );
}
