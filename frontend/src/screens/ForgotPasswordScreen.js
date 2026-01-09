import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { forgotPassword, FORGOT_PASSWORD_RESET } from '../actions/userActions'
import '../styles/auth.css'

const ForgotPasswordScreen = () => {
  const history = useHistory()
  const dispatch = useDispatch()

  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')

  const forgotPasswordState = useSelector((state) => state.forgotPassword)
  const { loading, success, error, message } = forgotPasswordState

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        dispatch({ type: FORGOT_PASSWORD_RESET })
        history.push('/login')
      }, 3000)
    }
  }, [success, dispatch, history])

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const submitHandler = (e) => {
    e.preventDefault()
    setEmailError('')

    if (email.trim() === '') {
      setEmailError('Vui lòng nhập email')
      return
    }

    if (!isValidEmail(email)) {
      setEmailError('Email không hợp lệ')
      return
    }

    dispatch(forgotPassword(email))
  }

  return (
    <main className='page-main'>
      <div className='login-container'>
        <div className='login-header'>
          <h1>Quên Mật Khẩu</h1>
          <p>Nhập email để nhận link đặt lại mật khẩu</p>
        </div>

        {success && (
          <div className='success-message show'>
            {message || 'Link đặt lại mật khẩu đã được gửi đến email của bạn'}
          </div>
        )}

        {error && (
          <div className='error-message show'>{error}</div>
        )}

        <form onSubmit={submitHandler}>
          <div className='form-group'>
            <label htmlFor='email'>Email</label>
            <input
              type='email'
              id='email'
              placeholder='Nhập email đã đăng ký'
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setEmailError('')
              }}
              disabled={loading}
            />
            {emailError && (
              <div className='error-message show'>{emailError}</div>
            )}
          </div>

          <button type='submit' className='btn-login' disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
          </button>
        </form>

        <div className='register-link'>
          <a href='#' onClick={() => history.push('/login')}>
            ← Quay lại đăng nhập
          </a>
        </div>
      </div>
    </main>
  )
}

export default ForgotPasswordScreen