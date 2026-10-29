import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

function FieldSkeleton({ labelWidth = "w-24" }: { labelWidth?: string }) {
  return (
    <div className="space-y-1.5">
      <Skeleton className={`h-3.5 ${labelWidth}`} />
      <Skeleton className="h-8 w-full rounded-lg" />
    </div>
  );
}

export function EditApplicantFormSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 p-4"
      aria-label="Cargando formulario del candidato"
      aria-busy="true"
    >
      <Card className="w-full rounded-xl shadow-sm">
        <CardHeader className="pb-3">
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex shrink-0 flex-col items-center gap-1.5 md:w-32 md:pt-4">
              <Skeleton className="size-28 rounded-xl" />
              <Skeleton className="h-3 w-10" />
            </div>

            <div className="grid flex-1 grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-2">
              <FieldSkeleton labelWidth="w-20" />
              <FieldSkeleton labelWidth="w-20" />
              <FieldSkeleton labelWidth="w-16" />
              <FieldSkeleton labelWidth="w-20" />
              <FieldSkeleton labelWidth="w-14" />
              <FieldSkeleton labelWidth="w-20" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full rounded-xl shadow-sm">
        <CardHeader className="gap-1.5 pb-3">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-2">
            <FieldSkeleton labelWidth="w-14" />
            <FieldSkeleton labelWidth="w-20" />
            <FieldSkeleton labelWidth="w-16" />
            <FieldSkeleton labelWidth="w-28" />
          </div>
        </CardContent>
      </Card>

      <Card className="w-full rounded-xl shadow-sm">
        <CardHeader className="pb-3">
          <Skeleton className="h-4 w-36" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-2">
            <FieldSkeleton labelWidth="w-16" />
            <FieldSkeleton labelWidth="w-44" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function EditApplicantPageSkeleton() {
  return (
    <>
      <div className="mx-auto mb-0 flex w-full max-w-[1440px] flex-col gap-4 p-4">
        <h1 className="mb-0 font-heading text-2xl font-bold leading-[1.2] tracking-[-0.02em] text-dashboard-dark">
          Editar candidato
        </h1>
      </div>

      <EditApplicantFormSkeleton />
    </>
  );
}
