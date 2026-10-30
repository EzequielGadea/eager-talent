import type { ReactNode } from "react";

import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

type LoadingCardProps = {
  titleWidth?: string;
  children: ReactNode;
};

function LoadingCard({ titleWidth = "w-36", children }: LoadingCardProps) {
  return (
    <Card className="w-full rounded-xl shadow-sm">
      <CardHeader className="pb-3">
        <Skeleton className={`h-4 ${titleWidth}`} />
      </CardHeader>

      <CardContent>{children}</CardContent>
    </Card>
  );
}

function FieldSkeleton({ labelWidth = "w-28" }: { labelWidth?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Skeleton className={`h-3.5 ${labelWidth}`} />
      <Skeleton className="h-8.5 w-full rounded-lg" />
    </div>
  );
}

export function EditJobOpeningSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <header>
        <h1 className="font-heading text-2xl font-bold leading-[1.2] tracking-[-0.02em] text-text-primary">
          Editar vacante
        </h1>
      </header>

      <div
        className="flex flex-col gap-4"
        aria-label="Cargando información de la vacante"
        aria-busy="true"
      >
        <LoadingCard titleWidth="w-36">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <FieldSkeleton labelWidth="w-36" />
            </div>

            <FieldSkeleton labelWidth="w-16" />
            <FieldSkeleton labelWidth="w-20" />

            <div className="flex flex-col gap-2">
              <Skeleton className="h-3.5 w-20" />

              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-28 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Skeleton className="h-3.5 w-24" />

              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-28 rounded-full" />
              </div>
            </div>
          </div>
        </LoadingCard>

        <LoadingCard titleWidth="w-20">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_auto]">
            <FieldSkeleton labelWidth="w-32" />
            <FieldSkeleton labelWidth="w-40" />

            <Skeleton className="h-8.5 w-24 self-end rounded-lg" />
          </div>
        </LoadingCard>

        <LoadingCard titleWidth="w-40">
          <div className="flex flex-col gap-2">
            {Array.from({ length: 2 }, (_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </LoadingCard>
      </div>
    </div>
  );
}
