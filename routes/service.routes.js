import express from "express";

const router = express.Router();

/* ===============================
   CONFIG
   =============================== */
const API_BASE_URL = process.env.API_URL_BASE || "https://1gamestopup.com/api/v1";
const API_KEY = process.env.API_KEY;

const HEADERS = {
  "Content-Type": "application/json",
  ...(API_KEY && { "x-api-key": API_KEY }),
};

/* ===============================
   VALIDATE PLAYER (Name Check)
   POST /check-region/namecheck
   =============================== */
router.post("/check-region/namecheck", async (req, res) => {
  try {
    let { productId, game, playerId, user_id, id, zoneId, server_id, zone } = req.body;

    // Field aliases & normalization
    const finalProductId = (productId || game || "").trim();
    const finalPlayerId = (playerId || user_id || id || "").trim();
    const finalZoneId = (zoneId || server_id || zone || "NA").trim();

    if (!finalProductId || !finalPlayerId) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Missing required fields: productId/game and playerId/user_id",
        data: null,
      });
    }

    // External API call with an 8-second timeout
    const response = await fetch(`${API_BASE_URL}/api-service/validate`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        productId: finalProductId,
        playerId: finalPlayerId,
        zoneId: finalZoneId,
      }),
      signal: AbortSignal.timeout(8000),
    });

    const result = await response.json().catch(() => null);

    if (response.ok && result?.success) {
      return res.status(200).json({
        success: 200,
        message: result.message || "Player validated successfully",
        data: {
          username: result.data?.username || "NA",
          region: result.data?.region || "NA",
          user_id: result.data?.playerId || finalPlayerId,
          zone: result.data?.zoneId || finalZoneId,
          valid: result.data?.valid ?? true,
        },
      });
    }

    return res.status(response.status || 400).json({
      success: false,
      statusCode: result?.statusCode || response.status || 400,
      message: result?.message || "Player validation failed",
      data: null,
    });

  } catch (error) {
    console.error("Player Validation Error:", error.message || error);

    const isTimeout = error.name === "TimeoutError";
    return res.status(isTimeout ? 504 : 500).json({
      success: false,
      statusCode: isTimeout ? 504 : 500,
      message: isTimeout
        ? "Validation service timed out. Please try again."
        : "Internal server error during player validation",
      data: null,
    });
  }
});

export default router;
