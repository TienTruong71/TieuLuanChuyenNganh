// backend/controllers/admin/order.controller.js
import Order from '../../models/orderModel.js'
import OrderItem from '../../models/orderItemModel.js';
import Payment from '../../models/paymentModel.js'
import Product from '../../models/productModel.js'
import User from '../../models/userModel.js'
import asyncHandler from 'express-async-handler'


export const getOrders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const search = req.query.search || ''
    const status = req.query.status || ''

    const query = {}
    if (status) query.status = status
    if (search) {
        const users = await User.find({
            $or: [
                { full_name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ],
        }).select('_id')
        query.user_id = { $in: users.map(u => u._id) }
    }

    const total = await Order.countDocuments(query)
    const orders = await Order.find(query)
        .populate('user_id', 'full_name email phone')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })

    const detailedOrders = await Promise.all(
        orders.map(async (order) => {
            const items = await OrderItem.find({ order_id: order._id }).populate('product_id', 'product_name price')
            const payment = await Payment.findOne({ order_id: order._id })
            return {
                ...order.toObject(),
                total_amount: parseFloat(order.total_amount),
                items: items.map(item => ({
                    product_id: item.product_id._id,
                    product_name: item.product_id.product_name,
                    quantity: item.quantity,
                    price: parseFloat(item.price),
                })),
                payment: payment ? {
                    amount: parseFloat(payment.amount),
                    method: payment.method,
                    status: payment.status,
                    payment_date: payment.payment_date,
                } : null,
            }
        })
    )

    res.json({
        orders: detailedOrders,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    })
})


export const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user_id', 'full_name email phone')
    if (!order) {
        res.status(404)
        throw new Error('Đơn hàng không tồn tại')
    }

    const items = await OrderItem.find({ order_id: order._id }).populate('product_id', 'product_name price')
    const payment = await Payment.findOne({ order_id: order._id })

    res.json({
        ...order.toObject(),
        total_amount: parseFloat(order.total_amount),
        items: items.map(item => ({
            product_id: item.product_id._id,
            product_name: item.product_id.product_name,
            quantity: item.quantity,
            price: parseFloat(item.price),
        })),
        payment: payment ? {
            amount: parseFloat(payment.amount),
            method: payment.method,
            status: payment.status,
            payment_date: payment.payment_date,
        } : null,
    })
})


export const createOrder = asyncHandler(async (req, res) => {
    const { user_id, items, total_amount, payment_method } = req.body

 
    if (!user_id || !items || !items.length || !total_amount || !payment_method) {
        res.status(400)
        throw new Error('Vui lòng nhập đầy đủ thông tin: khách hàng, sản phẩm, tổng tiền, phương thức thanh toán')
    }

    
    const user = await User.findById(user_id)
    if (!user) {
        res.status(404)
        throw new Error('Khách hàng không tồn tại')
    }

    
    const order = await Order.create({
        user_id,
        total_amount: parseFloat(total_amount),
        status: 'pending',
        payment_method,
    })

 
    for (const item of items) {
        const product = await Product.findById(item.product_id)
        if (!product) {
            await order.deleteOne()
            res.status(404)
            throw new Error(`Sản phẩm ${item.product_id} không tồn tại`)
        }
        if (product.stock_quantity < item.quantity) {
            await order.deleteOne()
            res.status(400)
            throw new Error(`Sản phẩm ${product.product_name} không đủ số lượng`)
        }

        await OrderItem.create({
            order_id: order._id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: parseFloat(item.price || product.price),
        })

        product.stock_quantity -= item.quantity
        await product.save()
    }

  
    const payment = await Payment.create({
        order_id: order._id,
        amount: parseFloat(total_amount),
        method: payment_method,
        status: 'pending',
    })

    res.status(201).json({
        message: 'Tạo đơn hàng thành công',
        order: {
            ...order.toObject(),
            total_amount: parseFloat(order.total_amount),
            items,
            payment: {
                amount: parseFloat(payment.amount),
                method: payment.method,
                status: payment.status,
                payment_date: payment.payment_date,
            },
        },
    })
})


export const updateOrder = asyncHandler(async (req, res) => {
    const { status, payment_status } = req.body

    const order = await Order.findById(req.params.id)
    if (!order) {
        res.status(404)
        throw new Error('Đơn hàng không tồn tại')
    }

    if (status) {
        if (order.status === 'delivered' || order.status === 'cancelled') {
            res.status(400)
            throw new Error('Không thể cập nhật đơn hàng đã hoàn thành hoặc đã hủy')
        }

        if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
            res.status(400)
            throw new Error('Trạng thái không hợp lệ')
        }
        order.status = status
    }

    const updatedOrder = await order.save()

    if (payment_status) {
        const payment = await Payment.findOne({ order_id: order._id })
        if (!payment) {
            res.status(404)
            throw new Error('Thanh toán không tồn tại')
        }
        if (!['pending', 'completed', 'failed', 'refunded'].includes(payment_status)) {
            res.status(400)
            throw new Error('Trạng thái thanh toán không hợp lệ')
        }
        payment.status = payment_status
        await payment.save()
    }

    res.json({
        message: 'Cập nhật đơn hàng thành công',
        order: {
            ...updatedOrder.toObject(),
            total_amount: parseFloat(updatedOrder.total_amount),
        },
    })
})


export const deleteOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
    if (!order) {
        res.status(404)
        throw new Error('Đơn hàng không tồn tại')
    }

    if (order.status !== 'cancelled') {
        res.status(400)
        throw new Error('Chỉ có thể xóa đơn hàng đã hủy')
    }


    await OrderItem.deleteMany({ order_id: order._id })


    await Payment.deleteOne({ order_id: order._id })

    await order.deleteOne()

    res.json({ message: 'Xóa đơn hàng thành công' })
})