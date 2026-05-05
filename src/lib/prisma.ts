import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { env } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool:  Pool       | undefined;
};

const pool =
  globalForPrisma.pgPool ??
  new Pool({
    connectionString: env.DATABASE_URL,

    // Neon free-tier cold starts can take 15–20 s; keep well above that.
    connectionTimeoutMillis: 60_000,

    // Must be LESS than Neon's server-side idle timeout (~300 s / 5 min).
    // If the pool holds a connection longer than Neon keeps it open, the
    // next query on that connection gets "Connection terminated".
    idleTimeoutMillis: 20_000,

    // Allow enough connections for concurrent server components in dev.
    max: process.env.NODE_ENV === "production" ? 5 : 5,

    // Release pool when no more clients are needed (good for serverless).
    allowExitOnIdle: true,
  });

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pgPool  = pool;
  globalForPrisma.prisma  = prisma;
}
