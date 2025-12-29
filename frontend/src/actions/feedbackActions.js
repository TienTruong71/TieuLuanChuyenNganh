import axios from 'axios'

// Lấy danh sách feedback
export const getFeedbacks = (page = 1, limit = 10, productId = '', serviceId = '') => async (dispatch, getState) => {
    try {
        dispatch({ type: 'GET_FEEDBACKS_REQUEST' })

        const {
            userLogin: { userInfo },
        } = getState()

        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
        }

        if (userInfo) {
            config.headers.Authorization = `Bearer ${userInfo.token}`
        }

        let url = '/api/client/feedbacks';
        if (productId || serviceId) {
            url = '/api/client/feedbacks/public';
        }

        const { data } = await axios.get(url, {
            params: {
                page,
                limit,
                product_id: productId,
                service_id: serviceId,
            },
            ...config,
        })

        dispatch({
            type: 'GET_FEEDBACKS_SUCCESS',
            payload: data,
        })
    } catch (error) {
        dispatch({
            type: 'GET_FEEDBACKS_FAIL',
            payload: error.response?.data?.message || error.message,
        })
    }
}

// Lấy chi tiết feedback
export const getFeedbackById = (id) => async (dispatch, getState) => {
    try {
        dispatch({ type: 'GET_FEEDBACK_DETAIL_REQUEST' })

        const {
            userLogin: { userInfo },
        } = getState()

        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
        }

        if (userInfo) {
            config.headers.Authorization = `Bearer ${userInfo.token}`
        }

        const { data } = await axios.get(`/api/client/feedbacks/${id}`, config)

        dispatch({
            type: 'GET_FEEDBACK_DETAIL_SUCCESS',
            payload: data,
        })
    } catch (error) {
        dispatch({
            type: 'GET_FEEDBACK_DETAIL_FAIL',
            payload: error.response?.data?.message || error.message,
        })
    }
}

// Tạo feedback
export const createFeedback = (feedbackData) => async (dispatch, getState) => {
    try {
        dispatch({ type: 'CREATE_FEEDBACK_REQUEST' })

        const {
            userLogin: { userInfo },
        } = getState()

        if (!userInfo) {
            throw new Error('Vui lòng đăng nhập để gửi đánh giá')
        }

        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`,
            },
        }

        const { data } = await axios.post('/api/client/feedbacks', feedbackData, config)

        dispatch({
            type: 'CREATE_FEEDBACK_SUCCESS',
            payload: data,
        })

        return data
    } catch (error) {
        dispatch({
            type: 'CREATE_FEEDBACK_FAIL',
            payload: error.response?.data?.message || error.message,
        })
        throw error
    }
}

// Cập nhật feedback
export const updateFeedback = (id, feedbackData) => async (dispatch, getState) => {
    try {
        dispatch({ type: 'UPDATE_FEEDBACK_REQUEST' })

        const {
            userLogin: { userInfo },
        } = getState()

        if (!userInfo) {
            throw new Error('Vui lòng đăng nhập để cập nhật đánh giá')
        }

        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`,
            },
        }

        const { data } = await axios.put(`/api/client/feedbacks/${id}`, feedbackData, config)

        dispatch({
            type: 'UPDATE_FEEDBACK_SUCCESS',
            payload: data,
        })

        return data
    } catch (error) {
        dispatch({
            type: 'UPDATE_FEEDBACK_FAIL',
            payload: error.response?.data?.message || error.message,
        })
        throw error
    }
}

// Xóa feedback
export const deleteFeedback = (id) => async (dispatch, getState) => {
    try {
        dispatch({ type: 'DELETE_FEEDBACK_REQUEST' })

        const {
            userLogin: { userInfo },
        } = getState()

        if (!userInfo) {
            throw new Error('Vui lòng đăng nhập để xóa đánh giá')
        }

        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`,
            },
        }

        const { data } = await axios.delete(`/api/client/feedbacks/${id}`, config)

        dispatch({
            type: 'DELETE_FEEDBACK_SUCCESS',
            payload: data,
        })

        return data
    } catch (error) {
        dispatch({
            type: 'DELETE_FEEDBACK_FAIL',
            payload: error.response?.data?.message || error.message,
        })
        throw error
    }
}

// Clear feedback detail
export const clearFeedbackDetail = () => (dispatch) => {
    dispatch({ type: 'CLEAR_FEEDBACK_DETAIL' })
}

// Clear feedback message
export const clearFeedbackMessage = () => (dispatch) => {
    dispatch({ type: 'CLEAR_FEEDBACK_MESSAGE' })
}
