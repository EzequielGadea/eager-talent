"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useFormContext, useWatch } from "react-hook-form";

import type { UpdateJobOpeningInput } from "~/lib/validations/job-opening";

type HiringManager = {
  id: string;
  name: string;
  lastName: string;
  image: string | null;
  jobOpeningCount: number;
};

type JobOpeningHiringManagersCardProps = {
  initialHiringManagers: HiringManager[];
  hiringManagerOptions: HiringManager[];
};

const AVATAR_CLASS_NAMES = [
  "bg-tag-purple-bg text-tag-purple-fg",
  "bg-tag-amber-bg text-tag-amber-fg",
  "bg-tag-green-bg text-tag-green-fg",
  "bg-tag-blue-bg text-tag-blue-fg",
];

function getFullName(manager: HiringManager) {
  return `${manager.name} ${manager.lastName}`.trim();
}

function getInitials(manager: HiringManager) {
  return `${manager.name.charAt(0)}${manager.lastName.charAt(0)}`.toUpperCase();
}

function getAvatarClassName(userId: string) {
  const hash = Array.from(userId).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );

  return (
    AVATAR_CLASS_NAMES[hash % AVATAR_CLASS_NAMES.length] ??
    "bg-tag-gray-bg text-tag-gray-fg"
  );
}

export function JobOpeningHiringManagersCard({
  initialHiringManagers,
  hiringManagerOptions,
}: JobOpeningHiringManagersCardProps) {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<UpdateJobOpeningInput>();

  const selectedHiringManagerIds =
    useWatch({
      control,
      name: "hiringManagerIds",
    }) ?? [];

  const hiringManagerById = new Map(
    [...hiringManagerOptions, ...initialHiringManagers].map((manager) => [
      manager.id,
      manager,
    ]),
  );

  const hiringManagers = selectedHiringManagerIds.flatMap((managerId) => {
    const manager = hiringManagerById.get(managerId);

    return manager ? [manager] : [];
  });
  const [managerSearch, setManagerSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const normalizedSearch = managerSearch.trim().toLocaleLowerCase("es");

  const availableHiringManagers = hiringManagerOptions.filter(
    (manager) =>
      !hiringManagers.some(
        (selectedManager) => selectedManager.id === manager.id,
      ) &&
      getFullName(manager).toLocaleLowerCase("es").includes(normalizedSearch),
  );

  const showSearchResults = isSearchOpen && normalizedSearch !== "";
  useEffect(() => {
    if (!showSearchResults) return;

    searchContainerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [showSearchResults]);

  const handleAddHiringManager = (manager: HiringManager) => {
    if (selectedHiringManagerIds.includes(manager.id)) {
      return;
    }

    setValue("hiringManagerIds", [...selectedHiringManagerIds, manager.id], {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    setManagerSearch("");
    setIsSearchOpen(false);
  };

  const handleRemoveHiringManager = (managerId: string) => {
    setValue(
      "hiringManagerIds",
      selectedHiringManagerIds.filter(
        (selectedManagerId) => selectedManagerId !== managerId,
      ),
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      },
    );
  };

  return (
    <Card className="w-full rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle className="font-heading text-[15px] font-bold tracking-[-0.01em] text-text-primary">
          Hiring Managers
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-start gap-3">
        <ul aria-live="polite" className="flex flex-wrap gap-2">
          {hiringManagers.map((manager) => (
            <li key={manager.id}>
              <Badge
                variant="tag"
                className="h-8 gap-2 rounded-full py-1 pr-1 pl-1 text-[13px]"
              >
                <Avatar size="sm">
                  {manager.image && <AvatarImage src={manager.image} alt="" />}

                  <AvatarFallback className={getAvatarClassName(manager.id)}>
                    {getInitials(manager)}
                  </AvatarFallback>
                </Avatar>

                <span>{getFullName(manager)}</span>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Quitar a ${getFullName(manager)}`}
                  onClick={() => handleRemoveHiringManager(manager.id)}
                >
                  <X aria-hidden="true" />
                </Button>
              </Badge>
            </li>
          ))}
        </ul>
        {errors.hiringManagerIds?.message && (
          <p className="text-xs text-danger">
            {errors.hiringManagerIds.message}
          </p>
        )}
        <div
          ref={searchContainerRef}
          className="relative w-full max-w-sm scroll-mb-6"
          onFocus={() => setIsSearchOpen(true)}
          onBlur={(event) => {
            const nextFocusedElement = event.relatedTarget as Node | null;

            if (!event.currentTarget.contains(nextFocusedElement)) {
              setIsSearchOpen(false);
            }
          }}
        >
          <Input
            type="text"
            value={managerSearch}
            aria-label="Buscar Hiring Manager"
            aria-expanded={showSearchResults}
            aria-controls="hiring-manager-results"
            placeholder="Buscar usuario..."
            className="h-10 border-border-default bg-card text-sm focus-visible:border-border-focus focus-visible:ring-4 focus-visible:ring-border-focus/20"
            onChange={(event) => setManagerSearch(event.target.value)}
          />

          {showSearchResults && (
            <div
              id="hiring-manager-results"
              role="listbox"
              aria-label="Usuarios del sistema"
              className="mt-2 w-full rounded-xl border border-border-default bg-card p-3 shadow-lg"
            >
              <p className="px-2 pb-2 text-xs font-semibold tracking-wide text-text-tertiary">
                USUARIOS DEL SISTEMA
              </p>

              {availableHiringManagers.length > 0 ? (
                <ul className="flex flex-col gap-1">
                  {availableHiringManagers.map((manager) => (
                    <li key={manager.id}>
                      <Button
                        type="button"
                        role="option"
                        aria-selected="false"
                        variant="ghost"
                        className="h-auto w-full justify-start rounded-lg px-2 py-2.5"
                        onClick={() => handleAddHiringManager(manager)}
                      >
                        <Avatar size="sm">
                          {manager.image && (
                            <AvatarImage src={manager.image} alt="" />
                          )}

                          <AvatarFallback
                            className={getAvatarClassName(manager.id)}
                          >
                            {getInitials(manager)}
                          </AvatarFallback>
                        </Avatar>

                        <span>{getFullName(manager)}</span>

                        <span className="ml-auto font-normal text-text-tertiary">
                          {manager.jobOpeningCount}{" "}
                          {manager.jobOpeningCount === 1
                            ? "vacante"
                            : "vacantes"}
                        </span>
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-2 py-3 text-sm text-text-secondary">
                  No se encontraron usuarios.
                </p>
              )}

              <Separator className="my-3" />

              <p className="px-2 text-xs leading-5 text-text-tertiary">
                Solo podés asignar usuarios existentes. Invitá nuevos desde
                Configuración → Usuarios.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
