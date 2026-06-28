import { Activity, ArrowRight, BarChart3, FileText, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export function Landing() {
  const features = [
    { icon: ShieldCheck, title: "Strength Analysis", text: "Entropy, character diversity, weak patterns, and clear fixes." },
    { icon: LockKeyhole, title: "Exposure Checks", text: "Find personal information matches without generating risky lists." },
    { icon: BarChart3, title: "Dashboards", text: "Track assessment trends, risk metrics, and policy outcomes." },
    { icon: FileText, title: "Reports", text: "Export CSV summaries and printable executive reports." }
  ];

  return (
    <div>
      <section className="bg-[radial-gradient(circle_at_top_left,#e0f2fe,transparent_38%),linear-gradient(135deg,#f8fafc,#ecfeff)] dark:bg-[radial-gradient(circle_at_top_left,#075985,transparent_32%),linear-gradient(135deg,#0f172a,#111827)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 lg:grid-cols-[1.1fr_.9fr] lg:py-20">
          <div className="flex flex-col justify-center">
            <div className="mb-5 flex w-fit items-center gap-2 rounded-md border border-sky-200 bg-white px-3 py-2 text-sm text-sky-700 dark:border-sky-900 dark:bg-slate-900 dark:text-sky-300">
              <Activity className="h-4 w-4" />
              Cybersecurity awareness platform
            </div>
            <h1 className="max-w-3xl text-4xl font-bold tracking-normal md:text-6xl">Password Exposure Analyzer</h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              Assess password strength, personal-information exposure, compliance, and security recommendations in one defensive training workflow.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/analyzer" className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-white dark:bg-white dark:text-slate-950">
                Analyze Password <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/generator" className="rounded-md border border-slate-300 px-4 py-3 dark:border-slate-700">
                Generate Secure Password
              </Link>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
            <div className="grid gap-3">
              {["Length below 12 chars", "Personal name detected", "Policy compliance failed", "MFA recommended"].map((item, index) => (
                <div key={item} className="flex items-center justify-between rounded-md border border-slate-200 p-4 dark:border-slate-800">
                  <span>{item}</span>
                  <span className={index === 0 ? "text-risk" : index === 1 ? "text-warn" : "text-signal"}>{index === 3 ? "Action" : "Risk"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-12 md:grid-cols-4">
        {features.map((feature) => (
          <article key={feature.title} className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <feature.icon className="mb-4 h-6 w-6 text-signal" />
            <h2 className="font-semibold">{feature.title}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{feature.text}</p>
          </article>
        ))}
      </section>
      <section className="border-y border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 md:grid-cols-3">
          {[
            ["81%", "breaches involve weak or stolen credentials"],
            ["12+", "characters recommended as a practical minimum"],
            ["1", "unique password needed for every important account"]
          ].map(([value, label]) => (
            <div key={value}>
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-slate-600 dark:text-slate-300">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
