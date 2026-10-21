import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { CircleAlert } from "lucide-react";
import { Button } from "~/components/ui/button";

export function SettingsFetchError({title, message, refetch, isFetching}: {title: string, message: string, refetch: () => void, isFetching: boolean}) {

  return (
      <Card className="w-full rounded-xl shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-baseline gap-2">
          <CardTitle className="text-sm font-semibold">
            {title}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-2 text-center">
        <div role="alert" className="w-full max-w-md text-center">
          <div className="flex flex-col items-center gap-4 p-0"> 
            <div className="flex size-12 items-center justify-center rounded-full bg-danger-bg">
              <CircleAlert className="size-6 text-danger" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-text-secondary">
                {message}
              </p>
            </div>
          </div> 
          <div className="p-0">
            <Button
              className="mt-4 w-40 rounded-full bg-destructive text-base text-white hover:bg-destructive/90"
              type="button"
              variant="destructive"
              size="lg"
              disabled={isFetching}
              onClick={() => refetch()}
            >
              {isFetching ? "Reintentando..." : "Reintentar"}
            </Button>
          </div>
         </div> 
      </CardContent>
    </Card>
  );
}