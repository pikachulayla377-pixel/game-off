import express from "express";
import { runSyncGames } from "../syncGames.js";
import { runDumpGameDetails } from "../dumpGameDetails.js";
import { getPricingConfig, updatePricingConfig } from "../config/games.config.js";

const router = express.Router();

let isJobRunning = false;
const ADMIN_SECRET = process.env.ADMIN_SECRET || "456456";

function requireAdminKey(req, res, next) {
  const providedKey = req.headers["x-admin-key"];
  if (!providedKey || providedKey !== ADMIN_SECRET) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: invalid or missing x-admin-key",
    });
  }
  next();
}

/* ===============================
   ADMIN: TRIGGER SYNC & DUMP
   POST /api/v1/admin/sync-dump
   =============================== */
router.post("/admin/sync-dump", requireAdminKey, async (req, res) => {
  if (isJobRunning) {
    return res.status(409).json({
      success: false,
      message: "A sync/dump job is already running. Please wait.",
    });
  }

  const {
    authorization,
    cookie,
    runSync = true,
    runDump = true,
  } = req.body || {};

  if (!runSync && !runDump) {
    return res.status(400).json({
      success: false,
      message: "At least one of runSync or runDump must be true",
    });
  }

  if (runDump && !(authorization || process.env.DUMP_AUTHORIZATION)) {
    return res.status(400).json({
      success: false,
      message: "Missing authorization token for dump",
    });
  }

  isJobRunning = true;
  try {
    const result = { success: true };

    if (runSync) {
      result.sync = await runSyncGames();
    }

    if (runDump) {
      result.dump = await runDumpGameDetails({ authorization, cookie });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error("Admin sync-dump error:", err.message || err);
    return res.status(500).json({
      success: false,
      message: err.message || "Sync/dump failed",
    });
  } finally {
    isJobRunning = false;
  }
});

/* ===============================
   ADMIN: PRICING CONFIG
   GET  /api/v1/admin/pricing
   POST /api/v1/admin/pricing
   =============================== */
router.get("/admin/pricing", requireAdminKey, (_, res) => {
  return res.status(200).json({
    success: true,
    data: getPricingConfig(),
  });
});

router.post("/admin/pricing", requireAdminKey, (req, res) => {
  try {
    const { usdToInrRatio, sellingMarkupPercent, dummyMarkupPercent } = req.body || {};
    const updated = updatePricingConfig({
      usdToInrRatio,
      sellingMarkupPercent,
      dummyMarkupPercent,
    });
    return res.status(200).json({
      success: true,
      message: "Pricing config updated",
      data: updated,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Invalid pricing values",
    });
  }
});

export default router;
