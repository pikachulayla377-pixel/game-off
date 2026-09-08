import mongoose from "mongoose";

const GameDetailSchema = new mongoose.Schema(
  {
    gameSlug: { type: String, index: true, unique: true },
  },
  { strict: false }
);

export default mongoose.model(
  "GameDetail",
  GameDetailSchema,
  "gamedetails"
);
