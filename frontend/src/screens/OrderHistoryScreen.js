import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, Link } from 'react-router-dom'
import { listMyOrders, cancelOrder } from '../actions/orderActions'
import { ORDER_CANCEL_RESET } from '../constants/cartOrderConstants'
import '../styles/order.css'

const OrderHistoryScreen = () => {
  const history = useHistory()
  const dispatch = useDispatch()

  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState(null)

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  const orderListMy = useSelector((state) => state.orderListMy)
  const { loading, error, orders } = orderListMy

  const orderCancel = useSelector((state) => state.orderCancel)
  const { loading: loadingCancel, success: successCancel } = orderCancel

  useEffect(() => {
    if (!userInfo) {
      history.push('/login')
    } else {
      dispatch(listMyOrders())
    }
  }, [dispatch, history, userInfo])

  useEffect(() => {
    if (successCancel) {
      alert('Đơn hàng đã được hủy thành công')
      dispatch({ type: ORDER_CANCEL_RESET })
      dispatch(listMyOrders())
      setShowCancelConfirm(false)
      setSelectedOrderId(null)
    }
  }, [successCancel, dispatch])

  const openCancelModal = (orderId) => {
    setSelectedOrderId(orderId)
    setShowCancelConfirm(true)
  }

  const handleCancelOrder = () => {
    if (selectedOrderId) {
      dispatch(cancelOrder(selectedOrderId))
    }
  }

  const handleReorder = (order) => {
    try {
      // Chuyển trực tiếp sang trang Checkout với danh sách items.
      const directItems = order.items.map(item => {
        // Map từ structure của Order Item sang structure Cart Item mà CheckoutScreen cần
        const product = item.product_id || {}
        // Sử dụng giá hiện tại từ sản phẩm (nếu có populate) thay vì giá cũ trong order
        const currentPrice = product.price || item.price

        return {
          product_id: product._id || product.id || item.product_id,
          product_name: product.product_name || product.name || 'Sản phẩm',
          price: currentPrice,
          image: product.image || (product.images && product.images[0]),
          images: product.images,
          quantity: item.quantity,
          type: item.type || product.type || 'product',
          category: product.category || (product.category_id?.category_name || ''),
          stock_quantity: product.stock_quantity
        }
      })

      history.push({
        pathname: '/checkout',
        state: { directBuyItems: directItems }
      })
    } catch (error) {
      alert('Có lỗi khi xử lý mua lại: ' + (error.message || error))
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Chờ xử lý', class: 'status-pending' },
      processing: { label: 'Đang xử lý', class: 'status-processing' },
      shipped: { label: 'Đang giao', class: 'status-shipped' },
      delivered: { label: 'Đã giao', class: 'status-delivered' },
      cancelled: { label: 'Đã hủy', class: 'status-cancelled' },
    }

    const config = statusConfig[status] || { label: status, class: 'status-default' }

    return <span className={`status-badge ${config.class}`}>{config.label}</span>
  }

  const getPaymentMethodLabel = (method) => {
    const methods = {
      cash: '💵 Tiền mặt',
      card: '💳 Thẻ',
      bank_transfer: '🏦 Chuyển khoản',
      e_wallet: '📱 Ví điện tử',
    }
    return methods[method] || method
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
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
      <div className='order-history-container'>
        <div className='order-history-header'>
          <h1>Lịch Sử Đơn Hàng</h1>
          <Link to='/product' className='btn-continue-shopping'>
            Tiếp tục mua sắm
          </Link>
        </div>

        {loading ? (
          <div className='loading-container'>
            <div className='loading-spinner'></div>
            <p>Đang tải đơn hàng...</p>
          </div>
        ) : error ? (
          <div className='error-container'>
            <p className='error-message'>{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className='empty-orders'>
            <div className='empty-icon'>📦</div>
            <h2>Chưa có đơn hàng nào</h2>
            <p>Bạn chưa đặt đơn hàng nào</p>
            <Link to='/product' className='btn-shop-now'>
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className='orders-list'>
            {orders.map((order) => (
              <div key={order._id} className='order-card'>
                <div className='order-header'>
                  <div className='order-info'>
                    <h3>Đơn hàng #{order._id.slice(-8)}</h3>
                    <span className='order-date'>
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div className='order-body'>
                  <div className='order-items'>
                    {order.items && order.items.length > 0 ? (
                      order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className='order-item'>
                          <div className='item-image'>
                            {item.product_id?.images?.[0]?.image_url ? (
                              <img
                                src={
                                  item.product_id.images[0].image_url.startsWith('http')
                                    ? item.product_id.images[0].image_url
                                    : `http://localhost:5000${item.product_id.images[0].image_url}`
                                }
                                alt={item.product_id?.product_name || 'Product'}
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                  e.target.nextSibling.style.display = 'flex'
                                }}
                              />
                            ) : null}
                            <div
                              style={{
                                display: item.product_id?.images?.[0]?.image_url ? 'none' : 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '60px',
                                height: '60px',
                                background: '#f0f0f0',
                                fontSize: '24px',
                                borderRadius: '8px',
                              }}
                            >
                              🏍️
                            </div>
                          </div>
                          <div className='item-info'>
                            <h4>{item.product_id?.product_name || item.product_id?.name || 'Sản phẩm'}</h4>
                            <p>Số lượng: {item.quantity}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className='no-items'>Không có sản phẩm</p>
                    )}
                    {order.items && order.items.length > 3 && (
                      <p className='more-items'>
                        +{order.items.length - 3} sản phẩm khác
                      </p>
                    )}
                  </div>

                  <div className='order-summary'>
                    <div className='summary-row'>
                      <span>Phương thức:</span>
                      <span>{getPaymentMethodLabel(order.payment_method)}</span>
                    </div>
                    <div className='summary-row total'>
                      <span>Tổng tiền:</span>
                      <span className='total-amount'>
                        {formatPrice(order.total_amount)} ₫
                      </span>
                    </div>
                  </div>
                </div>

                <div className='order-footer'>
                  <Link to={`/orders/${order._id}`} className='btn-view-detail'>
                    Xem chi tiết
                  </Link>
                  {order.status === 'pending' && (
                    <button
                      className='btn-cancel-order'
                      onClick={() => openCancelModal(order._id)}
                    >
                      Hủy đơn
                    </button>
                  )}
                  {order.status === 'delivered' && (
                    <button
                      className='btn-reorder'
                      onClick={() => handleReorder(order)}
                    >
                      Mua lại
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

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
      </div>
    </main>
  )
}

export default OrderHistoryScreen