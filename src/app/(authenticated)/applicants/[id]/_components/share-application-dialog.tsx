"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { inferRouterOutputs } from "@trpc/server";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowRight, Copy, Lock, MoreHorizontal, Share2 } from "lucide-react";
import { z } from "zod";

import { cn } from "~/lib/utils";
import { api } from "~/lib/trpc/react";
import { getPublicLinkUrl } from "~/lib/public-link-url";
import type { AppRouter } from "~/server/api/root";
import {
  PUBLIC_LINK_EXPIRATION_DAYS,
  publicLinkExpirationDaysSchema,
} from "~/server/public-link/expiration";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Field, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { toast } from "~/components/ui/toast";

type PublicLinkItem =
  inferRouterOutputs<AppRouter>["publicLink"]["listByApplication"][number];

// Same shape as the publicLink.create input.
const createPublicLinkSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Ingresá un nombre para el enlace.")
    .max(100, "El nombre puede tener hasta 100 caracteres."),
  includeSalary: z.boolean(),
  expirationDays: publicLinkExpirationDaysSchema,
});

type CreatePublicLinkValues = z.infer<typeof createPublicLinkSchema>;

const defaultValues: CreatePublicLinkValues = {
  name: "",
  includeSalary: false,
  expirationDays: 30,
};

const historyStatusConfig = {
  expired: { label: "Vencido", className: "bg-warning-bg text-tag-amber-fg" },
  revoked: { label: "Revocado", className: "bg-danger-bg text-danger" },
};

const sectionTitleClassName =
  "text-xs font-bold uppercase tracking-wider text-text-tertiary";

// tRPC has no transformer here, so dates arrive as ISO strings.
function formatDate(date: Date | string) {
  return format(new Date(date), "d MMM yyyy", { locale: es });
}

function getHistoryDateLabel(link: PublicLinkItem) {
  return link.status === "revoked" && link.revokedAt
    ? `Revocado el ${formatDate(link.revokedAt)}`
    : `Venció el ${formatDate(link.expirationDate)}`;
}

function getExpirationLabel(days: number) {
  return `En ${days} días`;
}

// The full URL is copied; the list shows it without the protocol.
function getDisplayUrl(token: string) {
  return getPublicLinkUrl(token, window.location.origin).replace(
    /^https?:\/\//,
    "",
  );
}

function copyPublicLink(token: string) {
  const url = getPublicLinkUrl(token, window.location.origin);

  navigator.clipboard.writeText(url).then(
    () => toast.add({ title: "Enlace copiado", type: "success" }),
    () => toast.add({ title: "No se pudo copiar el enlace", type: "error" }),
  );
}

function SalaryBadge({ includeSalary }: { includeSalary: boolean }) {
  return (
    <Badge
      className={cn(
        "shrink-0 border-transparent",
        includeSalary
          ? "bg-success-bg text-tag-green-fg"
          : "bg-warning-bg text-tag-amber-fg",
      )}
    >
      {includeSalary ? "Incluye salario" : "Sin salario"}
    </Badge>
  );
}

type ShareApplicationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicantId: string;
  jobOpeningId: string;
  applicantName: string;
  jobOpeningName: string;
};

