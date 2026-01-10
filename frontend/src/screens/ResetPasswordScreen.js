import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'
import { resetPassword, RESET_PASSWORD_RESET } from '../actions/userActions'
import axios from 'axios'
import '../styles/auth.css'

const ResetPasswordScreen = () => {
  const history = useHistory()
  const dispatch = useDispatch()
  const location = useLocation()

  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [tokenValid, setTokenValid] = useState(false)
  const [tokenError, setTokenError] = useState('')
  const [verifying, setVerifying] = useState(true)

  const resetPasswordState = useSelector((state) => state.resetPassword)
  const { loading, success, error, message } = resetPasswordState

  // Lấy token từ URL
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tokenFromUrl = params.get('token')

    if (!tokenFromUrl) {
      setTokenError('Link không hợp lệ')
      setVerifying(false)
      return
    }

    setToken(tokenFromUrl)

    // Verify token
    const verifyToken = async () => {
      try {
        const { data } = await axios.post('/api/client/auth/verify-reset-token', {
          token: tokenFromUrl,
        })
        setTokenValid(true)
        setVerifying(false)
      } catch (err) {
        setTokenError(
          err.response?.data?.message || 'Link không hợp lệ hoặc đã hết hạn'
        )
        setVerifying(false)
      }
    }

    verifyToken()
  }, [location])

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        dispatch({ type: RESET_PASSWORD_RESET })
        history.push('/login')
      }, 2000)
    }
  }, [success, dispatch, history])

  const submitHandler = (e) => {
    e.preventDefault()
    setPasswordError('')
    setConfirmPasswordError('')

    if (!newPassword) {
      setPasswordError('Vui lòng nhập mật khẩu mới')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Vui lòng nhập lại mật khẩu')
      return
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Mật khẩu không khớp')
      return
    }

    dispatch(resetPassword(token, newPassword))
  }

  if (verifying) {
    return (
      <main className='page-main'>
        <div className='login-container'>
          <div className='login-header'>
            <h1>Đang xác minh...</h1>
          </div>
        </div>
      </main>
    )
  }

  if (tokenError) {
    return (
      <main className='page-main'>
        <div className='login-container'>
          <div className='login-header'>
            <h1>Lỗi</h1>
          </div>
          <div className='error-message show'>{tokenError}</div>
          <div className='register-link'>
            <a href='#' onClick={() => history.push('/forgot-password')}>
              Gửi lại link đặt lại mật khẩu
            </a>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className='page-main'>
      <div className='login-container'>
        <div className='login-header'>
          <h1>Đặt Lại Mật Khẩu</h1>
          <p>Nhập mật khẩu mới của bạn</p>
        </div>

        {success && (
          <div className='success-message show'>
            {message || 'Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...'}
          </div>
        )}

        {error && (
          <div className='error-message show'>{error}</div>
        )}

        {tokenValid && (
          <form onSubmit={submitHandler}>
            <div className='form-group'>
              <label htmlFor='newPassword'>Mật khẩu mới *</label>
              <input
                type='password'
                id='newPassword'
                placeholder='Nhập mật khẩu mới (tối thiểu 6 ký tự)'
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  setPasswordError('')
                }}
                disabled={loading}
              />
              {passwordError && (
                <div className='error-message show'>{passwordError}</div>
              )}
            </div>

            <div className='form-group'>
              <label htmlFor='confirmPassword'>Xác nhận mật khẩu *</label>
              <input
                type='password'
                id='confirmPassword'
                placeholder='Nhập lại mật khẩu mới'
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setConfirmPasswordError('')
                }}
                disabled={loading}
              />
              {confirmPasswordError && (
                <div className='error-message show'>{confirmPasswordError}</div>
              )}
            </div>

            <button type='submit' className='btn-login' disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>
          </form>
        )}

        <div className='register-link'>
          <a href='#' onClick={() => history.push('/login')}>
            ← Quay lại đăng nhập
          </a>
        </div>
      </div>
    </main>
  )
}

export default ResetPasswordScreen