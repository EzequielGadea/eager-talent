"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowRight,
  CircleAlert,
  LoaderCircle,
  LockKeyhole,
  UserRoundPlus,
  X,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "~/components/ui/combobox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Field, FieldLabel } from "~/components/ui/field";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { toast } from "~/components/ui/toast";
import { api } from "~/lib/trpc/react";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";

type ShareWithHiringManagerDialogProps = {
  applicantId: string;
  applicantName: string;
  applicantRole: string;
};

type HiringManagerOption = {
  id: string;
  name: string;
  lastName: string;
  image: string | null;
};

type HiringManagerWithAccess = HiringManagerOption & {
  sharedAt: string;
  viewedAt: string | null;
};

const AVATAR_CLASS_NAMES = [
  "bg-tag-purple-bg text-tag-purple-fg",
  "bg-tag-green-bg text-tag-green-fg",
  "bg-tag-amber-bg text-tag-amber-fg",
  "bg-tag-blue-bg text-tag-blue-fg",
];

function getFullName(manager: HiringManagerOption) {
  return `${manager.name} ${manager.lastName}`.trim();
}

function getInitials(manager: HiringManagerOption) {
  return `${manager.name.charAt(0)}${manager.lastName.charAt(0)}`.toUpperCase();
}

function getAvatarClassName(managerId: string) {
  const hash = Array.from(managerId).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );

  return (
    AVATAR_CLASS_NAMES[hash % AVATAR_CLASS_NAMES.length] ??
    "bg-tag-gray-bg text-tag-gray-fg"
  );
}

function getAccessDescription(manager: HiringManagerWithAccess) {
  const sharedAt = `Compartido ${formatDistanceToNow(
    new Date(manager.sharedAt),
    {
      addSuffix: true,
      locale: es,
    },
  )}`;

  const viewedAt = manager.viewedAt
    ? `lo vio ${formatDistanceToNow(new Date(manager.viewedAt), {
        addSuffix: true,
        locale: es,
      })}`
    : null;

  return [sharedAt, viewedAt].filter(Boolean).join(" · ");
}

function HiringManagerAvatar({
  manager,
  size = "default",
}: {
  manager: HiringManagerOption;
  size?: "default" | "sm" | "lg";
}) {
  return (
    <Avatar size={size}>
      {manager.image && <AvatarImage src={manager.image} alt="" />}

      <AvatarFallback className={getAvatarClassName(manager.id)}>
        {getInitials(manager)}
      </AvatarFallback>
    </Avatar>
  );
}

