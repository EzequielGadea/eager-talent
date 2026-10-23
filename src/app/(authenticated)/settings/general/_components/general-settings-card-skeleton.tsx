import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export function GeneralSettingsCardSkeleton({
  rows = 3,
  showActionButton = true,
}: {
  title?: string;
  rows?: number;
  showActionButton?: boolean;
}) {
  return (
    <Card className="w-full rounded-xl shadow-sm">
      <CardHeader className="pb-3">
        <Skeleton className="h-4 w-36" />
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between border-b border-border-default py-4"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Skeleton className="h-4 w-full max-w-52" />
            </div>

            <Skeleton className="ml-3 size-7 shrink-0 rounded-md" />
          </div>
        ))}

        {showActionButton && (
          <Skeleton className="mt-5 h-11 w-full rounded-lg border border-dashed border-border-default" />
        )}
      </CardContent>
    </Card>
  );
}
