import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { login } from '../actions/userActions'
import '../styles/auth.css'
import { GoogleLogin } from '@react-oauth/google'
import { loginWithGoogle } from '../actions/userActions'


const LoginScreen = () => {
  const history = useHistory()
  const dispatch = useDispatch()
  const handleGoogleLoginSuccess = (credentialResponse) => {
  if (credentialResponse?.credential) {
    dispatch(loginWithGoogle(credentialResponse.credential))
  }
}

  // State cho form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  // Lấy state từ Redux
  const userLogin = useSelector((state) => state.userLogin)
  const { loading, error, userInfo } = userLogin

  // Redirect nếu đã đăng nhập
  useEffect(() => {
    if (userInfo) {
      setShowSuccess(true)
      setTimeout(() => {
        // Redirect dựa vào role
        if (userInfo.isAdmin || userInfo.role === 'Admin') {
          history.push('/admin')
        } else {
          history.push('/')
        }
      }, 1200)
    }
  }, [history, userInfo])

  // Validate email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validate form
  const validateForm = () => {
    let isValid = true
    setEmailError('')
    setPasswordError('')

    if (email.trim() === '') {
      setEmailError('Vui lòng nhập email')
      isValid = false
    } else if (!isValidEmail(email)) {
      setEmailError('Email không hợp lệ')
      isValid = false
    }

    if (password === '') {
      setPasswordError('Vui lòng nhập mật khẩu')
      isValid = false
    } else if (password.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự')
      isValid = false
    }

    return isValid
  }

  // Submit handler
  const submitHandler = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      // Dispatch login action với EMAIL và PASSWORD
      dispatch(login(email, password))
    }
  }

  // Forgot password handler
  const handleForgotPassword = (e) => {
    e.preventDefault()
    history.push('/forgot-password')
  }

  return (
    <main className='page-main'>
      <div className='login-container'>
        <div className='login-header'>
          <h1>Đăng Nhập</h1>
          <p>Chào mừng trở lại!</p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className='success-message show'>
            Đăng nhập thành công!
          </div>
        )}

        {/* Error Message từ API */}
        {error && (
          <div className='error-message show'>
            {error}
          </div>
        )}

        <form onSubmit={submitHandler}>
          {/* Email Input */}
          <div className='form-group'>
            <label htmlFor='email'>Email</label>
            <div className='input-wrapper'>
              <input
                type='email'
                id='email'
                placeholder='Nhập email của bạn'
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setEmailError('')
                }}
                autoComplete='email'
                disabled={loading}
              />
            </div>
            {emailError && (
              <div className='error-message show'>{emailError}</div>
            )}
          </div>

          {/* Password Input */}
          <div className='form-group'>
            <label htmlFor='password'>Mật khẩu</label>
            <div className='input-wrapper'>
              <input
                type='password'
                id='password'
                placeholder='Nhập mật khẩu'
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setPasswordError('')
                }}
                autoComplete='current-password'
                disabled={loading}
              />
            </div>
            {passwordError && (
              <div className='error-message show'>{passwordError}</div>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className='forgot-password'>
            <a href='#' onClick={handleForgotPassword}>
              Quên mật khẩu?
            </a>
          </div>

          {/* Submit Button */}
          <button type='submit' className='btn-login' disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>
          {/* Divider */}
          <div className='login-divider'>
            <span>HOẶC</span>
          </div>

          {/* Google Login Button */}
          <div className='google-login-wrapper'>
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={() => {
                console.log('Google Login Failed')
              }}
              width='100%'
              theme='outline'
              size='large'
              text='signin_with'
              shape='rectangular'
            />
          </div>
        </form>

        {/* Register Link */}
        <div className='register-link'>
          Chưa có tài khoản?{' '}
          <a href='#' onClick={() => history.push('/register')}>
            Đăng ký ngay
          </a>
        </div>
      </div>
    </main>
  )
}

export default LoginScreen