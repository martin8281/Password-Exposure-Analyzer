export type PersonalInfo = {
  firstName?: string;
  lastName?: string;
  nickname?: string;
  birthYear?: string;
  birthDate?: string;
  petName?: string;
  familyMemberNames?: string;
  favoriteColor?: string;
  favoriteNumber?: string;
  hobbies?: string;
  sportsTeams?: string;
  publicUsernames?: string;
};

export type ExposureResult = {
  score: number;
  level: "Low" | "Moderate" | "High" | "Critical";
  findings: string[];
  recommendations: string[];
};

const substitutions: Record<string, string[]> = {
  a: ["4", "@"],
  e: ["3"],
  i: ["1", "!"],
  o: ["0"],
  s: ["5", "$"],
  t: ["7"]
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function variants(value: string) {
  const normalized = normalize(value);
  const output = new Set([normalized]);
  for (const [letter, replacements] of Object.entries(substitutions)) {
    for (const replacement of replacements) {
      if (normalized.includes(letter)) output.add(normalized.replaceAll(letter, replacement));
    }
  }
  return [...output].filter((item) => item.length >= 3);
}

function splitValues(value?: string) {
  return (value ?? "")
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function analyzeExposure(password: string, personalInfo: PersonalInfo): ExposureResult {
  const loweredPassword = normalize(password);
  const findings: string[] = [];
  const recommendations = [
    "Avoid using names, dates, usernames, favorite items, or hobbies in passwords.",
    "Prefer randomly generated passwords or unrelated passphrases.",
    "Use unique passwords and enable multi-factor authentication."
  ];

  const fields: Array<[keyof PersonalInfo, string, string[]]> = [
    ["firstName", "first name", splitValues(personalInfo.firstName)],
    ["lastName", "last name", splitValues(personalInfo.lastName)],
    ["nickname", "nickname", splitValues(personalInfo.nickname)],
    ["birthYear", "birth year", splitValues(personalInfo.birthYear)],
    ["birthDate", "birth date", splitValues(personalInfo.birthDate)],
    ["petName", "pet name", splitValues(personalInfo.petName)],
    ["familyMemberNames", "family member name", splitValues(personalInfo.familyMemberNames)],
    ["favoriteColor", "favorite color", splitValues(personalInfo.favoriteColor)],
    ["favoriteNumber", "favorite number", splitValues(personalInfo.favoriteNumber)],
    ["hobbies", "hobby", splitValues(personalInfo.hobbies)],
    ["sportsTeams", "sports team", splitValues(personalInfo.sportsTeams)],
    ["publicUsernames", "public username", splitValues(personalInfo.publicUsernames)]
  ];

  let score = 0;
  for (const [, label, values] of fields) {
    for (const value of values) {
      const normalized = normalize(value);
      if (normalized.length < 2) continue;
      if (loweredPassword === normalized) {
        findings.push(`Password exactly matches ${label}: ${value}.`);
        score += 35;
        continue;
      }
      if (normalized.length >= 3 && loweredPassword.includes(normalized)) {
        findings.push(`Password contains ${label}: ${value}.`);
        score += 20;
      }
      if (normalized.length >= 4 && variants(normalized).some((variant) => loweredPassword.includes(variant) && variant !== normalized)) {
        findings.push(`Password appears to contain a substituted form of ${label}: ${value}.`);
        score += 15;
      }
      if (normalized.length >= 5 && loweredPassword.includes(normalized.slice(0, 4))) {
        findings.push(`Password contains a partial match related to ${label}: ${value}.`);
        score += 8;
      }
    }
  }

  score = Math.min(100, score);
  const level = score >= 75 ? "Critical" : score >= 50 ? "High" : score >= 20 ? "Moderate" : "Low";
  if (findings.length === 0) {
    findings.push("No supplied personal information was detected in the password.");
  }

  return { score, level, findings, recommendations };
}
