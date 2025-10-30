import React from 'react'

const TermsScreen = () => {
  return (
    <main className='page-main'>
      <div className='terms-container'>
        <h1>Điều khoản sử dụng</h1>
        <p>
          Vui lòng đọc kỹ các điều kiện sử dụng dịch vụ trước khi sử dụng CarsAuto.
        </p>

        <section>
          <h2>1. Điều kiện chung</h2>
          <p>
            Người dùng phải tuân thủ các quy định pháp luật và điều khoản của dịch vụ.
          </p>
        </section>

        <section>
          <h2>2. Quyền và trách nhiệm</h2>
          <p>
            CarsAuto có quyền thay đổi nội dung, tạm ngưng hoặc chấm dứt dịch vụ 
            khi cần thiết.
          </p>
        </section>

        <section>
          <h2>3. Chấm dứt</h2>
          <p>
            Các điều khoản về chấm dứt sử dụng dịch vụ sẽ được áp dụng khi có vi phạm.
          </p>
        </section>

        <section>
          <h2>4. Liên hệ</h2>
          <p>Liên hệ: support@carsauto.com</p>
        </section>
      </div>
    </main>
  )
}

export default TermsScreen