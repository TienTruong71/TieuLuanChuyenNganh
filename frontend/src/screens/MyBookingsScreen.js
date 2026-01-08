import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, Link } from 'react-router-dom'
import { listMyBookings, cancelBooking } from '../actions/bookingActions'
import { BOOKING_CANCEL_RESET } from '../constants/bookingConstants'
import '../styles/booking.css'

const MyBookingsScreen = () => {
  const history = useHistory()
  const dispatch = useDispatch()

  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  const bookingListMy = useSelector((state) => state.bookingListMy)
  const { loading, error, bookings, pagination } = bookingListMy

  const bookingCancel = useSelector((state) => state.bookingCancel)
  const { success: successCancel } = bookingCancel

  useEffect(() => {
    if (!userInfo) {
      history.push('/login')
    } else {
      dispatch(listMyBookings(currentPage, filterStatus))
    }
  }, [dispatch, history, userInfo, currentPage, filterStatus])

  useEffect(() => {
    if (successCancel) {
      alert('Hủy lịch thành công')
      dispatch({ type: BOOKING_CANCEL_RESET })
      dispatch(listMyBookings(currentPage, filterStatus))
    }
  }, [successCancel, dispatch, currentPage, filterStatus])

  const handleCancelBooking = (id) => {
    if (window.confirm('Bạn có chắc muốn hủy lịch này?')) {
      dispatch(cancelBooking(id))
    }
  }

  const handleFilterChange = (status) => {
    setFilterStatus(status)
    setCurrentPage(1)
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
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatPrice = (price) => {
    if (typeof price === 'object' && price.$numberDecimal) {
      return parseFloat(price.$numberDecimal).toLocaleString('vi-VN')
    }
    return parseFloat(price || 0).toLocaleString('vi-VN')
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // ✅ Helper: Lấy thông tin booking (service hoặc vehicle)
  const getBookingInfo = (booking) => {
    if (booking.booking_type === 'vehicle' && booking.product_id) {
      return {
        name: booking.product_id.product_name,
        type: 'vehicle',
        typeLabel: '🚗 Lái thử xe',
        duration: '30-45 phút',
        price: 'Miễn phí',
        isPaid: false,
      }
    }
    
    if (booking.service_id) {
      return {
        name: booking.service_id.service_name,
        type: 'service',
        typeLabel: '🔧 Dịch vụ',
        duration: booking.service_id.duration || 'N/A',
        price: formatPrice(booking.service_id.price) + 'đ',
        isPaid: true,
      }
    }

    return {
      name: 'Không rõ',
      type: 'unknown',
      typeLabel: '❓ Không rõ',
      duration: 'N/A',
      price: '0đ',
      isPaid: false,
    }
  }

  return (
    <main className='page-main'>
      <div className='my-bookings-container'>
        <div className='bookings-header'>
          <div className='header-left'>
            <h1>Lịch hẹn của tôi</h1>
            {/* <p>Quản lý tất cả lịch hẹn dịch vụ và lái thử xe của bạn</p> */}
          </div>
          <Link to='/services' className='btn-new-booking'>
            + Đặt lịch mới
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className='filter-tabs'>
          <button
            className={`filter-tab ${filterStatus === '' ? 'active' : ''}`}
            onClick={() => handleFilterChange('')}
          >
            Tất cả
          </button>
          <button
            className={`filter-tab ${filterStatus === 'pending' ? 'active' : ''}`}
            onClick={() => handleFilterChange('pending')}
          >
            Chờ xác nhận
          </button>
          <button
            className={`filter-tab ${filterStatus === 'confirmed' ? 'active' : ''}`}
            onClick={() => handleFilterChange('confirmed')}
          >
            Đã xác nhận
          </button>
          <button
            className={`filter-tab ${filterStatus === 'completed' ? 'active' : ''}`}
            onClick={() => handleFilterChange('completed')}
          >
            Hoàn thành
          </button>
          <button
            className={`filter-tab ${filterStatus === 'cancelled' ? 'active' : ''}`}
            onClick={() => handleFilterChange('cancelled')}
          >
            Đã hủy
          </button>
        </div>

        {loading ? (
          <div className='loading-container'>
            <div className='loading-spinner'></div>
            <p>Đang tải lịch hẹn...</p>
          </div>
        ) : error ? (
          <div className='error-container'>
            <p className='error-message'>{error}</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className='empty-bookings'>
            <div className='empty-icon'>📅</div>
            <h2>Chưa có lịch hẹn nào</h2>
            <p>Bạn chưa đặt lịch dịch vụ hoặc lái thử xe nào</p>
            <Link to='/services' className='btn-book-now'>
              Đặt lịch ngay
            </Link>
          </div>
        ) : (
          <>
            <div className='bookings-list'>
              {bookings.map((booking) => {
                const bookingInfo = getBookingInfo(booking)
                
                return (
                  <div key={booking._id} className='booking-card'>
                    {/* ✅ Header với type badge */}
                    <div className='booking-header'>
                      <div className='booking-info'>
                        <div className='booking-type-label'>
                          {bookingInfo.typeLabel}
                        </div>
                        <h3>{bookingInfo.name}</h3>
                        <p className='booking-id'>Mã: #{booking._id.slice(-8)}</p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className='booking-body'>
                      <div className='booking-detail'>
                        <div className='detail-item'>
                          <i className='fas fa-calendar'></i>
                          <div>
                            <span className='label'>Ngày hẹn</span>
                            <span className='value'>{formatDate(booking.booking_date)}</span>
                          </div>
                        </div>

                        <div className='detail-item'>
                          <i className='fas fa-clock'></i>
                          <div>
                            <span className='label'>Khung giờ</span>
                            <span className='value'>{booking.time_slot}</span>
                          </div>
                        </div>

                        <div className='detail-item'>
                          <i className='fas fa-hourglass-half'></i>
                          <div>
                            <span className='label'>Thời gian</span>
                            <span className='value'>{bookingInfo.duration}</span>
                          </div>
                        </div>

                        <div className='detail-item'>
                          <i className='fas fa-money-bill-wave'></i>
                          <div>
                            <span className='label'>Chi phí</span>
                            <span className={`value ${bookingInfo.isPaid ? 'price' : 'free'}`}>
                              {bookingInfo.price}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ✅ Ghi chú đặc biệt cho xe */}
                      {bookingInfo.type === 'vehicle' && (
                        <div className='vehicle-note'>
                          <span className='note-icon'>💡</span>
                          <span>Vui lòng mang theo CMND/CCCD và Giấy phép lái xe</span>
                        </div>
                      )}
                    </div>

                    <div className='booking-footer'>
                      <Link to={`/booking-detail/${booking._id}`} className='btn-view-detail'>
                        Xem chi tiết
                      </Link>
                      {booking.status === 'pending' && (
                        <button
                          className='btn-cancel'
                          onClick={() => handleCancelBooking(booking._id)}
                        >
                          Hủy lịch
                        </button>
                      )}
                      {booking.status === 'completed' && bookingInfo.type === 'service' && (
                        <Link to='/services' className='btn-rebook'>
                          Đặt lại
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className='pagination'>
                <button
                  className='page-btn'
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ← Trước
                </button>

                <div className='page-numbers'>
                  {[...Array(pagination.pages)].map((_, index) => (
                    <button
                      key={index + 1}
                      className={`page-number ${currentPage === index + 1 ? 'active' : ''}`}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <button
                  className='page-btn'
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

export default MyBookingsScreen