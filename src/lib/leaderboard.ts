import type { Recording } from "../game/recording";

export type Run = {
  id: string;
  name: string;
  score: number;
  level: number;
  createdAt: number;
};

export type RunWithRecording = Run & { recording: Recording };

export type LeaderboardClient = {
  topRuns(limit: number): Promise<Run[]>;
  bestRunWithRecording(): Promise<RunWithRecording | null>;
  submitRun(run: Omit<RunWithRecording, "id" | "createdAt">): Promise<Run>;
};

const LS_RUNS_KEY = "flappin-ufo:runs";
const LS_NAME_KEY = "flappin-ufo:player-name";
const LOCAL_RUNS_LIMIT = 100;

const readLocalRuns = (): RunWithRecording[] => {
  try {
    const raw = localStorage.getItem(LS_RUNS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLocalRuns = (runs: RunWithRecording[]) => {
  try {
    localStorage.setItem(LS_RUNS_KEY, JSON.stringify(runs));
  } catch {
    // quota exhausted: trim aggressively and retry once
    try {
      localStorage.setItem(
        LS_RUNS_KEY,
        JSON.stringify(runs.slice(0, Math.floor(LOCAL_RUNS_LIMIT / 4))),
      );
    } catch {
      /* give up */
    }
  }
};

const stripRecording = (run: RunWithRecording): Run => ({
  id: run.id,
  name: run.name,
  score: run.score,
  level: run.level,
  createdAt: run.createdAt,
});

export const localLeaderboard: LeaderboardClient = {
  async topRuns(limit) {
    return readLocalRuns()
      .slice()
      .sort((a, b) => b.score - a.score || b.createdAt - a.createdAt)
      .slice(0, limit)
      .map(stripRecording);
  },
  async bestRunWithRecording() {
    const runs = readLocalRuns();
    if (runs.length === 0) return null;
    return runs.reduce(
      (best, r) => (best === null || r.score > best.score ? r : best),
      null as RunWithRecording | null,
    );
  },
  async submitRun(input) {
    const run: RunWithRecording = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    const runs = readLocalRuns();
    runs.push(run);
    runs.sort((a, b) => b.score - a.score || b.createdAt - a.createdAt);
    writeLocalRuns(runs.slice(0, LOCAL_RUNS_LIMIT));
    return stripRecording(run);
  },
};

const remoteBase = (): string | null => {
  // Use /api in production builds (Vercel will route to functions).
  if (import.meta.env.PROD) return "/api";
  // Allow opt-in remote in dev via env override (e.g. against a deployed preview).
  const override = import.meta.env.VITE_LEADERBOARD_API as string | undefined;
  return override?.trim() || null;
};

const remoteLeaderboard = (base: string): LeaderboardClient => ({
  async topRuns(limit) {
    const res = await fetch(`${base}/leaderboard?limit=${limit}`);
    if (!res.ok) throw new Error(`leaderboard fetch failed: ${res.status}`);
    const data = (await res.json()) as { runs: Run[] };
    return data.runs;
  },
  async bestRunWithRecording() {
    const res = await fetch(`${base}/ghost`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`ghost fetch failed: ${res.status}`);
    return (await res.json()) as RunWithRecording;
  },
  async submitRun(input) {
    const res = await fetch(`${base}/runs`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`submit failed: ${res.status}`);
    return (await res.json()) as Run;
  },
});

/** Falls back to localStorage if the remote call rejects or is unavailable. */
const withFallback = (
  primary: LeaderboardClient,
  fallback: LeaderboardClient,
): LeaderboardClient => ({
  async topRuns(limit) {
    try {
      return await primary.topRuns(limit);
    } catch {
      return fallback.topRuns(limit);
    }
  },
  async bestRunWithRecording() {
    try {
      return await primary.bestRunWithRecording();
    } catch {
      return fallback.bestRunWithRecording();
    }
  },
  async submitRun(input) {
    try {
      return await primary.submitRun(input);
    } catch {
      return fallback.submitRun(input);
    }
  },
});

const base = remoteBase();
export const leaderboard: LeaderboardClient = base
  ? withFallback(remoteLeaderboard(base), localLeaderboard)
  : localLeaderboard;

export const getStoredPlayerName = (): string => {
  try {
    return localStorage.getItem(LS_NAME_KEY) ?? "";
  } catch {
    return "";
  }
};

export const setStoredPlayerName = (name: string): void => {
  try {
    localStorage.setItem(LS_NAME_KEY, name);
  } catch {
    /* ignore */
  }
};
