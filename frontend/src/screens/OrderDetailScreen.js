import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams, Link } from 'react-router-dom'
import { getOrderDetails, cancelOrder } from '../actions/orderActions'

const OrderDetailScreen = () => {
  const { id } = useParams()
  const history = useHistory()
  const dispatch = useDispatch()

  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  const orderDetails = useSelector((state) => state.orderDetails)
  const { loading, error, order } = orderDetails

  const orderCancel = useSelector((state) => state.orderCancel)
  const { loading: loadingCancel, success: successCancel } = orderCancel

  useEffect(() => {
    if (!userInfo) {
      history.push('/login')
    } else {
      dispatch(getOrderDetails(id))
    }
  }, [dispatch, history, userInfo, id])

  useEffect(() => {
    if (successCancel) {
      alert('Đơn hàng đã được hủy thành công')
      dispatch(getOrderDetails(id))
      setShowCancelConfirm(false)
    }
  }, [successCancel, dispatch, id])

  const handleCancelOrder = () => {
    dispatch(cancelOrder(id))
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Chờ xử lý', class: 'status-pending', icon: '⏳' },
      processing: { label: 'Đang xử lý', class: 'status-processing', icon: '🔄' },
      shipped: { label: 'Đang giao', class: 'status-shipped', icon: '🚚' },
      delivered: { label: 'Đã giao', class: 'status-delivered', icon: '✅' },
      cancelled: { label: 'Đã hủy', class: 'status-cancelled', icon: '❌' },
    }

    const config = statusConfig[status] || { label: status, class: 'status-default', icon: '📦' }

    return (
      <span className={`status-badge ${config.class}`}>
        <span className='status-icon'>{config.icon}</span>
        {config.label}
      </span>
    )
  }

  const getPaymentMethodLabel = (method) => {
    const methods = {
      cash: '💵 Thanh toán khi nhận hàng (COD)',
      card: '💳 Thẻ tín dụng/ghi nợ',
      bank_transfer: '🏦 Chuyển khoản ngân hàng',
      e_wallet: '📱 Ví điện tử (VNPay)',
    }
    return methods[method] || method
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPrice = (price) => {
    if (typeof price === 'object' && price.$numberDecimal) {
      return parseFloat(price.$numberDecimal).toLocaleString('vi-VN')
    }
    return parseFloat(price || 0).toLocaleString('vi-VN')
  }

  return (
    <main className='page-main'>
      <div className='order-detail-container'>
        {loading ? (
          <div className='loading-container'>
            <div className='loading-spinner'></div>
            <p>Đang tải thông tin đơn hàng...</p>
          </div>
        ) : error ? (
          <div className='error-container'>
            <div className='error-icon'>⚠️</div>
            <h2>Không thể tải đơn hàng</h2>
            <p className='error-message'>{error}</p>
            <Link to='/orders' className='btn-back'>
              Quay lại danh sách đơn hàng
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className='order-detail-header'>
              <div className='header-left'>
                <button onClick={() => history.push('/orders')} className='btn-back-arrow'>
                  ← Quay lại
                </button>
                <div className='order-title'>
                  <h1>Chi Tiết Đơn Hàng</h1>
                  <p className='order-id'>Mã đơn: #{order._id?.slice(-8)}</p>
                </div>
              </div>
              <div className='header-right'>
                {getStatusBadge(order.status)}
              </div>
            </div>

            {/* Order Timeline */}
            <div className='order-timeline'>
              <div className='timeline-step'>
                <div className='step-icon completed'>✓</div>
                <div className='step-content'>
                  <h4>Đơn hàng đã đặt</h4>
                  <p>{formatDate(order.createdAt)}</p>
                </div>
              </div>
              <div className={`timeline-step ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
                <div className='step-icon'>🔄</div>
                <div className='step-content'>
                  <h4>Đang xử lý</h4>
                  <p>{['processing', 'shipped', 'delivered'].includes(order.status) ? 'Đã xác nhận' : 'Chờ xác nhận'}</p>
                </div>
              </div>
              <div className={`timeline-step ${['shipped', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
                <div className='step-icon'>🚚</div>
                <div className='step-content'>
                  <h4>Đang giao hàng</h4>
                  <p>{['shipped', 'delivered'].includes(order.status) ? 'Đang vận chuyển' : 'Chờ giao hàng'}</p>
                </div>
              </div>
              <div className={`timeline-step ${order.status === 'delivered' ? 'completed' : ''}`}>
                <div className='step-icon'>✅</div>
                <div className='step-content'>
                  <h4>Đã giao</h4>
                  <p>{order.status === 'delivered' ? 'Hoàn thành' : 'Chưa giao'}</p>
                </div>
              </div>
            </div>

            <div className='order-detail-content'>
              {/* Order Items */}
              <div className='order-items-section'>
                <h2>Sản Phẩm Đã Đặt</h2>
                <div className='items-list'>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => {
                      const getProductImage = () => {
                        const product = item.product_id;
                        if (!product || !product.images || product.images.length === 0) {
                          return null;
                        }

                        // images là array of strings
                        const imageUrl = product.images[0];
                        
                        // Nếu là full URL thì dùng trực tiếp
                        if (imageUrl.startsWith('http')) {
                          return imageUrl;
                        }
                        
                        // Nếu là relative path thì thêm base URL
                        return `http://localhost:5000${imageUrl}`;
                      };

                      const imageUrl = getProductImage();

                      // ✅ Tính giá đúng - xử lý cả Decimal128 và Number
                      const calculatePrice = (priceValue) => {
                        if (typeof priceValue === 'object' && priceValue.$numberDecimal) {
                          return parseFloat(priceValue.$numberDecimal);
                        }
                        return parseFloat(priceValue || 0);
                      };

                      const itemPrice = calculatePrice(item.price);
                      const subtotal = itemPrice * item.quantity;

                      // ✅ LOG để debug
                      console.log('📦 Item:', {
                        name: item.product_id?.product_name,
                        price: item.price,
                        parsedPrice: itemPrice,
                        quantity: item.quantity,
                        subtotal: subtotal,
                        imageUrl: imageUrl,
                        rawImages: item.product_id?.images
                      });

                      return (
                        <div key={index} className='order-item-detail'>
                          {/* IMAGE */}
                          <div className='item-image'>
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={item.product_id?.product_name || 'Product'}
                                onError={(e) => {
                                  console.error('❌ Image failed to load:', imageUrl);
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
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
                                fontSize: '40px',
                                borderRadius: '8px',
                              }}
                            >
                              🏍️
                            </div>
                          </div>

                          {/* PRODUCT INFO */}
                          <div className='item-info'>
                            <h3>{item.product_id?.product_name || 'Sản phẩm'}</h3>
                            <p className='item-category'>
                              {item.product_id?.category_id?.category_name || 'Chưa phân loại'}
                            </p>
                            <div className='item-price-qty'>
                              <span className='qty'>Số lượng: {item.quantity}</span>
                              <span className='price'>{itemPrice.toLocaleString('vi-VN')} ₫</span>
                            </div>
                          </div>

                          {/* SUBTOTAL */}
                          <div className='item-subtotal'>
                            <p>Thành tiền:</p>
                            <p className='subtotal-price'>
                              {subtotal.toLocaleString('vi-VN')} ₫
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className='no-items'>Không có sản phẩm trong đơn hàng</p>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className='order-summary-section'>
                {/* Payment Method */}
                <div className='info-card'>
                  <h3>Phương Thức Thanh Toán</h3>
                  <p className='payment-method'>{getPaymentMethodLabel(order.payment_method)}</p>
                </div>

                {/* Order Total */}
                <div className='info-card'>
                  <h3>Tổng Đơn Hàng</h3>
                  <div className='summary-rows'>
                    <div className='summary-row'>
                      <span>Tạm tính:</span>
                      <span>{formatPrice(order.total_amount)} ₫</span>
                    </div>
                    <div className='summary-row'>
                      <span>Phí vận chuyển:</span>
                      <span className='free'>Miễn phí</span>
                    </div>
                    <div className='summary-divider'></div>
                    <div className='summary-row total'>
                      <span>Tổng cộng:</span>
                      <span className='total-price'>
                        {formatPrice(order.total_amount)} ₫
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {order.status === 'pending' && (
                  <div className='action-buttons'>
                    <button
                      className='btn-cancel'
                      onClick={() => setShowCancelConfirm(true)}
                      disabled={loadingCancel}
                    >
                      {loadingCancel ? 'Đang hủy...' : 'Hủy Đơn Hàng'}
                    </button>
                  </div>
                )}

                {order.status === 'delivered' && (
                  <div className='action-buttons'>
                    <Link to='/product' className='btn-reorder'>
                      Mua Lại
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Cancel Confirmation Modal */}
            {showCancelConfirm && (
              <div className='modal-overlay' onClick={() => setShowCancelConfirm(false)}>
                <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                  <h3>Xác nhận hủy đơn hàng</h3>
                  <p>Bạn có chắc chắn muốn hủy đơn hàng này?</p>
                  <div className='modal-buttons'>
                    <button
                      className='btn-confirm-cancel'
                      onClick={handleCancelOrder}
                      disabled={loadingCancel}
                    >
                      {loadingCancel ? 'Đang hủy...' : 'Xác nhận hủy'}
                    </button>
                    <button
                      className='btn-close-modal'
                      onClick={() => setShowCancelConfirm(false)}
                      disabled={loadingCancel}
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

export default OrderDetailScreen