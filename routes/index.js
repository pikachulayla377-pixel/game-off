import express from "express";
import gameRoutes from "./game.routes.js";
import gateRoutes from "./gate.routes.js";
import regionRoutes from "./region.routes.js";

const router = express.Router();

router.use(gameRoutes);
router.use(gateRoutes);
router.use(regionRoutes);

export default router;
