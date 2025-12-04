import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { createOrder } from '../actions/orderActions'
import { getCart } from '../actions/cartActions'

const CheckoutScreen = () => {
  const history = useHistory()
  const dispatch = useDispatch()

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  const cart = useSelector((state) => state.cart)
  const { cartItems, total } = cart

  const orderCreate = useSelector((state) => state.orderCreate)
  const { loading, success, error, order } = orderCreate

  // Form state
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [shippingAddress, setShippingAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!userInfo) {
      history.push('/login')
    } else if (cartItems.length === 0) {
      history.push('/cart')
    } else {
      dispatch(getCart())
    }
  }, [dispatch, history, userInfo, cartItems.length])

  useEffect(() => {
    if (success && order) {
      alert('Đặt hàng thành công!')
      history.push(`/orders/${order.order._id}`)
    }
  }, [success, order, history])

  const submitHandler = (e) => {
    e.preventDefault()

    if (!shippingAddress.trim()) {
      alert('Vui lòng nhập địa chỉ giao hàng')
      return
    }

    if (!phone.trim()) {
      alert('Vui lòng nhập số điện thoại')
      return
    }

    // Chuẩn bị data order
    const orderData = {
      items: cartItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      })),
      total_amount: total,
      payment_method: paymentMethod,
      shipping_address: shippingAddress,
      phone: phone,
      note: note,
    }

    dispatch(createOrder(orderData))
  }

  return (
    <main className='page-main'>
      <div className='checkout-container'>
        <h1 className='checkout-title'>Thanh Toán</h1>

        {loading && (
          <div className='loading-overlay'>
            <div className='loading-spinner'></div>
            <p>Đang xử lý đơn hàng...</p>
          </div>
        )}

        {error && (
          <div className='error-message'>
            {error}
          </div>
        )}

        <div className='checkout-content'>
          {/* Left: Form */}
          <div className='checkout-form'>
            <form onSubmit={submitHandler}>
              {/* Thông tin người nhận */}
              <div className='form-section'>
                <h2>Thông Tin Người Nhận</h2>

                <div className='form-group'>
                  <label htmlFor='name'>Họ và tên</label>
                  <input
                    type='text'
                    id='name'
                    value={userInfo?.full_name || userInfo?.username || ''}
                    disabled
                  />
                </div>

                <div className='form-group'>
                  <label htmlFor='email'>Email</label>
                  <input
                    type='email'
                    id='email'
                    value={userInfo?.email || ''}
                    disabled
                  />
                </div>

                <div className='form-group'>
                  <label htmlFor='phone'>Số điện thoại *</label>
                  <input
                    type='tel'
                    id='phone'
                    placeholder='Nhập số điện thoại'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className='form-group'>
                  <label htmlFor='address'>Địa chỉ giao hàng *</label>
                  <textarea
                    id='address'
                    placeholder='Nhập địa chỉ chi tiết (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)'
                    rows='3'
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className='form-group'>
                  <label htmlFor='note'>Ghi chú (tùy chọn)</label>
                  <textarea
                    id='note'
                    placeholder='Ghi chú cho đơn hàng...'
                    rows='2'
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  ></textarea>
                </div>
              </div>

              {/* Phương thức thanh toán */}
              <div className='form-section'>
                <h2>Phương Thức Thanh Toán</h2>

                <div className='payment-options'>
                  <label className='payment-option'>
                    <input
                      type='radio'
                      name='payment'
                      value='cash'
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className='option-content'>
                      <span className='option-icon'>💵</span>
                      <div>
                        <strong>Thanh toán khi nhận hàng (COD)</strong>
                        <p>Thanh toán bằng tiền mặt khi nhận hàng</p>
                      </div>
                    </div>
                  </label>

                  <label className='payment-option'>
                    <input
                      type='radio'
                      name='payment'
                      value='bank_transfer'
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className='option-content'>
                      <span className='option-icon'>🏦</span>
                      <div>
                        <strong>Chuyển khoản ngân hàng</strong>
                        <p>Chuyển khoản qua tài khoản ngân hàng</p>
                      </div>
                    </div>
                  </label>

                  <label className='payment-option'>
                    <input
                      type='radio'
                      name='payment'
                      value='e_wallet'
                      checked={paymentMethod === 'e_wallet'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className='option-content'>
                      <span className='option-icon'>📱</span>
                      <div>
                        <strong>Ví điện tử (VNPay)</strong>
                        <p>Thanh toán qua ví điện tử VNPay</p>
                      </div>
                    </div>
                  </label>

                  <label className='payment-option'>
                    <input
                      type='radio'
                      name='payment'
                      value='card'
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className='option-content'>
                      <span className='option-icon'>💳</span>
                      <div>
                        <strong>Thẻ tín dụng/ghi nợ</strong>
                        <p>Thanh toán bằng thẻ Visa, Mastercard</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type='submit'
                className='btn-submit-order'
                disabled={loading || cartItems.length === 0}
              >
                {loading ? 'Đang xử lý...' : 'Đặt Hàng'}
              </button>
            </form>
          </div>

          {/* Right: Order Summary */}
          <div className='order-summary'>
            <h2>Đơn Hàng Của Bạn</h2>

            <div className='summary-items'>
              {cartItems.map((item) => (
                <div key={item.product_id} className='summary-item'>
                  <div className='item-info'>
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
                      }}
                    />
                    <div>
                      <h4>{item.product_name}</h4>
                      <p>Số lượng: {item.quantity}</p>
                    </div>
                  </div>
                  <div className='item-price'>
                    {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                  </div>
                </div>
              ))}
            </div>

            <div className='summary-divider'></div>

            <div className='summary-totals'>
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
                <span className='total-amount'>
                  {(total || 0).toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </div>

            <div className='summary-notes'>
              <p>✓ Miễn phí vận chuyển toàn quốc</p>
              <p>✓ Hỗ trợ đổi trả trong 7 ngày</p>
              <p>✓ Bảo hành chính hãng</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default CheckoutScreen