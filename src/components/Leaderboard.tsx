import { useEffect, useState } from "react";
import { leaderboard, type Run } from "../lib/leaderboard";

type Props = {
  limit?: number;
  refreshKey?: unknown;
};

export const Leaderboard = ({ limit = 5, refreshKey }: Props) => {
  const [runs, setRuns] = useState<Run[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    leaderboard.topRuns(limit).then((r) => {
      if (!cancelled) setRuns(r);
    });
    return () => {
      cancelled = true;
    };
  }, [limit, refreshKey]);

  if (runs === null) return null;
  if (runs.length === 0) return null;

  return (
    <div className="mt-8 text-base font-sans">
      <h4 className="mb-2 uppercase tracking-wide text-sm opacity-70">
        Top {Math.min(limit, runs.length)}
      </h4>
      <ol className="grid grid-cols-[2rem_1fr_4rem] gap-x-2 text-left">
        {runs.map((run, idx) => (
          <li key={run.id} className="contents">
            <span className="opacity-60">{idx + 1}.</span>
            <span className="truncate">{run.name || "anon"}</span>
            <span className="text-right tabular-nums">{run.score}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};
