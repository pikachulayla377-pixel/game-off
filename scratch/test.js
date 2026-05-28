import mongoose from "mongoose";
import dotenv from "dotenv";
import Game from "../models/Game.js";
dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const game = await Game.findOne({ gameSlug: "mobile-legends-exclusive952" }).lean();
  console.log(JSON.stringify(game, null, 2));
  process.exit(0);
}
test();
