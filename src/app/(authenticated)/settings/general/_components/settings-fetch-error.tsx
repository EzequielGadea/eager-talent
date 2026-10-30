import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { CircleAlert, RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";

export function SettingsFetchError({
  title,
  refetch,
  isFetching,
}: {
  title: string;
  refetch: () => void;
  isFetching: boolean;
}) {
  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-baseline gap-2">
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col items-center text-center">
        <div
          role="alert"
          className="flex w-full max-w-md flex-col gap-4 text-center"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-danger-bg">
              <CircleAlert className="size-6 text-danger" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                Error inesperado
              </h3>
              <p className="text-sm text-text-secondary">
                Algo salió mal, intentalo de nuevo más tarde.
              </p>
            </div>
          </div>
          <div>
            <Button
              type="button"
              disabled={isFetching}
              onClick={() => refetch()}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              {isFetching ? "Reintentando..." : "Intentar nuevamente"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
