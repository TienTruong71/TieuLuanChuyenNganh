import React from 'react'

const services = [
  {
    id: 1,
    title: 'Bảo dưỡng định kỳ',
    icon: '🔧',
    description: 'Kiểm tra và bảo dưỡng xe định kỳ theo km hoặc thời gian sử dụng',
    features: [
      'Thay dầu máy & lọc dầu',
      'Kiểm tra hệ thống phanh',
      'Kiểm tra áp suất lốp',
      'Vệ sinh buồng máy'
    ],
    price: 'Từ 500.000đ',
    popular: true
  },
  {
    id: 2,
    title: 'Sửa chữa chuyên sâu',
    icon: '⚙️',
    description: 'Chẩn đoán và sửa chữa các hư hỏng phức tạp của xe',
    features: [
      'Sửa động cơ & hộp số',
      'Sửa chữa điện & điện tử',
      'Thay thế phụ tùng',
      'Bảo hành dài hạn'
    ],
    price: 'Liên hệ',
    popular: false
  },
  {
    id: 3,
    title: 'Chăm sóc nội thất',
    icon: '✨',
    description: 'Vệ sinh, làm sạch và phục hồi nội thất xe',
    features: [
      'Giặt ghế & thảm lót',
      'Vệ sinh trần xe',
      'Khử mùi & diệt khuẩn',
      'Đánh bóng táp lô'
    ],
    price: 'Từ 300.000đ',
    popular: true
  },
  {
    id: 4,
    title: 'Chăm sóc ngoại thất',
    icon: '🚗',
    description: 'Rửa xe, đánh bóng và bảo vệ bề mặt sơn xe',
    features: [
      'Rửa xe chuyên nghiệp',
      'Đánh bóng sơn xe',
      'Phủ ceramic bảo vệ',
      'Làm mới đèn xe'
    ],
    price: 'Từ 200.000đ',
    popular: false
  },
  {
    id: 5,
    title: 'Thay lốp & cân chỉnh',
    icon: '⚫',
    description: 'Thay lốp mới, vá lốp và cân chỉnh độ chụm bánh xe',
    features: [
      'Thay lốp mới các hãng',
      'Vá lốp không săm',
      'Cân bằng động bánh xe',
      'Cân chỉnh độ chụm'
    ],
    price: 'Từ 100.000đ',
    popular: false
  },
  {
    id: 6,
    title: 'Kiểm tra tổng thể',
    icon: '🔍',
    description: 'Kiểm tra toàn bộ tình trạng xe trước khi đi xa',
    features: [
      'Kiểm tra 50 hạng mục',
      'Báo cáo chi tiết',
      'Tư vấn sửa chữa',
      'Miễn phí cho khách hàng thân thiết'
    ],
    price: 'Miễn phí',
    popular: true
  },
  {
    id: 7,
    title: 'Cứu hộ 24/7',
    icon: '🚨',
    description: 'Dịch vụ cứu hộ xe hỏng, cạn xăng, hết bình',
    features: [
      'Hỗ trợ 24/7',
      'Đến tận nơi trong 30 phút',
      'Sửa chữa tại chỗ',
      'Kéo xe về garage'
    ],
    price: 'Từ 200.000đ',
    popular: false
  },
  {
    id: 8,
    title: 'Độ xe & phụ kiện',
    icon: '🎨',
    description: 'Độ xe theo phong cách riêng, lắp đặt phụ kiện',
    features: [
      'Độ bodykit & spoiler',
      'Lắp camera & cảm biến',
      'Độ đèn & âm thanh',
      'Dán phim cách nhiệt'
    ],
    price: 'Liên hệ',
    popular: false
  }
]

const ServicesScreen = () => {
  return (
    <main className='page-main'>
      <div className='services-container'>
        <div className='services-hero'>
          <h1>Dịch vụ của chúng tôi</h1>
          <p>Chăm sóc xe hơi toàn diện với đội ngũ kỹ thuật viên chuyên nghiệp</p>
        </div>

        <div className='services-grid'>
          {services.map(service => (
            <div 
              key={service.id} 
              className={`service-card ${service.popular ? 'popular' : ''}`}
            >
              {service.popular && (
                <div className='popular-badge'>Phổ biến</div>
              )}
              
              <div className='service-icon'>{service.icon}</div>
              
              <h3 className='service-title'>{service.title}</h3>
              
              <p className='service-description'>{service.description}</p>
              
              <ul className='service-features'>
                {service.features.map((feature, index) => (
                  <li key={index}>
                    <i className='fas fa-check-circle'></i>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <div className='service-footer'>
                <div className='service-price'>{service.price}</div>
                <button className='btn-book'>Đặt lịch</button>
              </div>
            </div>
          ))}
        </div>

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