export function ShareApplicationDialog({
  open,
  onOpenChange,
  applicantId,
  jobOpeningId,
  applicantName,
  jobOpeningName,
}: ShareApplicationDialogProps) {
  const application = { applicantId, jobOpeningId };
  const utils = api.useUtils();

  const [linkToRevokeId, setLinkToRevokeId] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreatePublicLinkValues>({
    resolver: zodResolver(createPublicLinkSchema),
    defaultValues,
  });

  const linksQuery = api.publicLink.listByApplication.useQuery(application, {
    enabled: open,
  });

  const createMutation = api.publicLink.create.useMutation({
    onSuccess: async (link) => {
      // Show the new link right away so it can be copied immediately.
      utils.publicLink.listByApplication.setData(application, (links) => [
        link,
        ...(links ?? []),
      ]);
      reset(defaultValues);
      toast.add({ title: "Enlace creado correctamente", type: "success" });
      await utils.publicLink.listByApplication.invalidate(application);
    },
    onError: (error) => {
      setError("root", { message: error.message });
    },
  });

  const revokeMutation = api.publicLink.revoke.useMutation({
    onSuccess: async () => {
      setLinkToRevokeId(null);
      toast.add({ title: "Enlace revocado", type: "success" });
      await utils.publicLink.listByApplication.invalidate(application);
    },
    onError: async (error) => {
      setLinkToRevokeId(null);
      toast.add({ title: error.message, type: "error" });
      // The link may have changed on the server (already revoked or expired).
      await utils.publicLink.listByApplication.invalidate(application);
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      reset(defaultValues);
      setLinkToRevokeId(null);
    }

    onOpenChange(nextOpen);
  }

  function createLink(values: CreatePublicLinkValues) {
    createMutation.mutate({ ...application, ...values });
  }

  const links = linksQuery.data ?? [];
  const activeLinks = links.filter((link) => link.status === "active");
  const historyLinks = links.filter((link) => link.status !== "active");

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="shrink-0 gap-2 border-b border-border-default px-5 pt-5 pb-4">
          <div className="flex items-center gap-3 pr-8">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-success-bg text-accent-green-strong">
              <Share2 className="size-4" aria-hidden="true" />
            </div>
            <DialogTitle className="font-heading text-lg font-bold text-text-primary">
              Compartir postulación
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-text-secondary">
            {applicantName}
            {" · "}
            <span className="font-semibold text-text-primary">
              {jobOpeningName}
            </span>
            {" · "}
          </DialogDescription>
        </DialogHeader>

        {/* Only the body scrolls, so the footer stays anchored at the bottom. */}
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-4">
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className={sectionTitleClassName}>Links activos</h3>
              {linksQuery.isSuccess && (
                <span className="text-xs text-text-tertiary">
                  {activeLinks.length === 1
                    ? "1 link"
                    : `${activeLinks.length} links`}
                </span>
              )}
            </div>

            {linksQuery.isLoading && (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            )}

            {linksQuery.error && (
              <div
                role="alert"
                className="flex items-center justify-between gap-3 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                <span>{linksQuery.error.message}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void linksQuery.refetch()}
                >
                  Reintentar
                </Button>
              </div>
            )}

            {linksQuery.isSuccess && activeLinks.length === 0 && (
              <p className="rounded-lg border border-dashed border-border-default px-3 py-3 text-xs text-text-tertiary">
                Esta postulación no tiene links activos.
              </p>
            )}

            {activeLinks.map((link) => {
              const isConfirmingRevoke = linkToRevokeId === link.id;
              const isRevoking =
                revokeMutation.isPending &&
                revokeMutation.variables?.id === link.id;

              return (
                <div
                  key={link.id}
                  className="flex flex-col gap-2 rounded-lg border border-border-default px-4 py-3"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate text-sm font-semibold text-text-primary">
                          {link.name}
                        </span>
                        <SalaryBadge includeSalary={link.includeSalary} />
                      </div>
                      {link.token && (
                        <span className="truncate text-xs text-text-tertiary">
                          {getDisplayUrl(link.token)}
                        </span>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-full px-3 font-semibold"
                        disabled={!link.token}
                        onClick={() => {
                          if (link.token) {
                            window.open(
                              getPublicLinkUrl(
                                link.token,
                                window.location.origin,
                              ),
                              "_blank",
                            );
                          }
                        }}
                      >
                        Ver
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-full px-3 text-text-secondary"
                        disabled={!link.token}
                        onClick={() => link.token && copyPublicLink(link.token)}
                      >
                        <Copy />
                        Copiar
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              className="rounded-lg text-text-secondary"
                              aria-label={`Más acciones para ${link.name}`}
                              disabled={revokeMutation.isPending}
                            />
                          }
                        >
                          <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>
                              Vence el {formatDate(link.expirationDate)}
                            </DropdownMenuLabel>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setLinkToRevokeId(link.id)}
                          >
                            Revocar link
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {isConfirmingRevoke && (
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-danger-bg px-3 py-2">
                      <span className="text-xs text-danger">
                        ¿Revocar este link? Dejará de funcionar y no se podrá
                        reactivar.
                      </span>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          disabled={isRevoking}
                          onClick={() => setLinkToRevokeId(null)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="xs"
                          disabled={isRevoking}
                          onClick={() =>
                            revokeMutation.mutate({
                              ...application,
                              id: link.id,
                            })
                          }
                        >
                          {isRevoking ? "Revocando..." : "Revocar"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {historyLinks.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <h4 className="text-xs font-medium text-text-tertiary">
                  Historial
                </h4>
                <ul className="flex flex-col divide-y divide-border-default rounded-lg border border-border-default">
                  {historyLinks.map((link) => {
                    const status =
                      historyStatusConfig[link.status as "expired" | "revoked"];

                    return (
                      <li
                        key={link.id}
                        className="flex flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2 text-xs"
                      >
                        <span className="min-w-0 truncate font-medium text-text-secondary">
                          {link.name}
                        </span>
                        <Badge
                          className={cn(
                            "shrink-0 border-transparent",
                            status.className,
                          )}
                        >
                          {status.label}
                        </Badge>
                        <span className="text-text-tertiary">
                          {getHistoryDateLabel(link)}
                          {" · "}
                          {link.includeSalary
                            ? "Incluye salario"
                            : "Sin salario"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </section>

          <Separator className="bg-border-default" />

          <form
            id="share-public-link-form"
            onSubmit={handleSubmit(createLink)}
            className="flex flex-col gap-4"
          >
            <h3 className={sectionTitleClassName}>Crear nuevo link</h3>

            {errors.root && (
              <div
                role="alert"
                className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {errors.root.message}
              </div>
            )}

            <div className="flex flex-col gap-2">
              {/* Controlled so the value stays in sync after reset(): with the
                  React Compiler, a memoized register() is not re-run and the
                  field would stay unregistered after the first submit. */}
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <Input
                    id="public-link-name"
                    label="Nombre del link"
                    placeholder="Entrevista técnica externa"
                    maxLength={100}
                    className="h-10 px-3"
                    errorMessage={errors.name?.message}
                    {...field}
                  />
                )}
              />
            </div>

            <Controller
              control={control}
              name="includeSalary"
              render={({ field }) => (
                <div className="flex items-center gap-3 rounded-lg border border-warning bg-warning-bg px-4 py-3">
                  <Checkbox
                    id="public-link-include-salary"
                    className="size-5 bg-background"
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked)}
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      <label
                        htmlFor="public-link-include-salary"
                        className="text-sm font-semibold text-text-primary"
                      >
                        Incluir salario pretendido
                      </label>
                      <span className="text-xs font-semibold text-tag-amber-fg">
                        Sensible
                      </span>
                    </div>
                  </div>
                  <Lock
                    className="size-4 shrink-0 text-tag-amber-fg"
                    aria-hidden="true"
                  />
                </div>
              )}
            />

            <Controller
              control={control}
              name="expirationDays"
              render={({ field }) => (
                <Field className="gap-2">
                  <FieldLabel>Vencimiento</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) =>
                      field.onChange(value ?? defaultValues.expirationDays)
                    }
                  >
                    <SelectTrigger className="w-full px-3 data-[size=default]:h-10">
                      <SelectValue>
                        {getExpirationLabel(field.value)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {PUBLIC_LINK_EXPIRATION_DAYS.map((days) => (
                        <SelectItem key={days} value={days}>
                          {getExpirationLabel(days)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </form>
        </div>

        <DialogFooter className="mx-0 mb-0 shrink-0 gap-3 border-border-default bg-surface-subtle px-5 py-4 sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-xs text-text-tertiary sm:max-w-64">
            <Lock className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            Los links son de solo lectura y no permiten descargar datos
            internos.
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-full px-4 font-semibold"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="share-public-link-form"
              className="h-9 rounded-full px-4 font-semibold"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Generando..." : "Generar link"}
              {!createMutation.isPending && (
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
