import mongoose from "mongoose";

const GameDetailSchema = new mongoose.Schema({}, { strict: false });

export default mongoose.model(
  "GameDetail",
  GameDetailSchema,
  "gamedetails"
);
