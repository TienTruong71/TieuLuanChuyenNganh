// backend/controllers/client/cart.controller.js
import Cart from '../../models/cartModel.js'
import Product from '../../models/productModel.js'
import asyncHandler from 'express-async-handler'

// @desc    Lấy giỏ hàng của khách hàng
// @route   GET /api/client/cart
// @access  Private/Customer
export const getCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user_id: req.user._id })
        .populate({
            path: 'items.product_id',
            select: 'product_name price images category_id',
            populate: { path: 'category_id', select: 'category_name' },
        })

    if (!cart) {
        return res.json({ items: [], total: 0 })
    }

    const total = cart.items.reduce((sum, item) => {
        return sum + (item.product_id.price * item.quantity)
    }, 0)

    res.json({
        items: cart.items.map(item => ({
            product_id: item.product_id._id,
            product_name: item.product_id.product_name,
            price: parseFloat(item.product_id.price),
            quantity: item.quantity,
            image: item.product_id.images.find(img => img.is_primary)?.image_url || '',
            category: item.product_id.category_id.category_name,
        })),
        total: parseFloat(total),
    })
})

// @desc    Thêm sản phẩm vào giỏ hàng
// @route   POST /api/client/cart
// @access  Private/Customer
export const addToCart = asyncHandler(async (req, res) => {
    const { product_id, quantity } = req.body

    // Validate
    if (!product_id || !quantity || quantity < 1) {
        res.status(400)
        throw new Error('Vui lòng cung cấp product_id và số lượng hợp lệ')
    }

    // Kiểm tra product tồn tại
    const product = await Product.findById(product_id)
    if (!product) {
        res.status(404)
        throw new Error('Sản phẩm không tồn tại')
    }

    // Kiểm tra stock
    if (product.stock_quantity < quantity) {
        res.status(400)
        throw new Error('Số lượng trong kho không đủ')
    }

    let cart = await Cart.findOne({ user_id: req.user._id })

    if (!cart) {
        cart = await Cart.create({
            user_id: req.user._id,
            items: [{ product_id, quantity }],
        })
    } else {
        const itemIndex = cart.items.findIndex(item => item.product_id.toString() === product_id)
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity
        } else {
            cart.items.push({ product_id, quantity })
        }
        await cart.save()
    }

    const updatedCart = await Cart.findById(cart._id).populate({
        path: 'items.product_id',
        select: 'product_name price images category_id',
        populate: { path: 'category_id', select: 'category_name' },
    })

    const total = updatedCart.items.reduce((sum, item) => {
        return sum + (item.product_id.price * item.quantity)
    }, 0)

    res.status(201).json({
        message: 'Thêm vào giỏ hàng thành công',
        cart: {
            items: updatedCart.items.map(item => ({
                product_id: item.product_id._id,
                product_name: item.product_id.product_name,
                price: parseFloat(item.product_id.price),
                quantity: item.quantity,
                image: item.product_id.images.find(img => img.is_primary)?.image_url || '',
                category: item.product_id.category_id.category_name,
            })),
            total: parseFloat(total),
        },
    })
})

// @desc    Cập nhật số lượng sản phẩm trong giỏ
// @route   PUT /api/client/cart
// @access  Private/Customer
export const updateCartItem = asyncHandler(async (req, res) => {
    const { product_id, quantity } = req.body

    if (!product_id || !quantity || quantity < 1) {
        res.status(400)
        throw new Error('Vui lòng cung cấp product_id và số lượng hợp lệ')
    }

    const cart = await Cart.findOne({ user_id: req.user._id })
    if (!cart) {
        res.status(404)
        throw new Error('Giỏ hàng không tồn tại')
    }

    const itemIndex = cart.items.findIndex(item => item.product_id.toString() === product_id)
    if (itemIndex === -1) {
        res.status(404)
        throw new Error('Sản phẩm không có trong giỏ hàng')
    }

    const product = await Product.findById(product_id)
    if (!product) {
        res.status(404)
        throw new Error('Sản phẩm không tồn tại')
    }

    if (product.stock_quantity < quantity) {
        res.status(400)
        throw new Error('Số lượng trong kho không đủ')
    }

    cart.items[itemIndex].quantity = quantity
    await cart.save()

    const updatedCart = await Cart.findById(cart._id).populate({
        path: 'items.product_id',
        select: 'product_name price images category_id',
        populate: { path: 'category_id', select: 'category_name' },
    })

    const total = updatedCart.items.reduce((sum, item) => {
        return sum + (item.product_id.price * item.quantity)
    }, 0)

    res.json({
        message: 'Cập nhật giỏ hàng thành công',
        cart: {
            items: updatedCart.items.map(item => ({
                product_id: item.product_id._id,
                product_name: item.product_id.product_name,
                price: parseFloat(item.product_id.price),
                quantity: item.quantity,
                image: item.product_id.images.find(img => img.is_primary)?.image_url || '',
                category: item.product_id.category_id.category_name,
            })),
            total: parseFloat(total),
        },
    })
})

// @desc    Xóa sản phẩm khỏi giỏ hàng
// @route   DELETE /api/client/cart/:product_id44
// @access  Private/Customer
export const removeFromCart = asyncHandler(async (req, res) => {
    const product_id = req.params.product_id

    const cart = await Cart.findOne({ user_id: req.user._id })
    if (!cart) {
        res.status(404)
        throw new Error('Giỏ hàng không tồn tại')
    }

    const itemIndex = cart.items.findIndex(item => item.product_id.toString() === product_id)
    if (itemIndex === -1) {
        res.status(404)
        throw new Error('Sản phẩm không có trong giỏ hàng')
    }

    cart.items.splice(itemIndex, 1)
    await cart.save()

    const updatedCart = await Cart.findById(cart._id).populate({
        path: 'items.product_id',
        select: 'product_name price images category_id',
        populate: { path: 'category_id', select: 'category_name' },
    })

    const total = updatedCart ? updatedCart.items.reduce((sum, item) => {
        return sum + (item.product_id.price * item.quantity)
    }, 0) : 0

    res.json({
        message: 'Xóa sản phẩm khỏi giỏ hàng thành công',
        cart: {
            items: updatedCart ? updatedCart.items.map(item => ({
                product_id: item.product_id._id,
                product_name: item.product_id.product_name,
                price: parseFloat(item.product_id.price),
                quantity: item.quantity,
                image: item.product_id.images.find(img => img.is_primary)?.image_url || '',
                category: item.product_id.category_id.category_name,
            })) : [],
            total: parseFloat(total),
        },
    })
})

// @desc    Xóa toàn bộ giỏ hàng
// @route   DELETE /api/client/cart
// @access  Private/Customer
export const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user_id: req.user._id })
    if (!cart) {
        res.status(404)
        throw new Error('Giỏ hàng không tồn tại')
    }

    await cart.deleteOne()
    res.json({ message: 'Xóa toàn bộ giỏ hàng thành công', cart: { items: [], total: 0 } })
})