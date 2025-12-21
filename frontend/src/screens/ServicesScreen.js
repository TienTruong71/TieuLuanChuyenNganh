import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { listServices } from '../actions/bookingActions'
import '../styles/services.css'

const ServicesScreen = () => {
  const history = useHistory()
  const dispatch = useDispatch()

  const serviceList = useSelector((state) => state.serviceList)
  const { loading, error, services } = serviceList

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  useEffect(() => {
    dispatch(listServices())
  }, [dispatch])

  const handleBooking = (serviceId) => {
    if (!userInfo) {
      alert('Vui lòng đăng nhập để đặt lịch')
      history.push('/login')
      return
    }
    history.push(`/booking/${serviceId}`)
  }

  // Map icon từ service name
  const getServiceIcon = (name) => {
    const iconMap = {
      'Bảo dưỡng định kỳ': '🔧',
      'Sửa chữa động cơ': '⚙️',
      'Thay lốp xe': '⚫',
      'Rửa xe': '🚗',
      'Chăm sóc nội thất': '✨',
      'Kiểm tra tổng thể': '🔍',
      'Cứu hộ 24/7': '🚨',
      'Độ xe': '🎨',
    }
    return iconMap[name] || '🔧'
  }

  // Parse features từ description
  const getFeatures = (description) => {
    // Nếu description có format đặc biệt, parse nó
    // Mặc định trả về array rỗng, bạn có thể customize
    return [
      'Dịch vụ chuyên nghiệp',
      'Bảo hành chính hãng',
      'Giá cả hợp lý',
      'Hỗ trợ tận tâm'
    ]
  }

  const formatPrice = (price) => {
    if (typeof price === 'object' && price.$numberDecimal) {
      return parseFloat(price.$numberDecimal).toLocaleString('vi-VN')
    }
    return parseFloat(price || 0).toLocaleString('vi-VN')
  }

  return (
    <main className='page-main'>
      <div className='services-container'>
        <div className='services-hero'>
          <div className='hero-content'>
            <h1>Dịch vụ của chúng tôi</h1>
            <p>Chăm sóc xe hơi toàn diện với đội ngũ kỹ thuật viên chuyên nghiệp</p>
          </div>
          {userInfo && (
            <button 
              className='btn-my-bookings'
              onClick={() => history.push('/my-bookings')}
            >
              <i className='fas fa-calendar-check'></i>
              Dịch vụ của tôi
            </button>
          )}
        </div>

        {loading ? (
          <div className='loading-container'>
            <div className='loading-spinner'></div>
            <p>Đang tải dịch vụ...</p>
          </div>
        ) : error ? (
          <div className='error-container'>
            <p className='error-message'>{error}</p>
          </div>
        ) : (
          <div className='services-grid'>
            {services.map((service) => (
              <div key={service._id} className='service-card'>
                <div className='service-icon'>{getServiceIcon(service.service_name)}</div>

                <h3 className='service-title'>{service.service_name}</h3>

                <p className='service-description'>{service.description}</p>

                <ul className='service-features'>
                  {getFeatures(service.description).map((feature, index) => (
                    <li key={index}>
                      <i className='fas fa-check-circle'></i>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className='service-duration'>
                  <i className='fas fa-clock'></i>
                  <span>Thời gian: {service.duration}</span>
                </div>

                <div className='service-footer'>
                  <div className='service-price'>
                    {formatPrice(service.price)}đ
                  </div>
                  <button
                    className='btn-book'
                    onClick={() => handleBooking(service._id)}
                  >
                    Đặt lịch
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className='services-cta'>
          <h2>Cần tư vấn thêm?</h2>
          <p>Liên hệ với chúng tôi để được tư vấn chi tiết về dịch vụ phù hợp nhất</p>
          <div className='cta-buttons'>
            <a href='tel:1900xxxx' className='btn-call'>
              <i className='fas fa-phone'></i> Gọi ngay
            </a>
            <a href='/contact' className='btn-contact'>
              <i className='fas fa-envelope'></i> Liên hệ
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}

export default ServicesScreen