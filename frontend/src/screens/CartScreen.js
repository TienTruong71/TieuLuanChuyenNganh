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
            <div className='empty-icon'>🛒</div>
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
              {cartItems.map((item) => (
                <div key={item.product_id} className='cart-item'>
                  <div className='item-image'>
                    <img
                      src={
                        item.image?.startsWith('http')
                          ? item.image
                          : item.image
                          ? `http://localhost:5000${item.image}`
                          : null
                      }
                      alt={item.product_name}
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                    <div
                      style={{
                        display: item.image ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100px',
                        height: '100px',
                        background: '#f0f0f0',
                        fontSize: '32px',
                      }}
                    >
                      🏍️
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
                  >
                    🗑️
                  </button>
                </div>
              ))}
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
                  <span>💳</span>
                  <span>🏦</span>
                  <span>💵</span>
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