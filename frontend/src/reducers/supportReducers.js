const initialState = {
    loading: false,
    error: null,
    message: null,
    success: false,
    activeRequest: null,
}

export const supportReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'CREATE_SUPPORT_REQUEST':
        case 'SEND_SUPPORT_MESSAGE':
        case 'CLOSE_SUPPORT_REQUEST':
            return {
                ...state,
                loading: true,
                error: null,
                message: null,
                success: false,
            }
        case 'CREATE_SUPPORT_SUCCESS':
            return {
                ...state,
                loading: false,
                message: action.payload.message,
                success: true,
                error: null,
                activeRequest: action.payload.supportRequest,
            }
        case 'SEND_SUPPORT_MESSAGE_SUCCESS':
            return {
                ...state,
                loading: false,
                success: true,
                activeRequest: action.payload.supportRequest,
            }
        case 'CREATE_SUPPORT_FAIL':
        case 'SEND_SUPPORT_MESSAGE_FAIL':
            return {
                ...state,
                loading: false,
                error: action.payload,
                success: false,
            }
        case 'GET_ACTIVE_SUPPORT_REQUEST':
            return {
                ...state,
                loading: true,
            }
        case 'GET_ACTIVE_SUPPORT_SUCCESS':
            return {
                ...state,
                loading: false,
                activeRequest: action.payload.activeRequest || null,
            }
        case 'GET_ACTIVE_SUPPORT_FAIL':
            return {
                ...state,
                loading: false,
                activeRequest: null,
            }
        case 'CLOSE_SUPPORT_SUCCESS':
            return {
                ...state,
                loading: false,
                message: 'Đã đóng yêu cầu hỗ trợ',
                success: true,
                activeRequest: null,
            }
        case 'CLOSE_SUPPORT_FAIL':
            return {
                ...state,
                loading: false,
                error: action.payload,
            }
        case 'CLEAR_SUPPORT_MESSAGE':
            return {
                ...state,
                message: null,
                success: false,
                error: null,
            }
        default:
            return state
    }
}
