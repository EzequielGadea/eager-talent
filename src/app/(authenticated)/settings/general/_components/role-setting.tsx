"use client";

import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { Input } from "~/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/lib/trpc/react";
import { cn } from "~/lib/utils";
import { useState, useEffect } from "react";

export default function RoleSetting() {
  const [isAddingRole, setIsAddingRole] = useState(false);

  const [roleName, setRoleName] = useState("");

  const { data: roles } = api.role.getAllRoles.useQuery({});

  const utils = api.useUtils();

  const createRole = api.role.createRole.useMutation({
    onSuccess: async () => {
      setRoleName("");
      setIsAddingRole(false);
      await utils.role.getAllRoles.invalidate();
    },
  });

  const deleteRole = api.role.deleteRole.useMutation({
    onSuccess: async () => {
      await utils.role.getAllRoles.invalidate();
    },
  });

  function handleCreateRole(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = roleName.trim();

    if (!name) {
      return;
    }

    createRole.mutate({ name });
  }

  function handleDeleteRole(id: string) {
    deleteRole.mutate({ id });
  }

  function handleCancelRole() {
    setIsAddingRole(false);
    setRoleName("");
  }

  useEffect(() => {
    if (!isAddingRole) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleCancelRole();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAddingRole]);

  return (
    <Card className="w-full rounded-xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          Roles de candidato
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          {roles?.map((role) => (
            <div
              key={role.id}
              className="flex items-center justify-between border-b border-border-default py-4"
            >
              <span className="text-sm font-medium text-text-primary">
                {role.name}
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
                    className="gap-2 text-danger hover:bg-danger-bg hover:text-tag-red-fg"
                    onClick={() => handleDeleteRole(role.id)}
                  >
                    <Trash2 className="size-4" />
                    <span>Eliminar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
          {isAddingRole && (
            <form
              onSubmit={handleCreateRole}
              className="flex items-end gap-3 border-b border-border-default
                        py-4"
            >
              <div className="flex-1">
                <Input
                  type="text"
                  value={roleName}
                  onChange={(event) => setRoleName(event.target.value)}
                  placeholder="Nombre del rol"
                  autoFocus
                />
              </div>{" "}
              <Button
                type="submit"
                disabled={!roleName.trim() || createRole.isPending}
              >
                {createRole.isPending ? "Guardando..." : "Crear rol"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelRole}
              >
                Cancelar
              </Button>
            </form>
          )}
        </div>
        {!isAddingRole && (
          <button
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border-default py-3 text-[13px] font-medium text-text-tertiary transition-colors hover:bg-surface-hover"
            type="button"
            onClick={() => setIsAddingRole(true)}
          >
            <Plus className="h-4 w-4" />
            Agregar rol
          </button>
        )}
      </CardContent>
    </Card>
  );
}
