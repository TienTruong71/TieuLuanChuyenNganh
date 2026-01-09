// src/actions/userActions.js
import axios from 'axios'

// Action Types
export const USER_LOGIN_REQUEST = 'USER_LOGIN_REQUEST'
export const USER_LOGIN_SUCCESS = 'USER_LOGIN_SUCCESS'
export const USER_LOGIN_FAIL = 'USER_LOGIN_FAIL'
export const USER_LOGOUT = 'USER_LOGOUT'

export const USER_REGISTER_REQUEST = 'USER_REGISTER_REQUEST'
export const USER_REGISTER_SUCCESS = 'USER_REGISTER_SUCCESS'
export const USER_REGISTER_FAIL = 'USER_REGISTER_FAIL'

export const USER_DETAILS_REQUEST = 'USER_DETAILS_REQUEST'
export const USER_DETAILS_SUCCESS = 'USER_DETAILS_SUCCESS'
export const USER_DETAILS_FAIL = 'USER_DETAILS_FAIL'
export const USER_DETAILS_RESET = 'USER_DETAILS_RESET'

export const VERIFY_EMAIL_OTP_REQUEST = 'VERIFY_EMAIL_OTP_REQUEST'
export const VERIFY_EMAIL_OTP_SUCCESS = 'VERIFY_EMAIL_OTP_SUCCESS'
export const VERIFY_EMAIL_OTP_FAIL = 'VERIFY_EMAIL_OTP_FAIL'

// ✅ NEW: Change Password Action Types
export const USER_CHANGE_PASSWORD_REQUEST = 'USER_CHANGE_PASSWORD_REQUEST'
export const USER_CHANGE_PASSWORD_SUCCESS = 'USER_CHANGE_PASSWORD_SUCCESS'
export const USER_CHANGE_PASSWORD_FAIL = 'USER_CHANGE_PASSWORD_FAIL'
export const USER_CHANGE_PASSWORD_RESET = 'USER_CHANGE_PASSWORD_RESET'

export const FORGOT_PASSWORD_REQUEST = 'FORGOT_PASSWORD_REQUEST'
export const FORGOT_PASSWORD_SUCCESS = 'FORGOT_PASSWORD_SUCCESS'
export const FORGOT_PASSWORD_FAIL = 'FORGOT_PASSWORD_FAIL'
export const FORGOT_PASSWORD_RESET = 'FORGOT_PASSWORD_RESET'

export const RESET_PASSWORD_REQUEST = 'RESET_PASSWORD_REQUEST'
export const RESET_PASSWORD_SUCCESS = 'RESET_PASSWORD_SUCCESS'
export const RESET_PASSWORD_FAIL = 'RESET_PASSWORD_FAIL'
export const RESET_PASSWORD_RESET = 'RESET_PASSWORD_RESET'

// =====================================================
// LOGIN ACTION
// =====================================================
export const login = (email, password) => async (dispatch) => {
  try {
    dispatch({ type: USER_LOGIN_REQUEST })

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    }

    const { data } = await axios.post(
      '/api/client/auth/login',
      { email, password },
      config
    )

    dispatch({
      type: USER_LOGIN_SUCCESS,
      payload: data,
    })
    
    localStorage.setItem('userInfo', JSON.stringify(data))

  } catch (error) {
    dispatch({
      type: USER_LOGIN_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    })
  }
}

// =====================================================
// REGISTER ACTION - KẾT NỐI API THẬT
// =====================================================
export const register = (email, username, password, full_name, phone) => async (dispatch) => {
  try {
    dispatch({ type: USER_REGISTER_REQUEST })

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    }

    // Gọi API register
    const { data } = await axios.post(
      '/api/client/auth/register',
      { 
        email, 
        username, 
        password,
        full_name: full_name || username,
        phone: phone || ''
      },
      config
    )

    // Dispatch register success
    dispatch({
      type: USER_REGISTER_SUCCESS,
      payload: data,
    })

    // Auto login sau khi register thành công
    dispatch({
      type: USER_LOGIN_SUCCESS,
      payload: data,
    })

    // Lưu vào localStorage
    localStorage.setItem('userInfo', JSON.stringify(data))
  } catch (error) {
    dispatch({
      type: USER_REGISTER_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    })
  }
}

