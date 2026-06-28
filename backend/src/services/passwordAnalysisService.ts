const commonPasswords = new Set([
  "password",
  "password1",
  "qwerty",
  "123456",
  "12345678",
  "admin",
  "welcome",
  "letmein",
  "iloveyou",
  "monkey",
  "dragon",
  "changeme"
]);

const commonWords = ["password", "admin", "welcome", "login", "user", "secret", "summer", "winter"];
const keyboardPatterns = ["qwerty", "asdf", "zxcv", "qaz", "wsx"];

export type StrengthResult = {
  score: number;
  level: "Weak" | "Medium" | "Strong" | "Very Strong";
  entropy: number;
  checks: Record<string, boolean | number>;
  findings: string[];
  recommendations: string[];
};

function hasSequential(input: string) {
  const normalized = input.toLowerCase();
  for (let i = 0; i <= normalized.length - 3; i += 1) {
    const a = normalized.charCodeAt(i);
    const b = normalized.charCodeAt(i + 1);
    const c = normalized.charCodeAt(i + 2);
    if (b === a + 1 && c === b + 1) return true;
    if (b === a - 1 && c === b - 1) return true;
  }
  return false;
}

export function analyzePasswordStrength(password: string): StrengthResult {
  const findings: string[] = [];
  const recommendations: string[] = [];
  const length = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const repeated = /(.)\1{2,}/.test(password);
  const sequential = hasSequential(password);
  const keyboard = keyboardPatterns.some((pattern) => password.toLowerCase().includes(pattern));
  const dictionary = commonPasswords.has(password.toLowerCase()) || commonWords.some((word) => password.toLowerCase().includes(word));

  let poolSize = 0;
  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasNumber) poolSize += 10;
  if (hasSpecial) poolSize += 33;
  const entropy = poolSize > 0 ? Math.round(length * Math.log2(poolSize) * 10) / 10 : 0;

  let score = Math.min(100, Math.round(entropy * 1.4));
  if (length < 12) score -= 20;
  if (length < 8) score -= 25;
  if (!(hasUpper && hasLower && hasNumber && hasSpecial)) score -= 15;
  if (repeated) score -= 10;
  if (sequential) score -= 10;
  if (keyboard) score -= 10;
  if (dictionary) score -= 25;
  score = Math.max(0, Math.min(100, score));

  if (length < 12) {
    findings.push("Password is shorter than the recommended 12 character minimum.");
    recommendations.push("Increase password length to at least 12-16 characters.");
  }
  if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    findings.push("Password does not use all major character categories.");
    recommendations.push("Use a mix of uppercase, lowercase, numbers, and symbols.");
  }
  if (repeated) {
    findings.push("Repeated character patterns were detected.");
    recommendations.push("Avoid repeated characters such as aaa or 111.");
  }
  if (sequential) {
    findings.push("Sequential letters or numbers were detected.");
    recommendations.push("Avoid sequences such as abc, cba, 123, or 321.");
  }
  if (keyboard) {
    findings.push("Keyboard walk patterns were detected.");
    recommendations.push("Avoid keyboard patterns such as qwerty or asdf.");
  }
  if (dictionary) {
    findings.push("Common password or dictionary terms were detected.");
    recommendations.push("Avoid common words and known weak passwords.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Maintain good hygiene by using unique passwords and a password manager.");
  }

  const level = score >= 85 ? "Very Strong" : score >= 65 ? "Strong" : score >= 40 ? "Medium" : "Weak";

  return {
    score,
    level,
    entropy,
    checks: { length, hasUpper, hasLower, hasNumber, hasSpecial, repeated, sequential, keyboard, dictionary },
    findings,
    recommendations
  };
}
