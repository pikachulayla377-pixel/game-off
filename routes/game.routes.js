import express from "express";
import Game from "../models/Game.js";
import GameDetail from "../models/GameDetail.js";

const router = express.Router();

import {
  SLUGS,
  CUSTOM_GAME_IMAGES,
  CUSTOM_ITEM_IMAGES,
  SELLING_MULTIPLIER,
  DUMMY_MULTIPLIER,
} from "../config/games.config.js";

/* ===============================
   HELPERS
   =============================== */

const getAllGames = async () => {
  const games = await Game.find({
    gameSlug: { $in: SLUGS },
  }).lean();

  return games.map((game) => {
    if (game.gameSlug && CUSTOM_GAME_IMAGES[game.gameSlug]) {
      if (!game.gameImageId) game.gameImageId = {};
      game.gameImageId.image = CUSTOM_GAME_IMAGES[game.gameSlug];
    }
    return game;
  });
};

const getGameDetailBySlug = async (slug) => {
  return GameDetail.findOne({ gameSlug: slug }).lean();
};

const applySellingMarkup = (price) => {
  const base = Number(price) || 0;
  return Math.round(base * SELLING_MULTIPLIER);
};

const applyDummyMarkup = (price) => {
  const base = Number(price) || 0;
  return Math.round(base * DUMMY_MULTIPLIER);
};

const applyMarkupToItem = (item) => {
  return {
    ...item,
    sellingPrice: applySellingMarkup(item?.resellerSellingPrice || item?.sellingPrice),
    dummyPrice: applyDummyMarkup(item?.dummyPrice),
  };
};

const filterDuplicateItems = (items) => {
  const uniqueItems = new Map();
  for (const item of items) {
    if (!uniqueItems.has(item.itemSlug)) {
      uniqueItems.set(item.itemSlug, item);
    } else {
      const existingItem = uniqueItems.get(item.itemSlug);
      if ((item.sellingPrice || 0) < (existingItem.sellingPrice || 0)) {
        uniqueItems.set(item.itemSlug, item);
      }
    }
  }
  return Array.from(uniqueItems.values());
};

/* ===============================
   GET ALL GAMES
   =============================== */
router.get("/game", async (req, res) => {
  try {
    const games = await getAllGames();

    res.json({
      success: true,
      data: {
        games,
        totalGames: games.length,
      },
    });
  } catch (err) {
    console.error("Game list error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load games",
    });
  }
});

/* ===============================
   GET GAME LIST
   =============================== */
router.get("/games/list", async (req, res) => {
  try {
    const games = await getAllGames();

    const slimGames = games
      .filter((g) => g.gameAvailablity === true)
      .map((g) => ({
        gameName: g.gameName,
        gameSlug: g.gameSlug,
      }));

    res.json({
      success: true,
      data: {
        games: slimGames,
        totalGames: slimGames.length,
      },
    });
  } catch (err) {
    console.error("Game list error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load games",
    });
  }
});

/* ===============================
   GET GAME DETAIL BY SLUG
   =============================== */
router.get("/game/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const record = await getGameDetailBySlug(slug);

    if (!record?.data) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    const gameData = JSON.parse(JSON.stringify(record.data));

    if (CUSTOM_GAME_IMAGES[slug]) {
      if (!gameData.gameImageId) gameData.gameImageId = {};
      gameData.gameImageId.image = CUSTOM_GAME_IMAGES[slug];
    }

    if (Array.isArray(gameData.itemId)) {

      gameData.itemId = gameData.itemId.map(item => {
        const updated = applyMarkupToItem(item);
        
        // If there's a specific custom item image, use it for all items
        if (CUSTOM_ITEM_IMAGES[slug]) {
          if (!updated.itemImageId) updated.itemImageId = {};
          updated.itemImageId.image = CUSTOM_ITEM_IMAGES[slug];
        } 
        // Otherwise fallback to custom game image if present
        else if (CUSTOM_GAME_IMAGES[slug]) {
          if (!updated.itemImageId) updated.itemImageId = {};
          updated.itemImageId.image = CUSTOM_GAME_IMAGES[slug];
        }
        
        return updated;
      });

      if (slug === "mobile-legends-exclusive952") {
        gameData.itemId = gameData.itemId.filter((item) => item.sellingPrice < 5000 && item.itemSlug !== "mlbb_exclusive_limited-time_value_pack");
      }

      gameData.itemId = filterDuplicateItems(gameData.itemId);
    }

    res.json({
      success: true,
      data: gameData,
    });
  } catch (err) {
    console.error("Game detail error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* ===============================
   GET ITEMS BY GAME SLUG
   =============================== */
router.get("/games/:slug/items", async (req, res) => {
  try {
    const { slug } = req.params;

    const record = await getGameDetailBySlug(slug);

    if (!record?.data?.itemId?.length) {
      return res.status(404).json({
        success: false,
        message: "Items not found for this game",
      });
    }

    let rawItems = record.data.itemId || [];

    let items = rawItems.map((item) => {
      const updated = applyMarkupToItem(item);

      let itemImageId = item.itemImageId;
      if (CUSTOM_ITEM_IMAGES[slug]) {
        itemImageId = { image: CUSTOM_ITEM_IMAGES[slug] };
      } else if (CUSTOM_GAME_IMAGES[slug]) {
        itemImageId = { image: CUSTOM_GAME_IMAGES[slug] };
      }

      return {
        itemName: updated.itemName,
        itemSlug: updated.itemSlug,
        sellingPrice: updated.sellingPrice,
        dummyPrice: updated.dummyPrice,
        itemImageId: itemImageId,
      };
    });

    if (slug === "mobile-legends-exclusive952") {
      items = items.filter((item) => item.sellingPrice < 5000 && item.itemSlug !== "mlbb_exclusive_limited-time_value_pack");
    }

    items = filterDuplicateItems(items);

    res.json({
      success: true,
      data: {
        gameName: record.data.gameName,
        gameSlug: record.data.gameSlug,
        items,
      },
    });
  } catch (err) {
    console.error("Game items error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
