import axios from 'axios'

export const GET_SUPPORT_REQUESTS_REQUEST = 'GET_SUPPORT_REQUESTS_REQUEST'
export const GET_SUPPORT_REQUESTS_SUCCESS = 'GET_SUPPORT_REQUESTS_SUCCESS'
export const GET_SUPPORT_REQUESTS_FAILURE = 'GET_SUPPORT_REQUESTS_FAILURE'

export const GET_SUPPORT_REQUEST_DETAIL_REQUEST = 'GET_SUPPORT_REQUEST_DETAIL_REQUEST'
export const GET_SUPPORT_REQUEST_DETAIL_SUCCESS = 'GET_SUPPORT_REQUEST_DETAIL_SUCCESS'
export const GET_SUPPORT_REQUEST_DETAIL_FAILURE = 'GET_SUPPORT_REQUEST_DETAIL_FAILURE'

export const REPLY_SUPPORT_REQUEST_REQUEST = 'REPLY_SUPPORT_REQUEST_REQUEST'
export const REPLY_SUPPORT_REQUEST_SUCCESS = 'REPLY_SUPPORT_REQUEST_SUCCESS'
export const REPLY_SUPPORT_REQUEST_FAILURE = 'REPLY_SUPPORT_REQUEST_FAILURE'
export const CLEAR_SUPPORT_MESSAGE = 'CLEAR_SUPPORT_MESSAGE'

// Lấy danh sách tất cả yêu cầu hỗ trợ (chỉ cho staff)
export const getSupportRequests = (page = 1) => async (dispatch, getState) => {
  dispatch({ type: GET_SUPPORT_REQUESTS_REQUEST })
  
  try {
    const { userLogin: { userInfo } } = getState()
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`
      }
    }
    
    const { data } = await axios.get(
      `http://localhost:5000/api/staff/sale/support?page=${page}`,
      config
    )
    
    dispatch({
      type: GET_SUPPORT_REQUESTS_SUCCESS,
      payload: data
    })
  } catch (error) {
    dispatch({
      type: GET_SUPPORT_REQUESTS_FAILURE,
      payload: error.response?.data?.message || error.message
    })
  }
}

// Lấy chi tiết yêu cầu hỗ trợ
export const getSupportRequestDetail = (id) => async (dispatch, getState) => {
  dispatch({ type: GET_SUPPORT_REQUEST_DETAIL_REQUEST })
  
  try {
    const { userLogin: { userInfo } } = getState()
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`
      }
    }
    
    const { data } = await axios.get(
      `http://localhost:5000/api/staff/sale/support/${id}`,
      config
    )
    
    dispatch({
      type: GET_SUPPORT_REQUEST_DETAIL_SUCCESS,
      payload: data
    })
  } catch (error) {
    dispatch({
      type: GET_SUPPORT_REQUEST_DETAIL_FAILURE,
      payload: error.response?.data?.message || error.message
    })
  }
}

// Trả lời và đóng yêu cầu hỗ trợ
export const replySupportRequest = (id, replyData) => async (dispatch, getState) => {
  dispatch({ type: REPLY_SUPPORT_REQUEST_REQUEST })
  
  try {
    const { userLogin: { userInfo } } = getState()
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`
      }
    }
    
    const { data } = await axios.put(
      `http://localhost:5000/api/staff/sale/support/${id}/reply`,
      replyData,
      config
    )
    
    dispatch({
      type: REPLY_SUPPORT_REQUEST_SUCCESS,
      payload: data
    })
  } catch (error) {
    dispatch({
      type: REPLY_SUPPORT_REQUEST_FAILURE,
      payload: error.response?.data?.message || error.message
    })
  }
}

// Xóa thông báo từ redux
export const clearSupportMessage = () => (dispatch) => {
  dispatch({ type: CLEAR_SUPPORT_MESSAGE })
}
