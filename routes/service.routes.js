import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

/* ===============================
   CONFIG
   =============================== */
const API_BASE_URL = process.env.API_URL_BASE || "https://1gamestopup.com/api/v1";
const API_KEY = process.env.API_KEY;

/* ===============================
   VALIDATE PLAYER
   POST /check-region/namecheck
   =============================== */
router.post("/check-region/namecheck", async (req, res) => {
  try {
    const { productId, playerId, zoneId, currency } = req.body;

    if (!productId || !playerId) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Missing required fields: productId and playerId",
      });
    }

    // Construct the payload
    const payload = {
      productId,
      playerId,
      zoneId, // can be omitted for single-field games
    };

    // External API call
    const response = await fetch(`${API_BASE_URL}/api-service/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      return res.status(200).json({
        success: 200,
        message: result.message || "Region checked successfully",
        data: {
          username: result.data?.username || "IN",
          region: result.data?.region || "IN", // Default to IN if not provided
          user_id: result.data?.playerId || playerId,
          zone: result.data?.zoneId || zoneId,
          valid: result.data?.valid ?? false,
        },
      });
    }

    // Error handling
    return res.status(response.status).json({
      success: false,
      statusCode: result.statusCode || response.status,
      message: result.message || "Player validation failed",
      data: null,
    });

  } catch (error) {
    console.error("Player Validation Error:", error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error during player validation",
      data: null,
    });
  }
});

export default router;
