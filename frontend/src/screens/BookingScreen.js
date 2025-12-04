import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { getServiceDetails } from '../actions/bookingActions'
import { createBooking } from '../actions/bookingActions'
import { BOOKING_CREATE_RESET } from '../constants/bookingConstants'

const BookingScreen = () => {
  const { id } = useParams() // service_id
  const history = useHistory()
  const dispatch = useDispatch()

  const [bookingDate, setBookingDate] = useState('')
  const [timeSlot, setTimeSlot] = useState('')

  const serviceDetails = useSelector((state) => state.serviceDetails)
  const { loading, error, service } = serviceDetails

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  const bookingCreate = useSelector((state) => state.bookingCreate)
  const { loading: loadingCreate, success, error: errorCreate } = bookingCreate

  useEffect(() => {
    if (!userInfo) {
      history.push('/login')
    } else {
      if (!service || service._id !== id) {
        dispatch(getServiceDetails(id))
      }
    }
  }, [dispatch, history, userInfo, id, service])

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

    dispatch(
      createBooking({
        service_id: id,
        booking_date: bookingDate,
        time_slot: timeSlot,
      })
    )
  }

  return (
    <main className='page-main'>
      <div className='booking-container'>
        <div className='booking-header'>
          <button onClick={() => history.goBack()} className='btn-back'>
            ← Quay lại
          </button>
          <h1>Đặt lịch dịch vụ</h1>
        </div>

        {loading ? (
          <div className='loading-container'>
            <div className='loading-spinner'></div>
            <p>Đang tải thông tin dịch vụ...</p>
          </div>
        ) : error ? (
          <div className='error-container'>
            <p className='error-message'>{error}</p>
          </div>
        ) : (
          <div className='booking-content'>
            <div className='service-info-card'>
              <h2>Thông tin dịch vụ</h2>
              <div className='service-details'>
                <div className='detail-row'>
                  <span className='label'>Tên dịch vụ:</span>
                  <span className='value'>{service.service_name}</span>
                </div>
                <div className='detail-row'>
                  <span className='label'>Mô tả:</span>
                  <span className='value'>{service.description}</span>
                </div>
                <div className='detail-row'>
                  <span className='label'>Thời gian:</span>
                  <span className='value'>{service.duration}</span>
                </div>
                <div className='detail-row'>
                  <span className='label'>Giá:</span>
                  <span className='value price'>{formatPrice(service.price)}đ</span>
                </div>
              </div>
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
                      <span>Dịch vụ:</span>
                      <span>{service.service_name}</span>
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
                      <span>Tổng chi phí:</span>
                      <span className='price'>{formatPrice(service.price)}đ</span>
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
                    <li>Vui lòng đến đúng giờ đã đặt</li>
                    <li>Có thể hủy lịch trước 24 giờ</li>
                    <li>Mang theo giấy tờ xe khi đến</li>
                    <li>Liên hệ hotline nếu cần thay đổi</li>
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