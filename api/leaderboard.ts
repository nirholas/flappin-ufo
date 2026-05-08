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
  const limit = Math.min(
    Math.max(parseInt(String(req.query.limit ?? "10"), 10) || 10, 1),
    100,
  );
  try {
    const ids = (await kv.zrange(LEADERBOARD_KEY, 0, limit - 1, {
      rev: true,
    })) as string[];
    if (ids.length === 0) {
      res.json({ runs: [] });
      return;
    }
    const runs = await Promise.all(
      ids.map(async (id) => {
        const data = (await kv.hgetall(runKey(id))) as Record<
          string,
          string
        > | null;
        if (!data) return null;
        return {
          id,
          name: data.name ?? "",
          score: Number(data.score) || 0,
          level: Number(data.level) || 1,
          createdAt: Number(data.createdAt) || 0,
        };
      }),
    );
    res.setHeader("Cache-Control", "public, s-maxage=10, stale-while-revalidate=30");
    res.json({ runs: runs.filter(Boolean) });
  } catch (err) {
    res
      .status(500)
      .json({ error: "leaderboard read failed", detail: String(err) });
  }
}
