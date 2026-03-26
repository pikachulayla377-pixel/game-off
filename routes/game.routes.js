import express from "express";
import Game from "../models/Game.js";
import GameDetail from "../models/GameDetail.js";

const router = express.Router();

/* ===============================
   CONFIG
   =============================== */

// --- DYNAMIC CURRENCY CONFIG ---
const BASE_USDT_RATE = 88;    // The rate used when you SAVED the 130 INR in DB
const CURRENT_USDT_RATE = 98; // 👈 Change THIS to 98 to auto-adjust everything!
// -------------------------------

/* ===============================
   HELPERS
   =============================== */

const getAllGames = async () => {
  return Game.find({
    gameSlug: { $ne: "test-1637" },
  }).lean();
};

const getGameDetailBySlug = async (slug) => {
  return GameDetail.findOne({ gameSlug: slug }).lean();
};

const applySellingMarkup = (item) => {
  const originalInr = Number(item?.resellerSellingPrice) || 0;

  // Calculate adjusted cost based on rate ratio (e.g., 98/97)
  const adjustedCost = (originalInr / BASE_USDT_RATE) * CURRENT_USDT_RATE;

  // No markup now, just return raw adjusted cost
  return Math.round(adjustedCost);
};

const applyDummyMarkup = (item) => {
  const originalInr = Number(item?.dummyPrice) || 0;

  const adjustedCost = (originalInr / BASE_USDT_RATE) * CURRENT_USDT_RATE;

  return Math.round(adjustedCost);
};

const applyMarkupToItem = (item) => {
  return {
    ...item,
    sellingPrice: applySellingMarkup(item),
    dummyPrice: applyDummyMarkup(item),
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
