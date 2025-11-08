import asyncHandler from 'express-async-handler';
import Order from '../../models/orderModel.js';

// [POST] Tạo đơn hàng mới
// Route: POST /api/client/orders
// Access: Private (Registered Customer)
export const createOrder = asyncHandler(async (req, res) => {
  const { total_amount, payment_method } = req.body;

  if (!total_amount || !payment_method) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đủ thông tin đơn hàng' });
  }

  const order = new Order({
    user_id: req.user._id, // từ middleware xác thực
    total_amount,
    payment_method,
  });

  const createdOrder = await order.save();
  res.status(201).json({
    message: 'Tạo đơn hàng thành công',
    order: createdOrder,
  });
});

// [GET] Lấy danh sách đơn hàng của người dùng hiện tại
// Route: GET /api/client/orders
// Access: Private

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user_id: req.user._id }).sort({ createdAt: -1 });

  if (!orders.length) {
    return res.status(404).json({ message: 'Không có lịch sử đơn hàng' });
  }

  res.status(200).json(orders);
});

// [GET] Lấy chi tiết 1 đơn hàng
// Route: GET /api/client/orders/:id
// Access: Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user_id', 'name email');

  if (!order) {
    return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
  }

  // chỉ cho phép xem đơn hàng của chính user
  if (order.user_id._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Bạn không có quyền xem đơn hàng này' });
  }

  res.status(200).json(order);
});

// [PUT] Hủy đơn hàng (nếu còn pending)
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

  order.status = 'cancelled';
  await order.save();

  res.json({
    message: 'Đơn hàng đã được hủy thành công',
    order,
  });


  
});
