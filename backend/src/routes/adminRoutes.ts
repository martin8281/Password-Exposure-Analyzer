import { Router } from "express";
import { z } from "zod";
import { query } from "../db/pool.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { auditLog } from "../services/auditService.js";
import { simulateCredentialExposure } from "../services/credentialExposureService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createTextPdf } from "../utils/pdf.js";

export const adminRoutes = Router();
adminRoutes.use(requireAuth, requireRole("admin"));

adminRoutes.get(
  "/users",
  asyncHandler(async (_req, res) => {
    const result = await query(
      "select id, email, name, role, disabled_at, last_login_at, created_at from users order by created_at desc"
    );
    res.json(result.rows);
  })
);

adminRoutes.patch(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const body = z.object({ role: z.enum(["user", "admin"]).optional(), disabled: z.boolean().optional() }).parse(req.body);
    const result = await query(
      `update users set
         role = coalesce($2, role),
         disabled_at = case when $3::boolean is null then disabled_at when $3 then coalesce(disabled_at, now()) else null end
       where id=$1 returning id, email, role, disabled_at`,
      [req.params.id, body.role ?? null, body.disabled ?? null]
    );
    await auditLog({ userId: req.user!.id, action: "updated_user", category: "admin", ip: req.ip, metadata: { target: req.params.id } });
    res.json(result.rows[0]);
  })
);

adminRoutes.get(
  "/analytics",
  asyncHandler(async (_req, res) => {
    const result = await query<{
      assessments: number;
      avg_strength: number;
      avg_exposure: number;
      policy_failures: number;
    }>(
      `select
         count(*)::int as assessments,
         coalesce(round(avg(strength_score)), 0)::int as avg_strength,
         coalesce(round(avg(exposure_score)), 0)::int as avg_exposure,
         count(*) filter (where policy_pass=false)::int as policy_failures
       from assessments`
    );
    const exposureDistribution = await query(
      `select risk_level, count(*)::int as count
       from exposure_reports group by risk_level order by risk_level`
    );
    const commonRiskFactors = await query(
      `select factor->>'label' as label, count(*)::int as count
       from exposure_reports, jsonb_array_elements(risk_factors) as factor
       group by factor->>'label'
       order by count desc limit 8`
    );
    const monthly = await query(
      `select to_char(date_trunc('month', created_at), 'YYYY-MM') as month,
              count(*)::int as reports,
              round(avg(exposure_score))::int as avg_exposure
       from exposure_reports
       group by 1 order by 1 desc limit 12`
    );
    const activity = await query(
      `select users.email, count(assessments.id)::int as assessments
       from users left join assessments on assessments.user_id=users.id
       group by users.email order by assessments desc limit 10`
    );
    res.json({
      ...result.rows[0],
      exposureDistribution: exposureDistribution.rows,
      commonRiskFactors: commonRiskFactors.rows,
      monthly: monthly.rows.reverse(),
      activity: activity.rows
    });
  })
);

adminRoutes.get(
  "/assessments",
  asyncHandler(async (req, res) => {
    const search = String(req.query.search ?? "").trim();
    const result = await query(
      `select assessments.id, assessments.strength_score, assessments.exposure_score, assessments.policy_pass,
              assessments.created_at, users.email, users.name
       from assessments join users on users.id=assessments.user_id
       where ($1 = '' or users.email ilike '%' || $1 || '%' or users.name ilike '%' || $1 || '%')
       order by assessments.created_at desc limit 200`,
      [search]
    );
    res.json(result.rows);
  })
);

const simulatorSchema = z.object({
  firstName: z.string().max(120).optional(),
  lastName: z.string().max(120).optional(),
  nickname: z.string().max(120).optional(),
  dateOfBirth: z.string().max(40).optional(),
  birthYear: z.string().max(12).optional(),
  emailAddress: z.string().max(255).optional(),
  socialMediaUsernames: z.string().max(500).optional(),
  petName: z.string().max(120).optional(),
  favoriteColor: z.string().max(80).optional(),
  favoriteNumber: z.string().max(80).optional(),
  familyMemberNames: z.string().max(500).optional(),
  houseName: z.string().max(120).optional(),
  hobbies: z.string().max(500).optional(),
  sportsTeams: z.string().max(500).optional(),
  otherPublicInformation: z.string().max(1000).optional(),
  patternExampleCount: z.number().int().min(1).max(30).optional()
});

