// src/reducers/userReducers.js
import {
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAIL,
  USER_LOGOUT,
  USER_REGISTER_REQUEST,
  USER_REGISTER_SUCCESS,
  USER_REGISTER_FAIL,
  USER_DETAILS_REQUEST,
  USER_DETAILS_SUCCESS,
  USER_DETAILS_FAIL,
  USER_DETAILS_RESET,
  VERIFY_EMAIL_OTP_REQUEST,
  VERIFY_EMAIL_OTP_SUCCESS,
  VERIFY_EMAIL_OTP_FAIL,
  USER_CHANGE_PASSWORD_REQUEST,
  USER_CHANGE_PASSWORD_SUCCESS,
  USER_CHANGE_PASSWORD_FAIL,
  USER_CHANGE_PASSWORD_RESET,
  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_SUCCESS,
  FORGOT_PASSWORD_FAIL,
  FORGOT_PASSWORD_RESET,
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_FAIL,
  RESET_PASSWORD_RESET,


} from '../actions/userActions'

// =====================================================
// USER LOGIN REDUCER
// =====================================================
export const userLoginReducer = (state = {}, action) => {
  switch (action.type) {
    case USER_LOGIN_REQUEST:
      return { loading: true }
    case USER_LOGIN_SUCCESS:
      return { loading: false, userInfo: action.payload }
    case USER_LOGIN_FAIL:
      return { loading: false, error: action.payload }
    case USER_LOGOUT:
      return {}
    default:
      return state
  }
}

// =====================================================
// USER REGISTER REDUCER
// =====================================================
export const userRegisterReducer = (state = {}, action) => {
  switch (action.type) {
    case USER_REGISTER_REQUEST:
      return { loading: true }
    case USER_REGISTER_SUCCESS:
      return { loading: false, userInfo: action.payload }
    case USER_REGISTER_FAIL:
      return { loading: false, error: action.payload }
    case USER_LOGOUT:
      return {}
    default:
      return state
  }
}

// =====================================================
// USER DETAILS REDUCER
// =====================================================
export const userDetailsReducer = (state = { user: {} }, action) => {
  switch (action.type) {
    case USER_DETAILS_REQUEST:
      return { ...state, loading: true }
    case USER_DETAILS_SUCCESS:
      return { loading: false, user: action.payload }
    case USER_DETAILS_FAIL:
      return { loading: false, error: action.payload }
    case USER_DETAILS_RESET:
      return { user: {} }
    default:
      return state
  }
}
export const verifyEmailReducer = (
  state = {},
  action
) => {
  switch (action.type) {
    case VERIFY_EMAIL_OTP_REQUEST:
      return { loading: true }
    case VERIFY_EMAIL_OTP_SUCCESS:
      return { loading: false, success: true, message: action.payload }
    case VERIFY_EMAIL_OTP_FAIL:
      return { loading: false, error: action.payload }
    default:
      return state
  }
}
export const verifyOTPReducer = (
  state = { loading: false, success: false },
  action
) => {
  switch (action.type) {
    case 'VERIFY_OTP_REQUEST':
      return { loading: true }

    case 'VERIFY_OTP_SUCCESS':
      return { loading: false, success: true }

    case 'VERIFY_OTP_FAIL':
      return { loading: false, error: action.payload }

    default:
      return state
  }
}

export const userChangePasswordReducer = (state = {}, action) => {
  switch (action.type) {
    case USER_CHANGE_PASSWORD_REQUEST:
      return { loading: true }
    case USER_CHANGE_PASSWORD_SUCCESS:
      return { loading: false, success: true, message: action.payload }
    case USER_CHANGE_PASSWORD_FAIL:
      return { loading: false, error: action.payload }
    case USER_CHANGE_PASSWORD_RESET:
      return {}
    default:
      return state
  }
}

export const forgotPasswordReducer = (state = {}, action) => {
  switch (action.type) {
    case FORGOT_PASSWORD_REQUEST:
      return { loading: true }
    case FORGOT_PASSWORD_SUCCESS:
      return { loading: false, success: true, message: action.payload }
    case FORGOT_PASSWORD_FAIL:
      return { loading: false, error: action.payload }
    case FORGOT_PASSWORD_RESET:
      return {}
    default:
      return state
  }
}

export const resetPasswordReducer = (state = {}, action) => {
  switch (action.type) {
    case RESET_PASSWORD_REQUEST:
      return { loading: true }
    case RESET_PASSWORD_SUCCESS:
      return { loading: false, success: true, message: action.payload }
    case RESET_PASSWORD_FAIL:
      return { loading: false, error: action.payload }
    case RESET_PASSWORD_RESET:
      return {}
    default:
      return state
  }
}