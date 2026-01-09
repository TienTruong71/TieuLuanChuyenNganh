import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import moment from 'moment'
import { logout } from '../actions/userActions'
import { listNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../actions/notificationActions'
import logo from '../assets/logo.png'
import '../styles/shared.css'
import { BellOutlined, CheckCircleOutlined, UserOutlined, ShoppingCartOutlined, LogoutOutlined } from '@ant-design/icons'
import { Dropdown, Badge, List, Avatar, Button, Typography, Space, theme, Empty } from 'antd'

const { Text } = Typography

const Header = () => {
  const dispatch = useDispatch()
  const { token } = theme.useToken()

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin || {}

  const cart = useSelector((state) => state.cart)
  const { cartItems } = cart || { cartItems: [] }

  const notificationList = useSelector((state) => state.notificationList)
  const { notifications } = notificationList || { notifications: [] }

  useEffect(() => {
    if (userInfo) {
      dispatch(listNotifications())
      const interval = setInterval(() => {
        dispatch(listNotifications())
      }, 10000)
      return () => clearInterval(interval)
    }
  }, [dispatch, userInfo])

  const logoutHandler = () => {
    dispatch(logout())
  }

  const handleNotificationClick = (id, isRead) => {
    if (!isRead) {
      dispatch(markNotificationAsRead(id))
      // Slightly delayed refetch or optimistic update
      setTimeout(() => dispatch(listNotifications()), 500)
    }
  }

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.is_read).length : 0

  // Notification list item render
  const notificationMenu = (
    <div className='w-80 md:w-96 bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden'>
      <div className='px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 backdrop-blur-sm'>
        <Text strong className='text-gray-800 text-lg'>Thông báo</Text>
        {unreadCount > 0 && <Badge count={unreadCount} style={{ backgroundColor: token.colorPrimary }} />}
      </div>

      <div className='max-h-[400px] overflow-y-auto custom-scrollbar'>
        {notifications && notifications.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                className={`cursor-pointer transition-colors duration-200 hover:bg-gray-50 px-4 py-3 border-b border-gray-50 ${!item.is_read ? 'bg-blue-50/30' : ''}`}
                onClick={() => handleNotificationClick(item._id, item.is_read)}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      style={{ backgroundColor: !item.is_read ? token.colorPrimary : '#d9d9d9' }}
                      icon={!item.is_read ? <BellOutlined /> : <CheckCircleOutlined />}
                    />
                  }
                  title={
                    <div className='flex justify-between items-start'>
                      <Text strong={!item.is_read} className='text-sm text-gray-800' style={{ whiteSpace: 'pre-wrap' }}>{item.message}</Text>
                      {!item.is_read && <div className='w-2 h-2 rounded-full bg-blue-500 mt-1.5 ml-2 shrink-0'></div>}
                    </div>
                  }
                  description={<Text type="secondary" className='text-xs mt-1 block'>{moment(item.createdAt).fromNow()}</Text>}
                />
              </List.Item>
            )}
          />
        ) : (
          <div className='py-8'>
            <Empty description="Không có thông báo nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        )}
      </div>

      <div className='p-2 bg-gray-50 border-t border-gray-100 text-center'>
        <Button
          type="link"
          size="small"
          className='text-gray-500 hover:text-blue-600 font-medium'
          onClick={() => {
            dispatch(markAllNotificationsAsRead());
            // Optimistic update: force re-render or re-fetch after small delay just in case
            setTimeout(() => dispatch(listNotifications()), 500);
          }}
        >
          Đánh dấu đã đọc tất cả
        </Button>
      </div>
    </div>
  )

  return (
    <header className='site-header'>
      <div className='container'>
        <Link to='/' className='logo'>
          <img src={logo} alt='CarsAuto Logo' className='logo-img' />
          <span className='logo-text'>CarsAuto</span>
        </Link>

        <nav className='main-nav'>
          <Link to='/product'>Sản Phẩm</Link>
          <Link to='/services'>Dịch Vụ</Link>
          <Link to='/contact'>Liên hệ</Link>
        </nav>

        <div className='header-actions'>
          {/* Notification Bell (Only for logged in users) */}
          {userInfo && (
            <div className='notification-container'>
              <Dropdown
                dropdownRender={() => notificationMenu}
                trigger={['click']}
                placement="bottomRight"
              >
                <div className='notification-bell' style={{ cursor: 'pointer' }}>
                  <Badge count={unreadCount} size="small" offset={[5, -5]}>
                    <BellOutlined style={{ fontSize: '20px', color: '#333' }} />
                  </Badge>
                </div>
              </Dropdown>
            </div>
          )}

          {/* Cart Icon */}
          {userInfo && (
            <Link to='/cart' className='cart-link'>
              <span className='cart-icon' role="img" aria-label="cart">🛒</span>
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