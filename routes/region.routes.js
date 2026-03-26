import express from "express";

const router = express.Router();

/* ===============================
   REGION CHECK
   POST /api/v1/check-region
   =============================== */
// router.post("/check-region", async (req, res) => {
//   try {
//     let { user_id, server_id, id, zone, game } = req.body;

//     // fallback aliases
//     if (!user_id && id) user_id = id;
//     if (!server_id && zone) server_id = zone;

//     // default game
//     if (!game) game = "mlbb";

//     if (!user_id || !server_id) {
//       return res.status(200).json({
//         success: false,
//         message: "Missing required fields",
//         data: null,
//       });
//     }

//     const url =
//       `https://xpreloads.com/api/api/${encodeURIComponent(game)}` +
//       `?user_id=${encodeURIComponent(user_id)}` +
//       `&server_id=${encodeURIComponent(server_id)}`;

//     const response = await fetch(url);
//     const apiData = await response.json();

//     return res.status(200).json({
//       success: 200,
//       message: "Region checked successfully",
//       data: {
//         username: apiData.username || null,
//         region: apiData.country || null,
//         user_id: apiData.user_id || user_id,
//         zone: apiData.server_id || server_id,
//         game,
//       },
//     });
//   } catch (err) {
//     console.error("Region check error:", err);
//     return res.status(200).json({
//       success: false,
//       message: "Internal server error",
//       data: null,
//     });
//   }
// });



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

    const url = "https://classysmile.in/api/validation/region";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "region",
        userid: user_id,
        zoneid: server_id,
      }),
    });

    const apiData = await response.json();
    console.log("ClassySmile Data:", apiData);

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
