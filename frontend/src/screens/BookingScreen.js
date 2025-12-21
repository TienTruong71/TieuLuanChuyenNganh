import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams, useLocation } from 'react-router-dom'
import { getServiceDetails, createBooking } from '../actions/bookingActions'
import { getProductDetails } from '../actions/productActions'
import '../styles/booking.css'
import { BOOKING_CREATE_RESET } from '../constants/bookingConstants'

const BookingScreen = () => {
  const { id } = useParams() // service_id hoặc product_id
  const history = useHistory()
  const location = useLocation()
  const dispatch = useDispatch()

  // ✅ Lấy type từ URL query
  const queryParams = new URLSearchParams(location.search)
  const bookingType = queryParams.get('type') || 'service' // 'service' hoặc 'vehicle'

  const [bookingDate, setBookingDate] = useState('')
  const [timeSlot, setTimeSlot] = useState('')

  // Redux states
  const serviceDetails = useSelector((state) => state.serviceDetails)
  const { loading: loadingService, error: errorService, service } = serviceDetails

  const productDetails = useSelector((state) => state.productDetails)
  const { loading: loadingProduct, error: errorProduct, product } = productDetails

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  const bookingCreate = useSelector((state) => state.bookingCreate)
  const { loading: loadingCreate, success, error: errorCreate } = bookingCreate

  // ✅ Dữ liệu hiển thị (service hoặc vehicle)
  const itemData = bookingType === 'vehicle' ? product : service
  const loading = bookingType === 'vehicle' ? loadingProduct : loadingService
  const error = bookingType === 'vehicle' ? errorProduct : errorService

  useEffect(() => {
    if (!userInfo) {
      history.push('/login')
    } else {
      if (bookingType === 'vehicle') {
        // Fetch product details
        if (!product || product._id !== id) {
          dispatch(getProductDetails(id))
        }
      } else {
        // Fetch service details
        if (!service || service._id !== id) {
          dispatch(getServiceDetails(id))
        }
      }
    }
  }, [dispatch, history, userInfo, id, bookingType, product, service])

  useEffect(() => {
    if (success) {
      alert('Đặt lịch thành công!')
      dispatch({ type: BOOKING_CREATE_RESET })
      history.push('/my-bookings')
    }
  }, [success, history, dispatch])

  const timeSlots = [
    '08:00-10:00',
    '10:00-12:00',
    '13:00-15:00',
    '15:00-17:00',
  ]

  const formatPrice = (price) => {
    if (typeof price === 'object' && price.$numberDecimal) {
      return parseFloat(price.$numberDecimal).toLocaleString('vi-VN')
    }
    return parseFloat(price || 0).toLocaleString('vi-VN')
  }

  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 30)
    return maxDate.toISOString().split('T')[0]
  }

  const submitHandler = (e) => {
    e.preventDefault()

    if (!bookingDate) {
      alert('Vui lòng chọn ngày đặt lịch')
      return
    }

    if (!timeSlot) {
      alert('Vui lòng chọn khung giờ')
      return
    }

    // ✅ Gửi booking với type tương ứng
    dispatch(
      createBooking({
        service_id: bookingType === 'service' ? id : undefined,
        product_id: bookingType === 'vehicle' ? id : undefined,
        booking_date: bookingDate,
        time_slot: timeSlot,
        booking_type: bookingType, // 'service' hoặc 'vehicle'
      })
    )
  }

  // ✅ Lấy tên và mô tả dựa trên type
  const getItemName = () => {
    if (bookingType === 'vehicle') {
      return product?.product_name || 'Xe ô tô'
    }
    return service?.service_name || 'Dịch vụ'
  }

  const getItemDescription = () => {
    if (bookingType === 'vehicle') {
      return product?.description || 'Lái thử xe ô tô'
    }
    return service?.description || ''
  }

  const getItemDuration = () => {
    if (bookingType === 'vehicle') {
      return '30-45 phút' // Thời gian lái thử mặc định
    }
    return service?.duration || ''
  }

  const getItemPrice = () => {
    if (bookingType === 'vehicle') {
      return 'Miễn phí' // Lái thử miễn phí
    }
    return formatPrice(service?.price) + 'đ'
  }

  return (
    <main className='page-main'>
      <div className='booking-container'>
        <div className='booking-header'>
          <button onClick={() => history.goBack()} className='btn-back'>
            ← Quay lại
          </button>
          <h1>
            {bookingType === 'vehicle' ? 'Đặt lịch lái thử xe' : 'Đặt lịch dịch vụ'}
          </h1>
        </div>

        {loading ? (
          <div className='loading-container'>
            <div className='loading-spinner'></div>
            <p>Đang tải thông tin...</p>
          </div>
        ) : error ? (
          <div className='error-container'>
            <p className='error-message'>{error}</p>
          </div>
        ) : (
          <div className='booking-content'>
            {/* ✅ Card thông tin (service hoặc vehicle) */}
            <div className='service-info-card'>
              <h2>
                {bookingType === 'vehicle' ? '🚗 Thông tin xe' : '🔧 Thông tin dịch vụ'}
              </h2>
              <div className='service-details'>
                <div className='detail-row'>
                  <span className='label'>
                    {bookingType === 'vehicle' ? 'Tên xe:' : 'Tên dịch vụ:'}
                  </span>
                  <span className='value'>{getItemName()}</span>
                </div>
                <div className='detail-row'>
                  <span className='label'>Mô tả:</span>
                  <span className='value'>{getItemDescription()}</span>
                </div>
                <div className='detail-row'>
                  <span className='label'>Thời gian:</span>
                  <span className='value'>{getItemDuration()}</span>
                </div>
                <div className='detail-row'>
                  <span className='label'>
                    {bookingType === 'vehicle' ? 'Chi phí:' : 'Giá:'}
                  </span>
                  <span className='value price'>{getItemPrice()}</span>
                </div>
              </div>

              {/* ✅ Thông báo đặc biệt cho xe */}
              {bookingType === 'vehicle' && (
                <div className='vehicle-booking-notice'>
                  <div className='notice-icon'>💡</div>
                  <div className='notice-content'>
                    <strong>Lưu ý quan trọng:</strong>
                    <ul>
                      <li>Lái thử hoàn toàn <strong>MIỄN PHÍ</strong></li>
                      <li>Vui lòng mang theo <strong>CMND/CCCD</strong> và <strong>Giấy phép lái xe</strong></li>
                      <li>Chuyên viên tư vấn sẽ đồng hành cùng bạn</li>
                      <li>Thời gian lái thử: 30-45 phút</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className='booking-form-card'>
              <h2>Chọn ngày và giờ</h2>

              {errorCreate && (
                <div className='alert-error'>{errorCreate}</div>
              )}

              <form onSubmit={submitHandler}>
                <div className='form-group'>
                  <label htmlFor='bookingDate'>
                    Chọn ngày <span className='required'>*</span>
                  </label>
                  <input
                    type='date'
                    id='bookingDate'
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={getTodayDate()}
                    max={getMaxDate()}
                    required
                  />
                  <small className='form-hint'>
                    Có thể đặt lịch trong vòng 30 ngày tới
                  </small>
                </div>

                <div className='form-group'>
                  <label>
                    Chọn khung giờ <span className='required'>*</span>
                  </label>
                  <div className='time-slots'>
                    {timeSlots.map((slot) => (
                      <label
                        key={slot}
                        className={`time-slot ${timeSlot === slot ? 'selected' : ''}`}
                      >
                        <input
                          type='radio'
                          name='timeSlot'
                          value={slot}
                          checked={timeSlot === slot}
                          onChange={(e) => setTimeSlot(e.target.value)}
                        />
                        <span className='slot-time'>
                          <i className='fas fa-clock'></i>
                          {slot}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {bookingDate && timeSlot && (
                  <div className='booking-summary'>
                    <h3>Thông tin đặt lịch</h3>
                    <div className='summary-item'>
                      <span>{bookingType === 'vehicle' ? 'Xe:' : 'Dịch vụ:'}</span>
                      <span>{getItemName()}</span>
                    </div>
                    <div className='summary-item'>
                      <span>Ngày:</span>
                      <span>
                        {new Date(bookingDate).toLocaleDateString('vi-VN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className='summary-item'>
                      <span>Giờ:</span>
                      <span>{timeSlot}</span>
                    </div>
                    <div className='summary-item total'>
                      <span>Chi phí:</span>
                      <span className='price'>{getItemPrice()}</span>
                    </div>
                  </div>
                )}

                <button
                  type='submit'
                  className='btn-submit'
                  disabled={loadingCreate}
                >
                  {loadingCreate ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
                </button>

                <div className='booking-notes'>
                  <h4>Lưu ý:</h4>
                  <ul>
                    {bookingType === 'vehicle' ? (
                      <>
                        <li>Mang theo CMND/CCCD và Giấy phép lái xe</li>
                        <li>Đến đúng giờ đã đặt</li>
                        <li>Có thể hủy lịch trước 24 giờ</li>
                        <li>Liên hệ hotline: <strong>037788551</strong> hoặc <strong>nhân viên tư vấn</strong> nếu cần thay đổi</li>
                      </>
                    ) : (
                      <>
                        <li>Vui lòng đến đúng giờ đã đặt</li>
                        <li>Có thể hủy lịch trước 24 giờ</li>
                        <li>Mang theo giấy tờ xe khi đến</li>
                        <li>Liên hệ hotline: <strong>037788551</strong> hoặc <strong>nhân viên tư vấn</strong> nếu cần thay đổi</li>
                      </>
                    )}
                  </ul>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default BookingScreen