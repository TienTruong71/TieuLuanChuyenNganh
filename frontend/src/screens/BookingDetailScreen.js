import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams, Link } from 'react-router-dom'
import { getBookingDetails, cancelBooking } from '../actions/bookingActions'
import { BOOKING_CANCEL_RESET } from '../constants/bookingConstants'

const BookingDetailScreen = () => {
  const { id } = useParams()
  const history = useHistory()
  const dispatch = useDispatch()

  const [showCancelModal, setShowCancelModal] = useState(false)

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  const bookingDetails = useSelector((state) => state.bookingDetails)
  const { loading, error, booking } = bookingDetails

  const bookingCancel = useSelector((state) => state.bookingCancel)
  const { loading: loadingCancel, success: successCancel } = bookingCancel

  useEffect(() => {
    if (!userInfo) {
      history.push('/login')
    } else {
      dispatch(getBookingDetails(id))
    }
  }, [dispatch, history, userInfo, id])

  useEffect(() => {
    if (successCancel) {
      alert('Hủy lịch thành công')
      dispatch({ type: BOOKING_CANCEL_RESET })
      setShowCancelModal(false)
      dispatch(getBookingDetails(id))
    }
  }, [successCancel, dispatch, id])

  const handleCancelBooking = () => {
    dispatch(cancelBooking(id))
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Chờ xác nhận', class: 'status-pending', icon: '⏳' },
      confirmed: { label: 'Đã xác nhận', class: 'status-confirmed', icon: '✓' },
      in_progress: { label: 'Đang thực hiện', class: 'status-progress', icon: '🔧' },
      completed: { label: 'Hoàn thành', class: 'status-completed', icon: '✅' },
      cancelled: { label: 'Đã hủy', class: 'status-cancelled', icon: '❌' },
    }
    const config = statusConfig[status] || { label: status, class: 'status-default', icon: '📋' }
    return (
      <span className={`status-badge ${config.class}`}>
        <span className='status-icon'>{config.icon}</span>
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('vi-VN', {
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
      <div className='booking-detail-container'>
        {loading ? (
          <div className='loading-container'>
            <div className='loading-spinner'></div>
            <p>Đang tải thông tin lịch hẹn...</p>
          </div>
        ) : error ? (
          <div className='error-container'>
            <div className='error-icon'>⚠️</div>
            <h2>Không thể tải thông tin lịch hẹn</h2>
            <p className='error-message'>{error}</p>
            <Link to='/my-bookings' className='btn-back'>
              Quay lại danh sách
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className='booking-detail-header'>
              <div className='header-left'>
                <button onClick={() => history.push('/my-bookings')} className='btn-back-arrow'>
                  ← Quay lại
                </button>
                <div className='booking-title'>
                  <h1>Chi tiết lịch hẹn</h1>
                  <p className='booking-id'>Mã: #{booking._id?.slice(-8)}</p>
                </div>
              </div>
              <div className='header-right'>
                {getStatusBadge(booking.status)}
              </div>
            </div>

            {/* Timeline */}
            <div className='booking-timeline'>
              <div className={`timeline-step ${['pending', 'confirmed', 'in_progress', 'completed'].includes(booking.status) ? 'completed' : ''}`}>
                <div className='step-icon'>📋</div>
                <div className='step-content'>
                  <h4>Đã đặt lịch</h4>
                  <p>{formatDateTime(booking.createdAt)}</p>
                </div>
              </div>
              <div className={`timeline-step ${['confirmed', 'in_progress', 'completed'].includes(booking.status) ? 'completed' : ''}`}>
                <div className='step-icon'>✓</div>
                <div className='step-content'>
                  <h4>Đã xác nhận</h4>
                  <p>{['confirmed', 'in_progress', 'completed'].includes(booking.status) ? 'Đã xác nhận' : 'Chờ xác nhận'}</p>
                </div>
              </div>
              <div className={`timeline-step ${['in_progress', 'completed'].includes(booking.status) ? 'completed' : ''}`}>
                <div className='step-icon'>🔧</div>
                <div className='step-content'>
                  <h4>Đang thực hiện</h4>
                  <p>{['in_progress', 'completed'].includes(booking.status) ? 'Đang làm' : 'Chưa bắt đầu'}</p>
                </div>
              </div>
              <div className={`timeline-step ${booking.status === 'completed' ? 'completed' : ''}`}>
                <div className='step-icon'>✅</div>
                <div className='step-content'>
                  <h4>Hoàn thành</h4>
                  <p>{booking.status === 'completed' ? 'Đã hoàn thành' : 'Chưa hoàn thành'}</p>
                </div>
              </div>
            </div>

            <div className='booking-detail-content'>
              {/* Service Info */}
              <div className='detail-section'>
                <div className='info-card'>
                  <h2>Thông tin dịch vụ</h2>
                  <div className='info-grid'>
                    <div className='info-item'>
                      <i className='fas fa-wrench'></i>
                      <div>
                        <span className='label'>Dịch vụ</span>
                        <span className='value'>{booking.service_id?.service_name || 'N/A'}</span>
                      </div>
                    </div>
                    <div className='info-item'>
                      <i className='fas fa-align-left'></i>
                      <div>
                        <span className='label'>Mô tả</span>
                        <span className='value'>{booking.service_id?.description || 'Không có mô tả'}</span>
                      </div>
                    </div>
                    <div className='info-item'>
                      <i className='fas fa-hourglass-half'></i>
                      <div>
                        <span className='label'>Thời gian thực hiện</span>
                        <span className='value'>{booking.service_id?.duration || 'N/A'}</span>
                      </div>
                    </div>
                    <div className='info-item'>
                      <i className='fas fa-money-bill-wave'></i>
                      <div>
                        <span className='label'>Chi phí dịch vụ</span>
                        <span className='value price'>{formatPrice(booking.service_id?.price)}đ</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Info */}
                <div className='info-card'>
                  <h2>Thông tin lịch hẹn</h2>
                  <div className='info-grid'>
                    <div className='info-item'>
                      <i className='fas fa-calendar-alt'></i>
                      <div>
                        <span className='label'>Ngày hẹn</span>
                        <span className='value'>{formatDate(booking.booking_date)}</span>
                      </div>
                    </div>
                    <div className='info-item'>
                      <i className='fas fa-clock'></i>
                      <div>
                        <span className='label'>Khung giờ</span>
                        <span className='value'>{booking.time_slot}</span>
                      </div>
                    </div>
                    <div className='info-item'>
                      <i className='fas fa-info-circle'></i>
                      <div>
                        <span className='label'>Trạng thái</span>
                        <span className='value'>{getStatusBadge(booking.status)}</span>
                      </div>
                    </div>
                    <div className='info-item'>
                      <i className='fas fa-calendar-check'></i>
                      <div>
                        <span className='label'>Ngày đặt</span>
                        <span className='value'>{formatDateTime(booking.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Sidebar */}
              <div className='summary-sidebar'>
                <div className='info-card'>
                  <h3>Tóm tắt</h3>
                  <div className='summary-rows'>
                    <div className='summary-row'>
                      <span>Chi phí dịch vụ:</span>
                      <span>{formatPrice(booking.service_id?.price)}đ</span>
                    </div>
                    <div className='summary-divider'></div>
                    <div className='summary-row total'>
                      <span>Tổng cộng:</span>
                      <span className='total-price'>{formatPrice(booking.service_id?.price)}đ</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {booking.status === 'pending' && (
                  <div className='action-buttons'>
                    <button
                      className='btn-cancel-booking'
                      onClick={() => setShowCancelModal(true)}
                      disabled={loadingCancel}
                    >
                      {loadingCancel ? 'Đang hủy...' : 'Hủy lịch hẹn'}
                    </button>
                  </div>
                )}

                {booking.status === 'completed' && (
                  <div className='action-buttons'>
                    <Link to='/services' className='btn-rebook'>
                      Đặt lại dịch vụ
                    </Link>
                  </div>
                )}

                {/* Important Notes */}
                <div className='info-card notes-card'>
                  <h4>Lưu ý quan trọng</h4>
                  <ul className='notes-list'>
                    <li>Vui lòng đến đúng giờ đã đặt</li>
                    <li>Chỉ có thể hủy lịch ở trạng thái "Chờ xác nhận"</li>
                    <li>Mang theo giấy tờ xe khi đến</li>
                    <li>Liên hệ hotline nếu cần hỗ trợ</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
              <div className='modal-overlay' onClick={() => setShowCancelModal(false)}>
                <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                  <h3>Xác nhận hủy lịch hẹn</h3>
                  <p>Bạn có chắc chắn muốn hủy lịch hẹn này?</p>
                  <div className='modal-buttons'>
                    <button
                      className='btn-confirm-cancel'
                      onClick={handleCancelBooking}
                      disabled={loadingCancel}
                    >
                      {loadingCancel ? 'Đang hủy...' : 'Xác nhận hủy'}
                    </button>
                    <button
                      className='btn-close-modal'
                      onClick={() => setShowCancelModal(false)}
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

export default BookingDetailScreen