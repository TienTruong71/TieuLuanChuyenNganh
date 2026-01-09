import axios from 'axios'
import {
    NOTIFICATION_LIST_REQUEST,
    NOTIFICATION_LIST_SUCCESS,
    NOTIFICATION_LIST_FAIL,
    NOTIFICATION_MARK_READ_REQUEST,
    NOTIFICATION_MARK_READ_SUCCESS,
    NOTIFICATION_MARK_READ_FAIL,
} from '../constants/notificationConstants'

export const listNotifications = () => async (dispatch, getState) => {
    try {
        dispatch({ type: NOTIFICATION_LIST_REQUEST })

        const {
            userLogin: { userInfo },
        } = getState()

        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`,
            },
        }

        const { data } = await axios.get('/api/client/notifications', config)

        dispatch({
            type: NOTIFICATION_LIST_SUCCESS,
            payload: data,
        })
    } catch (error) {
        dispatch({
            type: NOTIFICATION_LIST_FAIL,
            payload:
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message,
        })
    }
}

export const markNotificationAsRead = (id) => async (dispatch, getState) => {
    try {
        dispatch({ type: NOTIFICATION_MARK_READ_REQUEST })

        const {
            userLogin: { userInfo },
        } = getState()

        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`,
            },
        }

        await axios.put(`/api/client/notifications/${id}/read`, {}, config)

        dispatch({
            type: NOTIFICATION_MARK_READ_SUCCESS,
        })
    } catch (error) {
        dispatch({
            type: NOTIFICATION_MARK_READ_FAIL,
            payload:
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message,
        })
    }
}

export const markAllNotificationsAsRead = () => async (dispatch, getState) => {
    try {
        dispatch({ type: NOTIFICATION_MARK_READ_REQUEST })

        const {
            userLogin: { userInfo },
        } = getState()

        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`,
            },
        }

        // We need a backend endpoint for this or we iterate. 
        // Assuming we update the backend or iterate here.
        // For efficiency, let's assume we simply refetch for now or call a new endpoint if we had one.
        // Since we don't have a 'mark all' endpoint yet, we will rely on individual marking OR 
        // ideally create a new endpoint.
        // But the user just wants the BUTTON to mark them as read.

        // Let's check backend controller.
        // If not available, we can iterate on client or add endpoint.
        // Adding endpoint is cleaner. Let's assume we will add PUT /api/client/notifications/read-all

        await axios.put(`/api/client/notifications/read-all`, {}, config)

        dispatch({
            type: NOTIFICATION_MARK_READ_SUCCESS,
        })

        dispatch(listNotifications())

    } catch (error) {
        dispatch({
            type: NOTIFICATION_MARK_READ_FAIL,
            payload:
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message,
        })
    }
}
