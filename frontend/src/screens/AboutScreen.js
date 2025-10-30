import React from 'react'

const services = [
  {
    id: 1,
    title: 'Thu mua xe cũ',
    description: 'Chúng tôi mua lại xe của bạn với giá hợp lý và quy trình minh bạch.',
    image: 'https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1600'
  },
  {
    id: 2,
    title: 'Bán xe cũ',
    description: 'Đăng bán nhanh chóng, tiếp cận người mua tiềm năng trong khu vực.',
    image: 'https://images.unsplash.com/photo-1511918984145-48de785d4c4a?q=80&w=1600'
  },
  {
    id: 3,
    title: 'Bảo dưỡng & sửa chữa',
    description: 'Dịch vụ tại gara đối tác với kỹ thuật viên chuyên nghiệp.',
    image: 'https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=1600'
  },
  {
    id: 4,
    title: 'Bán phụ tùng & đồ chơi',
    description: 'Phụ tùng chính hãng và phụ kiện đa dạng cho xe của bạn.',
    image: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?q=80&w=1600'
  },
  {
    id: 5,
    title: 'Tư vấn mua bán & định giá',
    description: 'Chuyên gia của chúng tôi hỗ trợ định giá và thương lượng cho bạn.',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600'
  }
]

const creators = [
  {
    id: 1,
    name: 'Nguyễn Đặng Đăng Nhựt',
    role: 'Thiết kế & Frontend',
    avatar: 'https://cdn.discordapp.com/attachments/1415895456692699156/1416078177104691261/91977C6F-1A94-4166-A01A-35BA1C240494.jpg?ex=68e878d2&is=68e72752&hm=d97ff8afb7384b9bfbfcfe79edfd7319f191bb0c814f2f26a137b5200df8d25b&'
  },
  {
    id: 2,
    name: 'Trương Thành Tiến',
    role: 'Backend & Hệ thống',
    avatar: 'https://via.placeholder.com/96?text=B'
  },
  {
    id: 3,
    name: 'Lê Phước Thành',
    role: 'Sản phẩm & Nội dung',
    avatar: 'https://via.placeholder.com/96?text=C'
  }
]

const AboutScreen = () => {
  return (
    <main className='about-main'>
      <section className='about-hero'>
        <h1>Về CarsAuto</h1>
        <p>
          CarsAuto là nền tảng giới thiệu và tìm kiếm ô tô, cung cấp thông tin 
          sản phẩm, ưu đãi và hướng dẫn mua bán cho người dùng.
        </p>
      </section>

      <section className='about-content'>
        <h2>Sứ mệnh</h2>
        <p>
          Chúng tôi muốn kết nối người mua và nhà cung cấp nhanh chóng, 
          minh bạch và an toàn.
        </p>
      </section>

      <section className='service-panels'>
        {services.map(service => (
          <article 
            key={service.id}
            className='service-panel'
            style={{ backgroundImage: `url('${service.image}')` }}
          >
            <div className='panel-overlay'></div>
            <div className='panel-content'>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          </article>
        ))}
      </section>

      <section className='creators'>
        <h2>Người tạo trang</h2>
        <div className='creator-grid'>
          {creators.map(creator => (
            <div key={creator.id} className='creator-card'>
              <img 
                className='creator-avatar' 
                src={creator.avatar} 
                alt={creator.name} 
              />
              <div className='creator-name'>{creator.name}</div>
              <div className='creator-role'>{creator.role}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default AboutScreen