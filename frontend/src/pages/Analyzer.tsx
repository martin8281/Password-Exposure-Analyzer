import { FormEvent, useState } from "react";
import { Panel } from "../components/Panel";
import { ScoreBar } from "../components/ScoreBar";
import { api } from "../services/api";

const exposureFields = [
  ["firstName", "First Name"],
  ["lastName", "Last Name"],
  ["nickname", "Nickname"],
  ["birthYear", "Birth Year"],
  ["birthDate", "Birth Date"],
  ["petName", "Pet Name"],
  ["familyMemberNames", "Family Member Names"],
  ["favoriteColor", "Favorite Color"],
  ["favoriteNumber", "Favorite Number"],
  ["hobbies", "Hobbies"],
  ["sportsTeams", "Sports Teams"],
  ["publicUsernames", "Public Usernames"]
] as const;

type Result = {
  strength: { score: number; level: string; entropy: number; findings: string[]; recommendations: string[] };
  exposure: { score: number; level: string; findings: string[]; recommendations: string[] };
  policy?: { pass: boolean; summary: string; checks: Array<{ key: string; label: string; pass: boolean }>; recommendedFixes: string[] };
  recommendations: { riskSummary: string; recommendedActions: string[]; bestPractices: string[] };
};

export function Analyzer() {
  const [password, setPassword] = useState("");
  const [personalInfo, setPersonalInfo] = useState<Record<string, string>>({});
  const [policy, setPolicy] = useState({
    minLength: 12,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecial: true,
    expirationDays: 90
  });
  const [result, setResult] = useState<Result | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const { data } = await api.post("/analysis/analyze", { password, personalInfo, policy });
    setResult(data);
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-5 px-4 py-8 lg:grid-cols-[1fr_.9fr]">
      <form onSubmit={submit} className="space-y-5">
        <Panel title="Password Strength Analyzer">
          <label className="block text-sm">
            Password to assess
            <input className="mt-1 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
        </Panel>
        <Panel title="Personal Information Exposure">
          <div className="grid gap-3 md:grid-cols-2">
            {exposureFields.map(([key, label]) => (
              <label key={key} className="block text-sm">
                {label}
                <input className="mt-1 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700" value={personalInfo[key] ?? ""} onChange={(e) => setPersonalInfo({ ...personalInfo, [key]: e.target.value })} />
              </label>
            ))}
          </div>
        </Panel>
        <Panel title="Password Policy">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm">
              Minimum Length
              <input className="mt-1 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700" type="number" value={policy.minLength} onChange={(e) => setPolicy({ ...policy, minLength: Number(e.target.value) })} />
            </label>
            <label className="text-sm">
              Maximum Length
              <input className="mt-1 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700" type="number" value={policy.maxLength} onChange={(e) => setPolicy({ ...policy, maxLength: Number(e.target.value) })} />
            </label>
            <label className="text-sm">
              Expiration Days
              <input className="mt-1 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700" type="number" value={policy.expirationDays} onChange={(e) => setPolicy({ ...policy, expirationDays: Number(e.target.value) })} />
            </label>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {[
              ["requireUppercase", "Uppercase"],
              ["requireLowercase", "Lowercase"],
              ["requireNumbers", "Numbers"],
              ["requireSpecial", "Symbols"]
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 rounded-md border border-slate-200 p-3 text-sm dark:border-slate-800">
                <input type="checkbox" checked={Boolean(policy[key as keyof typeof policy])} onChange={(e) => setPolicy({ ...policy, [key]: e.target.checked })} />
                {label}
              </label>
            ))}
          </div>
          <button className="mt-5 rounded-md bg-slate-950 px-4 py-3 text-white dark:bg-white dark:text-slate-950">Run Analysis</button>
        </Panel>
      </form>

      <div className="space-y-5">
        <Panel title="Results">
          {!result ? (
            <p className="text-sm text-slate-500">Submit a password to view strength, exposure, policy, and recommendations.</p>
          ) : (
            <div className="space-y-5">
              <ScoreBar score={result.strength.score} label={`Strength: ${result.strength.level}`} />
              <ScoreBar score={result.exposure.score} label={`Exposure: ${result.exposure.level}`} />
              <div className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
                <p className="font-medium">Entropy: {result.strength.entropy} bits</p>
                <p className={result.policy?.pass ? "text-safe" : "text-risk"}>{result.policy?.summary}</p>
              </div>
              <List title="Findings" items={[...result.strength.findings, ...result.exposure.findings]} />
              <List title="Recommended Actions" items={result.recommendations.recommendedActions} />
              <List title="Best Practices" items={result.recommendations.bestPractices} />
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="mb-2 font-medium">{title}</h3>
      <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
        {items.map((item) => (
          <li key={item} className="rounded-md bg-slate-100 px-3 py-2 dark:bg-slate-800">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
