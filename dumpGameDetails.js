import fetch from "node-fetch";
import mongoose from "mongoose";
import dotenv from "dotenv";

import GameDetail from "./models/GameDetail.js";

dotenv.config();

/* ===== CONFIG ===== */
const API_BASE = process.env.API_URL_BASE;
const API_KEY = process.env.API_KEY;
const MONGO_URI = process.env.MONGO_URI;

// Scraper Headers from .env
const DUMP_AUTH = process.env.DUMP_AUTHORIZATION;
const DUMP_COOKIE = process.env.DUMP_COOKIE;
const DUMP_USER_AGENT = process.env.DUMP_USER_AGENT;
const DUMP_SEC_CH_UA = process.env.DUMP_SEC_CH_UA;
const DUMP_SEC_CH_UA_MOBILE = process.env.DUMP_SEC_CH_UA_MOBILE;
const DUMP_SEC_CH_UA_PLATFORM = process.env.DUMP_SEC_CH_UA_PLATFORM;

const SLUGS = [
  // Mobile Legends: Bang Bang
  "mobile-legends988",
  "mlbb-double332",
  "sgmy-mlbb893",           // SGMY Region
  "mlbb-indo42",            // Indo Region
  "mlbb-russia953",          // Russia Region
  "mlbb-smallphp980",       // Small PHP
  "mlbbglobal202",          // Global
  "mlbbtr112",              // Turkey Region

  // Other Games
  "magic-chess-gogo-india924", // Magic Chess
  "pubg-mobile138",            // PUBG Mobile
  "genshin-impact742",         // Genshin Impact
  "honor-of-kings57",          // Honor of Kings
  "wuthering-of-waves464",     // Wuthering Waves
  "where-winds-meet280",       // Where Winds Meet

  // Bundles
  "weeklymonthly-bundle931"    // Weekly/Monthly Bundle

];

/* ===== SCRIPT ===== */
async function dumpGameDetails() {
  try {
    /* ===== CONNECT ===== */
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    /* ===== CLEAR OLD DATA ===== */
    const result = await GameDetail.deleteMany({});
    console.log(`🧹 Cleared GameDetail: ${result.deletedCount} records`);

    /* ===== DUMP FRESH DATA ===== */
    for (const slug of SLUGS) {
      console.log(`⏳ Dumping: ${slug}`);

      const res = await fetch(`${API_BASE}/game/${slug}`, {
        headers: {
          "x-api-key": API_KEY,
          "accept": "application/json, text/plain, */*",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "authorization": DUMP_AUTH,
          "connection": "keep-alive",
          "cookie": DUMP_COOKIE,
          "referer": `https://1gamestopup.com/product/${slug}`,
          "sec-ch-ua": DUMP_SEC_CH_UA,
          "sec-ch-ua-mobile": DUMP_SEC_CH_UA_MOBILE,
          "sec-ch-ua-platform": DUMP_SEC_CH_UA_PLATFORM,
          "user-agent": DUMP_USER_AGENT
        },
      });

      if (!res.ok) {
        console.error(`❌ Failed ${slug}: ${res.status}`);
        continue;
      }

      const json = await res.json();

      if (!json?.data) {
        console.error(`⚠️ No data for ${slug}`);
        continue;
      }

      // Rename Busan source
      if (json.data.gameFrom === "Busan") {
        json.data.gameFrom = "bluebuff";
      }

      if (slug === "mlbb-double332") {
        console.log(`🔍 DEBUG [${slug}] - Loaded ${json.data.itemId?.length} items.`);
        if (json.data.itemId?.[0]) {
          console.log(`🎁 Full structure of first item:`, JSON.stringify(json.data.itemId[0], null, 2));
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

      console.log(`✅ Dumped: ${slug}`);
    }

    console.log("🎉 All game details dumped successfully");
  } catch (err) {
    console.error("❌ Dump error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
    process.exit(0);
  }
}

dumpGameDetails();
