export function ScoreBar({ score, label }: { score: number; label: string }) {
  const color = score >= 75 ? "bg-safe" : score >= 45 ? "bg-warn" : "bg-risk";
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <span>{score}/100</span>
      </div>
      <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800">
        <div className={`h-3 rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}
