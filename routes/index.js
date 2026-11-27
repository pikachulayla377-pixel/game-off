import express from "express";
import gameRoutes from "./game.routes.js";
import gateRoutes from "./gate.routes.js";
import regionRoutes from "./region.routes.js";
import serviceRoutes from "./service.routes.js";
import adminRoutes from "./admin.routes.js";

const router = express.Router();

router.use(gameRoutes);
router.use(gateRoutes);
router.use(regionRoutes);
router.use(serviceRoutes);
router.use(adminRoutes);

export default router;
