import { Router } from "express";
import { query } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const dashboardRoutes = Router();

dashboardRoutes.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const recent = await query(
      `select id, strength_score, exposure_score, policy_pass, created_at
       from assessments where user_id=$1 order by created_at desc limit 8`,
      [req.user!.id]
    );
    const stats = await query(
      `select
         count(*)::int as total,
         coalesce(round(avg(strength_score)), 0)::int as avg_strength,
         coalesce(round(avg(exposure_score)), 0)::int as avg_exposure
       from assessments where user_id=$1`,
      [req.user!.id]
    );
    const trend = await query(
      `select date_trunc('day', created_at)::date as day,
              round(avg(strength_score))::int as strength,
              round(avg(exposure_score))::int as exposure
       from assessments where user_id=$1
       group by 1 order by 1 desc limit 14`,
      [req.user!.id]
    );

    res.json({ recent: recent.rows, stats: stats.rows[0], trend: trend.rows.reverse() });
  })
);
