import { Download, Search, ShieldAlert } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Panel } from "../components/Panel";
import { ScoreBar } from "../components/ScoreBar";
import { api } from "../services/api";

const fields = [
  ["firstName", "First Name"],
  ["lastName", "Last Name"],
  ["nickname", "Nickname"],
  ["dateOfBirth", "Date of Birth"],
  ["birthYear", "Birth Year"],
  ["emailAddress", "Email Address"],
  ["socialMediaUsernames", "Social Media Usernames"],
  ["petName", "Pet Name"],
  ["favoriteColor", "Favorite Color"],
  ["favoriteNumber", "Favorite Number"],
  ["familyMemberNames", "Family Member Names"],
  ["houseName", "House Name"],
  ["hobbies", "Hobbies"],
  ["sportsTeams", "Sports Teams"],
  ["otherPublicInformation", "Other Public Information"]
] as const;

type SimulationResult = {
  id: string;
  score: number;
  level: string;
  subjectLabel: string;
  riskFactors: Array<{ label: string; severity: string; reason: string }>;
  riskyPatterns: string[];
  possiblePatternWords: string[];
  possiblePatternCategories: Array<{ category: string; description: string; examples: string[] }>;
  safeCredentialSuggestions: {
    usernameIdeas: string[];
    passphraseIdeas: string[];
  };
  recommendations: string[];
};

type StoredReport = {
  id: string;
  subject_label: string;
  exposure_score: number;
  risk_level: string;
  created_at: string;
};

export function CredentialExposureSimulator() {
  const [form, setForm] = useState<Record<string, string>>({ patternExampleCount: "10" });
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [reports, setReports] = useState<StoredReport[]>([]);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");

  async function loadReports() {
    const { data } = await api.get("/admin/credential-exposure/reports", { params: { search, level } });
    setReports(data);
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const { data } = await api.post("/admin/credential-exposure/simulate", {
      ...form,
      patternExampleCount: Number(form.patternExampleCount || 10)
    });
    setResult(data);
    await loadReports();
  }

  async function exportReport(id: string) {
    const { data } = await api.get(`/admin/credential-exposure/reports/${id}/export`, { responseType: "blob" });
    const url = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = `exposure-report-${id}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-5 px-4 py-8 xl:grid-cols-[1fr_.85fr]">
      <form onSubmit={submit} className="space-y-5">
        <Panel title="Credential Exposure Simulator" action={<ShieldAlert className="h-5 w-5 text-warn" />}>
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
            Admin-only awareness simulator. It estimates exposure from public information and does not generate attack files, credential-stuffing lists, or raw password datasets.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {fields.map(([key, label]) => (
              <label key={key} className="text-sm">
                {label}
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700"
                  value={form[key] ?? ""}
                  onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                />
              </label>
            ))}
            <label className="text-sm">
              Display Pattern Examples
              <input
                className="mt-1 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700"
                type="number"
                min="1"
                max="30"
                value={form.patternExampleCount ?? "10"}
                onChange={(event) => setForm({ ...form, patternExampleCount: event.target.value })}
              />
            </label>
          </div>
          <button className="mt-5 rounded-md bg-slate-950 px-4 py-3 text-white dark:bg-white dark:text-slate-950">Run Simulation</button>
        </Panel>
        <Panel title="Exposure Reports">
          <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px_auto]">
            <input className="rounded-md border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700" placeholder="Search subject" value={search} onChange={(event) => setSearch(event.target.value)} />
            <select className="rounded-md border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700" value={level} onChange={(event) => setLevel(event.target.value)}>
              <option value="">All levels</option>
              <option value="Low">Low</option>
              <option value="Moderate">Moderate</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
            <button type="button" className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700" onClick={loadReports}>
              <Search className="h-4 w-4" /> Search
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-2">Subject</th>
                  <th>Risk</th>
                  <th>Score</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="py-3">{report.subject_label}</td>
                    <td>{report.risk_level}</td>
                    <td>{report.exposure_score}/100</td>
                    <td>{new Date(report.created_at).toLocaleString()}</td>
                    <td>
                      <button type="button" title="Export PDF report" className="rounded-md border border-slate-300 p-2 dark:border-slate-700" onClick={() => exportReport(report.id)}>
                        <Download className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        {result && (
          <Panel title="Possible Pattern Words">
            <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
              Display-only awareness list. Choose 1-30 examples. Values are masked or generalized and are not exported as attack wordlists.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {result.possiblePatternWords.map((item) => (
                <div key={item} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-mono dark:bg-slate-800">
                  {item}
                </div>
              ))}
            </div>
          </Panel>
        )}
      </form>

      <div className="space-y-5">
        <Panel title="Simulation Result">
          {!result ? (
            <p className="text-sm text-slate-500">Run a simulation to see risk score, risky pattern examples, and recommendations.</p>
          ) : (
            <div className="space-y-5">
              <ScoreBar score={result.score} label={`${result.level} exposure`} />
              <div>
                <h3 className="mb-2 font-medium">Risk Factors</h3>
                <div className="space-y-2">
                  {result.riskFactors.map((factor) => (
                    <div key={factor.label} className="rounded-md bg-slate-100 p-3 text-sm dark:bg-slate-800">
                      <p className="font-medium">{factor.label} · {factor.severity}</p>
                      <p className="text-slate-600 dark:text-slate-300">{factor.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
              <List title="Risky Patterns For Display Only" items={result.riskyPatterns} />
              <div>
                <h3 className="mb-2 font-medium">Memorable Safe Alternatives</h3>
                <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
                  These are unrelated to the entered personal information and are meant as safer examples.
                </p>
                <div className="grid gap-3">
                  <div className="rounded-md bg-slate-100 p-3 dark:bg-slate-800">
                    <p className="mb-2 font-medium">Username ideas</p>
                    <ul className="space-y-1 text-sm font-mono text-slate-700 dark:text-slate-200">
                      {result.safeCredentialSuggestions.usernameIdeas.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                  <div className="rounded-md bg-slate-100 p-3 dark:bg-slate-800">
                    <p className="mb-2 font-medium">Passphrase ideas</p>
                    <ul className="space-y-1 text-sm font-mono text-slate-700 dark:text-slate-200">
                      {result.safeCredentialSuggestions.passphraseIdeas.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
              <List title="Security Recommendations" items={result.recommendations} />
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
          <li key={item} className="rounded-md bg-slate-100 px-3 py-2 dark:bg-slate-800">{item}</li>
        ))}
      </ul>
    </div>
  );
}
