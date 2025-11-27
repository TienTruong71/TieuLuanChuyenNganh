import asyncHandler from "express-async-handler";
import StockTransaction from "../../../models/stockModel.js";
import Inventory from "../../../models/inventoryModel.js";
import Product from "../../../models/productModel.js";


export const getStockTransactions = asyncHandler(async (req, res) => {
  const history = await StockTransaction.find()
    .populate("product_id", "product_name price images stock_quantity")
    .sort({ createdAt: -1 });

  res.status(200).json(history);
});


export const createStockTransaction = asyncHandler(async (req, res) => {
  const { product_id, quantity, type, note } = req.body;

  if (!product_id || !quantity || !type)
    return res.status(400).json({ message: "Vui lòng nhập đủ thông tin" });

  if (quantity <= 0)
    return res.status(400).json({ message: "Số lượng phải lớn hơn 0" });

  const inventory = await Inventory.findOne({ product_id });
  if (!inventory)
    return res.status(404).json({ message: "Sản phẩm chưa có trong kho" });

  //  -----  Outbound Validation  -----  //
  if (type === "outbound" && quantity > inventory.quantity_available) {
    return res.status(400).json({ message: "Số lượng xuất vượt quá tồn kho" });
  }

  //  -----  Update Stock  -----  //
  if (type === "inbound") {
    inventory.quantity_available += quantity;
  } else if (type === "outbound") {
    inventory.quantity_available -= quantity;
  }

  inventory.last_updated = new Date();
  await inventory.save();

  /** Đồng bộ sang product.stock_quantity */
  await Product.findByIdAndUpdate(product_id, {
    stock_quantity: inventory.quantity_available,
  });

  //  -----  Save Transaction Log  -----  //
  const transaction = await StockTransaction.create({
    product_id,
    quantity,
    type,
    note,
    created_by: req.user?._id, // nếu có auth middleware
  });

  res.status(201).json({
    message: "Ghi nhận giao dịch thành công",
    transaction,
    current_stock: inventory.quantity_available,
  });
});
