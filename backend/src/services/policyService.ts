export type PasswordPolicy = {
  minLength: number;
  maxLength?: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecial: boolean;
  expirationDays?: number;
};

export function checkPolicy(password: string, policy: PasswordPolicy) {
  const checks = [
    { key: "minLength", label: `At least ${policy.minLength} characters`, pass: password.length >= policy.minLength },
    { key: "maxLength", label: policy.maxLength ? `At most ${policy.maxLength} characters` : "No maximum length configured", pass: !policy.maxLength || password.length <= policy.maxLength },
    { key: "uppercase", label: "Contains uppercase letter", pass: !policy.requireUppercase || /[A-Z]/.test(password) },
    { key: "lowercase", label: "Contains lowercase letter", pass: !policy.requireLowercase || /[a-z]/.test(password) },
    { key: "number", label: "Contains number", pass: !policy.requireNumbers || /\d/.test(password) },
    { key: "special", label: "Contains special character", pass: !policy.requireSpecial || /[^A-Za-z0-9]/.test(password) }
  ];
  const pass = checks.every((check) => check.pass);
  const recommendedFixes = checks.filter((check) => !check.pass).map((check) => check.label);

  return {
    pass,
    checks,
    summary: pass ? "Password complies with the selected policy." : "Password does not comply with the selected policy.",
    recommendedFixes
  };
}
