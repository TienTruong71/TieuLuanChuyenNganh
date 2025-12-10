import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, Link } from 'react-router-dom'
import { getCart, updateCartItem, removeFromCart } from '../actions/cartActions'

const CartScreen = () => {
  const history = useHistory()
  const dispatch = useDispatch()

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  const cart = useSelector((state) => state.cart)
  const { cartItems, loading, error, total } = cart

  useEffect(() => {
    if (!userInfo) {
      history.push('/login')
    } else {
      dispatch(getCart())
    }
  }, [dispatch, history, userInfo])

  // ✅ Helper: Convert object {0:'h', 1:'t'...} thành string
  const convertBrokenObjectToString = (obj) => {
    if (typeof obj !== 'object' || obj === null) return null
    if (!obj.hasOwnProperty('0') || !obj.hasOwnProperty('1')) return null
    
    const charKeys = Object.keys(obj)
      .filter(key => !isNaN(parseInt(key)))
      .sort((a, b) => parseInt(a) - parseInt(b))
    
    const reconstructedUrl = charKeys.map(key => obj[key]).join('')
    
    if (reconstructedUrl.startsWith('http')) {
      return reconstructedUrl
    }
    return null
  }

  // ✅ Helper: Get image URL from item
  const getItemImage = (item) => {
    // Check images array first
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      const firstImage = item.images[0]
      
      if (typeof firstImage === 'string' && firstImage.trim()) {
        return firstImage
      }
      
      if (typeof firstImage === 'object' && firstImage !== null) {
        if (firstImage.image_url) return firstImage.image_url
        if (firstImage.url) return firstImage.url
        
        // Fix broken object
        const reconstructed = convertBrokenObjectToString(firstImage)
        if (reconstructed) return reconstructed
      }
    }
    
    // Check single image field
    if (item.image) {
      if (typeof item.image === 'string' && item.image.trim()) {
        return item.image
      }
      
      if (typeof item.image === 'object') {
        const reconstructed = convertBrokenObjectToString(item.image)
        if (reconstructed) return reconstructed
      }
    }
    
    return null
  }

  // ✅ Helper: Get final image URL with localhost prefix if needed
  const getImageUrl = (item) => {
    const rawImage = getItemImage(item)
    
    if (!rawImage) return null
    
    if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) {
      return rawImage
    }
    
    return `http://localhost:5000${rawImage}`
  }

  const updateQuantityHandler = async (product_id, newQuantity) => {
    if (newQuantity < 1) return
    try {
      await dispatch(updateCartItem(product_id, newQuantity))
    } catch (error) {
      alert('Không thể cập nhật số lượng')
    }
  }

  const removeHandler = async (product_id) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      try {
        await dispatch(removeFromCart(product_id))
      } catch (error) {
        alert('Không thể xóa sản phẩm')
      }
    }
  }

  const checkoutHandler = () => {
    history.push('/checkout')
  }

  const continueShopping = () => {
    history.push('/product')
  }

  return (
    <main className='page-main'>
      <div className='cart-container'>
        <h1 className='cart-title'>Giỏ Hàng Của Bạn</h1>

        {loading ? (
          <div className='loading-container'>
            <div className='loading-spinner'></div>
            <p>Đang tải giỏ hàng...</p>
          </div>
        ) : error ? (
          <div className='error-container'>
            <p className='error-message'>{error}</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className='empty-cart'>
            <div className='empty-icon'>
              <span role='img' aria-label='cart'>🛒</span>
            </div>
            <h2>Giỏ hàng trống</h2>
            <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <button onClick={continueShopping} className='btn-continue-shopping'>
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className='cart-content'>
            {/* Cart Items */}
            <div className='cart-items'>
              {cartItems.map((item) => {
                // 🔍 DEBUG
                console.log('🛒 Cart item:', item)
                console.log('🛒 item.image:', item.image)
                console.log('🛒 item.images:', item.images)
                
                const imageUrl = getImageUrl(item)
                console.log('🛒 Final imageUrl:', imageUrl)
                
                return (
                  <div key={item.product_id} className='cart-item'>
                    <div className='item-image'>
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.product_name}
                          onError={(e) => {
                            e.target.style.display = 'none'
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = 'flex'
                            }
                          }}
                        />
                      ) : null}
                      <div
                        style={{
                          display: imageUrl ? 'none' : 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100px',
                          height: '100px',
                          background: '#f0f0f0',
                          fontSize: '32px',
                        }}
                      >
                        <span role='img' aria-label='product'>🚗</span>
                      </div>
                    </div>

                    <div className='item-details'>
                      <h3 className='item-name'>
                        <Link to={`/product/${item.product_id}`}>
                          {item.product_name}
                        </Link>
                      </h3>
                      <p className='item-category'>{item.category}</p>
                      <p className='item-price'>
                        {item.price.toLocaleString('vi-VN')} ₫
                      </p>
                    </div>

                    <div className='item-quantity'>
                      <button
                        className='qty-btn'
                        onClick={() =>
                          updateQuantityHandler(item.product_id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <input
                        type='number'
                        className='qty-input'
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1
                          updateQuantityHandler(item.product_id, val)
                        }}
                        min='1'
                      />
                      <button
                        className='qty-btn'
                        onClick={() =>
                          updateQuantityHandler(item.product_id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>

                    <div className='item-subtotal'>
                      <p className='subtotal-label'>Tạm tính:</p>
                      <p className='subtotal-price'>
                        {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                      </p>
                    </div>

                    <button
                      className='btn-remove'
                      onClick={() => removeHandler(item.product_id)}
                      aria-label='Xóa sản phẩm'
                    >
                      <span role='img' aria-label='delete'>🗑️</span>
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Cart Summary */}
            <div className='cart-summary'>
              <h2>Tổng Đơn Hàng</h2>

              <div className='summary-row'>
                <span>Số sản phẩm:</span>
                <span>
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              </div>

              <div className='summary-row'>
                <span>Tạm tính:</span>
                <span>{(total || 0).toLocaleString('vi-VN')} ₫</span>
              </div>

              <div className='summary-row'>
                <span>Phí vận chuyển:</span>
                <span className='free'>Miễn phí</span>
              </div>

              <div className='summary-divider'></div>

              <div className='summary-row total'>
                <span>Tổng cộng:</span>
                <span className='total-price'>
                  {(total || 0).toLocaleString('vi-VN')} ₫
                </span>
              </div>

              <button
                className='btn-checkout'
                onClick={checkoutHandler}
                disabled={cartItems.length === 0}
              >
                Tiến Hành Thanh Toán
              </button>

              <button className='btn-continue' onClick={continueShopping}>
                Tiếp Tục Mua Sắm
              </button>

              <div className='payment-methods'>
                <p>Chấp nhận thanh toán:</p>
                <div className='payment-icons'>
                  <span role='img' aria-label='card'>💳</span>
                  <span role='img' aria-label='bank'>🏦</span>
                  <span role='img' aria-label='cash'>💵</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default CartScreen