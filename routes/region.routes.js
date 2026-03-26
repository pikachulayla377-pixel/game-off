import express from "express";
import crypto from "crypto";
import fetch from "node-fetch";

const router = express.Router();

const md5 = (data) => crypto.createHash("md5").update(data).digest("hex");

/* ===============================
   REGION CHECK
   POST /api/v1/check-region
   =============================== */
router.post("/check-region", async (req, res) => {
  try {
    let { user_id, server_id, id, zone, game, provider } = req.body;

    // fallback aliases
    if (!user_id && id) user_id = id;
    if (!server_id && zone) server_id = zone;

    // default game
    if (!game) game = "mlbb";

    if (!user_id || !server_id) {
      return res.status(200).json({
        success: false,
        message: "Missing required fields (user_id/server_id)",
        data: null,
      });
    }

    /* ===== PROVIDER: SMILE ONE ===== */
    if (provider === "smileone") {
      const email = process.env.SMILE_ONE_EMAIL;
      const uid = process.env.SMILE_ONE_UID;
      const key = process.env.SMILE_ONE_KEY;
      const time = Math.floor(Date.now() / 1000).toString();
      const product = "mlbb"; // Defaulting to mlbb for smile.one role check

      // Sign: md5(time + email + uid + key + userid + zoneid + product + key)
      const signStr = time + email + uid + key + user_id + server_id + product + key;
      const sign = md5(signStr);

      const smileBody = {
        email,
        uid,
        userid: user_id,
        zoneid: server_id,
        product,
        time,
        sign,
      };

      const smileRes = await fetch("https://www.smile.one/api/checkrole", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(smileBody),
      });

      const smileData = await smileRes.json();

      if (smileData.status !== 200) {
        return res.status(200).json({
          success: false,
          message: smileData.message || "Smile.one identification failed",
          data: smileData,
        });
      }

      return res.status(200).json({
        success: 200,
        message: "Region checked successfully (Smile.one)",
        data: {
          username: smileData.username || null,
          region: smileData.zone || null, // Smile.one often returns zone/region info here
          user_id,
          zone: server_id,
          game,
        },
      });
    }

    /* ===== DEFAULT PROVIDER (XPRELOADS) ===== */
    const url =
      `https://xpreloads.com/api/api/${encodeURIComponent(game)}` +
      `?user_id=${encodeURIComponent(user_id)}` +
      `&server_id=${encodeURIComponent(server_id)}`;

    const response = await fetch(url);
    const apiData = await response.json();

    return res.status(200).json({
      success: 200,
      message: "Region checked successfully",
      data: {
        username: apiData.username || null,
        region: apiData.country || null,
        user_id: apiData.user_id || user_id,
        zone: apiData.server_id || server_id,
        game,
      },
    });
  } catch (err) {
    console.error("Region check error:", err);
    return res.status(200).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
});

export default router;
