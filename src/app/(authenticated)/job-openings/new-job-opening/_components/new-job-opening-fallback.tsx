import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

function FormSectionFallback({
  titleWidth = "w-36",
  children,
}: {
  titleWidth?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="w-full rounded-xl shadow-sm">
      <CardHeader className="pb-3">
        <Skeleton className={`h-4 ${titleWidth}`} />
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function FieldFallback({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Skeleton className="h-3.5 w-28" />
      <Skeleton className="h-8 w-full rounded-lg" />
    </div>
  );
}

export default function NewJobOpeningFallback() {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 p-4">
      <FormSectionFallback titleWidth="w-36">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FieldFallback className="md:col-span-2" />
          <FieldFallback />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-16" />
            <div className="flex h-8 items-center gap-1 rounded-lg border border-border-default bg-surface-sunken p-1">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-6 flex-1 rounded-md" />
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-8 w-24 rounded-full" />
              ))}
            </div>
          </div>
          <FieldFallback />
        </div>
      </FormSectionFallback>

      <FormSectionFallback titleWidth="w-20">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FieldFallback />
          <FieldFallback />
        </div>
      </FormSectionFallback>

      <FormSectionFallback titleWidth="w-40">
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </FormSectionFallback>
    </div>
  );
}

export function NewJobOpeningPageFallback() {
  return (
    <div className="mx-auto mb-0 flex w-full max-w-[1440px] flex-col gap-4 p-4">
      <h1 className="mb-0 text-2xl --text-primary --font-heading">
        Nueva vacante
      </h1>
      <NewJobOpeningFallback />
    </div>
  );
}
