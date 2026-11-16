import { FetchErrorState } from "~/components/fetch-error-state";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

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
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col items-center text-center">
        <FetchErrorState onRetry={() => refetch()} isRetrying={isFetching} />
      </CardContent>
    </Card>
  );
}
