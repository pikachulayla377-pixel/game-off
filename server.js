import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import gameRoutes from "./routes/game.routes.js";

dotenv.config(); // ⬅️ load .env

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/v1", gameRoutes);

app.get("/", (_, res) => {
  res.send("✅ Game API Server Running");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
