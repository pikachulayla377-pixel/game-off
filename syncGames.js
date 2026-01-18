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
    await mongoose.connect(MONGO_URI);

    const res = await fetch(API_URL, {
      headers: { "x-api-key": API_KEY },
    });

    if (!res.ok) {
      throw new Error(`API failed with status ${res.status}`);
    }

    const json = await res.json();
    const games = json?.data?.games || [];

    for (const game of games) {
      await Game.updateOne(
        { gameSlug: game.gameSlug },
        {
          $set: {
            ...game,
            lastSyncedAt: new Date(),
          },
        },
        { upsert: true }
      );
    }

    console.log("✅ Dumped games:", games.length);
  } catch (err) {
    console.error("❌ Dump failed:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

syncGames();
