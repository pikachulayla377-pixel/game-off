import fetch from "node-fetch";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

import GameDetail from "./models/GameDetail.js";
import { SLUGS, SCRAPER_HEADERS } from "./config/games.config.js";

dotenv.config();

/* ===== CORE DUMP FUNCTION (Reusable by CLI & API) ===== */
export async function runDumpGameDetails({ authorization, cookie } = {}) {
  const API_BASE = process.env.API_URL_BASE;
  const API_KEY = process.env.API_KEY;
  const authHeader = (authorization ?? process.env.DUMP_AUTHORIZATION ?? "").trim();
  const cookieHeader = (cookie ?? process.env.DUMP_COOKIE ?? "").trim();

  if (!API_BASE) {
    throw new Error("API_URL_BASE is not configured");
  }

  /* ===== CLEAR OLD DATA ===== */
  const result = await GameDetail.deleteMany({});
  console.log(`🧹 Cleared GameDetail: ${result.deletedCount} records`);

  const dumped = [];
  const failed = [];

  /* ===== DUMP FRESH DATA ===== */
  for (const slug of SLUGS) {
    console.log(`⏳ Dumping: ${slug}`);

    const res = await fetch(`${API_BASE}/game/${slug}`, {
      headers: {
        "x-api-key": API_KEY,
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "authorization": authHeader,
        "connection": "keep-alive",
        "cookie": cookieHeader,
        "referer": `https://1gamestopup.com/product/${slug}`,
        ...SCRAPER_HEADERS,
      },
    });

    if (!res.ok) {
      console.error(`❌ Failed ${slug}: ${res.status}`);
      failed.push({ slug, status: res.status });
      continue;
    }

    const json = await res.json();

    if (!json?.data) {
      console.error(`⚠️ No data for ${slug}`);
      failed.push({ slug, reason: "No data" });
      continue;
    }

    // Rename Busan source
    if (json.data.gameFrom === "Busan") {
      json.data.gameFrom = "bluebuff";
    }

    // Filter out unavailable items
    if (Array.isArray(json.data.itemId)) {
      const beforeCount = json.data.itemId.length;
      json.data.itemId = json.data.itemId.filter(
        (item) => item.itemAvailablity !== false
      );
      const removedCount = beforeCount - json.data.itemId.length;
      if (removedCount > 0) {
        console.log(`🚫 Removed ${removedCount} unavailable item(s) from [${slug}]`);
      }
    }

    await GameDetail.updateOne(
      { gameSlug: slug },
      {
        $set: {
          gameSlug: slug,
          data: json.data,
          rawResponse: json,
          source: "external-api",
          dumpedAt: new Date(),
        },
      },
      { upsert: true }
    );

    dumped.push(slug);
    console.log(`✅ Dumped: ${slug}`);
  }

  console.log("🎉 All game details dumped successfully");

  return {
    deletedCount: result.deletedCount,
    totalSlugs: SLUGS.length,
    dumpedCount: dumped.length,
    failedCount: failed.length,
    failed,
  };
}

/* ===== CLI ENTRYPOINT ===== */
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  (async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("✅ MongoDB connected");
      await runDumpGameDetails();
    } catch (err) {
      console.error("❌ Dump error:", err.message);
      process.exitCode = 1;
    } finally {
      await mongoose.disconnect();
      console.log("🔌 MongoDB disconnected");
      process.exit();
    }
  })();
}
