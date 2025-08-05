import { PrismaClient } from "@prisma/client";

export function maskDatabaseUrl(url?: string): string {
  if (!url) return "N/A";
  try {
    if (url.startsWith("file:")) return url;
    const u = new URL(url);
    const user = u.username ? `${u.username}:***@` : "";
    const host = u.host;
    const path = u.pathname;
    const params = u.search ? u.search : "";
    return `${u.protocol}//${user}${host}${path}${params}`;
  } catch {
    return url;
  }
}

export async function checkDatabase(): Promise<{ ok: boolean; message: string }> {
  const prisma = new PrismaClient();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, message: "connected" };
  } catch (e: unknown) {
    const error = e as Error;
    return { ok: false, message: error?.message ?? "connection failed" };
  }
}

export function banner(opts: {
  port: number;
  env: string;
  dbUrlMasked: string;
  nodeVersion: string;
}) {
  const base = `http://localhost:${opts.port}`;
  const lines = [
    " ",
    "🚀 API server is up",
    "────────────────────────────────────────",
    `Env         : ${opts.env}`,
    `Node        : ${opts.nodeVersion}`,
    `Port        : ${opts.port}`,
    `Health      : ${base}/api/health`,
    `Swagger UI  : ${base}/api/docs`,
    `Database    : ${opts.dbUrlMasked}`,
    "────────────────────────────────────────",
  ];
  return lines.join("\n");
}
