import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { query } from "../db/pool.js";
import { auditLog } from "../services/auditService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { requireAuth } from "../middleware/auth.js";

export const authRoutes = Router();

function signToken(user: { id: string; email: string; role: "user" | "admin" }) {
  const options: SignOptions = {
    subject: user.id,
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
  };
  return jwt.sign({ email: user.email, role: user.role }, env.JWT_SECRET, options);
}

authRoutes.post(
  "/register",
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        email: z.string().email().max(255),
        password: z.string().min(12).max(128),
        name: z.string().min(1).max(120)
      })
      .parse(req.body);

    const passwordHash = await bcrypt.hash(body.password, env.BCRYPT_ROUNDS);
    const result = await query<{ id: string; email: string; role: "user" | "admin" }>(
      `insert into users (email, password_hash, name, role)
       values ($1, $2, $3, 'user')
       returning id, email, role`,
      [body.email.toLowerCase(), passwordHash, body.name]
    );
    const user = result.rows[0];
    await auditLog({ userId: user.id, action: "registered", category: "auth", ip: req.ip });
    res.status(201).json({ token: signToken(user), user });
  })
);

authRoutes.post(
  "/login",
  asyncHandler(async (req, res) => {
    const body = z.object({ email: z.string().email(), password: z.string().min(1).max(128) }).parse(req.body);
    const result = await query<{
      id: string;
      email: string;
      role: "user" | "admin";
      password_hash: string;
      disabled_at: Date | null;
      failed_login_attempts: number;
      locked_until: Date | null;
    }>("select id, email, role, password_hash, disabled_at, failed_login_attempts, locked_until from users where email=$1", [
      body.email.toLowerCase()
    ]);
    const user = result.rows[0];
    if (!user || user.disabled_at) throw new HttpError(401, "Invalid credentials");
    if (user.locked_until && user.locked_until > new Date()) throw new HttpError(423, "Account temporarily locked");

    const ok = await bcrypt.compare(body.password, user.password_hash);
    if (!ok) {
      const attempts = user.failed_login_attempts + 1;
      const lockedUntil =
        attempts >= env.ACCOUNT_LOCKOUT_ATTEMPTS ? new Date(Date.now() + env.ACCOUNT_LOCKOUT_MINUTES * 60_000) : null;
      await query("update users set failed_login_attempts=$1, locked_until=$2 where id=$3", [attempts, lockedUntil, user.id]);
      await auditLog({ userId: user.id, action: "failed_login", category: "auth", ip: req.ip });
      throw new HttpError(401, "Invalid credentials");
    }

    await query("update users set failed_login_attempts=0, locked_until=null, last_login_at=now() where id=$1", [user.id]);
    await auditLog({ userId: user.id, action: "login", category: "auth", ip: req.ip });
    const safeUser = { id: user.id, email: user.email, role: user.role };
    res.json({ token: signToken(safeUser), user: safeUser });
  })
);

authRoutes.post(
  "/logout",
  requireAuth,
  asyncHandler(async (req, res) => {
    await auditLog({ userId: req.user!.id, action: "logout", category: "auth", ip: req.ip });
    res.status(204).send();
  })
);

authRoutes.post(
  "/password-reset",
  asyncHandler(async (req, res) => {
    z.object({ email: z.string().email() }).parse(req.body);
    res.json({ message: "If the account exists, a password reset workflow will be initiated." });
  })
);
