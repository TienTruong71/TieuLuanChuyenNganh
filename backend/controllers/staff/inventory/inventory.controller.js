import asyncHandler from "express-async-handler";
import Inventory from "../../../models/inventoryModel.js";
import Product from "../../../models/productModel.js";

export const getInventoryList = asyncHandler(async (req, res) => {
  const inventory = await Inventory.find()
    .populate({
      path: "product_id",
      select: "product_name price images category_id type stock_quantity"
    });

  res.status(200).json(inventory);
});


export const addInventory = asyncHandler(async (req, res) => {
  const { product_id, quantity_available } = req.body;

  if (quantity_available < 0)
    return res.status(400).json({ message: "Số lượng không hợp lệ" });

  const product = await Product.findById(product_id);
  if (!product) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

  const existed = await Inventory.findOne({ product_id });
  if (existed)
    return res.status(400).json({ message: "Sản phẩm đã có trong kho" });

  const newInventory = await Inventory.create({
    product_id,
    quantity_available,
    last_updated: Date.now(),
  });

  /** Đồng bộ với bảng product (stock_quantity) */
  product.stock_quantity = quantity_available;
  await product.save();

  res.status(201).json({
    message: "Thêm sản phẩm vào kho thành công",
    inventory: newInventory,
  });
});


export const updateInventory = asyncHandler(async (req, res) => {
  const { quantity_available } = req.body;
  if (quantity_available < 0)
    return res.status(400).json({ message: "Số lượng không hợp lệ" });

  const inventory = await Inventory.findById(req.params.id);
  if (!inventory)
    return res.status(404).json({ message: "Không tìm thấy sản phẩm kho" });

  inventory.quantity_available = quantity_available;
  inventory.last_updated = new Date();
  await inventory.save();

  /** Đồng bộ tồn kho sang Product */
  await Product.findByIdAndUpdate(inventory.product_id, {
    stock_quantity: quantity_available,
  });

  res.status(200).json({
    message: "Cập nhật số lượng sản phẩm kho thành công",
    inventory,
  });
});


export const deleteInventory = asyncHandler(async (req, res) => {
  const inventory = await Inventory.findById(req.params.id);
  if (!inventory)
    return res.status(404).json({ message: "Không tìm thấy mục kho" });

  /** Reset stock product về 0 khi xóa khỏi kho */
  await Product.findByIdAndUpdate(inventory.product_id, { stock_quantity: 0 });

  await inventory.deleteOne();
  res.status(200).json({ message: "Xoá sản phẩm khỏi kho thành công" });
});
