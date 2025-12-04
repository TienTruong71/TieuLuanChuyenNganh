// src/actions/bookingActions.js
import axios from 'axios'
import {
  SERVICE_LIST_REQUEST,
  SERVICE_LIST_SUCCESS,
  SERVICE_LIST_FAIL,
  SERVICE_DETAILS_REQUEST,
  SERVICE_DETAILS_SUCCESS,
  SERVICE_DETAILS_FAIL,
  BOOKING_CREATE_REQUEST,
  BOOKING_CREATE_SUCCESS,
  BOOKING_CREATE_FAIL,
  BOOKING_LIST_MY_REQUEST,
  BOOKING_LIST_MY_SUCCESS,
  BOOKING_LIST_MY_FAIL,
  BOOKING_DETAILS_REQUEST,
  BOOKING_DETAILS_SUCCESS,
  BOOKING_DETAILS_FAIL,
  BOOKING_CANCEL_REQUEST,
  BOOKING_CANCEL_SUCCESS,
  BOOKING_CANCEL_FAIL,
} from '../constants/bookingConstants'

// Lấy danh sách services
export const listServices = () => async (dispatch) => {
  try {
    dispatch({ type: SERVICE_LIST_REQUEST })

    const { data } = await axios.get('/api/client/services')

    dispatch({
      type: SERVICE_LIST_SUCCESS,
      payload: data,
    })
  } catch (error) {
    dispatch({
      type: SERVICE_LIST_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    })
  }
}

// Lấy chi tiết service
export const getServiceDetails = (id) => async (dispatch) => {
  try {
    dispatch({ type: SERVICE_DETAILS_REQUEST })

    const { data } = await axios.get(`/api/client/services/${id}`)

    dispatch({
      type: SERVICE_DETAILS_SUCCESS,
      payload: data,
    })
  } catch (error) {
    dispatch({
      type: SERVICE_DETAILS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    })
  }
}

// Tạo booking mới
export const createBooking = (bookingData) => async (dispatch, getState) => {
  try {
    dispatch({ type: BOOKING_CREATE_REQUEST })

    const {
      userLogin: { userInfo },
    } = getState()

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    }

    const { data } = await axios.post(
      '/api/client/bookings',
      bookingData,
      config
    )

    dispatch({
      type: BOOKING_CREATE_SUCCESS,
      payload: data,
    })
  } catch (error) {
    dispatch({
      type: BOOKING_CREATE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    })
  }
}

// Lấy danh sách booking của user
export const listMyBookings = (page = 1, status = '') => async (dispatch, getState) => {
  try {
    dispatch({ type: BOOKING_LIST_MY_REQUEST })

    const {
      userLogin: { userInfo },
    } = getState()

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    }

    const { data } = await axios.get(
      `/api/client/bookings?page=${page}&status=${status}`,
      config
    )

    dispatch({
      type: BOOKING_LIST_MY_SUCCESS,
      payload: data,
    })
  } catch (error) {
    dispatch({
      type: BOOKING_LIST_MY_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    })
  }
}

// Lấy chi tiết booking
export const getBookingDetails = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: BOOKING_DETAILS_REQUEST })

    const {
      userLogin: { userInfo },
    } = getState()

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    }

    const { data } = await axios.get(`/api/client/bookings/${id}`, config)

    dispatch({
      type: BOOKING_DETAILS_SUCCESS,
      payload: data,
    })
  } catch (error) {
    dispatch({
      type: BOOKING_DETAILS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    })
  }
}

// Hủy booking
export const cancelBooking = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: BOOKING_CANCEL_REQUEST })

    const {
      userLogin: { userInfo },
    } = getState()

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    }

    const { data } = await axios.put(
      `/api/client/bookings/${id}/cancel`,
      {},
      config
    )

    dispatch({
      type: BOOKING_CANCEL_SUCCESS,
      payload: data,
    })
  } catch (error) {
    dispatch({
      type: BOOKING_CANCEL_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    })
  }
}