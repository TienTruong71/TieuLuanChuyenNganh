import mongoose from "mongoose";

const contractSchema = mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    contract_number: {
      type: String,
      required: true,
      unique: true,
    },

    generated_file_url: {
      type: String, // link file PDF
    },

    status: {
      type: String,
      enum: ["draft", "issued", "signed", "cancelled"],
      default: "draft",
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    customer_snapshot: {
      full_name: String,
      email: String,
      phone: String,
      address: String,
    },

    order_snapshot: {
      total_amount: mongoose.Types.Decimal128,
      payment_method: String,
      createdAt: Date,
    },

    items_snapshot: [
      {
        product_name: String,
        quantity: Number,
        price: mongoose.Types.Decimal128,
      },
    ],
  },
  { timestamps: true }
);

const Contract = mongoose.model("Contract", contractSchema);

export default Contract;
