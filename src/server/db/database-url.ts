export const LOCAL_DATABASE_URL =
  "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable&connection_limit=10&connect_timeout=0&max_idle_connection_lifetime=0&pool_timeout=0&socket_timeout=0";

export function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (databaseUrl) {
    return databaseUrl;
  }

  // Prevent local fallback in production, Vercel, or CI environments
  if (process.env.VERCEL || process.env.VERCEL_ENV) {
    throw new Error(
      "DATABASE_URL is not defined in Vercel environment. Database connection requires an explicit DATABASE_URL.",
    );
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "DATABASE_URL is not defined in production environment. Database connection requires an explicit DATABASE_URL.",
    );
  }

  if (process.env.CI) {
    throw new Error(
      "DATABASE_URL is not defined in CI environment. CI workflow must explicitly provide DATABASE_URL.",
    );
  }

  return LOCAL_DATABASE_URL;
}
