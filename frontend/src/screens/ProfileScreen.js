import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { changePassword, USER_CHANGE_PASSWORD_RESET } from '../actions/userActions'
import '../styles/profile.css'

const ProfileScreen = () => {
  const history = useHistory()
  const dispatch = useDispatch()
  
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  
  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin || {}

  const userChangePassword = useSelector((state) => state.userChangePassword)
  const { loading, success, error } = userChangePassword || {}

  // ✅ Kiểm tra xem user có phải Google account không
  // const isGoogleUser = userInfo?.authProvider === 'google'

  useEffect(() => {
    // Redirect to login if not logged in
    if (!userInfo) {
      history.push('/login')
    }
  }, [history, userInfo])

  // Reset form sau khi đổi mật khẩu thành công
  useEffect(() => {
    if (success) {
      alert('Đổi mật khẩu thành công!')
      setShowPasswordForm(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordError('')
      
      // Reset state sau 2 giây
      setTimeout(() => {
        dispatch({ type: USER_CHANGE_PASSWORD_RESET })
      }, 2000)
    }
  }, [success, dispatch])

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    setPasswordError('')

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Vui lòng điền đầy đủ thông tin')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu mới và xác nhận mật khẩu không khớp')
      return
    }

    if (currentPassword === newPassword) {
      setPasswordError('Mật khẩu mới không được trùng với mật khẩu hiện tại')
      return
    }

    // Dispatch action
    dispatch(changePassword(currentPassword, newPassword))
  }

  const handleCancelPasswordChange = () => {
    setShowPasswordForm(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError('')
    dispatch({ type: USER_CHANGE_PASSWORD_RESET })
  }

  if (!userInfo) {
    return null
  }

  return (
    <main className='page-main'>
      <div className='profile-container'>
        <div className='profile-header'>
          <div className='profile-avatar'>
            {userInfo.avatar ? (
              <img src={userInfo.avatar} alt={userInfo.name} />
            ) : (
              <i className='fas fa-user-circle'></i>
            )}
          </div>
          <h1>Hồ sơ của tôi</h1>
          <p className='profile-subtitle'>Xin chào, {userInfo.full_name || userInfo.name}!</p>
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
            <div className='section-header'>
              <h2>Đơn hàng của tôi</h2>
            </div>
            <div className='order-quick-access'>
              <p>Xem và quản lý tất cả đơn hàng của bạn</p>
              <button 
                className='btn-view-orders'
                onClick={() => history.push('/orders')}
              >
                📦 Xem đơn hàng
              </button>
            </div>
          </div>

          {/* Change Password Section */}
          <div className='profile-section'>
            <div className='section-header'>
              <h2>Bảo mật</h2>
              {!showPasswordForm && (
                <button 
                  className='btn-change-password'
                  onClick={() => setShowPasswordForm(true)}
                >
                  🔒 Đổi mật khẩu
                </button>
              )}
            </div>

            {showPasswordForm && (
              <div className='password-change-form'>
                <form onSubmit={handlePasswordSubmit}>
                  {/* Error Messages */}
                  {passwordError && (
                    <div className='error-message'>{passwordError}</div>
                  )}
                  {error && (
                    <div className='error-message'>{error}</div>
                  )}
                  {success && (
                    <div className='success-message'>Đổi mật khẩu thành công!</div>
                  )}

                  <div className='form-group'>
                    <label htmlFor='currentPassword'>Mật khẩu hiện tại *</label>
                    <input
                      type='password'
                      id='currentPassword'
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder='Nhập mật khẩu hiện tại'
                      disabled={loading}
                    />
                  </div>

                  <div className='form-group'>
                    <label htmlFor='newPassword'>Mật khẩu mới *</label>
                    <input
                      type='password'
                      id='newPassword'
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder='Nhập mật khẩu mới (tối thiểu 6 ký tự)'
                      disabled={loading}
                    />
                  </div>

                  <div className='form-group'>
                    <label htmlFor='confirmPassword'>Xác nhận mật khẩu mới *</label>
                    <input
                      type='password'
                      id='confirmPassword'
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder='Nhập lại mật khẩu mới'
                      disabled={loading}
                    />
                  </div>

                  <div className='form-actions'>
                    <button 
                      type='submit' 
                      className='btn-submit'
                      disabled={loading}
                    >
                      {loading ? 'Đang xử lý...' : 'Xác nhận đổi mật khẩu'}
                    </button>
                    <button 
                      type='button' 
                      className='btn-cancel'
                      onClick={handleCancelPasswordChange}
                      disabled={loading}
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* <div className='profile-section'>
            <h2>Lịch sử hoạt động</h2>
            <p className='coming-soon'>Tính năng đang được phát triển...</p>
          </div> */}
        </div>
      </div>
    </main>
  )
}

export default ProfileScreen