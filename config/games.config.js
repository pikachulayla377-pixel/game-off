/* ===============================
   GAMES CONFIGURATION
   Centralized configuration for all games, custom assets, and pricing markups.
   =============================== */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRICING_FILE = path.join(__dirname, "pricing.json");

export const SLUGS = [
  // Mobile Legends
  "mobile-legends114", 
  "mobile-legends-united-states41",
  "mlbb-double332",
  "sgmy-mlbb893",
  "mlbb-russia46",
  "mlbbglobal202",
  "mlbbtr112",

  "mobile-legends-exclusive952",
  "mobile-legends-philippines888", //philipins
  "value-pass-ml838",

  "mlbbid35" ,//indo
  "mlbbph643",//ph
  "mlbbsgmy885",//sg

  // Other Popular Games
  "magicchestgogo883",
  "genshin-impact265",
  "honor-of-kings57",
  "wuthering-of-waves464",
  "where-winds-meet280",
  "8ballpool498",
  "asphalt9877",
  "freefireglobal368",
  "garenaundawn179",
  "bloodstrike746",
  "likee349",
  "bigo339",
  "kingshot148",
  "aoem436",
  "starmaker908",
  "mla504",
  "fifafutcoinsconsole532",
  "codmsgmy218",
  "farlight84859",
  "sololeveling60",
  "rsm624", 

  // roblox
  "roblox7" ,

  // Bundles & Battle Royales
  "weeklymonthly-bundle646",
  // pubg bgmi
  "bgmi226",
  "pubg-mobile138",
  "mlbbindia929"
];

/* ===============================
   CUSTOM GAME ASSETS (Cloudinary)
   =============================== */
export const CUSTOM_GAME_IMAGES = {
  "mobile-legends-exclusive952": "https://res.cloudinary.com/dtnu1hlq9/image/upload/q_auto/f_auto/v1779959176/exclusive-mlbb_jqidjv.png",
  "mlbbglobal202": "https://res.cloudinary.com/dtnu1hlq9/image/upload/q_auto/f_auto/v1779967576/global_fxfx6d.png",
  "mlbbbr178": "https://res.cloudinary.com/dtnu1hlq9/image/upload/q_auto/f_auto/v1779962974/brazil-mlbb_rcjsfy.png",
  "mlbbtr112": "https://res.cloudinary.com/dtnu1hlq9/image/upload/q_auto/f_auto/v1779961064/mlbb-turkey_rsfqfc.png",
  "mlbb-double332": "https://res.cloudinary.com/dtnu1hlq9/image/upload/q_auto/f_auto/v1779966871/double-dias_dqv4qg.png",
  "wuthering-of-waves464": "https://res.cloudinary.com/dtnu1hlq9/image/upload/q_auto/f_auto/v1779968054/ww_zo61px.png",
  "where-winds-meet280": "https://res.cloudinary.com/dtnu1hlq9/image/upload/q_auto/f_auto/v1779968317/wwm_dnfmqy.png",
};

export const CUSTOM_ITEM_IMAGES = {};

/* ===============================
   PRICING MARKUP CONFIG
   =============================== */
const DEFAULT_PRICING = {
  usdToInrRatio: 1.139,
  sellingMarkupPercent: 0.5,
  dummyMarkupPercent: 5,
};

function loadPricing() {
  try {
    if (fs.existsSync(PRICING_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(PRICING_FILE, "utf8"));
      return {
        usdToInrRatio: Number(parsed.usdToInrRatio) || DEFAULT_PRICING.usdToInrRatio,
        sellingMarkupPercent:
          parsed.sellingMarkupPercent !== undefined
            ? Number(parsed.sellingMarkupPercent)
            : DEFAULT_PRICING.sellingMarkupPercent,
        dummyMarkupPercent:
          parsed.dummyMarkupPercent !== undefined
            ? Number(parsed.dummyMarkupPercent)
            : DEFAULT_PRICING.dummyMarkupPercent,
      };
    }
  } catch (err) {
    console.warn("⚠️ Failed to read pricing.json, using defaults:", err.message);
  }
  return { ...DEFAULT_PRICING };
}

let currentPricing = loadPricing();

export const SELLING_MARKUP_PERCENT = currentPricing.sellingMarkupPercent;
export const DUMMY_MARKUP_PERCENT = currentPricing.dummyMarkupPercent;
export const USD_TO_INR_RATIO = currentPricing.usdToInrRatio;

export const getSellingMultiplier = () =>
  (1 + currentPricing.sellingMarkupPercent / 100) * currentPricing.usdToInrRatio;

export const getDummyMultiplier = () =>
  (1 + currentPricing.dummyMarkupPercent / 100) * currentPricing.usdToInrRatio;

export const SELLING_MULTIPLIER = getSellingMultiplier();
export const DUMMY_MULTIPLIER = getDummyMultiplier();

export function getPricingConfig() {
  return {
    ...currentPricing,
    sellingMultiplier: getSellingMultiplier(),
    dummyMultiplier: getDummyMultiplier(),
  };
}

export function updatePricingConfig({
  usdToInrRatio,
  sellingMarkupPercent,
  dummyMarkupPercent,
}) {
  if (usdToInrRatio !== undefined) {
    const val = Number(usdToInrRatio);
    if (!Number.isFinite(val) || val <= 0) {
      throw new Error("usdToInrRatio must be a positive number");
    }
    currentPricing.usdToInrRatio = val;
  }
  if (sellingMarkupPercent !== undefined) {
    const val = Number(sellingMarkupPercent);
    if (!Number.isFinite(val) || val < 0) {
      throw new Error("sellingMarkupPercent must be >= 0");
    }
    currentPricing.sellingMarkupPercent = val;
  }
  if (dummyMarkupPercent !== undefined) {
    const val = Number(dummyMarkupPercent);
    if (!Number.isFinite(val) || val < 0) {
      throw new Error("dummyMarkupPercent must be >= 0");
    }
    currentPricing.dummyMarkupPercent = val;
  }

  fs.writeFileSync(PRICING_FILE, JSON.stringify(currentPricing, null, 2) + "\n", "utf8");
  return getPricingConfig();
}

/* ===============================
   SCRAPER HEADERS
   =============================== */
export const SCRAPER_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1",
  "sec-ch-ua": '"Chromium";v="146", "Not-A.Brand";v="24", "Brave";v="146"',
  "sec-ch-ua-mobile": "?1",
  "sec-ch-ua-platform": '"iOS"',
};
