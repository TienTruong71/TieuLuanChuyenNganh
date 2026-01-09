const initialState = {
    feedbacks: [],
    loading: false,
    error: null,
    message: null,
    feedbackDetail: null,
    detailLoading: false,
    detailError: null,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
    },
    success: false,
}

export const feedbackReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'GET_FEEDBACKS_REQUEST':
            return { ...state, loading: true, error: null }
        case 'GET_FEEDBACKS_SUCCESS':
            return {
                ...state,
                loading: false,
                feedbacks: action.payload.feedbacks,
                pagination: action.payload.pagination,
                error: null,
            }
        case 'GET_FEEDBACKS_FAIL':
            return { ...state, loading: false, error: action.payload }

        case 'GET_FEEDBACK_DETAIL_REQUEST':
            return { ...state, detailLoading: true, detailError: null }
        case 'GET_FEEDBACK_DETAIL_SUCCESS':
            return {
                ...state,
                detailLoading: false,
                feedbackDetail: action.payload,
                detailError: null,
            }
        case 'GET_FEEDBACK_DETAIL_FAIL':
            return { ...state, detailLoading: false, detailError: action.payload }

        case 'CREATE_FEEDBACK_REQUEST':
            return { ...state, loading: true, error: null, message: null }
        case 'CREATE_FEEDBACK_SUCCESS':
            return {
                ...state,
                loading: false,
                // feedbacks: [action.payload.feedback, ...state.feedbacks], 
                message: action.payload.message,
                success: true,
                error: null,
            }
        case 'CREATE_FEEDBACK_FAIL':
            return { ...state, loading: false, error: action.payload }

        case 'UPDATE_FEEDBACK_REQUEST':
            return { ...state, loading: true, error: null, message: null }
        case 'UPDATE_FEEDBACK_SUCCESS':
            return {
                ...state,
                loading: false,
                feedbacks: state.feedbacks.map((fb) =>
                    fb._id === action.payload.feedback._id ? action.payload.feedback : fb
                ),
                feedbackDetail: action.payload.feedback,
                message: action.payload.message,
                success: true,
                error: null,
            }
        case 'UPDATE_FEEDBACK_FAIL':
            return { ...state, loading: false, error: action.payload }

        case 'DELETE_FEEDBACK_REQUEST':
            return { ...state, loading: true, error: null, message: null }
        case 'DELETE_FEEDBACK_SUCCESS':
            return {
                ...state,
                loading: false,
                message: action.payload.message,
                success: true,
                error: null,
            }
        case 'DELETE_FEEDBACK_FAIL':
            return { ...state, loading: false, error: action.payload }

        case 'CLEAR_FEEDBACK_DETAIL':
            return { ...state, feedbackDetail: null }
        case 'CLEAR_FEEDBACK_MESSAGE':
            return { ...state, message: null, success: false }

        default:
            return state
    }
}
