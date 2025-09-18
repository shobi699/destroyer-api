// server.ts — Fastify + Prisma اسکلت ساده برای API «نابودگر»
// قابل اجرا روی Vercel/Fly.io/Render

import Fastify from "fastify";
import cors from "@fastify/cors";
import { PrismaClient } from "@prisma/client";

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

// فعال‌سازی CORS برای تست کلاینت
await fastify.register(cors, { origin: true });

// --- Health endpoint ---
fastify.get("/ping", async () => ({ pong: true }));

// --- /play/answer ---
fastify.post("/play/answer", async (req, reply) => {
  const body: any = req.body;
  const { targetId, target, text, timeSec } = body;

  // شبیه‌سازی: بررسی درستی پاسخ (در نسخه واقعی از Graph+Rules استفاده می‌کنی)
  const valid = text && text.length > 0;
  if (!valid) return { valid: false, reason: "empty" };

  // rarity و score موقت
  const rarityPct = Math.random() * 5; // فقط جهت تست
  const stepScore = Math.round(100 * (1 + Math.random()));

  return {
    valid,
    canonical: text,
    reason: "طبق قاعده تستی",
    stepScore,
    rarityPct,
    nextTargetId: "آتش", // برای تست ثابت
  };
});

// --- /stats/top ---
fastify.get("/stats/top", async (req, reply) => {
  const { target, targetId } = req.query as any;
  const key = target || targetId || "?";

  // داده تستی
  const top5 = [
    { answer: "آتش", count: 42 },
    { answer: "آب", count: 17 },
    { answer: "قیچی", count: 9 },
  ];

  return { target: key, top5 };
});

// --- راه‌اندازی ---
const port = Number(process.env.PORT) || 3000;
fastify.listen({ port, host: "0.0.0.0" }, (err, addr) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`🚀 API running at ${addr}`);
});

/*
 * Prisma Schema پیشنهادی (prisma/schema.prisma):
 * ----------------------------------------------
 * datasource db {
 *   provider = "postgresql"
 *   url      = env("DATABASE_URL")
 * }
 *
 * generator client {
 *   provider = "prisma-client-js"
 * }
 *
 * model AnswerStat {
 *   id        Int      @id @default(autoincrement())
 *   target    String
 *   answer    String
 *   count     Int      @default(1)
 *   updatedAt DateTime @updatedAt
 * }
 *
 * model Game {
 *   id        Int      @id @default(autoincrement())
 *   userId    String
 *   mode      String
 *   totalScore Int
 *   createdAt DateTime @default(now())
 * }
 */
