import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../actions/userActions'
import logo from '../assets/logo.png'

const Header = () => {
  const dispatch = useDispatch()
  
  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin || {}

  // ← THÊM: Lấy cart từ Redux
  const cart = useSelector((state) => state.cart)
  const { cartItems } = cart || { cartItems: [] }

  const logoutHandler = () => {
    dispatch(logout())
  }

  // Tính tổng số sản phẩm trong giỏ
  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  return (
    <header className='site-header'>
      <div className='container'>
        {/* Logo bên trái */}
        <Link to='/' className='logo'>
          <img 
            src={logo} 
            alt='CarsAuto Logo' 
            className='logo-img' 
          />
          <span className='logo-text'>CarsAuto</span>
        </Link>
        
        {/* Navigation ở giữa */}
        <nav className='main-nav'>
          <Link to='/product'>Sản Phẩm</Link>
          <Link to='/services'>Dịch Vụ</Link>
          <Link to='/contact'>Liên hệ</Link>
        </nav>

        {/* User actions ở góc phải */}
        <div className='header-actions'>
          {/* ← THÊM: Cart Icon */}
          {userInfo && (
            <Link to='/cart' className='cart-link'>
              <span className='cart-icon'>🛒</span>
              {cartItemsCount > 0 && (
                <span className='cart-badge'>{cartItemsCount}</span>
              )}
            </Link>
          )}

          {userInfo ? (
            <>
              <Link to='/profile' className='user-name'>
                <i className='fas fa-user'></i> {userInfo.full_name || userInfo.username || userInfo.name}
              </Link>
              <button onClick={logoutHandler} className='btn-logout'>
                Đăng xuất
              </button>
            </>
          ) : (
            <Link to='/login' className='btn-login-header'>
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header