adminRoutes.post(
  "/credential-exposure/simulate",
  asyncHandler(async (req, res) => {
    const body = simulatorSchema.parse(req.body);
    const report = simulateCredentialExposure(body);
    const saved = await query<{ id: string; created_at: Date }>(
      `insert into exposure_reports
       (admin_user_id, subject_label, exposure_score, risk_level, public_info, risk_factors, risky_patterns, possible_pattern_categories, recommendations, metadata)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       returning id, created_at`,
      [
        req.user!.id,
        report.subjectLabel,
        report.score,
        report.level,
        JSON.stringify(body),
        JSON.stringify(report.riskFactors),
        JSON.stringify(report.riskyPatterns),
        JSON.stringify(report.possiblePatternCategories),
        JSON.stringify(report.recommendations),
        JSON.stringify({ purpose: "cybersecurity awareness", attack_files_generated: false })
      ]
    );
    await auditLog({ userId: req.user!.id, action: "credential_exposure_simulated", category: "admin", ip: req.ip });
    res.status(201).json({ id: saved.rows[0].id, createdAt: saved.rows[0].created_at, ...report });
  })
);

adminRoutes.get(
  "/credential-exposure/reports",
  asyncHandler(async (req, res) => {
    const search = String(req.query.search ?? "").trim();
    const level = String(req.query.level ?? "").trim();
    const result = await query(
      `select id, subject_label, exposure_score, risk_level, risk_factors, risky_patterns, recommendations, created_at
       from exposure_reports
       where ($1 = '' or subject_label ilike '%' || $1 || '%')
         and ($2 = '' or risk_level = $2)
       order by created_at desc limit 200`,
      [search, level]
    );
    res.json(result.rows);
  })
);

adminRoutes.get(
  "/credential-exposure/reports/:id/export",
  asyncHandler(async (req, res) => {
    const result = await query("select * from exposure_reports where id=$1", [req.params.id]);
    const report = result.rows[0];
    if (!report) return res.status(404).json({ message: "Report not found" });
    await auditLog({ userId: req.user!.id, action: "exported_exposure_report", category: "report", ip: req.ip, metadata: { reportId: req.params.id } });
    const riskFactors = Array.isArray(report.risk_factors) ? report.risk_factors : [];
    const recommendations = Array.isArray(report.recommendations) ? report.recommendations : [];
    const pdf = createTextPdf("Credential Exposure Report", [
      {
        heading: "Executive Summary",
        lines: [
          `Subject: ${report.subject_label}`,
          `Risk: ${report.risk_level} (${report.exposure_score}/100)`,
          `Created: ${report.created_at}`,
          "This educational report does not include attack wordlists, credential-stuffing lists, or raw passwords."
        ]
      },
      {
        heading: "Risk Factors",
        lines: riskFactors.map((factor: { label?: string; severity?: string; reason?: string }) => `${factor.label ?? "Risk factor"} - ${factor.severity ?? "Observed"}: ${factor.reason ?? ""}`)
      },
      {
        heading: "Recommendations",
       lines: recommendations.map((item: string) => `- ${item}`)
      }
    ]);
    res.header("Content-Type", "application/pdf");
    res.attachment(`exposure-report-${req.params.id}.pdf`);
    res.send(pdf);
  })
);

adminRoutes.get(
  "/audit-logs",
  asyncHandler(async (_req, res) => {
    const result = await query(
      `select audit_logs.*, users.email
       from audit_logs left join users on users.id=audit_logs.user_id
       order by audit_logs.created_at desc limit 200`
    );
    res.json(result.rows);
  })
);

adminRoutes.get(
  "/policy",
  asyncHandler(async (_req, res) => {
    const result = await query("select * from password_policies order by created_at desc limit 1");
    res.json(result.rows[0]);
  })
);

adminRoutes.put(
  "/policy",
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        min_length: z.number().int().min(4),
        max_length: z.number().int().min(4).optional(),
        require_uppercase: z.boolean(),
        require_lowercase: z.boolean(),
        require_numbers: z.boolean(),
        require_special: z.boolean(),
        expiration_days: z.number().int().min(0).optional()
      })
      .parse(req.body);
    const result = await query(
      `insert into password_policies
       (min_length, max_length, require_uppercase, require_lowercase, require_numbers, require_special, expiration_days, created_by)
       values ($1,$2,$3,$4,$5,$6,$7,$8) returning *`,
      [
        body.min_length,
        body.max_length ?? null,
        body.require_uppercase,
        body.require_lowercase,
        body.require_numbers,
        body.require_special,
        body.expiration_days ?? null,
        req.user!.id
      ]
    );
    await auditLog({ userId: req.user!.id, action: "updated_policy", category: "admin", ip: req.ip });
    res.json(result.rows[0]);
  })
);
