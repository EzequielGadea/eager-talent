"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { FileUp } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { DropdownMenuItem } from "~/components/ui/dropdown-menu";

import {
  parseApplicantCsv,
  type ImportedApplicant,
} from "~/lib/csv/parse-applicants-csv";

import { api } from "~/lib/trpc/react";

type ImportError = {
  rowNumber: number;
  email: string;
  reason: string;
};

type ValidationResult = {
  validApplicants: ImportedApplicant[];
  errors: ImportError[];
};

type ImportResult = {
  total: number;
  imported: number;
  failed: number;
  errors: ImportError[];
};

export function ImportApplicantsButton({
  fileInputRef: externalFileInputRef,
}: {
  fileInputRef?: React.RefObject<HTMLInputElement | null>;
} = {}) {
  const internalFileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = externalFileInputRef ?? internalFileInputRef;
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();

  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [generalError, setGeneralError] = useState<string | null>(null);

  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);

  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const [isParsing, setIsParsing] = useState(false);

  const utils = api.useUtils();

  const validateMutation = api.applicant.validateImportApplicants.useMutation();

  const importMutation = api.applicant.importApplicants.useMutation();

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  const isLoading =
    isParsing ||
    validateMutation.isPending ||
    importMutation.isPending ||
    isRefreshing;

  function resetState() {
    setFileName("");
    setGeneralError(null);
    setValidationResult(null);
    setImportResult(null);
    setIsParsing(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const expectedHeaders: Record<string, string> = {
      email: "Correo",
      fullName: "Nombre completo",
      role: "Posición actual",
    };

    const file = event.target.files?.[0];

    if (!file) return;

    resetState();
    setFileName(file.name);
    setOpen(true);

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setGeneralError("El archivo debe tener formato CSV.");
      return;
    }

    setIsParsing(true);

    try {
      const parsed = await parseApplicantCsv(file);

      const parseErrors: string[] = [
        ...parsed.headerErrors,
        ...parsed.missingHeaders.map(
          (header) =>
            `Al archivo le falta una columna obligatoria correspondiente a ${header} (se esperaba "${expectedHeaders[header]}").`,
        ),
        ...parsed.errors.map(
          (error) => `Error al leer el CSV: ${error.message}`,
        ),
      ];

      if (parseErrors.length > 0) {
        setGeneralError(parseErrors.join("\n"));
        return;
      }

      if (parsed.data.length === 0) {
        setGeneralError("El archivo CSV no contiene candidatos.");
        return;
      }

      const validation = await validateMutation.mutateAsync({
        applicants: parsed.data,
      });

      setValidationResult(validation);
    } catch (error) {
      setGeneralError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al procesar el archivo.",
      );
    } finally {
      setIsParsing(false);
    }
  }

  async function handleConfirmImport() {
    if (!validationResult?.validApplicants.length) return;

    try {
      setGeneralError(null);

      const result = await importMutation.mutateAsync({
        applicants: validationResult.validApplicants,
      });

      setImportResult(result);

      // Refresh the applicants list after importing.
      await utils.applicant.invalidate();
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setGeneralError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error durante la importación.",
      );
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Seleccionar archivo CSV de candidatos"
      />

      {!externalFileInputRef && (
        <DropdownMenuItem className="gap-2" onClick={openFilePicker}>
          <FileUp />
          <span>Importar candidatos</span>
        </DropdownMenuItem>
      )}

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (isLoading && !nextOpen) return;

          setOpen(nextOpen);

          if (!nextOpen) resetState();
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Importar candidatos</DialogTitle>
            <DialogDescription>
              {fileName || "Importación desde archivo CSV"}
            </DialogDescription>
          </DialogHeader>

          {isLoading && (
            <p className="text-sm text-text-secondary">
              {importMutation.isPending
                ? "Importando candidatos..."
                : "Procesando y validando el archivo..."}
            </p>
          )}

          {generalError && (
            <div
              role="alert"
              className="whitespace-pre-line rounded-md border border-danger bg-danger-bg p-3 text-sm text-danger"
            >
              {generalError}
            </div>
          )}

          {validationResult && !importResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border border-border p-3">
                  <p className="text-sm text-text-secondary">
                    Candidatos válidos
                  </p>
                  <p className="text-2xl font-semibold">
                    {validationResult.validApplicants.length}
                  </p>
                </div>

                <div className="rounded-md border border-border p-3">
                  <p className="text-sm text-text-secondary">
                    Candidatos con errores
                  </p>
                  <p className="text-2xl font-semibold">
                    {validationResult.errors.length}
                  </p>
                </div>
              </div>

              {validationResult.errors.length > 0 && (
                <ImportErrors errors={validationResult.errors} />
              )}

              <p className="text-sm text-text-secondary">
                Solo se importarán los candidatos válidos. Los candidatos con
                errores quedarán excluidos.
              </p>
            </div>
          )}

          {importResult && (
            <div className="space-y-4">
              <p
                className={`rounded-md p-3 text-sm ${
                  importResult.imported === 0
                    ? "bg-danger-bg text-danger"
                    : importResult.failed > 0
                      ? "bg-warning-bg text-warning"
                      : "bg-success-bg text-success"
                }`}
              >
                {importResult.imported === 0 ? (
                  "No se pudo importar ningún candidato."
                ) : importResult.failed > 0 ? (
                  <>
                    Se importaron {importResult.imported} de{" "}
                    {importResult.total} candidatos. Los otros{" "}
                    {importResult.failed} no pudieron importarse.
                  </>
                ) : (
                  <>
                    Se importaron correctamente {importResult.imported}{" "}
                    candidatos.
                  </>
                )}
              </p>

              {importResult.failed > 0 && (
                <ImportErrors errors={importResult.errors} />
              )}
            </div>
          )}

          <DialogFooter>
            {importResult ? (
              <Button disabled={isLoading} onClick={() => setOpen(false)}>
                Cerrar
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>

                {validationResult && (
                  <Button
                    disabled={
                      isLoading || validationResult.validApplicants.length === 0
                    }
                    onClick={handleConfirmImport}
                  >
                    Importar {validationResult.validApplicants.length}{" "}
                    candidatos
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ImportErrors({ errors }: { errors: ImportError[] }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">
        Errores detectados ({errors.length})
      </h3>

      <div className="max-h-64 overflow-auto rounded-md border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-2">Fila</th>
              <th className="p-2">Email</th>
              <th className="p-2">Motivo</th>
            </tr>
          </thead>

          <tbody>
            {errors.map((error, index) => (
              <tr
                key={`${error.rowNumber}-${index}`}
                className="border-b border-border last:border-b-0"
              >
                <td className="p-2">{error.rowNumber}</td>
                <td className="break-all p-2">{error.email || "—"}</td>
                <td className="p-2">{error.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
