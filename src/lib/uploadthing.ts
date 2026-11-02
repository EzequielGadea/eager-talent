"use client";

import { useState } from "react";

type ServerData = {
  url: string;
  ufsUrl: string;
  key: string;
  name: string;
};

export type UploadedFile = ServerData & {
  serverData: ServerData;
};

type Options = {
  onClientUploadComplete?: (res: UploadedFile[]) => void;
  onUploadError?: (error: Error) => void;
};

const MAX_SIZE = 4 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

// Mantiene una interfaz compatible con el hook anterior,
// pero el archivo se envía a nuestro servidor y no directamente a UploadThing.
export function useUploadThing(_endpoint?: string, options?: Options) {
  void _endpoint;

  const [pending, setPending] = useState(0);

  const startUpload = async (
    files: File[],
  ): Promise<UploadedFile[] | undefined> => {
    // Validación anticipada para evitar solicitudes innecesarias.
    const invalidFile = files.find((file) => {
      return (
        file.size === 0 || file.size > MAX_SIZE || !ALLOWED_TYPES.has(file.type)
      );
    });

    if (invalidFile) {
      let message = "Formato no permitido (PDF, PNG, JPG, WEBP o GIF)";

      if (invalidFile.size === 0) {
        message = "El archivo está vacío";
      } else if (invalidFile.size > MAX_SIZE) {
        message = "El archivo supera el tamaño máximo de 4 MB";
      }

      options?.onUploadError?.(new Error(message));
      return undefined;
    }

    setPending((n) => n + 1);

    try {
      const results: UploadedFile[] = [];

      for (const file of files) {
        const body = new FormData();
        body.append("file", file);

        const res = await fetch("/api/files/upload", {
          method: "POST",
          body,
        });

        if (!res.ok) {
          const err = (await res.json().catch(() => null)) as {
            message?: string;
          } | null;

          throw new Error(err?.message ?? "Error al subir el archivo");
        }

        const data = (await res.json()) as ServerData;

        results.push({
          ...data,
          serverData: data,
        });
      }

      options?.onClientUploadComplete?.(results);
      return results;
    } catch (e) {
      options?.onUploadError?.(
        e instanceof Error ? e : new Error("Error al subir el archivo"),
      );

      return undefined;
    } finally {
      setPending((n) => n - 1);
    }
  };

  return {
    startUpload,
    isUploading: pending > 0,
  };
}
