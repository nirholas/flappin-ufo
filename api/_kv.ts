import { Redis } from "@upstash/redis";

let client: Redis | null = null;

export const getKv = (): Redis | null => {
  if (client) return client;
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  client = new Redis({ url, token });
  return client;
};

export const LEADERBOARD_KEY = "leaderboard";
export const runKey = (id: string) => `run:${id}`;
export const MAX_LEADERBOARD_ENTRIES = 1000;
