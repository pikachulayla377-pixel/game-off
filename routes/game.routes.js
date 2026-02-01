import express from "express";
import Game from "../models/Game.js";
import GameDetail from "../models/GameDetail.js";

const router = express.Router();

/* ===============================
   CONFIG
   =============================== */

const MARKUP_PERCENT = 6; // change anytime
const MULTIPLIER = 1 + MARKUP_PERCENT / 100;

/* ===============================
   HELPERS (SOURCE OF TRUTH)
   =============================== */

const getAllGames = async () => {
  return Game.find({
    gameSlug: { $ne: "test-1637" },
  }).lean();
};

const getGameDetailBySlug = async (slug) => {
  return GameDetail.findOne({ gameSlug: slug }).lean();
};

// Reusable markup function
const applyMarkup = (price) => {
  const base = Number(price) || 0;
  return Math.round(base * MULTIPLIER);
};

// Apply markup to full item
const applyMarkupToItem = (item) => {
  return {
    ...item,
    sellingPrice: applyMarkup(item.sellingPrice),
    dummyPrice: applyMarkup(item.dummyPrice),
  };
};

/* ===============================
   GET ALL GAMES (FULL)
   GET /api/v1/game
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
   GET GAME LIST (NAME + SLUG)
   GET /api/v1/games/list
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
   GET /api/v1/game/:slug
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

    // Clone safely
    const gameData = JSON.parse(JSON.stringify(record.data));

    // Apply 6% markup to all items
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
   GET /api/v1/games/:slug/items
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
