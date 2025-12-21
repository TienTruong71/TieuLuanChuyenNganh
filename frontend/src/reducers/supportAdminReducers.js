import {
  GET_SUPPORT_REQUESTS_REQUEST,
  GET_SUPPORT_REQUESTS_SUCCESS,
  GET_SUPPORT_REQUESTS_FAILURE,
  GET_SUPPORT_REQUEST_DETAIL_REQUEST,
  GET_SUPPORT_REQUEST_DETAIL_SUCCESS,
  GET_SUPPORT_REQUEST_DETAIL_FAILURE,
  REPLY_SUPPORT_REQUEST_REQUEST,
  REPLY_SUPPORT_REQUEST_SUCCESS,
  REPLY_SUPPORT_REQUEST_FAILURE,
  CLEAR_SUPPORT_MESSAGE
} from '../actions/supportAdminActions'

const initialState = {
  supportRequests: [],
  selectedRequest: null,
  loading: false,
  error: null,
  message: '',
  success: false,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalRequests: 0
  }
}

export const supportAdminReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_SUPPORT_REQUESTS_REQUEST:
    case GET_SUPPORT_REQUEST_DETAIL_REQUEST:
    case REPLY_SUPPORT_REQUEST_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      }
    
    case GET_SUPPORT_REQUESTS_SUCCESS:
      return {
        ...state,
        loading: false,
        supportRequests: action.payload.supportRequests || [],
        pagination: action.payload.pagination || initialState.pagination,
        success: true
      }
    
    case GET_SUPPORT_REQUEST_DETAIL_SUCCESS:
      return {
        ...state,
        loading: false,
        selectedRequest: action.payload.supportRequest || action.payload,
        success: true
      }
    
    case REPLY_SUPPORT_REQUEST_SUCCESS:
      return {
        ...state,
        loading: false,
        message: action.payload.message || 'Đã trả lời thành công',
        success: true,
        selectedRequest: null
      }
    
    case GET_SUPPORT_REQUESTS_FAILURE:
    case GET_SUPPORT_REQUEST_DETAIL_FAILURE:
    case REPLY_SUPPORT_REQUEST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false
      }
    
    case CLEAR_SUPPORT_MESSAGE:
      return {
        ...state,
        message: '',
        error: null,
        success: false
      }
    
    default:
      return state
  }
}
