import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function getNormalizedDatabaseUrl() {
  const rawUrl = process.env.DATABASE_URL;

  if (!rawUrl) {
    return undefined;
  }

  const trimmed = rawUrl.trim();
  const normalized =
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1).trim()
      : trimmed;

  if (!normalized) {
    return undefined;
  }

  return normalized;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    datasourceUrl: getNormalizedDatabaseUrl(),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
