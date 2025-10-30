import React from 'react'
import logo from '../assets/logo.png'

const contacts = [
  {
    id: 1,
    name: 'Nguyễn Đặng Đăng Nhựt',
    email: '22110195@student.hcmute.edu.vn',
    phone: '0377885501',
    avatar: 'https://via.placeholder.com/96?text=DN'
  },
  {
    id: 2,
    name: 'Trương Thành Tiến',
    email: '22110245@student.hcmute.edu.vn',
    phone: '0366443231',
    avatar: 'https://via.placeholder.com/96?text=TT'
  },
  {
    id: 3,
    name: 'Lê Phước Thành',
    email: '22110244@student.hcmute.edu.vn',
    phone: '0988299075',
    avatar: 'https://via.placeholder.com/96?text=PT'
  }
]

const ContactScreen = () => {
  return (
    <main className='contact-main'>
      <section className='contact-hero'>
        <h1>Liên hệ với CarsAuto</h1>
        <p>Chúng tôi sẵn sàng hỗ trợ bạn. Thông tin liên hệ:</p>
      </section>

      <section className='contact-details'>
        <div className='person-grid'>
          {contacts.map(person => (
            <div key={person.id} className='person-card'>
              <img 
                className='person-avatar' 
                src={person.avatar} 
                alt={person.name} 
              />
              <div className='person-name'>{person.name}</div>
              <div className='person-email'>
                <a href={`mailto:${person.email}`}>{person.email}</a>
              </div>
              <div className='person-phone'>
                <a href={`tel:${person.phone}`}>{person.phone}</a>
              </div>
            </div>
          ))}
        </div>

        <div className='address-block'>
          <h2>Địa chỉ</h2>
          <p>
            Số 1 Võ Văn Ngân, Phường Linh Chiểu, Quận Thủ Đức, 
            TP. Hồ Chí Minh.
          </p>
          <div className='office-image'>
            <img src='/assets/auto.jpg' alt='logo công ty' />
          </div>
        </div>
      </section>
    </main>
  )
}

export default ContactScreen