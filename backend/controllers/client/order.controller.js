// controllers/orderController.js
import asyncHandler from 'express-async-handler';
import Order from '../../models/orderModel.js';
import OrderItem from '../../models/orderItemModel.js';
import Payment from '../../models/paymentModel.js';
import Product from '../../models/productModel.js'; // nếu cần populate tên sản phẩm
import Cart from '../../models/cartModel.js'

// [POST] Tạo đơn hàng mới + chi tiết sản phẩm
// Route: POST /api/client/orders
// Access: Private (Registered Customer)
export const createOrder = asyncHandler(async (req, res) => {
  const { items, total_amount, payment_method } = req.body

  if (!items || items.length === 0 || !total_amount || !payment_method) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin đơn hàng và sản phẩm' })
  }

  // Tạo Order
  const order = new Order({
    user_id: req.user._id,
    total_amount,
    payment_method,
  })

  const createdOrder = await order.save()

  // Tạo từng OrderItem
  const orderItems = await Promise.all(
    items.map(async (item) => {
      return await OrderItem.create({
        order_id: createdOrder._id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      })
    })
  )

  // TỰ ĐỘNG XÓA GIỎ HÀNG SAU KHI ĐẶT HÀNG THÀNH CÔNG
  try {
    await Cart.deleteOne({ user_id: req.user._id })
    console.log('Đã xóa giỏ hàng của user:', req.user._id)
  } catch (err) {
    console.error('Lỗi khi xóa giỏ hàng:', err)
    // Không throw error, vẫn trả về success
  }

  res.status(201).json({
    message: 'Tạo đơn hàng thành công',
    order: createdOrder,
    items: orderItems,
  })
})

// [GET] Lấy chi tiết 1 đơn hàng (kèm chi tiết sản phẩm)
// Route: GET /api/client/orders/:id
// Access: Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).lean();
  if (!order) {
    return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
  }

  // Kiểm tra quyền truy cập
  if (order.user_id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Bạn không có quyền xem đơn hàng này' });
  }

  // FIX: Populate đầy đủ thông tin product
  const items = await OrderItem.find({ order_id: order._id })
    .populate({
      path: 'product_id',
      select: 'product_name price images category_id stock_quantity',  // ← Sửa 'name' thành 'product_name'
      populate: {
        path: 'category_id',
        select: 'category_name'
      }
    });

  order.items = items;

  res.status(200).json(order);
});

// [GET] Lấy danh sách đơn hàng của người dùng hiện tại
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user_id: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  if (!orders.length) {
    return res.status(404).json({ message: 'Không có lịch sử đơn hàng' });
  }

  for (let order of orders) {
    const items = await OrderItem.find({ order_id: order._id })
      .populate({
        path: 'product_id',
        select: 'product_name price images category_id',
        populate: {
          path: 'category_id',
          select: 'category_name'
        }
      });
    order.items = items;
  }

  res.status(200).json(orders);
});

// [PUT] Hủy đơn hàng (nếu còn pending và chưa thanh toán)
// Route: PUT /api/client/orders/:id/cancel
// Access: Private
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
  }

  if (order.user_id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Không thể hủy đơn hàng của người khác' });
  }

  if (order.status !== 'pending') {
    return res.status(400).json({ message: 'Đơn hàng đã xử lý, không thể hủy' });
  }

  // Kiểm tra nếu đã có Payment completed
  const payment = await Payment.findOne({ order_id: order._id });
  if (payment && payment.status === 'completed') {
    return res.status(400).json({ message: 'Đơn hàng đã thanh toán, không thể hủy' });
  }

  order.status = 'cancelled';
  await order.save();

  res.json({
    message: 'Đơn hàng đã được hủy thành công',
    order,
  });
});
