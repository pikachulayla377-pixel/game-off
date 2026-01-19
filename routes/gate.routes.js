import express from "express";

const router = express.Router();

/* ===============================
   BUSAN CHECK
   POST /api/v1/check
   =============================== */
router.post("/check", async (req, res) => {
  try {
    let { game, user_id, server_id, id, zone } = req.body;

    if (!user_id && id) user_id = id;
    if (!server_id && zone) server_id = zone;
    if (!game) game = "mlbb";

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: user_id or id",
      });
    }

    const busanUrl =
      `${process.env.BUSAN_BASE_URL}/check` +
      `?game=${encodeURIComponent(game)}` +
      `&user_id=${encodeURIComponent(user_id)}` +
      (server_id ? `&server_id=${encodeURIComponent(server_id)}` : "");

    const response = await fetch(busanUrl, {
      headers: {
        "X-API-KEY": process.env.BUSAN_API_KEY,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return res.status(response.status).json(data);

  } catch (err) {
    console.error("Busan check error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

export default router;
