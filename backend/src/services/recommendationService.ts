import type { ExposureResult } from "./exposureService.js";
import type { StrengthResult } from "./passwordAnalysisService.js";

export function buildRecommendations(input: {
  strength?: StrengthResult;
  exposure?: ExposureResult;
  policyPass?: boolean;
}) {
  const actions = new Set<string>();
  const bestPractices = [
    "Use a password manager for unique passwords.",
    "Enable multi-factor authentication on important accounts.",
    "Avoid reusing passwords across services.",
    "Change passwords after confirmed exposure or suspicious activity."
  ];

  if (input.strength && input.strength.score < 65) actions.add("Increase password length and complexity.");
  if (input.exposure && input.exposure.score > 0) actions.add("Remove personal information from the password.");
  if (input.policyPass === false) actions.add("Update the password to meet the configured policy.");
  if (actions.size === 0) actions.add("Keep this password unique and monitor for account exposure.");

  const risk = [
    input.strength ? `Strength: ${input.strength.level} (${input.strength.score}/100)` : null,
    input.exposure ? `Exposure: ${input.exposure.level} (${input.exposure.score}/100)` : null,
    typeof input.policyPass === "boolean" ? `Policy: ${input.policyPass ? "Pass" : "Fail"}` : null
  ].filter(Boolean);

  return {
    riskSummary: risk.join(" | "),
    recommendedActions: [...actions],
    bestPractices
  };
}
