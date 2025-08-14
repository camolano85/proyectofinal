import mongoose from "mongoose";

const BetSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["number", "color"], required: true },
    number: { type: Number },                         // si type=number (0..36)
    color: { type: String, enum: ["rojo", "negro"] }, // si type=color
    amount: { type: Number, required: true }
  },
  { _id: false }
);

const RouletteSchema = new mongoose.Schema(
  {
    status: { type: String, enum: ["open", "closed"], default: "closed" },
    bets: { type: [BetSchema], default: [] },
    winningNumber: { type: Number },
    winningColor: { type: String, enum: ["rojo", "negro"] },
    closedAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model("Roulette", RouletteSchema);


