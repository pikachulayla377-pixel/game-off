import express from "express";

const router = express.Router();

const BUSAN_BASE_URL = process.env.BUSAN_BASE_URL;
const BUSAN_API_KEY = process.env.BUSAN_API_KEY;

/* ===============================
   BUSAN CHECK
   POST /api/v1/check
   =============================== */
router.post("/check", async (req, res) => {
  try {
    let { game, user_id, server_id, id, zone, playerId, zoneId } = req.body;

    // Field normalization, aliases & trimming
    const finalUserId = (user_id || id || playerId || "").toString().trim();
    const finalServerId = (server_id || zone || zoneId || "").toString().trim();
    const finalGame = (game || "mlbb").toString().trim();

    if (!finalUserId) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: user_id or id",
      });
    }

    if (!BUSAN_BASE_URL) {
      return res.status(500).json({
        success: false,
        error: "Busan service URL is not configured on the server",
      });
    }

    const busanUrl =
      `${BUSAN_BASE_URL}/check` +
      `?game=${encodeURIComponent(finalGame)}` +
      `&user_id=${encodeURIComponent(finalUserId)}` +
      (finalServerId ? `&server_id=${encodeURIComponent(finalServerId)}` : "");

    const response = await fetch(busanUrl, {
      headers: {
        "X-API-KEY": BUSAN_API_KEY,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(8000),
    });

    const data = await response.json().catch(() => null);

    if (data) {
      return res.status(response.status).json(data);
    }

    return res.status(response.status || 500).json({
      success: false,
      error: `Upstream service returned status ${response.status}`,
    });

  } catch (err) {
    console.error("Busan check error:", err.message || err);

    const isTimeout = err.name === "TimeoutError";
    return res.status(isTimeout ? 504 : 500).json({
      success: false,
      error: isTimeout ? "Busan check service timed out. Please try again." : "Internal server error",
    });
  }
});

export default router;
