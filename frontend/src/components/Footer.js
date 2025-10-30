import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className='site-footer'>
      <div className='container'>
        <p>© 2025 CarsAuto. All rights reserved.</p>
        <div className='footer-links'>
          <Link to='/policy'>Chính sách</Link>
          <Link to='/terms'>Điều Khoản</Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer