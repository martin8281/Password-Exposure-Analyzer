import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { pool } from "./pool.js";

const adminPasswordHash = await bcrypt.hash("AdminChangeMe123!", env.BCRYPT_ROUNDS);

const admin = await pool.query<{ id: string }>(
  `insert into users (email, password_hash, name, role)
   values ('admin@example.com', $1, 'System Administrator', 'admin')
   on conflict (email) do update set role='admin'
   returning id`,
  [adminPasswordHash]
);

await pool.query(
  `insert into password_policies
   (min_length, max_length, require_uppercase, require_lowercase, require_numbers, require_special, expiration_days, created_by)
   select 12, 128, true, true, true, true, 90, $1
   where not exists (select 1 from password_policies)`,
  [admin.rows[0].id]
);

console.log("Seed data loaded.");
await pool.end();
