import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
import GameDetail from "../models/GameDetail.js";

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const detail = await GameDetail.findOne({ gameSlug: "mobile-legends-exclusive952" }).lean();
  console.log(JSON.stringify(detail?.data?.gameImageId, null, 2));
  process.exit(0);
}
test();
