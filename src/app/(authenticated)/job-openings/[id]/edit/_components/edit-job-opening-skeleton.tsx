import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

type LoadingCardProps = {
  title: string;
  children: ReactNode;
};

function LoadingCard({ title, children }: LoadingCardProps) {
  return (
    <Card className="w-full rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle className="font-heading text-[15px] font-bold tracking-[-0.01em] text-text-primary">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>{children}</CardContent>
    </Card>
  );
}

function FieldSkeleton({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-text-primary">{label}</span>

      <Skeleton className="h-9.5 w-full rounded-lg" />
    </div>
  );
}

export function EditJobOpeningSkeleton() {
  return (
    <div
      className="flex flex-col gap-5"
      aria-label="Cargando información de la vacante"
      aria-busy="true"
    >
      <LoadingCard title="Datos de la vacante">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <FieldSkeleton label="Nombre de la vacante" />
          </div>

          <FieldSkeleton label="Area" />
          <FieldSkeleton label="Estado" />

          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-medium text-text-primary">
              Seniority
            </span>

            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-medium text-text-primary">
              Ubicacion
            </span>

            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>
          </div>
        </div>
      </LoadingCard>

      <LoadingCard title="Fechas">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_auto]">
          <FieldSkeleton label="Fecha de apertura" />
          <FieldSkeleton label="Fecha objetivo de cierre" />

          <Skeleton className="h-9.5 w-24 self-end rounded-lg" />
        </div>
      </LoadingCard>

      <LoadingCard title="Flujo del proceso">
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-lg" />
          ))}

          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </LoadingCard>

      <LoadingCard title="Hiring Managers">
        <div className="flex flex-col items-start gap-3">
          <div className="flex gap-2">
            <Skeleton className="h-8 w-36 rounded-full" />
            <Skeleton className="h-8 w-32 rounded-full" />
          </div>

          <Skeleton className="h-10 w-full max-w-sm rounded-lg" />
        </div>
      </LoadingCard>

      <Card className="w-full rounded-xl py-5 shadow-sm">
        <CardContent className="flex justify-end gap-3">
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-40 rounded-full" />
        </CardContent>
      </Card>
    </div>
  );
}
