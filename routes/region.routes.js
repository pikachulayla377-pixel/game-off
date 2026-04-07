import express from "express";

const router = express.Router();

/* ===============================
   REGION CHECK
   POST /api/v1/check-region
   =============================== */
router.post("/check-region-xpreload", async (req, res) => {
  try {
    let { user_id, server_id, id, zone, game } = req.body;

    // fallback aliases
    if (!user_id && id) user_id = id;
    if (!server_id && zone) server_id = zone;

    // default game
    if (!game) game = "mlbb";

    if (!user_id || !server_id) {
      return res.status(200).json({
        success: false,
        message: "Missing required fields",
        data: null,
      });
    }

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
        valid: !!apiData.username,
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



router.post("/check-region-acidgame", async (req, res) => {
  try {
    let { user_id, server_id, id, zone, game } = req.body;

    // fallback aliases
    if (!user_id && id) user_id = id;
    if (!server_id && zone) server_id = zone;

    // default game
    if (!game) game = "mlbb";

    if (!user_id || !server_id) {
      return res.status(200).json({
        success: false,
        message: "Missing required fields",
        data: null,
      });
    }

    const url = `https://acidgameshop.com/api/check-region?userid=${encodeURIComponent(user_id)}&zoneid=${encodeURIComponent(server_id)}`;

    const response = await fetch(url);
    const apiData = await response.json();
    console.log("AcidGameShop Data:", apiData.data);

    const rawRegion = apiData.data.region || apiData.data.country || null;
    const processedRegion = rawRegion ? rawRegion.split(" ")[0] : null;

    return res.status(200).json({
      success: 200,
      message: "Region checked successfully",
      data: {
        username: apiData.data.username || apiData.data.name || "IN",
        region: processedRegion || "IN",
        user_id: apiData.data.user_id || apiData.data.userid || user_id,
        zone: apiData.data.server_id || apiData.data.zoneid || apiData.data.zone || server_id,
        game,
        valid: !!(apiData.data.username || apiData.data.name),
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


router.post("/check-region", async (req, res) => {
  try {
    let { user_id, server_id, id, zone, game } = req.body;

    // fallback aliases
    if (!user_id && id) user_id = id;
    if (!server_id && zone) server_id = zone;

    // default game
    if (!game) game = "mlbb";

    if (!user_id || !server_id) {
      return res.status(200).json({
        success: false,
        message: "Missing required fields",
        data: null,
      });
    }

    const url = `https://digitaltopup.in/api/name-checker/${encodeURIComponent(game)}?user_id=${encodeURIComponent(user_id)}&server_id=${encodeURIComponent(server_id)}`;

    const response = await fetch(url);
    const apiData = await response.json();
    console.log("DigitalTopup Data:", apiData.data);

    // Some APIs put data in 'data' field, some don't.
    const resultData = apiData.data || apiData;
    const rawRegion = resultData.region || resultData.country || null;
    const processedRegion = rawRegion ? rawRegion.split(" ")[0] : null;

    return res.status(200).json({
      success: 200,
      message: "Region checked successfully",
      data: {
        username: resultData.username || resultData.name || "IN",
        region: processedRegion || "IN",
        user_id: resultData.user_id || resultData.userid || user_id,
        zone: resultData.server_id || resultData.zoneid || resultData.zone || server_id,
        game,
        valid: !!(resultData.username || resultData.name),
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


router.post("/check-region-8", async (req, res) => {
  try {
    let { user_id, server_id, id, zone, game } = req.body;
    if (!user_id && id) user_id = id;
    if (!server_id && zone) server_id = zone;
    if (!game) game = "mlbb";

    if (!user_id || !server_id) return res.status(200).json({ success: false, message: "Missing required fields" });

    const response = await fetch("https://clovershop.in/api/validation/region", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userid: user_id, zoneid: server_id }),
    });
    const cloverJson = await response.json();

    if (cloverJson.success && cloverJson.data) {
      return res.status(200).json({
        success: 200,
        message: "Region checked successfully (Clovershop)",
        data: {
          username: cloverJson.data.username || "IN",
          region: cloverJson.data.region || "IN",
          user_id: cloverJson.data.user_id || user_id,
          zone: cloverJson.data.zone || server_id,
          game,
          valid: !!cloverJson.data.username,
        },
      });
    }
    return res.status(200).json({ success: false, message: "Clovershop verification failed" });
  } catch (err) {
    console.error("Clovershop error:", err.message);
    return res.status(200).json({ success: false, message: "Internal server error" });
  }
});

export default router;
