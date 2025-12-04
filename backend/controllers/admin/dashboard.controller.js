// backend/controllers/admin/dashboard.controller.js
import asyncHandler from 'express-async-handler'
import Order from '../../models/orderModel.js'
import User from '../../models/userModel.js'
import Product from '../../models/productModel.js'
import RevenueReport from '../../models/revenueReportModel.js'
import Booking from '../../models/bookingModel.js'
import Role from '../../models/roleModel.js'
import OrderItem from '../../models/orderItemModel.js'
import moment from 'moment'

// @desc    Lấy thống kê tổng quan cho dashboard
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query

    // Mặc định lấy dữ liệu 30 ngày gần nhất nếu không có ngày
    const start = startDate ? moment(startDate).startOf('day') : moment().subtract(30, 'days').startOf('day')
    const end = endDate ? moment(endDate).endOf('day') : moment().endOf('day')

    // 1. Tổng doanh thu (từ orders đã completed)
    const completedOrders = await Order.aggregate([
        {
            $match: {
                status: 'delivered',
                createdAt: { $gte: start.toDate(), $lte: end.toDate() },
            },
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$total_amount' },
                orderCount: { $sum: 1 },
            },
        },
    ])

    // 2. Số lượng khách hàng mới
    const newCustomers = await User.countDocuments({
        role_id: (await Role.findOne({ role_name: 'customer' }))._id,
        createdAt: { $gte: start.toDate(), $lte: end.toDate() },
    })

    // 3. Số lượng sản phẩm tồn kho thấp (< 5)
    const lowStockProducts = await Product.countDocuments({
        stock_quantity: { $lt: 5 },
    })

    // 4. Số lượng booking trong khoảng thời gian
    const bookings = await Booking.countDocuments({
        createdAt: { $gte: start.toDate(), $lte: end.toDate() },
    })

    // 5. Thống kê trạng thái đơn hàng
    const orderStatusStats = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: start.toDate(), $lte: end.toDate() },
            },
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ])

    res.json({
        totalRevenue: completedOrders[0]?.totalRevenue ? parseFloat(completedOrders[0].totalRevenue) : 0,
        orderCount: completedOrders[0]?.orderCount || 0,
        newCustomers,
        lowStockProducts,
        bookings,
        orderStatusStats: orderStatusStats.reduce((acc, stat) => ({
            ...acc,
            [stat._id]: stat.count,
        }), {}),
        dateRange: {
            start: start.toISOString(),
            end: end.toISOString(),
        },
    })
})

// @desc    Lấy báo cáo doanh thu theo tháng
// @route   GET /api/admin/dashboard/revenue-report
// @access  Private/Admin
export const getRevenueReport = asyncHandler(async (req, res) => {
    const { year } = req.query

    const filter = year ? { year: parseInt(year) } : {}
    const reports = await RevenueReport.find(filter).sort({ month: 1 })

    res.json({
        reports: reports.map(report => ({
            month: report.month,
            year: report.year,
            total_revenue: parseFloat(report.total_revenue),
        })),
    })
})

// @desc    Lấy top 5 sản phẩm bán chạy
// @route   GET /api/admin/dashboard/top-products
// @access  Private/Admin
export const getTopProducts = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query

    const start = startDate ? moment(startDate).startOf('day') : moment().subtract(30, 'days').startOf('day')
    const end = endDate ? moment(endDate).endOf('day') : moment().endOf('day')

    const topProducts = await OrderItem.aggregate([
        {
            $lookup: {
                from: 'orders',
                localField: 'order_id',
                foreignField: '_id',
                as: 'order',
            },
        },
        { $unwind: '$order' },
        {
            $match: {
                'order.status': 'delivered',
                'order.createdAt': { $gte: start.toDate(), $lte: end.toDate() },
            },
        },
        {
            $group: {
                _id: '$product_id',
                totalSold: { $sum: '$quantity' },
                totalRevenue: { $sum: { $multiply: ['$quantity', '$price'] } },
            },
        },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'product',
            },
        },
        { $unwind: '$product' },
        {
            $project: {
                product_id: '$_id',
                product_name: '$product.product_name',
                totalSold: 1,
                totalRevenue: 1,
            },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
    ])

    res.json({
        topProducts: topProducts.map(p => ({
            ...p,
            totalRevenue: parseFloat(p.totalRevenue),
        })),
        dateRange: {
            start: start.toISOString(),
            end: end.toISOString(),
        },
    })
})