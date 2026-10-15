import { Download, File } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

type PublicDocumentsCardProps = {
  resumeUrl?: string | null;
  educationUrl?: string | null;
};

export function PublicDocumentsCard({
  resumeUrl,
  educationUrl,
}: PublicDocumentsCardProps) {
  if (!resumeUrl && !educationUrl) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {resumeUrl && (
        <DocumentCard
          title="CV"
          value={resumeUrl}
          emptyMessage="Sin CV cargado"
          iconClassName="text-info"
        />
      )}

      {educationUrl && (
        <DocumentCard
          title="Certificado"
          value={educationUrl}
          emptyMessage="Sin escolaridad cargada"
          iconClassName="text-warning"
        />
      )}
    </div>
  );
}

type DocumentCardProps = {
  title: string;
  value: string | null;
  emptyMessage: string;
  iconClassName?: string;
};

function DocumentCard({
  title,
  value,
  emptyMessage,
  iconClassName = "text-info",
}: DocumentCardProps) {
  const documentUrl = value?.trim();

  return (
    <Card size="sm" className="min-w-0 shadow-xs">
      <CardHeader className="flex items-start gap-2">
        <span className="mt-0.5 shrink-0">
          <File className={`size-3.5 ${iconClassName}`} />
        </span>

        <CardTitle className="min-w-0 wrap-anywhere text-xs font-semibold text-text-secondary group-data-[size=sm]/card:text-xs">
          <h2>{title}</h2>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex min-w-0 flex-col gap-1 wrap-anywhere text-sm">
        {documentUrl ? (
          <a
            href={documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Descargar ${title}`}
            className={cn(
              buttonVariants({
                variant: "link",
                size: "sm",
                className:
                  "h-auto w-fit max-w-full gap-1 rounded-sm p-0 text-sm font-normal text-text-link hover:underline",
              }),
            )}
          >
            Descargar
            <Download className="size-3" aria-hidden="true" />
          </a>
        ) : (
          <p className="text-muted-foreground">{emptyMessage}</p>
        )}
      </CardContent>
    </Card>
  );
}
