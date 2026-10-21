export function assertSeedEnvironment(databaseUrl: string): void {
  if (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL ||
    process.env.VERCEL_ENV ||
    process.env.NETLIFY
  ) {
    throw new Error("El seed de prueba no se puede ejecutar en un despliegue.");
  }

  const url = new URL(databaseUrl);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (!["postgres:", "postgresql:"].includes(url.protocol)) {
    throw new Error("El seed requiere una conexión PostgreSQL directa.");
  }
  if (!local && process.env.ALLOW_REMOTE_SEED != "true") {
    throw new Error("El seed de prueba requiere una base PostgreSQL local.");
  }
}
