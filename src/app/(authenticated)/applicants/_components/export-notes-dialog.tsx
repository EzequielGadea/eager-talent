"use client";

import JSZip from "jszip";
import { Download, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import writeXlsxFile from "write-excel-file/browser";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { FieldLegend, FieldSet } from "~/components/ui/field";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { toast } from "~/components/ui/toast";
import { api } from "~/lib/trpc/react";

const sourceValues = ["Inbound", "Outbound", "Referral"] as const;
type Source = (typeof sourceValues)[number];
type ExportFormat = "xlsx" | "csv";

export function ExportNotesDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const searchParams = useSearchParams();
  const [exportFormat, setExportFormat] = useState<ExportFormat>("xlsx");
  const [isExporting, setIsExporting] = useState(false);
  const exportMutation = api.applicant.exportNotes.useMutation();

  async function exportNotes() {
    setIsExporting(true);

    try {
      const result = await exportMutation.mutateAsync({
        search: searchParams.get("search") ?? undefined,
        roleId: searchParams.getAll("role"),
        jobOpeningId: searchParams.getAll("jobOpening"),
        seniorityId: searchParams.getAll("seniority"),
        tagId: searchParams.getAll("tag"),
        areaId: searchParams.getAll("area"),
        source: searchParams
          .getAll("source")
          .filter((source): source is Source =>
            sourceValues.includes(source as Source),
          ),
      });

      const files: Array<{ name: string; data: Blob }> = [];

      if (result.candidateNotes.length > 0) {
        files.push({
          name: `notas-de-candidatos.${exportFormat}`,
          data:
            exportFormat === "xlsx"
              ? await createWorkbook(result.candidateNotes)
              : createCsv(result.candidateNotes),
        });
      }

      if (result.interviewNotes.length > 0) {
        files.push({
          name: `notas-de-entrevistas.${exportFormat}`,
          data:
            exportFormat === "xlsx"
              ? await createWorkbook(result.interviewNotes)
              : createCsv(result.interviewNotes),
        });
      }

      if (files.length === 0) {
        toast.add({
          type: "info",
          title: "No hay notas para exportar",
          description:
            "Los candidatos seleccionados no tienen notas registradas.",
        });
        onOpenChange(false);
        return;
      }

      const zip = new JSZip();
      files.forEach((file) => zip.file(file.name, file.data));
      const blob = await zip.generateAsync({ type: "blob" });
      downloadBlob(
        blob,
        `notas-de-candidatos-${new Date().toISOString().slice(0, 10)}.zip`,
      );

      if (files.length < 2) {
        toast.add({
          type: "info",
          title: "Exportación incompleta",
          description:
            "Uno de los dos tipos de notas no tenía datos y no se incluyó.",
        });
      } else {
        toast.add({ type: "success", title: "Notas exportadas correctamente" });
      }
      onOpenChange(false);
    } catch (error) {
      toast.add({
        type: "error",
        title: "No se pudieron exportar las notas",
        description:
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado.",
      });
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isExporting) return;
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exportar notas</DialogTitle>
          <DialogDescription>
            Elegí el formato del archivo para descargar las notas de los
            candidatos seleccionados.
          </DialogDescription>
        </DialogHeader>

        <FieldSet className="gap-3">
          <FieldLegend variant="label">Formato de salida</FieldLegend>
          <RadioGroup
            value={exportFormat}
            onValueChange={(value) => {
              if (value === "xlsx" || value === "csv") setExportFormat(value);
            }}
          >
            <Label
              htmlFor="export-notes-xlsx"
              className="flex items-start gap-3 rounded-lg border border-border p-3 has-data-checked:border-primary has-data-checked:bg-primary/5 hover:bg-muted/50"
            >
              <RadioGroupItem
                id="export-notes-xlsx"
                value="xlsx"
                className="mt-0.5"
                disabled={isExporting}
              />
              <span className="grid gap-0.5">
                <span className="text-sm font-medium">Excel (.xlsx)</span>
                <span className="text-sm text-text-secondary">
                  Recomendado para trabajar con las notas en una planilla.
                </span>
              </span>
            </Label>
            <Label
              htmlFor="export-notes-csv"
              className="flex items-start gap-3 rounded-lg border border-border p-3 has-data-checked:border-primary has-data-checked:bg-primary/5 hover:bg-muted/50"
            >
              <RadioGroupItem
                id="export-notes-csv"
                value="csv"
                className="mt-0.5"
                disabled={isExporting}
              />
              <span className="grid gap-0.5">
                <span className="text-sm font-medium">CSV (.csv)</span>
                <span className="text-sm text-text-secondary">
                  Compatible con la mayoría de las planillas y sistemas.
                </span>
              </span>
            </Label>
          </RadioGroup>
        </FieldSet>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={exportNotes} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 data-icon="inline-start" className="animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download data-icon="inline-start" />
                Exportar notas
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

async function createWorkbook(
  rows: Array<Record<string, string>>,
): Promise<Blob> {
  const columns = Object.keys(rows[0] ?? {}).map((key) => ({
    header: key,
    cell: (row: Record<string, string>) => row[key],
  }));

  return writeXlsxFile(rows, { columns }).toBlob();
}

function createCsv(rows: Array<Record<string, string>>): Blob {
  const headers = Object.keys(rows[0] ?? {});
  const csv = [
    headers,
    ...rows.map((row) => headers.map((header) => row[header])),
  ]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\r\n");

  return new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
}

function escapeCsvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
