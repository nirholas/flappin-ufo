import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "node:crypto";
import {
  getKv,
  LEADERBOARD_KEY,
  MAX_LEADERBOARD_ENTRIES,
  runKey,
} from "./_kv";

const MAX_NAME_LENGTH = 20;
const MAX_RECORDING_BYTES = 32 * 1024;

type SubmitBody = {
  name?: unknown;
  score?: unknown;
  level?: unknown;
  recording?: unknown;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }
  const kv = getKv();
  if (!kv) {
    res.status(503).json({ error: "leaderboard backend not configured" });
    return;
  }

  const body = (req.body ?? {}) as SubmitBody;
  const name = String(body.name ?? "")
    .trim()
    .slice(0, MAX_NAME_LENGTH);
  const score = Number(body.score);
  const level = Number(body.level);
  if (!Number.isFinite(score) || score < 0 || score > 100_000) {
    res.status(400).json({ error: "invalid score" });
    return;
  }
  if (!Number.isFinite(level) || level < 1 || level > 1000) {
    res.status(400).json({ error: "invalid level" });
    return;
  }
  if (!Array.isArray(body.recording)) {
    res.status(400).json({ error: "invalid recording" });
    return;
  }
  const recordingJson = JSON.stringify(body.recording);
  if (recordingJson.length > MAX_RECORDING_BYTES) {
    res.status(413).json({ error: "recording too large" });
    return;
  }

  const id = randomUUID();
  const createdAt = Date.now();
  try {
    await kv.hset(runKey(id), {
      name,
      score,
      level,
      createdAt,
      recording: recordingJson,
    });
    await kv.zadd(LEADERBOARD_KEY, { score, member: id });
    // Trim to top N — drop the lowest-scored beyond the cap.
    await kv.zremrangebyrank(
      LEADERBOARD_KEY,
      0,
      -MAX_LEADERBOARD_ENTRIES - 1,
    );
    res.json({ id, name, score, level, createdAt });
  } catch (err) {
    res
      .status(500)
      .json({ error: "submit failed", detail: String(err) });
  }
}
