// A tRPC error without `data` never got an answer from the server (offline,
// network failure), so its message is a technical one like "Failed to fetch".
export function getMutationErrorMessage(error: {
  message: string;
  data?: unknown;
}) {
  return error.data
    ? error.message
    : "No se pudo conectar con el servidor. Revisá tu conexión e intentá de nuevo.";
}
