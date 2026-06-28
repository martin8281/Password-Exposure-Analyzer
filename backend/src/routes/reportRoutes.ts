import { stringify } from "csv-stringify/sync";
import { Router } from "express";
import { query } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { auditLog } from "../services/auditService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const reportRoutes = Router();

reportRoutes.get(
  "/csv",
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await query(
      `select id, strength_score, exposure_score, policy_pass, created_at
       from assessments where user_id=$1 order by created_at desc`,
      [req.user!.id]
    );
    await auditLog({ userId: req.user!.id, action: "export_csv_report", category: "report", ip: req.ip });
    res.header("Content-Type", "text/csv");
    res.attachment("password-exposure-report.csv");
    res.send(stringify(result.rows, { header: true }));
  })
);

reportRoutes.get(
  "/printable",
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await query(
      `select result, created_at from assessments where user_id=$1 order by created_at desc limit 1`,
      [req.user!.id]
    );
    await auditLog({ userId: req.user!.id, action: "view_printable_report", category: "report", ip: req.ip });
    res.json({
      title: "Password Exposure Analyzer Report",
      executiveSummary: "This report summarizes password strength, exposure, policy compliance, and recommended actions.",
      latestAssessment: result.rows[0] ?? null
    });
  })
);
