import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'

const ProfileScreen = () => {
  const history = useHistory()
  
  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin || {}

  useEffect(() => {
    // Redirect to login if not logged in
    if (!userInfo) {
      history.push('/login')
    }
  }, [history, userInfo])

  if (!userInfo) {
    return null
  }

  return (
    <main className='page-main'>
      <div className='profile-container'>
        <div className='profile-header'>
          <div className='profile-avatar'>
            <i className='fas fa-user-circle'></i>
          </div>
          <h1>Hồ sơ của tôi</h1>
          <p className='profile-subtitle'>Xin chào, {userInfo.name}!</p>
        </div>

        <div className='profile-content'>
          <div className='profile-section'>
            <h2>Thông tin cá nhân</h2>
            <div className='info-grid'>
              <div className='info-item'>
                <label>Tên đăng nhập:</label>
                <span>{userInfo.username || userInfo.name}</span>
              </div>
              <div className='info-item'>
                <label>Email:</label>
                <span>{userInfo.email}</span>
              </div>
              <div className='info-item'>
                <label>Trạng thái:</label>
                <span className='status-badge'>
                  {userInfo.isAdmin ? 'Quản trị viên' : 'Thành viên'}
                </span>
              </div>
            </div>
          </div>

          <div className='profile-section'>
            <h2>Lịch sử hoạt động</h2>
            <p className='coming-soon'>Tính năng đang được phát triển...</p>
          </div>

          <div className='profile-section'>
            <h2>Cài đặt</h2>
            <p className='coming-soon'>Tính năng đang được phát triển...</p>
          </div>
        </div>

        <div className='profile-actions'>
          <button className='btn-edit' disabled>
            Chỉnh sửa thông tin
          </button>
          <button className='btn-change-password' disabled>
            Đổi mật khẩu
          </button>
        </div>
      </div>
    </main>
  )
}

export default ProfileScreen