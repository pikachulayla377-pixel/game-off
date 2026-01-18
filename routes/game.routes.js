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

router.post("/check", async (req, res) => {
  try {
   

    let { game, user_id, server_id, id, zone } = req.body;

    // 🔁 Map body payload keys
    if (!user_id && id) user_id = id;
    if (!server_id && zone) server_id = zone;

    // 🎮 Default game
    if (!game) game = "mlbb";

    /* ===== VALIDATION ===== */
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: user_id or id",
      });
    }

    /* ===== BUILD BUSAN URL (EXACT FORMAT) ===== */
    const busanUrl =
      `${process.env.BUSAN_BASE_URL}/check` +
      `?game=${encodeURIComponent(game)}` +
      `&user_id=${encodeURIComponent(user_id)}` +
      (server_id
        ? `&server_id=${encodeURIComponent(server_id)}`
        : "");

    /* ===== CALL BUSAN API ===== */
    const response = await fetch(busanUrl, {
      method: "GET",
      headers: {
        "X-API-KEY": process.env.BUSAN_API_KEY,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    /* ===== PASS THROUGH RESPONSE ===== */
    return res.status(response.status).json(data);
  } catch (err) {
    console.error("Busan check-region error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});


router.post("/check-region", async (req, res) => {
  try {
    let { user_id, server_id, id, zone } = req.body;

    // 🔁 Map alternative keys
    if (!user_id && id) user_id = id;
    if (!server_id && zone) server_id = zone;

    /* ===== VALIDATION ===== */
    if (!user_id || !server_id) {
      return res.status(200).json({
        success: false,
        message: "Missing required fields",
        data: null,
      });
    }

    /* ===== BUILD XPRELOADS URL ===== */
    const url =
      `https://xpreloads.com/api/api/mlbb` +
      `?user_id=${encodeURIComponent(user_id)}` +
      `&server_id=${encodeURIComponent(server_id)}`;

    /* ===== CALL API ===== */
    const response = await fetch(url);
    const apiData = await response.json();

    /* ===== NORMALIZE RESPONSE ===== */
    return res.status(200).json({
      success: true,
      message: "Region checked successfully",
      data: {
        username: apiData.username || null,
        region: apiData.country || null,   // mapped from country
        user_id: apiData.user_id || user_id,
        zone: apiData.server_id || server_id,
      },
    });

  } catch (err) {
    console.error("Check-region error:", err);
    return res.status(200).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
});




export default router;
