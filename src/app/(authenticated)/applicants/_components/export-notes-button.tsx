"use client";

import JSZip from "jszip";
import { ChevronDown, Download, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import writeXlsxFile from "write-excel-file/browser";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { toast } from "~/components/ui/toast";
import { api } from "~/lib/trpc/react";

const sourceValues = ["Inbound", "Outbound", "Referral"] as const;
type Source = (typeof sourceValues)[number];
type ExportFormat = "xlsx" | "csv";

export function ExportNotesButton() {
  const searchParams = useSearchParams();
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("xlsx");
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
    <div className="inline-flex items-center">
      <Button
        size="sm"
        variant="outline"
        onClick={exportNotes}
        disabled={isExporting}
        className="relative h-8.5 gap-2 rounded-l-full rounded-r-none px-3 text-small font-semibold focus-visible:z-10"
      >
        {isExporting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Download className="size-4" />
        )}
        <span>
          {isExporting
            ? "Exportando..."
            : `Exportar notas (${exportFormat.toUpperCase()})`}
        </span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={isExporting}
          render={
            <Button
              size="sm"
              variant="outline"
              aria-label="Formato de exportación"
              className="relative -ml-px h-8.5 rounded-l-none rounded-r-full px-2 focus-visible:z-10"
            />
          }
        >
          <ChevronDown className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuRadioGroup
            value={exportFormat}
            onValueChange={(value) => {
              if (value === "xlsx" || value === "csv") setExportFormat(value);
            }}
          >
            <DropdownMenuRadioItem value="xlsx">XLSX</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="csv">CSV</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
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
