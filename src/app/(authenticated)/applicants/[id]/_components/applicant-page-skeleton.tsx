import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";

export function ApplicantOverviewSkeleton() {
  return (
    <Card className="min-w-0">
      <CardHeader className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-70 flex-1 items-start gap-4">
          <Skeleton className="size-16 shrink-0 rounded-full" />

          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />

            <div className="mt-3 flex flex-col gap-2">
              <Skeleton className="h-4 w-52" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="size-8 rounded-full" />
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="min-w-0 space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ApplicantInfoCardsSkeleton() {
  return (
    <div className="@container">
      <div className="grid gap-3 @min-[360px]:grid-cols-2 @min-[640px]:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} size="sm" className="min-w-0 shadow-sm">
            <CardHeader className="flex items-start gap-2">
              <Skeleton className="mt-0.5 size-3.5 shrink-0 rounded-sm" />
              <Skeleton className="h-3.5 w-24" />
            </CardHeader>
            <CardContent className="flex min-w-0 flex-col gap-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3.5 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ApplicantApplicationsSkeleton() {
  return (
    <Card className="bg-card p-0">
      <CardHeader className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-9 w-48 rounded-xl" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
      </CardHeader>

      <Separator className="bg-border-default" />

      <CardContent className="flex flex-wrap items-center gap-6 px-6 py-4">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-4 w-32" />
      </CardContent>

      <Separator className="bg-border-default" />

      <CardContent className="px-6 pb-5 pt-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-8 w-36 rounded-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ApplicantLogsSkeleton() {
  return (
    <Card className="w-full min-w-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-40 rounded-lg" />
      </CardHeader>
      <Separator />
      <CardContent className="space-y-3 pt-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-full rounded-md" />
        ))}
      </CardContent>
    </Card>
  );
}

export function ApplicantNotesSkeleton() {
  return (
    <section className="overflow-hidden rounded-xl border border-border-default bg-card shadow-sm">
      <header className="flex items-center justify-between border-b border-border-default px-4 py-3.5">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </header>
      <div className="border-b border-border-default px-3 py-2">
        <Skeleton className="h-6 w-48 rounded-md" />
      </div>
      <div className="space-y-2.5 px-4 py-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <footer className="border-t border-border-default px-4 py-3">
        <Skeleton className="h-3.5 w-44" />
      </footer>
    </section>
  );
}

export function ApplicantTagsSkeleton() {
  return (
    <Card size="sm">
      <CardHeader>
        <Skeleton className="h-4 w-20" />
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </CardContent>
    </Card>
  );
}

export function ApplicantPageSkeleton() {
  return (
    <div
      className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]"
      aria-label="Cargando perfil del candidato"
      aria-busy="true"
    >
      <div className="flex min-w-0 flex-col gap-4">
        <ApplicantOverviewSkeleton />
        <ApplicantInfoCardsSkeleton />
        <ApplicantApplicationsSkeleton />
      </div>

      <aside className="flex min-w-0 flex-col gap-4">
        <ApplicantNotesSkeleton />
        <ApplicantTagsSkeleton />
      </aside>
    </div>
  );
}