export function ShareWithHiringManagerDialog({
  applicantId,
  applicantName,
  applicantRole,
}: ShareWithHiringManagerDialogProps) {
  const comboboxAnchor = useComboboxAnchor();
  const router = useRouter();
  const trpcUtils = api.useUtils();
  const [isRefreshing, startTransition] = useTransition();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedManagers, setSelectedManagers] = useState<
    HiringManagerOption[]
  >([]);
  const [isManagerListOpen, setIsManagerListOpen] = useState(false);

  const sharingDataQuery = api.applicant.getSharingData.useQuery(
    {
      applicantId,
    },
    {
      enabled: open,
    },
  );

  const shareMutation = api.applicant.shareWithHiringManagers.useMutation({
    onError: (error) => {
      toast.add({
        title: error.message,
        type: "error",
      });
    },
    onSuccess: ({ sharedCount }) => {
      toast.add({
        title:
          sharedCount === 1
            ? "Candidato compartido correctamente"
            : `Candidato compartido con ${sharedCount} Hiring Managers`,
        type: "success",
      });

      resetDialogState();
      setOpen(false);

      void trpcUtils.applicant.getSharingData.invalidate(
        {
          applicantId,
        },
        {
          refetchType: "none",
        },
      );

      startTransition(() => {
        router.refresh();
      });
    },
  });

  const revokeMutation = api.applicant.revokeHiringManagerAccess.useMutation({
    onError: (error) => {
      toast.add({
        title: error.message,
        type: "error",
      });
    },
    onSuccess: async () => {
      await trpcUtils.applicant.getSharingData.invalidate({
        applicantId,
      });

      toast.add({
        title: "Acceso quitado correctamente",
        type: "success",
      });

      startTransition(() => {
        router.refresh();
      });
    },
  });

  const availableManagers = sharingDataQuery.data?.availableManagers ?? [];

  const currentAccess = sharingDataQuery.data?.currentAccess ?? [];

  const selectedManagerIds = new Set(
    selectedManagers.map((manager) => manager.id),
  );

  const selectableManagers = availableManagers.filter(
    (manager) => !selectedManagerIds.has(manager.id),
  );

  const visibleManagerCount = Math.min(selectableManagers.length, 3);

  const managerListReservedHeight =
    visibleManagerCount === 0 ? 52 : visibleManagerCount * 64 + 24;

  const isBusy =
    shareMutation.isPending || revokeMutation.isPending || isRefreshing;

  function resetDialogState() {
    setSearch("");
    setSelectedManagers([]);
    setIsManagerListOpen(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isBusy) {
      return;
    }

    setOpen(nextOpen);

    if (!nextOpen) {
      resetDialogState();
    }
  }

  function handleRemoveAccess(managerId: string) {
    revokeMutation.mutate({
      applicantId,
      hiringManagerId: managerId,
    });
  }

  function handleShare() {
    if (selectedManagers.length === 0) {
      return;
    }

    shareMutation.mutate({
      applicantId,
      hiringManagerIds: selectedManagers.map((manager) => manager.id),
    });
  }

  function handleRemoveSelectedManager(managerId: string) {
    setSelectedManagers((currentManagers) =>
      currentManagers.filter((manager) => manager.id !== managerId),
    );

    setSearch("");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="max-w-full rounded-full px-4 text-xs"
          />
        }
      >
        <UserRoundPlus data-icon="inline-start" aria-hidden="true" />
        Compartir con un HM
      </DialogTrigger>

      <DialogContent
        data-applicant-id={applicantId}
        showCloseButton={false}
        className="grid max-h-[calc(100dvh-2rem)] w-full grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-w-2xl"
      >
        <DialogHeader className="relative gap-3 px-6 py-5 pr-16">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-success-bg text-tag-green-fg">
              <UserRoundPlus className="size-5" aria-hidden="true" />
            </div>

            <DialogTitle className="text-xl font-bold text-text-primary">
              Compartir con un Hiring Manager
            </DialogTitle>
          </div>

          <DialogDescription className="text-sm leading-6 text-text-secondary">
            {applicantName} · {applicantRole} ·{" "}
            <strong>Sin vacante asociada</strong> - le aparece en su pestaña
            Candidatos, en solo lectura.
          </DialogDescription>

          <DialogClose
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                data-combobox-dialog-action
                disabled={isBusy}
                className="absolute right-4 top-4"
              />
            }
          >
            <X aria-hidden="true" />
            <span className="sr-only">Cerrar</span>
          </DialogClose>
        </DialogHeader>

        <Separator />

        <div className="flex min-h-0 flex-col gap-6 overflow-y-auto px-6 py-5">
          {sharingDataQuery.error && (
            <Alert variant="destructive">
              <CircleAlert aria-hidden="true" />

              <AlertTitle>No se pudieron cargar los Hiring Managers</AlertTitle>

              <AlertDescription>
                {sharingDataQuery.error.message}
              </AlertDescription>
            </Alert>
          )}

          <Field>
            <FieldLabel className="text-sm font-semibold text-text-secondary">
              Hiring managers
            </FieldLabel>

            <Combobox
              items={selectableManagers}
              multiple
              open={isManagerListOpen}
              value={selectedManagers}
              inputValue={search}
              disabled={
                sharingDataQuery.isLoading ||
                Boolean(sharingDataQuery.error) ||
                isBusy
              }
              autoHighlight
              itemToStringLabel={getFullName}
              itemToStringValue={(manager) => manager.id}
              isItemEqualToValue={(manager, value) => manager.id === value.id}
              onOpenChange={(nextOpen, eventDetails) => {
                const interactionTarget =
                  eventDetails.event instanceof FocusEvent
                    ? eventDetails.event.relatedTarget
                    : eventDetails.event.target;

                const isDialogAction =
                  interactionTarget instanceof Element &&
                  interactionTarget.closest("[data-combobox-dialog-action]");

                const shouldKeepComboboxOpen =
                  !nextOpen &&
                  (eventDetails.reason === "focus-out" ||
                    eventDetails.reason === "outside-press") &&
                  isDialogAction;

                if (shouldKeepComboboxOpen) {
                  eventDetails.cancel();
                  return;
                }

                setIsManagerListOpen(nextOpen);
              }}
              onInputValueChange={(value) => setSearch(value)}
              onValueChange={(value) => {
                setSelectedManagers(value);
                setSearch("");
              }}
            >
              <ComboboxChips
                ref={comboboxAnchor}
                className="min-h-12 rounded-xl px-3 py-2 focus-within:border-border-focus focus-within:ring-4 focus-within:ring-border-focus/20"
              >
                <ComboboxValue>
                  {(value: HiringManagerOption[]) => (
                    <>
                      {value.map((manager) => (
                        <ComboboxChip
                          key={manager.id}
                          showRemove={false}
                          className="h-8 rounded-full"
                        >
                          <HiringManagerAvatar manager={manager} size="sm" />

                          <span>{getFullName(manager)}</span>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            disabled={isBusy}
                            className="-mr-1 opacity-50 hover:opacity-100"
                            aria-label={`Quitar ${getFullName(manager)}`}
                            onPointerDown={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                            }}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleRemoveSelectedManager(manager.id);
                            }}
                          >
                            <X aria-hidden="true" />
                          </Button>
                        </ComboboxChip>
                      ))}

                      <ComboboxChipsInput
                        placeholder={
                          value.length > 0 ? "" : "Escribí un nombre..."
                        }
                        aria-label="Buscar Hiring Manager"
                      />
                    </>
                  )}
                </ComboboxValue>
              </ComboboxChips>

              <ComboboxContent
                anchor={comboboxAnchor}
                sideOffset={8}
                className="overflow-hidden rounded-xl p-2"
              >
                <ComboboxEmpty>
                  {sharingDataQuery.isLoading
                    ? "Cargando Hiring Managers..."
                    : "No se encontraron Hiring Managers."}
                </ComboboxEmpty>

                <ComboboxList className="max-h-52 overflow-y-scroll! overscroll-contain scrollbar-gutter-stable [scrollbar-color:var(--border-default)_var(--muted)] scrollbar-thin! [&::-webkit-scrollbar]:block! [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border-default">
                  {(manager: HiringManagerOption) => (
                    <ComboboxItem
                      key={manager.id}
                      value={manager}
                      className="min-h-16 rounded-lg px-3 py-2"
                    >
                      <HiringManagerAvatar manager={manager} />

                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-semibold text-text-primary">
                          {getFullName(manager)}
                        </span>

                        <span className="truncate text-xs text-text-tertiary">
                          Hiring Manager
                        </span>
                      </div>

                      <span className="shrink-0 text-sm font-semibold text-text-secondary">
                        Agregar
                      </span>
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            {isManagerListOpen && (
              <div
                aria-hidden="true"
                className="shrink-0"
                style={{ height: managerListReservedHeight }}
              />
            )}
          </Field>

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xs font-bold tracking-wide text-text-tertiary">
                YA TIENE ACCESO
              </h3>

              <span aria-live="polite" className="text-sm text-text-tertiary">
                {sharingDataQuery.isLoading
                  ? "Cargando..."
                  : sharingDataQuery.error
                    ? "—"
                    : `${currentAccess.length} ${
                        currentAccess.length === 1 ? "persona" : "personas"
                      }`}
              </span>
            </div>

            {sharingDataQuery.error ? null : sharingDataQuery.isLoading ? (
              <div className="flex items-center gap-3 rounded-xl border border-border-default bg-card px-4 py-3">
                <Skeleton className="size-10 rounded-full" />

                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-52" />
                </div>
              </div>
            ) : currentAccess.length > 0 ? (
              <ScrollArea
                className={cn(
                  currentAccess.length > 5 ? "h-81 pr-3" : "h-auto",
                )}
              >
                <ul className="flex flex-col gap-2">
                  {currentAccess.map((manager) => {
                    const isRemoving =
                      revokeMutation.isPending &&
                      revokeMutation.variables?.hiringManagerId === manager.id;

                    return (
                      <li
                        key={manager.id}
                        className="flex items-center gap-3 rounded-xl border border-border-default bg-card px-4 py-3"
                      >
                        <HiringManagerAvatar manager={manager} />

                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate font-semibold text-text-primary">
                            {getFullName(manager)}
                          </span>

                          <span className="truncate text-xs text-text-tertiary">
                            {getAccessDescription(manager)}
                          </span>
                        </div>

                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          data-combobox-dialog-action
                          className="rounded-full"
                          disabled={isBusy}
                          onClick={() => handleRemoveAccess(manager.id)}
                        >
                          {isRemoving ? "Quitando..." : "Quitar acceso"}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>
            ) : (
              <p className="rounded-xl border border-dashed border-border-default px-4 py-5 text-center text-sm text-text-tertiary">
                Ningún Hiring Manager tiene acceso actualmente.
              </p>
            )}
          </section>
        </div>

        <DialogFooter className="m-0 flex-col gap-4 rounded-none px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-text-tertiary">
            <LockKeyhole className="size-4 shrink-0" aria-hidden="true" />
            <span>
              Solo lectura: el HM ve el perfil, no escribe en el sistema.
            </span>
          </div>

          <div className="flex w-full gap-2 sm:w-auto">
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  data-combobox-dialog-action
                  disabled={isBusy}
                  className="flex-1 rounded-full px-5 sm:flex-none"
                />
              }
            >
              Cancelar
            </DialogClose>

            <Button
              type="button"
              data-combobox-dialog-action
              className="flex-1 rounded-full px-5 sm:flex-none"
              disabled={
                selectedManagers.length === 0 ||
                sharingDataQuery.isLoading ||
                Boolean(sharingDataQuery.error) ||
                isBusy
              }
              onClick={handleShare}
            >
              {shareMutation.isPending || isRefreshing ? (
                <>
                  Compartiendo
                  <LoaderCircle
                    data-icon="inline-end"
                    className="animate-spin"
                    aria-hidden="true"
                  />
                </>
              ) : (
                <>
                  Compartir
                  <ArrowRight data-icon="inline-end" aria-hidden="true" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
