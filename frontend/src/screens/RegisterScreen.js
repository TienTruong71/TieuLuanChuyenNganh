import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { register } from '../actions/userActions'
import '../styles/auth.css'

const RegisterScreen = () => {
  const history = useHistory()
  const dispatch = useDispatch()

  // State cho form
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [full_name, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  
  // State cho validation errors
  const [emailError, setEmailError] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  // Lấy state từ Redux
  const userRegister = useSelector((state) => state.userRegister)
  const { loading, error, userInfo } = userRegister

  // Redirect nếu đăng ký thành công
  useEffect(() => {
    if (userInfo) {
      setShowSuccess(true)
      setTimeout(() => {
        // Tự động redirect về trang chủ sau khi register thành công
        // (vì đã auto-login)
        history.push('/')
      }, 2000)
    }
  }, [history, userInfo])

  // Validate email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validate username
  const isValidUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    return usernameRegex.test(username)
  }

  // Check password strength
  const checkPasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (password.match(/[a-z]+/)) strength++
    if (password.match(/[A-Z]+/)) strength++
    if (password.match(/[0-9]+/)) strength++
    if (password.match(/[$@#&!]+/)) strength++
    
    if (strength <= 2) return 'Yếu'
    if (strength <= 4) return 'Trung bình'
    return 'Mạnh'
  }

  // Validate form
  const validateForm = () => {
    let isValid = true
    setEmailError('')
    setUsernameError('')
    setPasswordError('')
    setConfirmPasswordError('')

    // Validate email
    if (email.trim() === '') {
      setEmailError('Vui lòng nhập địa chỉ email')
      isValid = false
    } else if (!isValidEmail(email)) {
      setEmailError('Email không hợp lệ')
      isValid = false
    }

    // Validate username
    if (username.trim() === '') {
      setUsernameError('Vui lòng nhập tên đăng nhập')
      isValid = false
    } else if (!isValidUsername(username)) {
      setUsernameError('Tên đăng nhập phải từ 3-20 ký tự, chỉ chứa chữ, số và dấu gạch dưới')
      isValid = false
    }

    // Validate password
    if (password === '') {
      setPasswordError('Vui lòng nhập mật khẩu')
      isValid = false
    } else if (password.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự')
      isValid = false
    } else if (password.length < 8) {
      setPasswordError('Mật khẩu nên có ít nhất 8 ký tự để an toàn hơn')
      // Không set isValid = false, chỉ cảnh báo
    }

    // Validate confirm password
    if (confirmPassword === '') {
      setConfirmPasswordError('Vui lòng nhập lại mật khẩu')
      isValid = false
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Mật khẩu không khớp')
      isValid = false
    }

    return isValid
  }

  // Submit handler
  const submitHandler = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      // Dispatch register action với email, username, password, full_name, phone
      dispatch(register(
        email, 
        username, 
        password, 
        full_name || username, // Nếu không có full_name thì dùng username
        phone
      ))
    }
  }

  return (
    <main className='page-main'>
      <div className='register-container'>
        <div className='register-header'>
          <h1>Đăng Ký</h1>
          <p>Tạo tài khoản mới của bạn</p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className='success-message show'>
            Đăng ký thành công! Đang chuyển hướng...
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
            <label htmlFor='email'>Email *</label>
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
                disabled={loading}
              />
            </div>
            {emailError && (
              <div className='error-message show'>{emailError}</div>
            )}
          </div>

          {/* Username Input */}
          <div className='form-group'>
            <label htmlFor='username'>Tên đăng nhập *</label>
            <div className='input-wrapper'>
              <input
                type='text'
                id='username'
                placeholder='Nhập tên đăng nhập (3-20 ký tự)'
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setUsernameError('')
                }}
                autoComplete='username'
                disabled={loading}
              />
            </div>
            {usernameError && (
              <div className='error-message show'>{usernameError}</div>
            )}
          </div>

          {/* Full Name Input (Optional) */}
          <div className='form-group'>
            <label htmlFor='full_name'>Họ và tên</label>
            <div className='input-wrapper'>
              <input
                type='text'
                id='full_name'
                placeholder='Nhập họ và tên đầy đủ (tùy chọn)'
                value={full_name}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete='name'
                disabled={loading}
              />
            </div>
          </div>

          {/* Phone Input (Optional) */}
          <div className='form-group'>
            <label htmlFor='phone'>Số điện thoại</label>
            <div className='input-wrapper'>
              <input
                type='tel'
                id='phone'
                placeholder='Nhập số điện thoại (tùy chọn)'
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete='tel'
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className='form-group'>
            <label htmlFor='password'>Mật khẩu *</label>
            <div className='input-wrapper'>
              <input
                type='password'
                id='password'
                placeholder='Nhập mật khẩu (tối thiểu 6 ký tự)'
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setPasswordError('')
                }}
                autoComplete='new-password'
                disabled={loading}
              />
            </div>
            {passwordError && (
              <div className='error-message show'>{passwordError}</div>
            )}
            {password && password.length >= 6 && (
              <div className='password-strength'>
                Độ mạnh: <span className={checkPasswordStrength(password).toLowerCase()}>
                  {checkPasswordStrength(password)}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className='form-group'>
            <label htmlFor='confirmPassword'>Nhập lại mật khẩu *</label>
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
                disabled={loading}
              />
            </div>
            {confirmPasswordError && (
              <div className='error-message show'>{confirmPasswordError}</div>
            )}
          </div>

          {/* Submit Button */}
          <button type='submit' className='btn-register' disabled={loading}>
            {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
          </button>
        </form>

        {/* Login Link */}
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