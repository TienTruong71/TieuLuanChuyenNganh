import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { verifyEmailOTP } from '../actions/userActions'
import { useHistory, useLocation } from 'react-router-dom'
import '../styles/auth.css'

const VerifyOTPScreen = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const location = useLocation()

  const email = location.state?.email
  const [otp, setOtp] = useState('')

  const verifyState = useSelector((state) => state.verifyEmail)
  const { loading, success, error } = verifyState

  useEffect(() => {
    if (!email) history.push('/register')

    if (success) {
      setTimeout(() => {
        history.push('/login')
      }, 1500)
    }
  }, [success, email, history])

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(verifyEmailOTP(email, otp))
  }

  return (
    <main className="page-main">
      <div className="register-container">
        <div className="register-header">
          <h1>Xác nhận Email</h1>
          <p>Nhập mã OTP đã gửi tới</p>
          <strong>{email}</strong>
        </div>

        {/* Error */}
        {error && (
          <div className="error-message show">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="success-message show">
            Xác nhận thành công! Đang chuyển hướng...
          </div>
        )}

        <form onSubmit={submitHandler}>
          <div className="form-group">
            <label>Mã OTP *</label>
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Nhập mã OTP (6 số)"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="btn-register" disabled={loading}>
            {loading ? 'Đang xác nhận...' : 'Xác nhận'}
          </button>
        </form>

        <div className="login-link">
          Quay lại{' '}
          <a href="#" onClick={() => history.push('/register')}>
            Đăng ký
          </a>
        </div>
      </div>
    </main>
  )
}

export default VerifyOTPScreen
