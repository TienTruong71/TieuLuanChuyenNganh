// backend/controllers/client/cart.controller.js
import Cart from '../../models/cartModel.js'
import Product from '../../models/productModel.js'
import asyncHandler from 'express-async-handler'

// @desc    Lấy giỏ hàng của khách hàng
// @route   GET /api/client/cart
// @access  Private/Customer
export const getCart = asyncHandler(async (req, res) => {
    try {
        console.log('Getting cart for user:', req.user._id)
        
        const cart = await Cart.findOne({ user_id: req.user._id })
            .populate({
                path: 'items.product_id',
                select: 'product_name price images category_id stock_quantity',
                populate: { path: 'category_id', select: 'category_name' },
            })

        // Nếu chưa có cart, trả về empty
        if (!cart || !cart.items || cart.items.length === 0) {
            return res.json({ items: [], total: 0 })
        }

        // Tính tổng tiền
        let total = 0
        const items = cart.items.map(item => {
            // Check nếu product đã bị xóa
            if (!item.product_id) {
                return null
            }

            const price = parseFloat(item.product_id.price)
            const quantity = item.quantity
            total += price * quantity

            // Handle images array
            const getFirstImage = () => {
                if (Array.isArray(item.product_id.images) && item.product_id.images.length > 0) {
                    const img = item.product_id.images[0]
                    if (typeof img === 'object') return img.image_url || img.url || ''
                    if (typeof img === 'string') return img
                }
                return ''
            }

            return {
                product_id: item.product_id._id,
                product_name: item.product_id.product_name,
                price: price,
                quantity: quantity,
                image: getFirstImage(),
                category: item.product_id.category_id?.category_name || 'Chưa phân loại',
            }
        }).filter(item => item !== null)  

        res.json({
            items: items,
            total: total,
        })
    } catch (error) {
        console.error('Error in getCart:', error)
        res.status(500).json({ message: error.message })
    }
})

// @desc    Thêm sản phẩm vào giỏ hàng
// @route   POST /api/client/cart
// @access  Private/Customer
export const addToCart = asyncHandler(async (req, res) => {
    const { product_id, quantity } = req.body

    console.log('🛒 Add to cart:', { user_id: req.user._id, product_id, quantity })

    // Validate input
    if (!product_id || !quantity || quantity < 1) {
        res.status(400)
        throw new Error('Vui lòng cung cấp product_id và số lượng hợp lệ')
    }

    // ✅ Kiểm tra product tồn tại
    const product = await Product.findById(product_id)
    if (!product) {
        console.error('❌ Product not found:', product_id)
        res.status(404)
        throw new Error('Sản phẩm không tồn tại')
    }

    console.log('✅ Product found:', {
        id: product._id,
        name: product.product_name,
        price: product.price,
        stock: product.stock_quantity
    })

    // ✅ Kiểm tra stock
    if (product.stock_quantity < quantity) {
        res.status(400)
        throw new Error(`Số lượng trong kho không đủ. Chỉ còn ${product.stock_quantity} sản phẩm`)
    }

    // Find or create cart
    let cart = await Cart.findOne({ user_id: req.user._id })

    if (!cart) {
        cart = await Cart.create({
            user_id: req.user._id,
            items: [{ product_id, quantity }],
        })
        console.log('✅ New cart created')
    } else {
        const itemIndex = cart.items.findIndex(item => item.product_id.toString() === product_id)
        if (itemIndex > -1) {
            // Update quantity
            const newQuantity = cart.items[itemIndex].quantity + quantity
            
            // Check stock for new quantity
            if (product.stock_quantity < newQuantity) {
                res.status(400)
                throw new Error(`Số lượng trong kho không đủ. Chỉ còn ${product.stock_quantity} sản phẩm`)
            }
            
            cart.items[itemIndex].quantity = newQuantity
            console.log('✅ Updated existing item quantity')
        } else {
            cart.items.push({ product_id, quantity })
            console.log('✅ Added new item to cart')
        }
        await cart.save()
    }

    // Populate cart
    const updatedCart = await Cart.findById(cart._id).populate({
        path: 'items.product_id',
        select: 'product_name price images category_id stock_quantity',
        populate: { path: 'category_id', select: 'category_name' },
    })

    // ✅ Handle null products (deleted products)
    const validItems = updatedCart.items.filter(item => item.product_id !== null)
    
    const total = validItems.reduce((sum, item) => {
        return sum + (parseFloat(item.product_id.price) * item.quantity)
    }, 0)

    // Helper: Get first image from product
    const getFirstImage = (product) => {
        if (Array.isArray(product.images) && product.images.length > 0) {
            const img = product.images[0]
            if (typeof img === 'object') return img.image_url || img.url || ''
            if (typeof img === 'string') return img
        }
        return ''
    }

    console.log('✅ Cart updated successfully')

    res.status(201).json({
        message: 'Thêm vào giỏ hàng thành công',
        cart: {
            items: validItems.map(item => ({
                product_id: item.product_id._id,
                product_name: item.product_id.product_name,
                price: parseFloat(item.product_id.price),
                quantity: item.quantity,
                image: getFirstImage(item.product_id),
                category: item.product_id.category_id?.category_name || 'Chưa phân loại',
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
        throw new Error(`Số lượng trong kho không đủ. Chỉ còn ${product.stock_quantity} sản phẩm`)
    }

    cart.items[itemIndex].quantity = quantity
    await cart.save()

    const updatedCart = await Cart.findById(cart._id).populate({
        path: 'items.product_id',
        select: 'product_name price images category_id',
        populate: { path: 'category_id', select: 'category_name' },
    })

    const validItems = updatedCart.items.filter(item => item.product_id !== null)

    const total = validItems.reduce((sum, item) => {
        return sum + (parseFloat(item.product_id.price) * item.quantity)
    }, 0)

    // Helper: Get first image
    const getFirstImage = (product) => {
        if (Array.isArray(product.images) && product.images.length > 0) {
            const img = product.images[0]
            if (typeof img === 'object') return img.image_url || img.url || ''
            if (typeof img === 'string') return img
        }
        return ''
    }

    res.json({
        message: 'Cập nhật giỏ hàng thành công',
        cart: {
            items: validItems.map(item => ({
                product_id: item.product_id._id,
                product_name: item.product_id.product_name,
                price: parseFloat(item.product_id.price),
                quantity: item.quantity,
                image: getFirstImage(item.product_id),
                category: item.product_id.category_id?.category_name || 'Chưa phân loại',
            })),
            total: parseFloat(total),
        },
    })
})

// @desc    Xóa sản phẩm khỏi giỏ hàng
// @route   DELETE /api/client/cart/:product_id
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

    const validItems = updatedCart ? updatedCart.items.filter(item => item.product_id !== null) : []

    const total = validItems.reduce((sum, item) => {
        return sum + (parseFloat(item.product_id.price) * item.quantity)
    }, 0)

    // Helper: Get first image
    const getFirstImage = (product) => {
        if (Array.isArray(product.images) && product.images.length > 0) {
            const img = product.images[0]
            if (typeof img === 'object') return img.image_url || img.url || ''
            if (typeof img === 'string') return img
        }
        return ''
    }

    res.json({
        message: 'Xóa sản phẩm khỏi giỏ hàng thành công',
        cart: {
            items: validItems.map(item => ({
                product_id: item.product_id._id,
                product_name: item.product_id.product_name,
                price: parseFloat(item.product_id.price),
                quantity: item.quantity,
                image: getFirstImage(item.product_id),
                category: item.product_id.category_id?.category_name || 'Chưa phân loại',
            })),
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