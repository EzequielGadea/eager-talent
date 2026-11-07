"use client";

import { FileUp } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { toast } from "~/components/ui/toast";
import { api } from "~/lib/trpc/react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";

type Preview =
  inferRouterOutputs<AppRouter>["applicantNote"]["previewPeopleForce"];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("No se pudo leer el archivo"));
        return;
      }
      resolve(reader.result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}

function getImportErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";

  if (
    message.includes("10.000") ||
    message.includes("10000") ||
    message.includes("Too big") ||
    message.includes("too_big")
  ) {
    return "El archivo tiene demasiadas filas. Seleccioná un CSV o XLSX con hasta 10.000 filas.";
  }

  if (message) return message;
  return "No se pudo procesar el archivo CSV o XLSX. Verificá el formato e intentá nuevamente.";
}

export function ImportNotesButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const previewMutation = api.applicantNote.previewPeopleForce.useMutation();
  const importMutation = api.applicantNote.importPeopleForce.useMutation();

  function reset() {
    setFileName("");
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    reset();
    setOpen(true);
    setFileName(file.name);
    const fileExtension = file.name.toLowerCase();
    if (!fileExtension.endsWith(".xlsx") && !fileExtension.endsWith(".csv")) {
      setError("El archivo debe tener formato CSV o XLSX.");
      return;
    }

    setIsReading(true);
    try {
      setPreview(
        await previewMutation.mutateAsync({
          file: await fileToBase64(file),
          fileName: file.name,
        }),
      );
    } catch (caught) {
      setError(getImportErrorMessage(caught));
    } finally {
      setIsReading(false);
    }
  }

  async function confirmImport() {
    if (!preview) return;
    try {
      const result = await importMutation.mutateAsync({ notes: preview.notes });
      toast.add({
        title: `Se importaron ${result.importedNotes} notas de ${result.reachedApplicants} candidatos`,
        type: "success",
      });
      setOpen(false);
      reset();
      router.refresh();
    } catch (caught) {
      setError(
        getImportErrorMessage(caught) ===
          "No se pudo procesar el archivo CSV o XLSX. Verificá el formato e intentá nuevamente."
          ? "Ocurrió un error durante la importación. No se guardaron datos parciales."
          : getImportErrorMessage(caught),
      );
    }
  }

  const busy =
    isReading || previewMutation.isPending || importMutation.isPending;
  const hasExistingNotes = (preview?.existingNoteApplicants.length ?? 0) > 0;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Seleccionar archivo CSV o XLSX de notas de PeopleForce"
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        className="h-8.5 gap-2 rounded-full px-3 text-small font-semibold md:px-4"
      >
        <FileUp data-icon="inline-start" />
        <span className="hidden md:inline">Importar notas</span>
        <span className="sr-only md:hidden">Importar notas de PeopleForce</span>
      </Button>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (busy && !nextOpen) return;
          setOpen(nextOpen);
          if (!nextOpen) reset();
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Importar notas de PeopleForce</DialogTitle>
            <DialogDescription>
              {fileName ||
                "Seleccioná un archivo CSV o XLSX exportado de PeopleForce."}
            </DialogDescription>
          </DialogHeader>

          {busy && (
            <p className="text-sm text-text-secondary">
              {importMutation.isPending
                ? "Importando notas..."
                : "Validando archivo..."}
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="rounded-md bg-danger-bg p-3 text-sm text-danger"
            >
              {error}
            </p>
          )}
          {preview && !error && (
            <div className="flex flex-col gap-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <Stat
                  label="Candidatos encontrados"
                  value={preview.matchedApplicants}
                />
                <Stat label="Notas a importar" value={preview.notesToImport} />
                <Stat
                  label="Candidatos omitidos"
                  value={preview.omittedApplicants}
                />
                <Stat
                  label="Filas sin identificación"
                  value={preview.skippedWithoutIdentification}
                />
              </div>
              {preview.matchedApplicants === 0 ? (
                <p className="rounded-md bg-warning-bg p-3 text-warning">
                  No hay candidatos del archivo con un identificador de
                  PeopleForce asociado.
                </p>
              ) : (
                <>
                  {preview.omittedApplicantNames.length > 0 && (
                    <OmittedApplicants names={preview.omittedApplicantNames} />
                  )}
                  {hasExistingNotes && (
                    <p className="rounded-md bg-warning-bg p-3 text-warning">
                      Algunos candidatos ya tienen notas importadas. Continuar
                      puede duplicarlas:{" "}
                      {preview.existingNoteApplicants.join(", ")}.
                    </p>
                  )}
                  <p className="text-text-secondary">
                    Se conservarán el autor y la fecha de cada nota del archivo.
                  </p>
                </>
              )}
              {preview.matchedApplicants === 0 &&
                preview.omittedApplicantNames.length > 0 && (
                  <OmittedApplicants names={preview.omittedApplicantNames} />
                )}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={busy}
            >
              Cancelar
            </Button>
            {preview && preview.matchedApplicants > 0 && !error && (
              <Button
                type="button"
                onClick={() => void confirmImport()}
                disabled={busy}
              >
                {hasExistingNotes
                  ? "Confirmar duplicación"
                  : "Confirmar importación"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function OmittedApplicants({ names }: { names: string[] }) {
  const visibleNames = names.slice(0, 50);
  const remainingCount = names.length - visibleNames.length;

  return (
    <div className="rounded-md bg-warning-bg p-3 text-warning">
      <p className="font-medium">Candidatos omitidos:</p>
      <ul className="mt-1 list-disc pl-5">
        {visibleNames.map((name, index) => (
          <li key={`${name}-${index}`}>{name}</li>
        ))}
      </ul>
      {remainingCount > 0 && (
        <p className="mt-1">
          y {remainingCount} candidato{remainingCount === 1 ? "" : "s"} más.
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border-default p-3">
      <p className="text-text-secondary">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
