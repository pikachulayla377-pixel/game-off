import express from "express";
import Game from "../models/Game.js";
import GameDetail from "../models/GameDetail.js";

const router = express.Router();

/* ===============================
   CONFIG
   =============================== */

const SELLING_MARKUP_PERCENT = 1;
const DUMMY_MARKUP_PERCENT = 5;

// The price is coming at 93 INR/USD, we want it to be 98 INR/USD.
// const USD_TO_INR_RATIO = 98 / 87;
const USD_TO_INR_RATIO = 1.126;

const SELLING_MULTIPLIER = (1 + SELLING_MARKUP_PERCENT / 100) * USD_TO_INR_RATIO;
const DUMMY_MULTIPLIER = (1 + DUMMY_MARKUP_PERCENT / 100) * USD_TO_INR_RATIO;

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

/* ===============================
   HELPERS
   =============================== */

const getAllGames = async () => {
  return Game.find({
    gameSlug: { $in: SLUGS },
  }).lean();
};

const getGameDetailBySlug = async (slug) => {
  return GameDetail.findOne({ gameSlug: slug }).lean();
};

const applySellingMarkup = (price) => {
  const base = Number(price) || 0;
  return Math.round(base * SELLING_MULTIPLIER);
};

const applyDummyMarkup = (price) => {
  const base = Number(price) || 0;
  return Math.round(base * DUMMY_MULTIPLIER);
};

const applyMarkupToItem = (item) => {
  return {
    ...item,
    sellingPrice: applySellingMarkup(item?.sellingPrice),
    dummyPrice: applyDummyMarkup(item.dummyPrice),
  };
};

/* ===============================
   GET ALL GAMES
   =============================== */
router.get("/game", async (req, res) => {
  try {
    const games = await getAllGames();

    res.json({
      success: true,
      data: {
        games,
        totalGames: games.length,
      },
    });
  } catch (err) {
    console.error("Game list error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load games",
    });
  }
});

/* ===============================
   GET GAME LIST
   =============================== */
router.get("/games/list", async (req, res) => {
  try {
    const games = await getAllGames();

    const slimGames = games
      .filter((g) => g.gameAvailablity === true)
      .map((g) => ({
        gameName: g.gameName,
        gameSlug: g.gameSlug,
      }));

    res.json({
      success: true,
      data: {
        games: slimGames,
        totalGames: slimGames.length,
      },
    });
  } catch (err) {
    console.error("Game list error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load games",
    });
  }
});

/* ===============================
   GET GAME DETAIL BY SLUG
   =============================== */
router.get("/game/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const record = await getGameDetailBySlug(slug);

    if (!record?.data) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    const gameData = JSON.parse(JSON.stringify(record.data));

    if (Array.isArray(gameData.itemId)) {
      gameData.itemId = gameData.itemId.map(applyMarkupToItem);
    }

    res.json({
      success: true,
      data: gameData,
    });
  } catch (err) {
    console.error("Game detail error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* ===============================
   GET ITEMS BY GAME SLUG
   =============================== */
router.get("/games/:slug/items", async (req, res) => {
  try {
    const { slug } = req.params;

    const record = await getGameDetailBySlug(slug);

    if (!record?.data?.itemId?.length) {
      return res.status(404).json({
        success: false,
        message: "Items not found for this game",
      });
    }

    const items = record.data.itemId.map((item) => {
      const updated = applyMarkupToItem(item);

      return {
        itemName: updated.itemName,
        itemSlug: updated.itemSlug,
        sellingPrice: updated.sellingPrice,
        dummyPrice: updated.dummyPrice,
      };
    });

    res.json({
      success: true,
      data: {
        gameName: record.data.gameName,
        gameSlug: record.data.gameSlug,
        items,
      },
    });
  } catch (err) {
    console.error("Game items error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
