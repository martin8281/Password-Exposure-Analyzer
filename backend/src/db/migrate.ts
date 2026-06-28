import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./pool.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, "../../db/migrations");

for (const file of fs.readdirSync(migrationsDir).filter((name) => name.endsWith(".sql")).sort()) {
  const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
  await pool.query(sql);
  console.log(`Applied ${file}`);
}

await pool.end();
