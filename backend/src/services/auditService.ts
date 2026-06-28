import { query } from "../db/pool.js";

export async function auditLog(input: {
  userId?: string;
  action: string;
  category: "auth" | "security" | "admin" | "report";
  ip?: string;
  metadata?: Record<string, unknown>;
}) {
  await query(
    `insert into audit_logs (user_id, action, category, ip_address, metadata)
     values ($1, $2, $3, $4, $5)`,
    [input.userId ?? null, input.action, input.category, input.ip ?? null, input.metadata ?? {}]
  );
}
