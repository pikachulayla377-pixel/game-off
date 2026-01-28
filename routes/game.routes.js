import express from "express";
import Game from "../models/Game.js";
import GameDetail from "../models/GameDetail.js";

const router = express.Router();

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

    // Clone data to avoid mutation
    const gameData = JSON.parse(JSON.stringify(record.data));

    // Apply 2% markup if items exist
    if (Array.isArray(gameData.itemId)) {
      gameData.itemId = gameData.itemId.map((item) => {
        const basePrice = Number(item.sellingPrice) || 0;
        const finalPrice = Math.round(basePrice * 1.05);

        return {
          ...item,
          sellingPrice: finalPrice,
        };
      });
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
      const basePrice = Number(item.sellingPrice) || 0;

      // +2% markup and nearest round number
      const finalPrice = Math.round(basePrice * 1.05);

      return {
        itemName: item.itemName,
        itemSlug: item.itemSlug,
        sellingPrice: finalPrice,
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
