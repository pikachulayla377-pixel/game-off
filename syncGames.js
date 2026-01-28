// syncGames.js
import fetch from "node-fetch";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Game from "./models/Game.js";

dotenv.config();

/* ===== CONFIG ===== */
const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;
const MONGO_URI = process.env.MONGO_URI;

async function syncGames() {
  try {
    /* ===== CONNECT DB ===== */
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

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
      return;
    }

    /* ===== INSERT FRESH DATA ===== */
    const bulkOps = games.map((game) => ({
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
    }));

    await Game.bulkWrite(bulkOps);

    console.log(`✅ Dumped games: ${games.length}`);
  } catch (err) {
    console.error("❌ Dump failed:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
    process.exit(0);
  }
}

syncGames();