// =====================================================
// LOGOUT ACTION
// =====================================================
export const logout = () => (dispatch) => {
  localStorage.removeItem('userInfo')
  dispatch({ type: USER_LOGOUT })
  dispatch({ type: USER_DETAILS_RESET })
  
  // Redirect về trang login
  window.location.href = '/login'
}

// =====================================================
// GET USER DETAILS
// =====================================================
export const getUserDetails = () => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_DETAILS_REQUEST })

    const {
      userLogin: { userInfo },
    } = getState()

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    }

    const { data } = await axios.get('/api/client/auth/me', config)

    dispatch({
      type: USER_DETAILS_SUCCESS,
      payload: data,
    })
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    
    if (message === 'Not authorized, token failed') {
      dispatch(logout())
    }
    
    dispatch({
      type: USER_DETAILS_FAIL,
      payload: message,
    })
  }
}

export const verifyEmailOTP = (email, otp) => async (dispatch) => {
  try {
    dispatch({ type: VERIFY_EMAIL_OTP_REQUEST })

    const { data } = await axios.post(
      '/api/client/auth/verify-email-otp',
      { email, otp },
      { headers: { 'Content-Type': 'application/json' } }
    )

    dispatch({
      type: VERIFY_EMAIL_OTP_SUCCESS,
      payload: data.message,
    })
  } catch (error) {
    dispatch({
      type: VERIFY_EMAIL_OTP_FAIL,
      payload:
        error.response?.data?.message || error.message,
    })
  }
}

// =====================================================
// GOOGLE LOGIN ACTION
// =====================================================
export const loginWithGoogle = (idToken) => async (dispatch) => {
  try {
    dispatch({ type: USER_LOGIN_REQUEST })

    const { data } = await axios.post(
      '/api/client/auth/google-login',
      { idToken },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    )

    dispatch({
      type: USER_LOGIN_SUCCESS,
      payload: data,
    })

    localStorage.setItem('userInfo', JSON.stringify(data))
  } catch (error) {
    dispatch({
      type: USER_LOGIN_FAIL,
      payload:
        error.response?.data?.message || error.message,
    })
  }
}

// =====================================================
// ✅ NEW: CHANGE PASSWORD ACTION
// =====================================================
export const changePassword = (currentPassword, newPassword) => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_CHANGE_PASSWORD_REQUEST })

    const {
      userLogin: { userInfo },
    } = getState()

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    }

    const { data } = await axios.put(
      '/api/client/auth/change-password',
      { currentPassword, newPassword },
      config
    )

    dispatch({
      type: USER_CHANGE_PASSWORD_SUCCESS,
      payload: data.message,
    })
  } catch (error) {
    dispatch({
      type: USER_CHANGE_PASSWORD_FAIL,
      payload:
        error.response?.data?.message || error.message,
    })
  }
}


export const forgotPassword = (email) => async (dispatch) => {
  try {
    dispatch({ type: FORGOT_PASSWORD_REQUEST })

    const { data } = await axios.post(
      '/api/client/auth/forgot-password',
      { email },
      { headers: { 'Content-Type': 'application/json' } }
    )

    dispatch({
      type: FORGOT_PASSWORD_SUCCESS,
      payload: data.message,
    })
  } catch (error) {
    dispatch({
      type: FORGOT_PASSWORD_FAIL,
      payload:
        error.response?.data?.message || error.message,
    })
  }
}

export const resetPassword = (token, newPassword) => async (dispatch) => {
  try {
    dispatch({ type: RESET_PASSWORD_REQUEST })

    const { data } = await axios.post(
      '/api/client/auth/reset-password',
      { token, newPassword },
      { headers: { 'Content-Type': 'application/json' } }
    )

    dispatch({
      type: RESET_PASSWORD_SUCCESS,
      payload: data.message,
    })
  } catch (error) {
    dispatch({
      type: RESET_PASSWORD_FAIL,
      payload:
        error.response?.data?.message || error.message,
    })
  }
}