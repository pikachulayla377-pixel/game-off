import express from "express";

const router = express.Router();

const PROVIDER_TIMEOUT_MS = 5000;

/* ===============================
   PROVIDER IMPLEMENTATIONS
   =============================== */

// 1. AcidGameShop Provider
async function checkAcidGameShop(userId, serverId) {
  const url = `https://acidgameshop.com/api/check-region?userid=${encodeURIComponent(userId)}&zoneid=${encodeURIComponent(serverId)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`Status ${res.status}`);

  const json = await res.json().catch(() => null);
  const data = json?.data;
  const username = data?.username || data?.name;
  if (!username) throw new Error("No username returned");

  const rawRegion = data?.region || data?.country || "IN";
  const region = rawRegion.split(" ")[0];

  return { username, region };
}

// 2. XPreloads Provider
async function checkXPreloads(userId, serverId, game) {
  const url = `https://xpreloads.com/api/api/${encodeURIComponent(game)}?user_id=${encodeURIComponent(userId)}&server_id=${encodeURIComponent(serverId)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`Status ${res.status}`);

  const json = await res.json().catch(() => null);
  const username = json?.username;
  if (!username) throw new Error("No username returned");

  const region = json?.country || "IN";
  return { username, region };
}

// 3. DigitalTopup Provider
async function checkDigitalTopup(userId, serverId, game) {
  const url = `https://digitaltopup.in/api/name-checker/${encodeURIComponent(game)}?user_id=${encodeURIComponent(userId)}&server_id=${encodeURIComponent(serverId)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`Status ${res.status}`);

  const json = await res.json().catch(() => null);
  const data = json?.data || json;
  const username = data?.username || data?.name;
  if (!username) throw new Error("No username returned");

  const rawRegion = data?.region || data?.country || "IN";
  const region = rawRegion.split(" ")[0];

  return { username, region };
}

// 4. CloverShop Provider
async function checkCloverShop(userId, serverId) {
  const res = await fetch("https://clovershop.in/api/validation/region", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userid: userId, zoneid: serverId }),
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Status ${res.status}`);

  const json = await res.json().catch(() => null);
  const username = json?.data?.username;
  if (!json?.success || !username) throw new Error("Validation failed");

  const region = json?.data?.region || "IN";
  return { username, region };
}

const PROVIDERS = [
  { name: "AcidGameShop", fn: (u, s, g) => checkAcidGameShop(u, s) },
  { name: "XPreloads", fn: (u, s, g) => checkXPreloads(u, s, g) },
  { name: "DigitalTopup", fn: (u, s, g) => checkDigitalTopup(u, s, g) },
  { name: "CloverShop", fn: (u, s, g) => checkCloverShop(u, s) },
];

/* ===============================
   UNIFIED REGION CHECK HANDLER
   =============================== */
async function handleRegionCheck(req, res) {
  try {
    let { user_id, server_id, id, zone, game, playerId, zoneId } = req.body;

    // Field aliases & normalization
    const finalUserId = (user_id || id || playerId || "").toString().trim();
    const finalServerId = (server_id || zone || zoneId || "").toString().trim();
    const finalGame = (game || "mlbb").toString().trim();

    if (!finalUserId || !finalServerId) {
      return res.status(200).json({
        success: false,
        message: "Missing required fields: user_id / server_id",
        data: null,
      });
    }

    // Try providers in sequence with automatic fallback
    for (const provider of PROVIDERS) {
      try {
        const result = await provider.fn(finalUserId, finalServerId, finalGame);

        if (result && result.username) {
          return res.status(200).json({
            success: 200,
            message: "Region checked successfully",
            provider: provider.name,
            data: {
              username: result.username,
              region: result.region || "IN",
              user_id: finalUserId,
              zone: finalServerId,
              game: finalGame,
              valid: true,
            },
          });
        }
      } catch (providerError) {
        console.warn(`⚠️ [Region Check] Provider ${provider.name} failed: ${providerError.message}`);
        // Continue to the next fallback provider
      }
    }

    // All fallback providers failed
    return res.status(200).json({
      success: false,
      message: "Player verification failed across all providers. Please verify User ID and Zone ID.",
      data: null,
    });

  } catch (err) {
    console.error("Region check global error:", err);
    return res.status(200).json({
      success: false,
      message: "Internal server error during region check",
      data: null,
    });
  }
}

/* ===============================
   ROUTES
   =============================== */
// Primary unified endpoint
router.post("/check-region", handleRegionCheck);

// Backward-compatible alias endpoints pointing to the unified fallback handler
router.post("/check-region-xpreload", handleRegionCheck);
router.post("/check-region-prev", handleRegionCheck);
router.post("/check-region-8", handleRegionCheck);

export default router;
