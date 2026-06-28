import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Panel } from "../components/Panel";
import { api } from "../services/api";

type DashboardData = {
  stats: { total: number; avg_strength: number; avg_exposure: number };
  recent: Array<{ id: string; strength_score: number; exposure_score: number; policy_pass: boolean | null; created_at: string }>;
  trend: Array<{ day: string; strength: number; exposure: number }>;
};

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.get("/dashboard").then((res) => setData(res.data));
  }, []);

  if (!data) return <div className="mx-auto max-w-7xl px-4 py-8">Loading dashboard...</div>;

  const distribution = [
    { name: "Strength", value: data.stats.avg_strength },
    { name: "Exposure", value: data.stats.avg_exposure }
  ];

  return (
    <div className="mx-auto space-y-5 px-4 py-8">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
        <Metric label="Assessments" value={data.stats.total} />
        <Metric label="Average Strength" value={`${data.stats.avg_strength}/100`} />
        <Metric label="Average Exposure" value={`${data.stats.avg_exposure}/100`} />
      </div>
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-2">
        <Panel title="Security Trends">
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={data.trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="strength" stroke="#16a34a" />
                <Line type="monotone" dataKey="exposure" stroke="#dc2626" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Strength and Exposure Distribution">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="value" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
      <div className="mx-auto max-w-7xl">
        <Panel title="Recent Assessments">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-2">Date</th>
                  <th>Strength</th>
                  <th>Exposure</th>
                  <th>Policy</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map((item) => (
                  <tr key={item.id} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="py-3">{new Date(item.created_at).toLocaleString()}</td>
                    <td>{item.strength_score}/100</td>
                    <td>{item.exposure_score}/100</td>
                    <td>{item.policy_pass === null ? "Not checked" : item.policy_pass ? "Pass" : "Fail"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
