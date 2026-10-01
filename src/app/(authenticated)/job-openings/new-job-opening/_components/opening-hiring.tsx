"use client";

import { JobOpeningFormValues } from "./new-job-opening-form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Controller, useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { GripVertical, X, Plus, Info, ChevronDown } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import Image from "next/image";

import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from "~/components/ui/combobox";

import { api } from "~/lib/trpc/react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

function getInitials(name: string, lastName?: string | null) {
  return `${name.charAt(0)}${lastName?.charAt(0) ?? ""}`.toUpperCase();
}

export default function OpeningHiring() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<JobOpeningFormValues>();

  const stages = [
    { name: "Revisión Inicial" },
    { name: "Entrevista Técnica" },
    { name: "Entrevista Cultural" },
    { name: "Oferta" },
  ];

  const { data: hiringManagers, isLoading: isLoadingManager } =
    api.users.getAllHiringManagers.useQuery({});
  return (
    <Card className="w-full rounded-x1 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Hiring Managers</CardTitle>
      </CardHeader>
      <CardContent>
        <Controller
          name="hiringManagerIds"
          control={control}
          render={({ field }) => {
            const selectedManagers = hiringManagers?.filter((manager) =>
              field.value.includes(manager.id),
            );

            const availableManagers = hiringManagers?.filter(
              (manager) => !field.value.includes(manager.id),
            );

            return (
              <div className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  {selectedManagers?.map((manager) => (
                    <Badge
                      key={manager.id}
                      variant="outline"
                      className="h-8 rounded-full border border-border-default bg-surface-hover px-4 text-[13px] font-medium text-text-secondary transition-all"
                    >
                      {manager.image ? (
                        <Image
                          src={manager.image}
                          alt=""
                          width={24}
                          height={24}
                          className="size-6 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-tag-purple-bg text-xs text-tag-purple-fg">
                          {getInitials(manager.name, manager.lastName)}
                        </span>
                      )}

                      <span>
                        {manager.name} {manager.lastName}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          field.onChange(
                            field.value.filter(
                              (managerId) => managerId !== manager.id,
                            ),
                          );
                        }}
                        className="ml-1 cursor-pointer"
                        aria-label={`Quitar a ${manager.name}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                <div className="w-1/2">
                  <Combobox
                    value=""
                    onValueChange={(managerId) => {
                      if (managerId && !field.value.includes(managerId)) {
                        field.onChange([...field.value, managerId]);
                      }
                    }}
                    disabled={
                      isLoadingManager || availableManagers?.length === 0
                    }
                  >
                    <ComboboxInput
                      className="w-full rounded-md focus-within:!border-border-focus focus-within:!ring-3 focus-within:!ring-accent-green/30"
                      placeholder={
                        isLoadingManager
                          ? "Cargando hiring managers..."
                          : availableManagers?.length === 0
                            ? "Todos los hiring managers fueron seleccionados"
                            : "Buscar hiring manager"
                      }
                    />

                    <ComboboxContent>
                      <ComboboxList>
                        <ComboboxGroup>
                          <ComboboxLabel className="px-4 py-3 text-xs font-bold text-text-tertiary">
                            USUARIOS DEL SISTEMA
                          </ComboboxLabel>

                          {availableManagers?.map((manager) => (
                            <ComboboxItem
                              key={manager.id}
                              value={manager.id}
                              className="flex items-center justify-between"
                            >
                              <span className="flex min-w-0 items-center gap-2">
                                {manager.image ? (
                                  <Image
                                    src={manager.image}
                                    alt=""
                                    width={24}
                                    height={24}
                                    className="size-6 shrink-0 rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-xs text-text-secondary">
                                    {getInitials(
                                      manager.name,
                                      manager.lastName,
                                    )}
                                  </span>
                                )}
                                <span className="truncate">
                                  {manager.name} {manager.lastName}
                                </span>
                              </span>
                              <span className="ml-4 shrink-0 text-xs text-text-tertiary">
                                {manager._count.assignedJobOpenings}{" "}
                                {manager._count.assignedJobOpenings === 1
                                  ? "vacante"
                                  : "vacantes"}
                              </span>
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                      </ComboboxList>
                      <div className="mt-2 border-t border-border-default p-4">
                        <p className="text-xs leading-relaxed text-text-tertiary">
                          Solo podés asignar usuarios existentes. Invitá nuevos
                          desde <br />
                          Configuración → Usuarios.
                        </p>
                      </div>
                    </ComboboxContent>
                  </Combobox>
                </div>
              </div>
            );
          }}
        />
      </CardContent>
    </Card>
  );
}
