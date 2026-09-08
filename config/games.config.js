/* ===============================
   GAMES CONFIGURATION
   Centralized configuration for all games, custom assets, and pricing markups.
   =============================== */

export const SLUGS = [
  // Mobile Legends
  "mobile-legends114",
  "mobile-legends-united-states41",
  "mlbb-double332",
  "sgmy-mlbb893",
  "mlbb-indo42",
  "mlbb-russia46",
  "mlbbglobal202",
  "mlbbtr112",
  "mlbbbr178",
  "mobile-legends-exclusive952",
  "mobile-legends-philippines888",

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

  // Bundles & Battle Royales
  "weeklymonthly-bundle646",
  "bgmi226",
  "pubg-mobile138",
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
export const SELLING_MARKUP_PERCENT = 0.5;
export const DUMMY_MARKUP_PERCENT = 5;
export const USD_TO_INR_RATIO = 1.145;

export const SELLING_MULTIPLIER = (1 + SELLING_MARKUP_PERCENT / 100) * USD_TO_INR_RATIO;
export const DUMMY_MULTIPLIER = (1 + DUMMY_MARKUP_PERCENT / 100) * USD_TO_INR_RATIO;
