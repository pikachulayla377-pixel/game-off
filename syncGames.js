// syncGames.js
import fetch from "node-fetch";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import Game from "./models/Game.js";

dotenv.config();

/* ===== CORE SYNC FUNCTION (Reusable by CLI & API) ===== */
export async function runSyncGames() {
  const API_URL = process.env.API_URL;
  const API_KEY = process.env.API_KEY;

  if (!API_URL) {
    throw new Error("API_URL is not configured");
  }

  /* ===== CLEAR EXISTING DATA ===== */
  const deleteResult = await Game.deleteMany({});
  console.log(`🧹 Cleared games collection: ${deleteResult.deletedCount} records`);

  /* ===== FETCH API DATA ===== */
  const res = await fetch(API_URL, {
    headers: { "x-api-key": API_KEY },
  });

  if (!res.ok) {
    throw new Error(`API failed with status ${res.status}`);
  }

  const json = await res.json();
  const games = json?.data?.games || [];

  if (!games.length) {
    console.warn("⚠️ No games received from API");
    return { deletedCount: deleteResult.deletedCount, syncedCount: 0 };
  }

  /* ===== INSERT FRESH DATA ===== */
  const bulkOps = games.map((game) => {
    // Rename Busan source
    if (game.gameFrom === "Busan" || game.gameFrom === "busan") {
      game.gameFrom = "bluebuff";
    }

    return {
      updateOne: {
        filter: { gameSlug: game.gameSlug },
        update: {
          $set: {
            ...game,
            lastSyncedAt: new Date(),
          },
        },
        upsert: true,
      },
    };
  });

  await Game.bulkWrite(bulkOps);
  console.log(`✅ Dumped games: ${games.length}`);

  return {
    deletedCount: deleteResult.deletedCount,
    syncedCount: games.length,
  };
}

/* ===== CLI ENTRYPOINT ===== */
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  (async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("✅ MongoDB connected");
      await runSyncGames();
    } catch (err) {
      console.error("❌ Dump failed:", err.message);
      process.exitCode = 1;
    } finally {
      await mongoose.disconnect();
      console.log("🔌 MongoDB disconnected");
      process.exit();
    }
  })();
}
