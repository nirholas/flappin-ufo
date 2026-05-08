import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getKv, LEADERBOARD_KEY, runKey } from "./_kv";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }
  const kv = getKv();
  if (!kv) {
    res.status(503).json({ error: "leaderboard backend not configured" });
    return;
  }
  try {
    const top = (await kv.zrange(LEADERBOARD_KEY, 0, 0, {
      rev: true,
    })) as string[];
    const id = top[0];
    if (!id) {
      res.status(404).end();
      return;
    }
    const data = (await kv.hgetall(runKey(id))) as Record<
      string,
      string
    > | null;
    if (!data) {
      res.status(404).end();
      return;
    }
    let recording: unknown = [];
    try {
      recording = JSON.parse(data.recording ?? "[]");
    } catch {
      recording = [];
    }
    res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=120");
    res.json({
      id,
      name: data.name ?? "",
      score: Number(data.score) || 0,
      level: Number(data.level) || 1,
      createdAt: Number(data.createdAt) || 0,
      recording,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "ghost read failed", detail: String(err) });
  }
}
