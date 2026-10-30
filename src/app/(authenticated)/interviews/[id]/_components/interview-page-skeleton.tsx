import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export function InterviewHeaderSkeleton() {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <Skeleton className="size-12 shrink-0 rounded-full" />

        <div className="min-w-0 space-y-2">
          <Skeleton className="h-6 w-52" />
          <Skeleton className="h-3.5 w-64" />
        </div>
      </div>

      <Skeleton className="h-9 w-36 rounded-full" />
    </header>
  );
}

export function InterviewNotesSkeleton() {
  return (
    <section className="overflow-hidden rounded-xl border border-border-default bg-card shadow-sm">
      <header className="flex items-center justify-between border-b border-border-default px-4 py-3.5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-20" />
      </header>

      <div className="border-b border-border-default px-3 py-2">
        <Skeleton className="h-6 w-56 rounded-md" />
      </div>

      <div className="space-y-3 px-4 py-6">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      <footer className="border-t border-border-default px-4 py-3">
        <Skeleton className="h-3.5 w-44" />
      </footer>
    </section>
  );
}

export function InterviewDetailsSkeleton() {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <Skeleton className="h-4 w-20" />
        <CardAction>
          <Skeleton className="h-7 w-20 rounded-full" />
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-36" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function InterviewPageSkeleton() {
  return (
    <div
      className="flex min-w-0 flex-col gap-4"
      aria-label="Cargando entrevista"
      aria-busy="true"
    >
      <InterviewHeaderSkeleton />

      <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(420px,480px)]">
        <InterviewNotesSkeleton />

        <aside className="flex min-w-0 flex-col gap-4">
          <InterviewDetailsSkeleton />
        </aside>
      </div>
    </div>
  );
}
