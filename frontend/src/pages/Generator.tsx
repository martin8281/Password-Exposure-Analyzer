import { Copy, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Panel } from "../components/Panel";
import { ScoreBar } from "../components/ScoreBar";
import { api } from "../services/api";

export function Generator() {
  const [mode, setMode] = useState<"random" | "passphrase">("random");
  const [length, setLength] = useState(16);
  const [wordCount, setWordCount] = useState(4);
  const [options, setOptions] = useState({ includeUppercase: true, includeLowercase: true, includeNumbers: true, includeSymbols: true });
  const [result, setResult] = useState<{ password: string; strength: { score: number; level: string } } | null>(null);

  async function generate() {
    const { data } = await api.post("/analysis/generate", { mode, length, wordCount, ...options });
    setResult(data);
  }

  useEffect(() => {
    generate();
  }, []);

  return (
    <div className="mx-auto grid max-w-5xl gap-5 px-4 py-8 md:grid-cols-[.8fr_1fr]">
      <Panel title="Generator Options">
        <div className="grid grid-cols-2 gap-2">
          {(["random", "passphrase"] as const).map((item) => (
            <button key={item} className={`rounded-md border px-3 py-2 ${mode === item ? "border-signal bg-sky-50 text-signal dark:bg-slate-800" : "border-slate-300 dark:border-slate-700"}`} onClick={() => setMode(item)}>
              {item === "random" ? "Random" : "Passphrase"}
            </button>
          ))}
        </div>
        {mode === "random" ? (
          <>
            <label className="mt-5 block text-sm">
              Length: {length}
              <input className="mt-2 w-full" type="range" min="8" max="64" value={length} onChange={(e) => setLength(Number(e.target.value))} />
            </label>
            <div className="mt-4 grid gap-2">
              {[
                ["includeUppercase", "Uppercase"],
                ["includeLowercase", "Lowercase"],
                ["includeNumbers", "Numbers"],
                ["includeSymbols", "Symbols"]
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 rounded-md border border-slate-200 p-3 text-sm dark:border-slate-800">
                  <input type="checkbox" checked={Boolean(options[key as keyof typeof options])} onChange={(e) => setOptions({ ...options, [key]: e.target.checked })} />
                  {label}
                </label>
              ))}
            </div>
          </>
        ) : (
          <label className="mt-5 block text-sm">
            Words: {wordCount}
            <input className="mt-2 w-full" type="range" min="3" max="8" value={wordCount} onChange={(e) => setWordCount(Number(e.target.value))} />
          </label>
        )}
        <button className="mt-5 inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-white dark:bg-white dark:text-slate-950" onClick={generate}>
          <RefreshCcw className="h-4 w-4" /> Regenerate
        </button>
      </Panel>
      <Panel title="Generated Password">
        {result && (
          <div className="space-y-5">
            <div className="flex gap-2">
              <input className="min-w-0 flex-1 rounded-md border border-slate-300 bg-transparent px-3 py-3 font-mono dark:border-slate-700" readOnly value={result.password} />
              <button title="Copy password" className="rounded-md border border-slate-300 p-3 dark:border-slate-700" onClick={() => navigator.clipboard.writeText(result.password)}>
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <ScoreBar score={result.strength.score} label={result.strength.level} />
          </div>
        )}
      </Panel>
    </div>
  );
}
