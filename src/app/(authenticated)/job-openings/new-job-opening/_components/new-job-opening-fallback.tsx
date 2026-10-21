import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";

function FormSectionFallback({
  children,
  titleWidth = "w-36",
}: {
  children: React.ReactNode;
  titleWidth?: string;
}) {
  return (
    <section className="w-full rounded-xl border border-border-default bg-card shadow-sm">
      <div className="border-b border-border-default px-6 py-4">
        <Skeleton className={`h-4 ${titleWidth}`} />
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function FieldFallback({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Skeleton className="h-3.5 w-28" />
      <Skeleton className="h-8.5 w-full rounded-md" />
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
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-16" />
            <div className="flex h-8.5 items-center gap-1 rounded-lg border border-border-default bg-surface-sunken p-1">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-6 flex-1 rounded-md" />
              ))}
            </div>
          </div>
          <div className="space-y-2">
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
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-lg" />
          ))}
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      </FormSectionFallback>

      <FormSectionFallback titleWidth="w-32">
        <div className="space-y-5">
          <div className="flex gap-2">
            <Skeleton className="h-8 w-32 rounded-full" />
            <Skeleton className="h-8 w-36 rounded-full" />
          </div>
          <Skeleton className="h-9 w-full rounded-md md:w-1/2" />
        </div>
      </FormSectionFallback>

      <div className="flex flex-col gap-3 border-t border-border-default pt-4 sm:flex-row sm:items-center sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled
          className="h-8.5 rounded-full px-4 text-[13px]"
        >
          Cancelar
        </Button>
        <Skeleton className="h-8.5 w-36 rounded-full" />
      </div>
    </div>
  );
}
