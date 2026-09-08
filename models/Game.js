import mongoose from "mongoose";

const GameSchema = new mongoose.Schema(
  {
    gameSlug: { type: String, index: true, unique: true },
    gameAvailablity: { type: Boolean, index: true },
  },
  { strict: false }
);

export default mongoose.model("Game", GameSchema, "games");
