import React from 'react'

const PolicyScreen = () => {
  return (
    <main className='page-main'>
      <div className='policy-container'>
        <h1>Chính sách bảo mật</h1>
        <p>
          Chào mừng bạn đến với CarsAuto. Dưới đây là các chính sách về thu thập, 
          lưu trữ và sử dụng thông tin người dùng.
        </p>

        <section>
          <h2>1. Thông tin thu thập</h2>
          <p>
            Chúng tôi có thể thu thập các thông tin cá nhân như tên, email khi bạn 
            đăng ký tài khoản hoặc tương tác với dịch vụ.
          </p>
        </section>

        <section>
          <h2>2. Mục đích sử dụng</h2>
          <p>
            Thông tin được sử dụng để cung cấp dịch vụ, liên lạc với người dùng 
            và cải thiện trải nghiệm.
          </p>
        </section>

        <section>
          <h2>3. Bảo mật</h2>
          <p>
            Chúng tôi áp dụng các biện pháp phù hợp để bảo vệ dữ liệu khỏi truy cập 
            trái phép.
          </p>
        </section>

        <section>
          <h2>4. Liên hệ</h2>
          <p>
            Nếu bạn có thắc mắc về chính sách, vui lòng liên hệ với chúng tôi qua 
            email: support@carsauto.com
          </p>
        </section>
      </div>
    </main>
  )
}

export default PolicyScreen