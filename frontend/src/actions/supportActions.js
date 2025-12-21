import axios from 'axios'

// Tạo yêu cầu hỗ trợ mới
export const createSupportRequest = (message) => async (dispatch, getState) => {
    try {
        dispatch({ type: 'CREATE_SUPPORT_REQUEST' })

        const {
            userLogin: { userInfo },
        } = getState()

        if (!userInfo) {
            throw new Error('Vui lòng đăng nhập để gửi yêu cầu hỗ trợ')
        }

        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`,
            },
        }

        const { data } = await axios.post('/api/client/support', { message }, config)

        dispatch({
            type: 'CREATE_SUPPORT_SUCCESS',
            payload: data,
        })

        return data
    } catch (error) {
        dispatch({
            type: 'CREATE_SUPPORT_FAIL',
            payload: error.response?.data?.message || error.message,
        })
        throw error
    }
}

// Clear support message
export const clearSupportMessage = () => (dispatch) => {
    dispatch({ type: 'CLEAR_SUPPORT_MESSAGE' })
}

// Lấy support request đang mở của user
export const getActiveSupportRequest = () => async (dispatch, getState) => {
    try {
        dispatch({ type: 'GET_ACTIVE_SUPPORT_REQUEST' })

        const {
            userLogin: { userInfo },
        } = getState()

        if (!userInfo) {
            return
        }

        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`,
            },
        }

        const { data } = await axios.get('/api/client/support/active', config)

        dispatch({
            type: 'GET_ACTIVE_SUPPORT_SUCCESS',
            payload: data,
        })
    } catch (error) {
        dispatch({
            type: 'GET_ACTIVE_SUPPORT_FAIL',
            payload: error.response?.data?.message || error.message,
        })
    }
}

// Gửi tin nhắn trong chat support
export const sendSupportMessage = (requestId, text) => async (dispatch, getState) => {
    try {
        dispatch({ type: 'SEND_SUPPORT_MESSAGE' })

        const {
            userLogin: { userInfo },
        } = getState()

        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`,
            },
        }

        const { data } = await axios.post(`/api/client/support/${requestId}/message`, { text }, config)

        dispatch({
            type: 'SEND_SUPPORT_MESSAGE_SUCCESS',
            payload: data,
        })

        return data
    } catch (error) {
        dispatch({
            type: 'SEND_SUPPORT_MESSAGE_FAIL',
            payload: error.response?.data?.message || error.message,
        })
        throw error
    }
}

// Đóng support request
export const closeSupportRequest = (requestId) => async (dispatch, getState) => {
    try {
        dispatch({ type: 'CLOSE_SUPPORT_REQUEST' })

        const {
            userLogin: { userInfo },
        } = getState()

        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`,
            },
        }

        const { data } = await axios.put(`/api/client/support/${requestId}/close`, {}, config)

        dispatch({
            type: 'CLOSE_SUPPORT_SUCCESS',
            payload: data,
        })

        return data
    } catch (error) {
        dispatch({
            type: 'CLOSE_SUPPORT_FAIL',
            payload: error.response?.data?.message || error.message,
        })
        throw error
    }
}
