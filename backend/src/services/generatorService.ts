import crypto from "crypto";
import { analyzePasswordStrength } from "./passwordAnalysisService.js";

const sets = {
  uppercase: "ABCDEFGHJKLMNPQRSTUVWXYZ",
  lowercase: "abcdefghijkmnopqrstuvwxyz",
  numbers: "23456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?"
};

const passphraseWords = [
  "anchor",
  "breeze",
  "cobalt",
  "delta",
  "ember",
  "frost",
  "harbor",
  "island",
  "jigsaw",
  "kernel",
  "lantern",
  "magnet",
  "nebula",
  "orbit",
  "prairie",
  "quartz",
  "ripple",
  "summit",
  "timber",
  "velvet"
];

function pick(source: string) {
  return source[crypto.randomInt(0, source.length)];
}

export function generateRandomPassword(options: {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}) {
  const selected = [
    options.includeUppercase ? sets.uppercase : "",
    options.includeLowercase ? sets.lowercase : "",
    options.includeNumbers ? sets.numbers : "",
    options.includeSymbols ? sets.symbols : ""
  ].filter(Boolean);

  if (selected.length === 0) {
    throw new Error("At least one character set is required.");
  }

  const length = Math.max(8, Math.min(128, options.length));
  const all = selected.join("");
  const required = selected.map(pick);
  const rest = Array.from({ length: length - required.length }, () => pick(all));
  const password = [...required, ...rest].sort(() => crypto.randomInt(0, 3) - 1).join("");

  return { password, strength: analyzePasswordStrength(password) };
}

export function generatePassphrase(wordCount = 4) {
  const count = Math.max(3, Math.min(8, wordCount));
  const words = Array.from({ length: count }, () => passphraseWords[crypto.randomInt(0, passphraseWords.length)]);
  const password = `${words.join("-")}-${crypto.randomInt(10, 99)}`;
  return { password, strength: analyzePasswordStrength(password) };
}
