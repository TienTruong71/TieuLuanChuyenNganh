import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { createOrder } from '../actions/orderActions'
import { getCart } from '../actions/cartActions'
import axios from 'axios'
import { ORDER_CREATE_RESET } from '../constants/cartOrderConstants'
import '../styles/checkout.css'

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
  const [processingVNPay, setProcessingVNPay] = useState(false)

  // ✅ Phân loại sản phẩm trong giỏ hàng
  const cartAnalysis = useMemo(() => {
    const vehicles = cartItems.filter(item =>
      item.type === 'vehicle' ||
      item.category?.toLowerCase().includes('xe') ||
      item.category?.toLowerCase().includes('ô tô') ||
      item.category?.toLowerCase().includes('sedan') ||
      item.category?.toLowerCase().includes('suv')
    )

    const accessories = cartItems.filter(item =>
      item.type !== 'vehicle' &&
      !item.category?.toLowerCase().includes('xe') &&
      !item.category?.toLowerCase().includes('ô tô')
    )

    const hasVehicles = vehicles.length > 0
    const hasAccessories = accessories.length > 0
    const isOnlyVehicles = hasVehicles && !hasAccessories
    const isOnlyAccessories = hasAccessories && !hasVehicles
    const isMixed = hasVehicles && hasAccessories

    // Tính tiền
    const vehicleTotal = vehicles.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const accessoryTotal = accessories.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    // Tiền cọc xe (20%)
    const depositRate = 0.2
    const vehicleDeposit = Math.round(vehicleTotal * depositRate)

    return {
      vehicles,
      accessories,
      hasVehicles,
      hasAccessories,
      isOnlyVehicles,
      isOnlyAccessories,
      isMixed,
      vehicleTotal,
      accessoryTotal,
      vehicleDeposit,
      depositRate,
      // Tổng tiền cần thanh toán
      totalPayable: isMixed
        ? vehicleDeposit + accessoryTotal
        : isOnlyVehicles
          ? vehicleDeposit
          : accessoryTotal
    }
  }, [cartItems])

  useEffect(() => {
    dispatch({ type: ORDER_CREATE_RESET })
  }, [dispatch])

  useEffect(() => {
    if (success) return

    if (!userInfo) {
      history.push('/login')
    } else if (cartItems.length === 0) {
      history.push('/cart')
    } else {
      dispatch(getCart())
    }
  }, [dispatch, history, userInfo, cartItems.length, success])

  const payAttempted = useRef(false)
  const paymentAmountRef = useRef(0)

  useEffect(() => {
    if (success && order) {
      if (!payAttempted.current) {
        payAttempted.current = true
        if (paymentMethod === 'e_wallet') {
          handleVNPayPayment(order.order._id, paymentAmountRef.current)
        } else {
          alert('Đặt hàng thành công!')
          history.push(`/orders/${order.order._id}`)
        }
      }
    }
  }, [success, order, history, paymentMethod])

  // Xử lý thanh toán VNPay
  const handleVNPayPayment = async (orderId, amount) => {
    try {
      setProcessingVNPay(true)

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      }

      if (!amount || amount < 5000) {
        console.warn('Invalid amount:', amount, 'Using fallback logic or alerting.')
      }

      const { data } = await axios.post(
        '/api/payments/vnpay',
        { order_id: orderId, amount: Math.floor(amount) },
        config
      )

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('Không nhận được URL thanh toán')
      }
    } catch (error) {
      console.error('VNPay Error:', error)
      alert(error.response?.data?.message || 'Lỗi khi tạo thanh toán VNPay')
      setProcessingVNPay(false)
    }
  }

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

    // Save payment amount to Ref before dispatching (persists even if cart clears)
    paymentAmountRef.current = cartAnalysis.totalPayable

    // Chuẩn bị data order
    const orderData = {
      items: cartItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        type: item.type || 'product',
      })),
      total_amount: total,
      payment_amount: cartAnalysis.totalPayable, // Số tiền thực thanh toán
      payment_method: paymentMethod,
      shipping_address: shippingAddress,
      phone: phone,
      note: note,
      has_vehicle: cartAnalysis.hasVehicles,
      vehicle_deposit: cartAnalysis.vehicleDeposit,
    }

    dispatch(createOrder(orderData))
  }

  return (
    <main className='page-main'>
      <div className='checkout-container'>
        <h1 className='checkout-title'>Thanh Toán</h1>

        {(loading || processingVNPay) && (
          <div className='loading-overlay'>
            <div className='loading-spinner'></div>
            <p>
              {processingVNPay
                ? 'Đang chuyển đến VNPay...'
                : 'Đang xử lý đơn hàng...'}
            </p>
          </div>
        )}

        {error && <div className='error-message'>{error}</div>}

        {/* ✅ Thông báo về loại đơn hàng */}
        {cartAnalysis.hasVehicles && (
          <div className='order-type-notice'>
            <div className='notice-icon'>
              <span role='img' aria-label='car'>🚗</span>
            </div>
            <div className='notice-content'>
              <h3>Đơn hàng có xe ô tô</h3>
              <p>
                Với các sản phẩm là xe ô tô, bạn chỉ cần đặt cọc <strong>{cartAnalysis.depositRate * 100}%</strong> giá trị xe.
                Số tiền còn lại sẽ thanh toán khi nhận xe.
              </p>
              {cartAnalysis.isMixed && (
                <p>Phụ kiện/linh kiện sẽ được thanh toán đầy đủ.</p>
              )}
            </div>
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
                  <label htmlFor='address'>
                    {cartAnalysis.hasVehicles ? 'Địa chỉ nhận xe / giao hàng *' : 'Địa chỉ giao hàng *'}
                  </label>
                  <textarea
                    id='address'
                    placeholder='Nhập địa chỉ chi tiết'
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
                  {/* COD - Chỉ hiện khi KHÔNG có xe hoặc có cả 2 */}
                  {!cartAnalysis.isOnlyVehicles && (
                    <label className='payment-option'>
                      <input
                        type='radio'
                        name='payment'
                        value='cash'
                        checked={paymentMethod === 'cash'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className='option-content'>
                        <span className='option-icon' role='img' aria-label='cash'>💵</span>
                        <div>
                          <strong>Thanh toán khi nhận hàng (COD)</strong>
                          <p>
                            {cartAnalysis.isMixed
                              ? 'Áp dụng cho phụ kiện/linh kiện. Xe cần đặt cọc trước.'
                              : 'Thanh toán bằng tiền mặt khi nhận hàng'}
                          </p>
                        </div>
                      </div>
                    </label>
                  )}

                  {/* VNPay */}
                  <label className='payment-option vnpay-option'>
                    <input
                      type='radio'
                      name='payment'
                      value='e_wallet'
                      checked={paymentMethod === 'e_wallet'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className='option-content'>
                      <span className='option-icon vnpay-logo'>
                        <img
                          src='https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png'
                          alt='VNPay'
                          style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                        />
                      </span>
                      <div>
                        <strong>Thanh toán VNPay</strong>
                        <p>
                          {cartAnalysis.hasVehicles
                            ? `Đặt cọc ${cartAnalysis.depositRate * 100}% qua VNPay`
                            : 'Quét mã QR hoặc thanh toán qua ứng dụng ngân hàng'}
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Chuyển khoản - Chỉ hiện khi có xe */}
                  {cartAnalysis.hasVehicles && (
                    <label className='payment-option'>
                      <input
                        type='radio'
                        name='payment'
                        value='bank_transfer'
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className='option-content'>
                        <span className='option-icon' role='img' aria-label='bank'>🏦</span>
                        <div>
                          <strong>Chuyển khoản ngân hàng</strong>
                          <p>Chuyển khoản đặt cọc {cartAnalysis.depositRate * 100}% giá trị xe</p>
                        </div>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              <button
                type='submit'
                className='btn-submit-order'
                disabled={loading || processingVNPay || cartItems.length === 0}
              >
                {loading || processingVNPay
                  ? 'Đang xử lý...'
                  : cartAnalysis.hasVehicles
                    ? `Đặt Cọc ${cartAnalysis.totalPayable.toLocaleString('vi-VN')}₫`
                    : paymentMethod === 'e_wallet'
                      ? 'Thanh Toán với VNPay'
                      : 'Đặt Hàng'}
              </button>
            </form>
          </div>

          {/* Right: Order Summary */}
          <div className='order-summary'>
            <h2>Đơn Hàng Của Bạn</h2>

            {/* Xe ô tô */}
            {cartAnalysis.vehicles.length > 0 && (
              <div className='summary-section'>
                <h3 className='section-title'>
                  <span role='img' aria-label='car'>🚗</span> Xe ô tô
                </h3>
                <div className='summary-items'>
                  {cartAnalysis.vehicles.map((item) => (
                    <div key={item.product_id} className='summary-item'>
                      <div className='item-info'>
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
                <div className='summary-row vehicle-deposit'>
                  <span>Tiền cọc ({cartAnalysis.depositRate * 100}%):</span>
                  <span className='deposit-amount'>
                    {cartAnalysis.vehicleDeposit.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>
            )}

            {/* Phụ kiện / Linh kiện */}
            {cartAnalysis.accessories.length > 0 && (
              <div className='summary-section'>
                <h3 className='section-title'>
                  <span role='img' aria-label='parts'>🔧</span> Phụ kiện / Linh kiện
                </h3>
                <div className='summary-items'>
                  {cartAnalysis.accessories.map((item) => (
                    <div key={item.product_id} className='summary-item'>
                      <div className='item-info'>
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
                <div className='summary-row'>
                  <span>Thành tiền:</span>
                  <span>{cartAnalysis.accessoryTotal.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>
            )}

            <div className='summary-divider'></div>

            <div className='summary-totals'>
              {cartAnalysis.hasVehicles && (
                <>
                  <div className='summary-row'>
                    <span>Tổng giá trị xe:</span>
                    <span>{cartAnalysis.vehicleTotal.toLocaleString('vi-VN')} ₫</span>
                  </div>
                  <div className='summary-row'>
                    <span>Tiền cọc xe ({cartAnalysis.depositRate * 100}%):</span>
                    <span>{cartAnalysis.vehicleDeposit.toLocaleString('vi-VN')} ₫</span>
                  </div>
                </>
              )}

              {cartAnalysis.hasAccessories && (
                <div className='summary-row'>
                  <span>Phụ kiện/Linh kiện:</span>
                  <span>{cartAnalysis.accessoryTotal.toLocaleString('vi-VN')} ₫</span>
                </div>
              )}

              <div className='summary-row'>
                <span>Phí vận chuyển:</span>
                <span className='free'>Miễn phí</span>
              </div>

              <div className='summary-divider'></div>

              <div className='summary-row total'>
                <span>
                  {cartAnalysis.hasVehicles ? 'Tổng thanh toán hôm nay:' : 'Tổng cộng:'}
                </span>
                <span className='total-amount'>
                  {cartAnalysis.totalPayable.toLocaleString('vi-VN')} ₫
                </span>
              </div>

              {cartAnalysis.hasVehicles && (
                <div className='summary-row remaining'>
                  <span>Còn lại (thanh toán khi nhận xe):</span>
                  <span className='remaining-amount'>
                    {(cartAnalysis.vehicleTotal - cartAnalysis.vehicleDeposit).toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              )}
            </div>

            <div className='summary-notes'>
              {cartAnalysis.hasVehicles ? (
                <>
                  <p>✔ Đặt cọc {cartAnalysis.depositRate * 100}% để giữ xe</p>
                  <p>✔ Thanh toán phần còn lại khi nhận xe</p>
                  <p>✔ Hỗ trợ đổi trả trong 7 ngày</p>
                </>
              ) : (
                <>
                  <p>✔ Miễn phí vận chuyển toàn quốc</p>
                  <p>✔ Hỗ trợ đổi trả trong 7 ngày</p>
                  <p>✔ Bảo hành chính hãng</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default CheckoutScreen