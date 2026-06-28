import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Panel } from "../components/Panel";
import { api } from "../services/api";

type User = { id: string; email: string; name: string; role: "user" | "admin"; disabled_at: string | null };
type Analytics = {
  assessments: number;
  avg_strength: number;
  avg_exposure: number;
  policy_failures: number;
  exposureDistribution: Array<{ risk_level: string; count: number }>;
  commonRiskFactors: Array<{ label: string; count: number }>;
  activity: Array<{ email: string; assessments: number }>;
};
type Assessment = { id: string; email: string; strength_score: number; exposure_score: number; policy_pass: boolean | null; created_at: string };
type ExposureReport = { id: string; subject_label: string; exposure_score: number; risk_level: string; created_at: string };

export function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [logs, setLogs] = useState<Array<Record<string, unknown>>>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [reports, setReports] = useState<ExposureReport[]>([]);
  const [search, setSearch] = useState("");

  async function refresh() {
    const [usersRes, analyticsRes, logsRes, assessmentsRes, reportsRes] = await Promise.all([
      api.get("/admin/users"),
      api.get("/admin/analytics"),
      api.get("/admin/audit-logs"),
      api.get("/admin/assessments", { params: { search } }),
      api.get("/admin/credential-exposure/reports", { params: { search } })
    ]);
    setUsers(usersRes.data);
    setAnalytics(analyticsRes.data);
    setLogs(logsRes.data);
    setAssessments(assessmentsRes.data);
    setReports(reportsRes.data);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function toggleUser(user: User) {
    await api.patch(`/admin/users/${user.id}`, { disabled: !user.disabled_at });
    refresh();
  }

  return (
    <div className="mx-auto space-y-5 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input className="min-w-64 rounded-md border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700" placeholder="Search users and reports" value={search} onChange={(event) => setSearch(event.target.value)} />
          <button className="rounded-md bg-slate-950 px-4 py-2 text-white dark:bg-white dark:text-slate-950" onClick={refresh}>Search</button>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
        <Metric label="Assessments" value={analytics?.assessments ?? 0} />
        <Metric label="Avg Strength" value={analytics?.avg_strength ?? 0} />
        <Metric label="Avg Exposure" value={analytics?.avg_exposure ?? 0} />
        <Metric label="Policy Failures" value={analytics?.policy_failures ?? 0} />
      </div>
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-2">
        <Panel title="Exposure Score Distribution">
          <Chart data={(analytics?.exposureDistribution ?? []).map((item) => ({ name: item.risk_level, value: item.count }))} />
        </Panel>
        <Panel title="Most Common Risk Factors">
          <Chart data={(analytics?.commonRiskFactors ?? []).map((item) => ({ name: item.label, value: item.count }))} />
        </Panel>
        <Panel title="User Management">
          <Table headers={["User", "Role", "Status", ""]}>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="py-3">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-slate-500">{user.email}</p>
                </td>
                <td>{user.role}</td>
                <td>{user.disabled_at ? "Disabled" : "Active"}</td>
                <td>
                  <button className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700" onClick={() => toggleUser(user)}>
                    {user.disabled_at ? "Enable" : "Disable"}
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        </Panel>
        <Panel title="User Activity">
          <Table headers={["User", "Assessments"]}>
            {(analytics?.activity ?? []).map((item) => (
              <tr key={item.email} className="border-t border-slate-200 dark:border-slate-800">
                <td className="py-3">{item.email}</td>
                <td>{item.assessments}</td>
              </tr>
            ))}
          </Table>
        </Panel>
        <Panel title="Assessment History">
          <Table headers={["User", "Strength", "Exposure", "Policy", "Date"]}>
            {assessments.map((item) => (
              <tr key={item.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="py-3">{item.email}</td>
                <td>{item.strength_score}/100</td>
                <td>{item.exposure_score}/100</td>
                <td>{item.policy_pass === null ? "N/A" : item.policy_pass ? "Pass" : "Fail"}</td>
                <td>{new Date(item.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </Table>
        </Panel>
        <Panel title="Exposure Reports">
          <Table headers={["Subject", "Risk", "Score", "Date"]}>
            {reports.map((item) => (
              <tr key={item.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="py-3">{item.subject_label}</td>
                <td>{item.risk_level}</td>
                <td>{item.exposure_score}/100</td>
                <td>{new Date(item.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </Table>
        </Panel>
        <Panel title="Audit Logs">
          <div className="max-h-[34rem] overflow-auto">
            {logs.map((log) => (
              <div key={String(log.id)} className="border-b border-slate-200 py-3 text-sm dark:border-slate-800">
                <p className="font-medium">{String(log.action)}</p>
                <p className="text-slate-500">{String(log.category)} | {new Date(String(log.created_at)).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Chart({ data }: { data: Array<{ name: string; value: number }> }) {
  return (
    <div className="h-72">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" fill="#0ea5e9" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-slate-500">
          <tr>{headers.map((header) => <th key={header} className="py-2 pr-4">{header}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Metric({ label, value }: { label: string | number; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
