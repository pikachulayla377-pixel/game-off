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

    // respond exactly like external API
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


router.get("/check", async (req, res) => {
  try {
    const { game, user_id, server_id } = req.query;

    if (!game || !user_id) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: game, user_id",
      });
    }

    const query = new URLSearchParams({
      game,
      user_id,
    });

    if (server_id) {
      query.append("server_id", server_id);
    }

    const response = await fetch(
      `${process.env.BUSAN_BASE_URL}/check?${query.toString()}`,
      {
        headers: {
          "X-API-KEY": process.env.BUSAN_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (err) {
    console.error("Busan check error:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

export default router;
