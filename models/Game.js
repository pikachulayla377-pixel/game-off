import mongoose from "mongoose";

const GameSchema = new mongoose.Schema({}, { strict: false });

export default mongoose.model("Game", GameSchema, "games");
