import fetch from "node-fetch";
import mongoose from "mongoose";
import dotenv from "dotenv";

import GameDetail from "./models/GameDetail.js";

dotenv.config();

/* ===== CONFIG ===== */
const API_BASE = process.env.API_URL_BASE;
const API_KEY = process.env.API_KEY;
const MONGO_URI = process.env.MONGO_URI;

const SLUGS = [
  // Mobile Legends: Bang Bang
  "mobile-legends988",
  "mlbb-double332",
  "sgmy-mlbb893",           // SGMY Region
  "mlbb-indo42",            // Indo Region
  "mlbb-russia953",          // Russia Region
  "mlbb-smallphp980",       // Small PHP
  "mlbbglobal202",          // Global

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
