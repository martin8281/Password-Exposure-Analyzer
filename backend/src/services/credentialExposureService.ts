export type CredentialExposureInput = {
  firstName?: string;
  lastName?: string;
  nickname?: string;
  dateOfBirth?: string;
  birthYear?: string;
  emailAddress?: string;
  socialMediaUsernames?: string;
  petName?: string;
  favoriteColor?: string;
  favoriteNumber?: string;
  familyMemberNames?: string;
  houseName?: string;
  hobbies?: string;
  sportsTeams?: string;
  otherPublicInformation?: string;
  patternExampleCount?: number;
};

export type CredentialExposureReport = {
  score: number;
  level: "Low" | "Moderate" | "High" | "Critical";
  subjectLabel: string;
  riskFactors: Array<{ field: string; label: string; severity: "Low" | "Moderate" | "High"; reason: string }>;
  riskyPatterns: string[];
  possiblePatternWords: string[];
  possiblePatternCategories: Array<{ category: string; description: string; examples: string[] }>;
  safeCredentialSuggestions: {
    usernameIdeas: string[];
    passphraseIdeas: string[];
  };
  recommendations: string[];
};

type PublicInfoField = Exclude<keyof CredentialExposureInput, "patternExampleCount">;

const fieldLabels: Record<PublicInfoField, string> = {
  firstName: "First name",
  lastName: "Last name",
  nickname: "Nickname",
  dateOfBirth: "Date of birth",
  birthYear: "Birth year",
  emailAddress: "Email address",
  socialMediaUsernames: "Social media usernames",
  petName: "Pet name",
  favoriteColor: "Favorite color",
  favoriteNumber: "Favorite number",
  familyMemberNames: "Family member names",
  houseName: "House name",
  hobbies: "Hobbies",
  sportsTeams: "Sports teams",
  otherPublicInformation: "Other public information"
};

const weights: Record<PublicInfoField, number> = {
  firstName: 9,
  lastName: 8,
  nickname: 9,
  dateOfBirth: 12,
  birthYear: 12,
  emailAddress: 10,
  socialMediaUsernames: 12,
  petName: 10,
  favoriteColor: 5,
  favoriteNumber: 8,
  familyMemberNames: 10,
  houseName: 8,
  hobbies: 6,
  sportsTeams: 6,
  otherPublicInformation: 5
};

function clean(value?: string) {
  return (value ?? "").trim();
}

