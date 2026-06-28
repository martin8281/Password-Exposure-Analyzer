import { Router } from "express";
import { z } from "zod";
import { query } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { analyzeExposure } from "../services/exposureService.js";
import { generatePassphrase, generateRandomPassword } from "../services/generatorService.js";
import { analyzePasswordStrength } from "../services/passwordAnalysisService.js";
import { checkPolicy } from "../services/policyService.js";
import { buildRecommendations } from "../services/recommendationService.js";

export const analysisRoutes = Router();

const personalInfoSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  nickname: z.string().optional(),
  birthYear: z.string().optional(),
  birthDate: z.string().optional(),
  petName: z.string().optional(),
  familyMemberNames: z.string().optional(),
  favoriteColor: z.string().optional(),
  favoriteNumber: z.string().optional(),
  hobbies: z.string().optional(),
  sportsTeams: z.string().optional(),
  publicUsernames: z.string().optional()
});

const policySchema = z.object({
  minLength: z.number().int().min(4).max(128),
  maxLength: z.number().int().min(4).max(256).optional(),
  requireUppercase: z.boolean(),
  requireLowercase: z.boolean(),
  requireNumbers: z.boolean(),
  requireSpecial: z.boolean(),
  expirationDays: z.number().int().min(0).max(365).optional()
});

analysisRoutes.post(
  "/analyze",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        password: z.string().min(1).max(256),
        personalInfo: personalInfoSchema.optional(),
        policy: policySchema.optional()
      })
      .parse(req.body);

    const strength = analyzePasswordStrength(body.password);
    const exposure = analyzeExposure(body.password, body.personalInfo ?? {});
    const policy = body.policy ? checkPolicy(body.password, body.policy) : undefined;
    const recommendations = buildRecommendations({ strength, exposure, policyPass: policy?.pass });

    const result = { strength, exposure, policy, recommendations };
    await query(
      `insert into assessments (user_id, strength_score, exposure_score, policy_pass, result)
       values ($1, $2, $3, $4, $5)`,
      [req.user!.id, strength.score, exposure.score, policy?.pass ?? null, result]
    );

    res.json(result);
  })
);

analysisRoutes.post(
  "/policy-check",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = z.object({ password: z.string().min(1).max(256), policy: policySchema }).parse(req.body);
    res.json(checkPolicy(body.password, body.policy));
  })
);

analysisRoutes.post(
  "/generate",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        mode: z.enum(["random", "passphrase"]).default("random"),
        length: z.number().int().min(8).max(128).default(16),
        wordCount: z.number().int().min(3).max(8).default(4),
        includeUppercase: z.boolean().default(true),
        includeLowercase: z.boolean().default(true),
        includeNumbers: z.boolean().default(true),
        includeSymbols: z.boolean().default(true)
      })
      .parse(req.body);

    const result =
      body.mode === "passphrase"
        ? generatePassphrase(body.wordCount)
        : generateRandomPassword({
            length: body.length,
            includeUppercase: body.includeUppercase,
            includeLowercase: body.includeLowercase,
            includeNumbers: body.includeNumbers,
            includeSymbols: body.includeSymbols
          });
    res.json(result);
  })
);
