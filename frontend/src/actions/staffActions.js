import axios from 'axios'

// Action Types
export const ADMIN_STAFF_LIST_REQUEST = 'ADMIN_STAFF_LIST_REQUEST'
export const ADMIN_STAFF_LIST_SUCCESS = 'ADMIN_STAFF_LIST_SUCCESS'
export const ADMIN_STAFF_LIST_FAILURE = 'ADMIN_STAFF_LIST_FAILURE'

export const ADMIN_STAFF_CREATE_REQUEST = 'ADMIN_STAFF_CREATE_REQUEST'
export const ADMIN_STAFF_CREATE_SUCCESS = 'ADMIN_STAFF_CREATE_SUCCESS'
export const ADMIN_STAFF_CREATE_FAILURE = 'ADMIN_STAFF_CREATE_FAILURE'
export const ADMIN_STAFF_CREATE_RESET = 'ADMIN_STAFF_CREATE_RESET'

export const ADMIN_STAFF_UPDATE_REQUEST = 'ADMIN_STAFF_UPDATE_REQUEST'
export const ADMIN_STAFF_UPDATE_SUCCESS = 'ADMIN_STAFF_UPDATE_SUCCESS'
export const ADMIN_STAFF_UPDATE_FAILURE = 'ADMIN_STAFF_UPDATE_FAILURE'
export const ADMIN_STAFF_UPDATE_RESET = 'ADMIN_STAFF_UPDATE_RESET'

export const ADMIN_STAFF_DELETE_REQUEST = 'ADMIN_STAFF_DELETE_REQUEST'
export const ADMIN_STAFF_DELETE_SUCCESS = 'ADMIN_STAFF_DELETE_SUCCESS'
export const ADMIN_STAFF_DELETE_FAILURE = 'ADMIN_STAFF_DELETE_FAILURE'

// Lấy danh sách nhân viên
export const listStaff = (page = 1, limit = 10, search = '') => async (dispatch, getState) => {
    dispatch({ type: ADMIN_STAFF_LIST_REQUEST })
    
    try {
        const { userLogin: { userInfo } } = getState()
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`
            }
        }
        
        const { data } = await axios.get(
            `http://localhost:5000/api/admin/staff?page=${page}&limit=${limit}&search=${search}`,
            config
        )
        
        dispatch({
            type: ADMIN_STAFF_LIST_SUCCESS,
            payload: data
        })
    } catch (error) {
        dispatch({
            type: ADMIN_STAFF_LIST_FAILURE,
            payload: error.response?.data?.message || error.message
        })
    }
}

// Tạo nhân viên mới
export const createStaff = (staffData) => async (dispatch, getState) => {
    dispatch({ type: ADMIN_STAFF_CREATE_REQUEST })
    
    try {
        const { userLogin: { userInfo } } = getState()
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`
            }
        }
        
        const { data } = await axios.post(
            'http://localhost:5000/api/admin/staff',
            staffData,
            config
        )
        
        dispatch({
            type: ADMIN_STAFF_CREATE_SUCCESS,
            payload: data
        })
    } catch (error) {
        dispatch({
            type: ADMIN_STAFF_CREATE_FAILURE,
            payload: error.response?.data?.message || error.message
        })
    }
}

// Cập nhật nhân viên
export const updateStaff = (id, staffData) => async (dispatch, getState) => {
    dispatch({ type: ADMIN_STAFF_UPDATE_REQUEST })
    
    try {
        const { userLogin: { userInfo } } = getState()
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`
            }
        }
        
        const { data } = await axios.put(
            `http://localhost:5000/api/admin/staff/${id}`,
            staffData,
            config
        )
        
        dispatch({
            type: ADMIN_STAFF_UPDATE_SUCCESS,
            payload: data
        })
    } catch (error) {
        dispatch({
            type: ADMIN_STAFF_UPDATE_FAILURE,
            payload: error.response?.data?.message || error.message
        })
    }
}

// Xóa nhân viên
export const deleteStaff = (id) => async (dispatch, getState) => {
    dispatch({ type: ADMIN_STAFF_DELETE_REQUEST })
    
    try {
        const { userLogin: { userInfo } } = getState()
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`
            }
        }
        
        const { data } = await axios.delete(
            `http://localhost:5000/api/admin/staff/${id}`,
            config
        )
        
        dispatch({
            type: ADMIN_STAFF_DELETE_SUCCESS,
            payload: data
        })
    } catch (error) {
        dispatch({
            type: ADMIN_STAFF_DELETE_FAILURE,
            payload: error.response?.data?.message || error.message
        })
    }
}
