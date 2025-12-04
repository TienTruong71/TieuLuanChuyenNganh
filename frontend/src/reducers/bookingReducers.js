// src/reducers/bookingReducers.js
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
  BOOKING_CREATE_RESET,
  BOOKING_LIST_MY_REQUEST,
  BOOKING_LIST_MY_SUCCESS,
  BOOKING_LIST_MY_FAIL,
  BOOKING_DETAILS_REQUEST,
  BOOKING_DETAILS_SUCCESS,
  BOOKING_DETAILS_FAIL,
  BOOKING_CANCEL_REQUEST,
  BOOKING_CANCEL_SUCCESS,
  BOOKING_CANCEL_FAIL,
  BOOKING_CANCEL_RESET,
} from '../constants/bookingConstants'

// Service List Reducer
export const serviceListReducer = (state = { services: [] }, action) => {
  switch (action.type) {
    case SERVICE_LIST_REQUEST:
      return { loading: true, services: [] }
    case SERVICE_LIST_SUCCESS:
      return { loading: false, services: action.payload }
    case SERVICE_LIST_FAIL:
      return { loading: false, error: action.payload }
    default:
      return state
  }
}

// Service Details Reducer
export const serviceDetailsReducer = (state = { service: {} }, action) => {
  switch (action.type) {
    case SERVICE_DETAILS_REQUEST:
      return { loading: true, ...state }
    case SERVICE_DETAILS_SUCCESS:
      return { loading: false, service: action.payload }
    case SERVICE_DETAILS_FAIL:
      return { loading: false, error: action.payload }
    default:
      return state
  }
}

// Booking Create Reducer
export const bookingCreateReducer = (state = {}, action) => {
  switch (action.type) {
    case BOOKING_CREATE_REQUEST:
      return { loading: true }
    case BOOKING_CREATE_SUCCESS:
      return { loading: false, success: true, booking: action.payload }
    case BOOKING_CREATE_FAIL:
      return { loading: false, error: action.payload }
    case BOOKING_CREATE_RESET:
      return {}
    default:
      return state
  }
}

// Booking List My Reducer
export const bookingListMyReducer = (state = { bookings: [] }, action) => {
  switch (action.type) {
    case BOOKING_LIST_MY_REQUEST:
      return { loading: true }
    case BOOKING_LIST_MY_SUCCESS:
      return {
        loading: false,
        bookings: action.payload.bookings,
        pagination: action.payload.pagination,
      }
    case BOOKING_LIST_MY_FAIL:
      return { loading: false, error: action.payload }
    default:
      return state
  }
}

// Booking Details Reducer
export const bookingDetailsReducer = (state = { booking: {} }, action) => {
  switch (action.type) {
    case BOOKING_DETAILS_REQUEST:
      return { loading: true, ...state }
    case BOOKING_DETAILS_SUCCESS:
      return { loading: false, booking: action.payload }
    case BOOKING_DETAILS_FAIL:
      return { loading: false, error: action.payload }
    default:
      return state
  }
}

// Booking Cancel Reducer
export const bookingCancelReducer = (state = {}, action) => {
  switch (action.type) {
    case BOOKING_CANCEL_REQUEST:
      return { loading: true }
    case BOOKING_CANCEL_SUCCESS:
      return { loading: false, success: true }
    case BOOKING_CANCEL_FAIL:
      return { loading: false, error: action.payload }
    case BOOKING_CANCEL_RESET:
      return {}
    default:
      return state
  }
}