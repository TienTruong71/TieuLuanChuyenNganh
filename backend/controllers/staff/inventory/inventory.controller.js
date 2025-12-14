import asyncHandler from "express-async-handler";
import Inventory from "../../../models/inventoryModel.js";
import Product from "../../../models/productModel.js";
import Category from "../../../models/categoryModel.js";

/**
 * GET: Lấy danh sách tồn kho
 */
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

  // Đồng bộ Product stock
  product.stock_quantity = quantity_available;
  await product.save();

  res.status(201).json({
    message: "Thêm sản phẩm vào kho thành công",
    inventory: newInventory,
  });
});


/**
 * POST: Thêm sản phẩm bằng product_name + category_name
 * Category phải tồn tại trước
 */
export const addInventoryByName = asyncHandler(async (req, res) => {
  const { product_name, category_name, price, images, quantity_available } = req.body;

  if (!product_name || !category_name) {
    return res.status(400).json({ message: "Tên sản phẩm và tên danh mục là bắt buộc" });
  }

  if (quantity_available < 0) {
    return res.status(400).json({ message: "Số lượng không hợp lệ" });
  }

  /** Kiểm tra Category tồn tại */
  const category = await Category.findOne({ category_name });
  if (!category) {
    return res.status(404).json({ message: "Danh mục không tồn tại. Hãy tạo danh mục trước." });
  }

  //Kiểm tra sản phẩm 
  let product = await Product.findOne({ product_name });

  // Nếu chưa tồn tại thì tạo mới
  if (!product) {
    product = await Product.create({
      product_name,
      price: price || 0,
      images: images || [],
      category_id: category._id,
      type: "normal",
      stock_quantity: quantity_available
    });
  } else {
    // Nếu đã có trong kho thì chặn
    const existedInventory = await Inventory.findOne({ product_id: product._id });
    if (existedInventory) {
      return res.status(400).json({ message: "Sản phẩm đã có trong kho" });
    }
  }

  const newInventory = await Inventory.create({
    product_id: product._id,
    quantity_available,
    last_updated: Date.now(),
  });

  product.stock_quantity = quantity_available;
  await product.save();

  res.status(201).json({
    message: "Thêm sản phẩm vào kho thành công (theo tên)",
    inventory: newInventory,
  });
});


/**
 * PUT: Cập nhật số lượng tồn kho
 */
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

  // Đồng bộ product stock
  await Product.findByIdAndUpdate(inventory.product_id, {
    stock_quantity: quantity_available,
  });

  res.status(200).json({
    message: "Cập nhật số lượng sản phẩm kho thành công",
    inventory,
  });
});


/**
 * DELETE: Xóa tồn kho và reset tồn kho trong Product
 */
export const deleteInventory = asyncHandler(async (req, res) => {
  const inventory = await Inventory.findById(req.params.id);
  if (!inventory)
    return res.status(404).json({ message: "Không tìm thấy mục kho" });

  // Reset stock về 0
  await Product.findByIdAndUpdate(inventory.product_id, { stock_quantity: 0 });

  await inventory.deleteOne();
  res.status(200).json({ message: "Xoá sản phẩm khỏi kho thành công" });
});
