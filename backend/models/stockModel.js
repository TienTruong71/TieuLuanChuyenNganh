import mongoose from "mongoose";

const stockSchema = new mongoose.Schema(
  {
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    type: { type: String, enum: ["inbound", "outbound"], required: true }, 
    note: { type: String, default: "" },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
  },
  { timestamps: true }
);

const StockTransaction = mongoose.model("StockTransaction", stockSchema);
export default StockTransaction;
