import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import routes from "./routes/index.js"; // 👈 aggregated routes

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

/* ===== API ROUTES ===== */
app.use("/api/v1", routes);

app.get("/", (_, res) => {
  res.send("✅ Game API Server Running");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
