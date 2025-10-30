import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { register } from '../actions/userActions'

const RegisterScreen = () => {
  const history = useHistory()
  const dispatch = useDispatch()

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const userRegister = useSelector((state) => state.userRegister)
  const { loading, error, userInfo } = userRegister

  useEffect(() => {
    if (userInfo) {
      setShowSuccess(true)
      setTimeout(() => {
        history.push('/login')
      }, 2000)
    }
  }, [history, userInfo])

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const isValidUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    return usernameRegex.test(username)
  }

  const checkPasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (password.match(/[a-z]+/)) strength++
    if (password.match(/[A-Z]+/)) strength++
    if (password.match(/[0-9]+/)) strength++
    if (password.match(/[$@#&!]+/)) strength++
    
    if (strength <= 2) return 'weak'
    if (strength <= 4) return 'medium'
    return 'strong'
  }

  const validateForm = () => {
    let isValid = true
    setEmailError('')
    setUsernameError('')
    setPasswordError('')
    setConfirmPasswordError('')

    if (email.trim() === '') {
      setEmailError('Vui lòng nhập địa chỉ email')
      isValid = false
    } else if (!isValidEmail(email)) {
      setEmailError('Email không hợp lệ')
      isValid = false
    }

    if (username.trim() === '') {
      setUsernameError('Vui lòng nhập tên đăng nhập')
      isValid = false
    } else if (!isValidUsername(username)) {
      setUsernameError('Tên đăng nhập phải từ 3-20 ký tự, chỉ chứa chữ, số và dấu gạch dưới')
      isValid = false
    }

    if (password === '') {
      setPasswordError('Vui lòng nhập mật khẩu')
      isValid = false
    } else if (password.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự')
      isValid = false
    } else if (password.length < 8) {
      setPasswordError('Mật khẩu nên có ít nhất 8 ký tự để an toàn hơn')
    }

    if (confirmPassword === '') {
      setConfirmPasswordError('Vui lòng nhập lại mật khẩu')
      isValid = false
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Mật khẩu không khớp')
      isValid = false
    }

    return isValid
  }

  const submitHandler = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      const passwordStrength = checkPasswordStrength(password)
      dispatch(register(email, username, password, passwordStrength))
    }
  }

  const handleForgotPassword = (e) => {
    e.preventDefault()
    alert('Chức năng "Quên mật khẩu" sẽ được triển khai sau!')
  }

  return (
    <main className='page-main'>
      <div className='register-container'>
        <div className='register-header'>
          <h1>Đăng Ký</h1>
          <p>Tạo tài khoản mới của bạn</p>
        </div>

        {showSuccess && (
          <div className='success-message show'>
            Đăng ký thành công!
          </div>
        )}

        {error && (
          <div className='error-message show'>
            {error}
          </div>
        )}

        <form onSubmit={submitHandler}>
          <div className='form-group'>
            <label htmlFor='email'>Email</label>
            <div className='input-wrapper'>
              <input
                type='email'
                id='email'
                placeholder='Nhập địa chỉ email'
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setEmailError('')
                }}
                autoComplete='email'
              />
            </div>
            {emailError && (
              <div className='error-message show'>{emailError}</div>
            )}
          </div>

          <div className='form-group'>
            <label htmlFor='username'>Tên đăng nhập</label>
            <div className='input-wrapper'>
              <input
                type='text'
                id='username'
                placeholder='Nhập tên đăng nhập'
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
                autoComplete='new-password'
              />
            </div>
            {passwordError && (
              <div className='error-message show'>{passwordError}</div>
            )}
          </div>

          <div className='form-group'>
            <label htmlFor='confirmPassword'>Nhập lại mật khẩu</label>
            <div className='input-wrapper'>
              <input
                type='password'
                id='confirmPassword'
                placeholder='Nhập lại mật khẩu'
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setConfirmPasswordError('')
                }}
                autoComplete='new-password'
              />
            </div>
            {confirmPasswordError && (
              <div className='error-message show'>{confirmPasswordError}</div>
            )}
          </div>

          <div className='forgot-password'>
            <a href='#' onClick={handleForgotPassword}>
              Quên mật khẩu?
            </a>
          </div>

          <button type='submit' className='btn-register' disabled={loading}>
            {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
          </button>
        </form>

        <div className='login-link'>
          Đã có tài khoản?{' '}
          <a href='#' onClick={() => history.push('/login')}>
            Đăng nhập ngay
          </a>
        </div>
      </div>
    </main>
  )
}

export default RegisterScreen