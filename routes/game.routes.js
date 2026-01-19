import express from "express";
import Game from "../models/Game.js";
import GameDetail from "../models/GameDetail.js";

const router = express.Router();

/* ===============================
   GET ALL GAMES
   GET /api/v1/game
   =============================== */
router.get("/game", async (req, res) => {
  try {
    const games = await Game.find({}).lean();

    const filteredGames = games.filter(
      (g) => g.gameSlug !== "test-1637"
    );

    res.json({
      success: true,
      data: {
        games: filteredGames,
        totalGames: filteredGames.length,
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
   GET GAME BY SLUG
   GET /api/v1/game/:slug
   =============================== */
router.get("/game/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const record = await GameDetail.findOne({
      gameSlug: slug,
    }).lean();

    if (!record?.data) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    res.json({
      success: true,
      data: record.data,
    });
  } catch (err) {
    console.error("Game detail error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


router.get("/game/list", async (req, res) => {
  try {
    const games = await Game.find(
      { gameAvailablity: true },
      { gameName: 1, gameSlug: 1, _id: 0 }
    ).lean();

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

router.get("/game/:slug/items", async (req, res) => {
  try {
    const { slug } = req.params;

    const gameDetail = await GameDetail.findOne(
      { gameSlug: slug },
      {
        gameName: 1,
        gameSlug: 1,
        "data.itemId.itemName": 1,
        "data.itemId.itemSlug": 1,
        "data.itemId.sellingPrice": 1,
        _id: 0,
      }
    ).lean();

    if (!gameDetail?.data?.itemId?.length) {
      return res.status(404).json({
        success: false,
        message: "Items not found for this game",
      });
    }

    res.json({
      success: true,
      data: {
        gameName: gameDetail.gameName,
        gameSlug: gameDetail.gameSlug,
        items: gameDetail.data.itemId.map((item) => ({
          itemName: item.itemName,
          itemSlug: item.itemSlug,
          sellingPrice: item.sellingPrice,
        })),
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
