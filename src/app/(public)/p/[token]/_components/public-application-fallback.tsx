import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

export function PublicApplicationFallback() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 text-foreground">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4">
        <div className="flex flex-col gap-2.5">
          <header className="flex items-center justify-between border-b border-border-default pb-3.5">
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-md" />
            </div>

            <Skeleton className="h-6 w-48 rounded-full" />
          </header>

          <Skeleton className="h-3.5 w-56 rounded-md" />
        </div>

        <Card className="min-w-0">
          <CardHeader className="flex flex-col gap-3 pb-2">
            <div className="flex items-start gap-4">
              <Skeleton className="size-20 shrink-0 rounded-xl" />

              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-6 w-48 rounded-md" />

                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-4 w-40 rounded-md" />
                </div>

                <div className="mt-0.5 flex items-center gap-4">
                  <Skeleton className="h-3.5 w-36 rounded-md" />
                  <Skeleton className="h-3.5 w-28 rounded-md" />
                  <Skeleton className="h-3.5 w-20 rounded-md" />
                </div>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="grid grid-cols-1 gap-4 pt-3.5 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3 w-16 rounded-md" />
              <Skeleton className="h-4 w-24 rounded-md" />
            </div>
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="h-4 w-28 rounded-md" />
            </div>
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3 w-16 rounded-md" />
              <Skeleton className="h-4 w-36 rounded-md" />
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2.5">
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded-sm" />
              <Skeleton className="h-5 w-44 rounded-md" />
            </div>
            <Skeleton className="h-5 w-32 rounded-full" />
          </CardHeader>

          <Separator />

          <CardContent className="grid grid-cols-2 gap-y-3 gap-x-6 pt-3.5 sm:grid-cols-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-1">
                <Skeleton className="h-3 w-16 rounded-md" />
                <Skeleton className="h-4 w-28 rounded-md" />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Card key={index} size="sm" className="min-w-0 shadow-xs">
              <CardHeader className="flex items-start gap-2 pb-1">
                <Skeleton className="size-3.5 rounded-sm" />
                <Skeleton className="h-3.5 w-14 rounded-md" />
              </CardHeader>
              <CardContent className="flex flex-col gap-1.5">
                <Skeleton className="h-3.5 w-28 rounded-md" />
                <Skeleton className="h-3.5 w-16 rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center gap-2 pb-2.5">
            <Skeleton className="size-4 rounded-sm" />
            <Skeleton className="h-4 w-36 rounded-md" />
          </CardHeader>

          <Separator />

          <CardContent className="pt-3 pb-3.5">
            <Skeleton className="h-4 w-72 rounded-md" />
          </CardContent>
        </Card>

        <div className="flex items-center gap-2 pt-0.5 pb-4">
          <Skeleton className="size-3 rounded-full shrink-0" />
          <Skeleton className="h-3 w-2/3 rounded-md" />
        </div>
      </div>
    </div>
  );
}
