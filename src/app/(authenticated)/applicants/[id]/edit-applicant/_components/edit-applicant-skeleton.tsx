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
      className="flex w-full flex-col gap-4"
      aria-label="Cargando formulario del candidato"
      aria-busy="true"
    >
      <Card className="w-full gap-4 rounded-xl shadow-sm [--card-spacing:--spacing(5)]">
        <CardHeader>
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

      <Card className="w-full gap-4 rounded-xl shadow-sm [--card-spacing:--spacing(5)]">
        <CardHeader className="gap-1.5">
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

      <Card className="w-full gap-4 rounded-xl shadow-sm [--card-spacing:--spacing(5)]">
        <CardHeader>
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
    <div className="mx-auto w-full max-w-210">
      <h1 className="mb-5.5 font-heading text-h1 text-text-primary">
        Editar candidato
      </h1>

      <EditApplicantFormSkeleton />
    </div>
  );
}