function splitValues(value?: string) {
  return clean(value)
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function mask(value: string) {
  if (value.length <= 2) return "*".repeat(value.length);
  return `${value[0]}${"*".repeat(Math.min(6, value.length - 2))}${value[value.length - 1]}`;
}

const usernameAdjectives = ["quiet", "bright", "steady", "clear", "north", "silver", "rapid", "fresh"];
const usernameNouns = ["harbor", "signal", "orbit", "field", "matrix", "summit", "ledger", "vector"];
const passphraseWords = ["cobalt", "lantern", "river", "quartz", "ember", "prairie", "anchor", "velvet", "orbit", "timber"];

function safeSuggestions() {
  return {
    usernameIdeas: Array.from({ length: 5 }, (_, index) => {
      const adjective = usernameAdjectives[index % usernameAdjectives.length];
      const noun = usernameNouns[(index * 3) % usernameNouns.length];
      return `${adjective}-${noun}-${42 + index}`;
    }),
    passphraseIdeas: Array.from({ length: 5 }, (_, index) => {
      const a = passphraseWords[index % passphraseWords.length];
      const b = passphraseWords[(index + 3) % passphraseWords.length];
      const c = passphraseWords[(index + 6) % passphraseWords.length];
      return `${a}-${b}-${c}-${70 + index}!`;
    })
  };
}

export function simulateCredentialExposure(input: CredentialExposureInput): CredentialExposureReport {
  const riskFactors: CredentialExposureReport["riskFactors"] = [];
  let score = 0;

  for (const [field, label] of Object.entries(fieldLabels) as Array<[PublicInfoField, string]>) {
    const values = splitValues(input[field]);
    if (values.length === 0) continue;

    const weight = Math.min(weights[field] + Math.max(0, values.length - 1) * 2, 18);
    score += weight;
    riskFactors.push({
      field,
      label,
      severity: weight >= 12 ? "High" : weight >= 8 ? "Moderate" : "Low",
      reason: `${label} is public information that people often reuse in memorable credentials.`
    });
  }

  const hasName = Boolean(clean(input.firstName) || clean(input.lastName) || clean(input.nickname));
  const hasDate = Boolean(clean(input.birthYear) || clean(input.dateOfBirth) || clean(input.favoriteNumber));
  const hasUsername = Boolean(clean(input.emailAddress) || clean(input.socialMediaUsernames));
  const hasPersonalTerms = Boolean(clean(input.petName) || clean(input.familyMemberNames) || clean(input.houseName));

  if (hasName && hasDate) score += 12;
  if (hasUsername && hasPersonalTerms) score += 10;
  if (hasName && hasUsername) score += 8;

  score = Math.min(100, score);
  const level = score >= 75 ? "Critical" : score >= 50 ? "High" : score >= 25 ? "Moderate" : "Low";
  const sampleName = mask(clean(input.firstName) || clean(input.nickname) || "name");
  const sampleYear = mask(clean(input.birthYear) || "year");
  const samplePet = mask(clean(input.petName) || "pet");

  const riskyPatterns = [
    `${sampleName} + year or date`,
    `${sampleName} + common suffix`,
    `${samplePet} + number`,
    "public username reused across accounts",
    "family, house, hobby, or sports term combined with a short number"
  ];
  const allPossiblePatternWords = [
    `${sampleName} + ${sampleYear}`,
    `${sampleName} + memorable number`,
    `${samplePet} + short number`,
    "email handle + year",
    "nickname + symbol",
    "sports team + year",
    "favorite color + number",
    "family name + date fragment",
    "house name + initials",
    "hobby term + simple suffix",
    "first initial + last name + year",
    "public handle + symbol",
    "team abbreviation + number",
    "pet name + date fragment",
    "house name + memorable number",
    "favorite color + year",
    "nickname + favorite number",
    "family name + common suffix",
    "hobby keyword + initials",
    "email prefix + short number",
    "name fragment + symbol",
    "sports team + common suffix",
    "public username + date fragment",
    "pet name + symbol",
    "initials + birth year",
    "favorite number + name fragment",
    "house name + year",
    "hobby term + favorite number",
    "family member name + short number",
    "color + initials + number"
  ];
  const requestedCount = Number.isFinite(input.patternExampleCount) ? Number(input.patternExampleCount) : 10;
  const exampleCount = Math.max(1, Math.min(30, Math.trunc(requestedCount)));
  const possiblePatternWords = allPossiblePatternWords.slice(0, exampleCount);

  const possiblePatternCategories = [
    {
      category: "Name-based patterns",
      description: "Public names are often reused as memorable credential anchors.",
      examples: ["first name combined with a date", "nickname combined with a short number", "last name combined with a symbol"]
    },
    {
      category: "Date and number patterns",
      description: "Birth years, favorite numbers, and memorable dates can make credentials easier to predict.",
      examples: ["birth year appended to a word", "favorite number used as a suffix", "date fragments mixed into a phrase"]
    },
    {
      category: "Personal interest patterns",
      description: "Pets, hobbies, teams, colors, and house names are common public clues.",
      examples: ["pet name plus number", "sports team plus year", "favorite color plus initials"]
    },
    {
      category: "Username reuse patterns",
      description: "Public usernames and email handles reused across services increase account correlation risk.",
      examples: ["same handle reused as a credential base", "email prefix reused across accounts", "social username combined with a date"]
    },
    {
      category: "Substitution patterns",
      description: "Simple substitutions do not remove the personal-information clue.",
      examples: ["letters replaced with similar numbers", "symbol added at the end", "capitalizing only the first character"]
    }
  ];

  return {
    score,
    level,
    subjectLabel: [clean(input.firstName), clean(input.lastName)].filter(Boolean).join(" ") || clean(input.emailAddress) || "Unlabeled subject",
    riskFactors,
    riskyPatterns,
    possiblePatternWords,
    possiblePatternCategories,
    safeCredentialSuggestions: safeSuggestions(),
    recommendations: [
      "Avoid names, dates, pet names, usernames, addresses, hobbies, and favorites in credentials.",
      "Use randomly generated passwords or unrelated passphrases.",
      "Use a unique password for every service.",
      "Enable multi-factor authentication.",
      "Review public profiles and remove unnecessary personal details."
    ]
  };
}
