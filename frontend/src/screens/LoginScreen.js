import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { login } from '../actions/userActions'

const LoginScreen = () => {
  const history = useHistory()
  const dispatch = useDispatch()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const userLogin = useSelector((state) => state.userLogin)
  const { loading, error, userInfo } = userLogin

  useEffect(() => {
    if (userInfo) {
      setShowSuccess(true)
      setTimeout(() => {
        history.push('/')
      }, 1200)
    }
  }, [history, userInfo])

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = () => {
    let isValid = true
    setUsernameError('')
    setPasswordError('')

    if (username.trim() === '') {
      setUsernameError('Vui lòng nhập tên đăng nhập hoặc email')
      isValid = false
    } else if (username.includes('@') && !isValidEmail(username)) {
      setUsernameError('Email không hợp lệ')
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

  const submitHandler = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      dispatch(login(username, password))
    }
  }

  const handleForgotPassword = (e) => {
    e.preventDefault()
    alert('Chức năng "Quên mật khẩu" sẽ được triển khai sau!')
  }

  return (
    <main className='page-main'>
      <div className='login-container'>
        <div className='login-header'>
          <h1>Đăng Nhập</h1>
          {/* <p>Chào mừng trở lại!</p> */}
        </div>

        {showSuccess && (
          <div className='success-message show'>
            Đăng nhập thành công!
          </div>
        )}

        {error && (
          <div className='error-message show'>
            {error}
          </div>
        )}

        <form onSubmit={submitHandler}>
          <div className='form-group'>
            <label htmlFor='username'>Tên đăng nhập hoặc Email</label>
            <div className='input-wrapper'>
              <input
                type='text'
                id='username'
                placeholder='Nhập email hoặc tên đăng nhập'
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setUsernameError('')
                }}
                autoComplete='username'
              />
            </div>
            {usernameError && (
              <div className='error-message show'>{usernameError}</div>
            )}
          </div>

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
              />
            </div>
            {passwordError && (
              <div className='error-message show'>{passwordError}</div>
            )}
          </div>

          <div className='forgot-password'>
            <a href='#' onClick={handleForgotPassword}>
              Quên mật khẩu?
            </a>
          </div>

          <button type='submit' className='btn-login' disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>
        </form>

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