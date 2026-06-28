import { Download, Printer } from "lucide-react";
import { useState } from "react";
import { Panel } from "../components/Panel";
import { api } from "../services/api";

export function Reports() {
  const [report, setReport] = useState<unknown>(null);

  async function loadPrintable() {
    const { data } = await api.get("/reports/printable");
    setReport(data);
  }

  async function downloadCsv() {
    const { data } = await api.get("/reports/csv", { responseType: "blob" });
    const url = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = "password-exposure-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-5 px-4 py-8 md:grid-cols-[.7fr_1fr]">
      <Panel title="Export Options">
        <div className="grid gap-3">
          <button className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-white dark:bg-white dark:text-slate-950" onClick={downloadCsv}>
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-3 dark:border-slate-700" onClick={loadPrintable}>
            <Printer className="h-4 w-4" /> Printable Report
          </button>
          <p className="text-sm text-slate-500">PDF export can be produced from the printable view using the browser print dialog.</p>
        </div>
      </Panel>
      <Panel title="Executive Summary">
        {report ? (
          <pre className="max-h-[36rem] overflow-auto rounded-md bg-slate-100 p-4 text-sm dark:bg-slate-800">{JSON.stringify(report, null, 2)}</pre>
        ) : (
          <p className="text-sm text-slate-500">Generate a printable report to view the latest assessment summary.</p>
        )}
      </Panel>
    </div>
  );
}
