import React from 'react'
import AIChatScreen from "./AIChatScreen";

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
    image: 'https://images.unsplash.com/photo-1698697475670-e84c588010a1?q=80&w=1742'
  },
  {
    id: 3,
    title: 'Bảo dưỡng & sửa chữa',
    description: 'Dịch vụ tại gara đối tác với kỹ thuật viên chuyên nghiệp.',
    image: 'https://thumbs.dreamstime.com/b/auto-car-repair-service-center-mechanic-checking-engine-oil-level.jpg'
  },
  {
    id: 4,
    title: 'Bán phụ tùng & đồ chơi',
    description: 'Phụ tùng chính hãng và phụ kiện đa dạng cho xe của bạn.',
    image: 'https://images.unsplash.com/photo-1606577924006-27d39b132ae2?q=80&w=776'
  },
  {
    id: 5,
    title: 'Tư vấn mua bán & định giá',
    description: 'Chuyên gia hỗ trợ định giá và thương lượng.',
    image: 'https://plus.unsplash.com/premium_photo-1661373362347-9dad03c78287?q=80&w=1738'
  }
];

const creators = [
  {
    id: 1,
    name: 'Nguyễn Đặng Đăng Nhựt',
    role: 'Thiết kế & Frontend',
    avatar: '/avatars/dangnhut.jpg'
  },
  {
    id: 2,
    name: 'Trương Thành Tiến',
    role: 'Backend & Hệ thống',
    avatar: '/avatars/thanhtien.jpg'
  },
  {
    id: 3,
    name: 'Lê Phước Thành',
    role: 'Sản phẩm & Nội dung',
    avatar: '/avatars/phuocthanh.jpg'
  }
];

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
              <img className='creator-avatar' src={creator.avatar} alt={creator.name} />
              <div className='creator-name'>{creator.name}</div>
              <div className='creator-role'>{creator.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ======= AI CHAT HIỂN THỊ LUÔN ======= */}
      <section className="ai-chat-section">
        <AIChatScreen />
      </section>

    </main>
  )
}

export default AboutScreen;
