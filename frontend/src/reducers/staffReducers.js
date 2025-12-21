import {
    ADMIN_STAFF_LIST_REQUEST,
    ADMIN_STAFF_LIST_SUCCESS,
    ADMIN_STAFF_LIST_FAILURE,
    ADMIN_STAFF_CREATE_REQUEST,
    ADMIN_STAFF_CREATE_SUCCESS,
    ADMIN_STAFF_CREATE_FAILURE,
    ADMIN_STAFF_CREATE_RESET,
    ADMIN_STAFF_UPDATE_REQUEST,
    ADMIN_STAFF_UPDATE_SUCCESS,
    ADMIN_STAFF_UPDATE_FAILURE,
    ADMIN_STAFF_UPDATE_RESET,
    ADMIN_STAFF_DELETE_REQUEST,
    ADMIN_STAFF_DELETE_SUCCESS,
    ADMIN_STAFF_DELETE_FAILURE,
} from '../actions/staffActions'

// List Staff Reducer
export const adminStaffListReducer = (
    state = { loading: false, staff: [], pagination: {}, error: null },
    action
) => {
    switch (action.type) {
        case ADMIN_STAFF_LIST_REQUEST:
            return { ...state, loading: true, error: null }
        case ADMIN_STAFF_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                staff: action.payload.staff || [],
                pagination: action.payload.pagination || {},
            }
        case ADMIN_STAFF_LIST_FAILURE:
            return { ...state, loading: false, error: action.payload }
        default:
            return state
    }
}

// Create Staff Reducer
export const adminStaffCreateReducer = (
    state = { loading: false, success: false, error: null, staff: null },
    action
) => {
    switch (action.type) {
        case ADMIN_STAFF_CREATE_REQUEST:
            return { ...state, loading: true, error: null }
        case ADMIN_STAFF_CREATE_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                staff: action.payload.staff,
                error: null,
            }
        case ADMIN_STAFF_CREATE_FAILURE:
            return { ...state, loading: false, success: false, error: action.payload }
        case ADMIN_STAFF_CREATE_RESET:
            return { loading: false, success: false, error: null, staff: null }
        default:
            return state
    }
}

// Update Staff Reducer
export const adminStaffUpdateReducer = (
    state = { loading: false, success: false, error: null, staff: null },
    action
) => {
    switch (action.type) {
        case ADMIN_STAFF_UPDATE_REQUEST:
            return { ...state, loading: true, error: null }
        case ADMIN_STAFF_UPDATE_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                staff: action.payload.staff,
                error: null,
            }
        case ADMIN_STAFF_UPDATE_FAILURE:
            return { ...state, loading: false, success: false, error: action.payload }
        case ADMIN_STAFF_UPDATE_RESET:
            return { loading: false, success: false, error: null, staff: null }
        default:
            return state
    }
}

// Delete Staff Reducer
export const adminStaffDeleteReducer = (
    state = { loading: false, success: false, error: null },
    action
) => {
    switch (action.type) {
        case ADMIN_STAFF_DELETE_REQUEST:
            return { ...state, loading: true, error: null }
        case ADMIN_STAFF_DELETE_SUCCESS:
            return { ...state, loading: false, success: true, error: null }
        case ADMIN_STAFF_DELETE_FAILURE:
            return { ...state, loading: false, success: false, error: action.payload }
        default:
            return state
    }
}
