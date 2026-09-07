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
  // Mobile Legends
  "mobile-legends114",
  "mobile-legends-united-states41",
  "mlbb-double332",
  "sgmy-mlbb893",
  "mlbbglobal202",
  "mlbbtr112",
  "mlbbbr178",
  "mobile-legends-exclusive952",
  "mlbb-russia46",
  "mobile-legends-philippines888",

  // Other games
  "magic-chess-gogo-india924",
  "magicchestgogo883",
  
  "genshin-impact265",
  "honor-of-kings57",
  "wuthering-of-waves464",
  "where-winds-meet280",
  "8ballpool498",
  "asphalt9877",
  "freefireglobal368",
  "garenaundawn179",
  "bloodstrike746",
  "likee349",
  "bigo339",
  "kingshot148",
  "aoem436",
  "starmaker908",
  "mla504",
  "fifafutcoinsconsole532",
  "codmsgmy218",
  "farlight84859",
  "sololeveling60",
  "rsm624",

  // Bundles and additional games
  "weeklymonthly-bundle468",

  //PUBG and BGMI
  "bgmi226",
  "pubg-mobile138",

  
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
