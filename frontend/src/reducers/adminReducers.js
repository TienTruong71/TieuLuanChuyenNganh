// src/reducers/adminReducers.js
import {
  ADMIN_DASHBOARD_STATS_REQUEST,
  ADMIN_DASHBOARD_STATS_SUCCESS,
  ADMIN_DASHBOARD_STATS_FAIL,
  ADMIN_ORDER_LIST_REQUEST,
  ADMIN_ORDER_LIST_SUCCESS,
  ADMIN_ORDER_LIST_FAIL,
  ADMIN_ORDER_UPDATE_REQUEST,
  ADMIN_ORDER_UPDATE_SUCCESS,
  ADMIN_ORDER_UPDATE_FAIL,
  ADMIN_ORDER_UPDATE_RESET,
  ADMIN_ORDER_DELETE_REQUEST,
  ADMIN_ORDER_DELETE_SUCCESS,
  ADMIN_ORDER_DELETE_FAIL,
  ADMIN_CUSTOMER_LIST_REQUEST,
  ADMIN_CUSTOMER_LIST_SUCCESS,
  ADMIN_CUSTOMER_LIST_FAIL,
  ADMIN_CUSTOMER_UPDATE_REQUEST,
  ADMIN_CUSTOMER_UPDATE_SUCCESS,
  ADMIN_CUSTOMER_UPDATE_FAIL,
  ADMIN_CUSTOMER_UPDATE_RESET,
  ADMIN_CUSTOMER_DELETE_REQUEST,
  ADMIN_CUSTOMER_DELETE_SUCCESS,
  ADMIN_CUSTOMER_DELETE_FAIL,
  ADMIN_PRODUCT_LIST_REQUEST,
  ADMIN_PRODUCT_LIST_SUCCESS,
  ADMIN_PRODUCT_LIST_FAIL,
  ADMIN_PRODUCT_CREATE_REQUEST,
  ADMIN_PRODUCT_CREATE_SUCCESS,
  ADMIN_PRODUCT_CREATE_FAIL,
  ADMIN_PRODUCT_CREATE_RESET,
  ADMIN_PRODUCT_UPDATE_REQUEST,
  ADMIN_PRODUCT_UPDATE_SUCCESS,
  ADMIN_PRODUCT_UPDATE_FAIL,
  ADMIN_PRODUCT_UPDATE_RESET,
  ADMIN_PRODUCT_DELETE_REQUEST,
  ADMIN_PRODUCT_DELETE_SUCCESS,
  ADMIN_PRODUCT_DELETE_FAIL,
  ADMIN_CATEGORY_LIST_REQUEST,
  ADMIN_CATEGORY_LIST_SUCCESS,
  ADMIN_CATEGORY_LIST_FAIL,
  ADMIN_CATEGORY_CREATE_REQUEST,
  ADMIN_CATEGORY_CREATE_SUCCESS,
  ADMIN_CATEGORY_CREATE_FAIL,
  ADMIN_CATEGORY_CREATE_RESET,
  ADMIN_CATEGORY_UPDATE_REQUEST,
  ADMIN_CATEGORY_UPDATE_SUCCESS,
  ADMIN_CATEGORY_UPDATE_FAIL,
  ADMIN_CATEGORY_UPDATE_RESET,
  ADMIN_CATEGORY_DELETE_REQUEST,
  ADMIN_CATEGORY_DELETE_SUCCESS,
  ADMIN_CATEGORY_DELETE_FAIL,
  ADMIN_SERVICE_LIST_REQUEST,
  ADMIN_SERVICE_LIST_SUCCESS,
  ADMIN_SERVICE_LIST_FAIL,
  ADMIN_SERVICE_CREATE_REQUEST,
  ADMIN_SERVICE_CREATE_SUCCESS,
  ADMIN_SERVICE_CREATE_FAIL,
  ADMIN_SERVICE_CREATE_RESET,
  ADMIN_SERVICE_UPDATE_REQUEST,
  ADMIN_SERVICE_UPDATE_SUCCESS,
  ADMIN_SERVICE_UPDATE_FAIL,
  ADMIN_SERVICE_UPDATE_RESET,
  ADMIN_SERVICE_DELETE_REQUEST,
  ADMIN_SERVICE_DELETE_SUCCESS,
  ADMIN_SERVICE_DELETE_FAIL,
  ADMIN_CATEGORY_DELETE_RESET,
  ADMIN_PRODUCT_DELETE_RESET,
  ADMIN_SERVICE_DELETE_RESET
} from '../constants/adminConstants'

// Dashboard Stats Reducer
export const adminDashboardStatsReducer = (state = {}, action) => {
  switch (action.type) {
    case ADMIN_DASHBOARD_STATS_REQUEST:
      return { loading: true }
    case ADMIN_DASHBOARD_STATS_SUCCESS:
      return { loading: false, stats: action.payload }
    case ADMIN_DASHBOARD_STATS_FAIL:
      return { loading: false, error: action.payload }
    default:
      return state
  }
}

// Order List Reducer
export const adminOrderListReducer = (state = { orders: [], pagination: {} }, action) => {
  switch (action.type) {
    case ADMIN_ORDER_LIST_REQUEST:
      return { loading: true, orders: [] }
    case ADMIN_ORDER_LIST_SUCCESS:
      return {
        loading: false,
        orders: action.payload.orders,
        pagination: action.payload.pagination,
      }
    case ADMIN_ORDER_LIST_FAIL:
      return { loading: false, error: action.payload }
    default:
      return state
  }
}

// Order Update Reducer
export const adminOrderUpdateReducer = (state = {}, action) => {
  switch (action.type) {
    case ADMIN_ORDER_UPDATE_REQUEST:
      return { loading: true }
    case ADMIN_ORDER_UPDATE_SUCCESS:
      return { loading: false, success: true, order: action.payload }
    case ADMIN_ORDER_UPDATE_FAIL:
      return { loading: false, error: action.payload }
    case ADMIN_ORDER_UPDATE_RESET:
      return {}
    default:
      return state
  }
}

// Order Delete Reducer
export const adminOrderDeleteReducer = (state = {}, action) => {
  switch (action.type) {
    case ADMIN_ORDER_DELETE_REQUEST:
      return { loading: true }
    case ADMIN_ORDER_DELETE_SUCCESS:
      return { loading: false, success: true }
    case ADMIN_ORDER_DELETE_FAIL:
      return { loading: false, error: action.payload }
    default:
      return state
  }
}

// Customer List Reducer
export const adminCustomerListReducer = (state = { customers: [], pagination: {} }, action) => {
  switch (action.type) {
    case ADMIN_CUSTOMER_LIST_REQUEST:
      return { loading: true, customers: [] }
    case ADMIN_CUSTOMER_LIST_SUCCESS:
      return {
        loading: false,
        customers: action.payload.customers,
        pagination: action.payload.pagination,
      }
    case ADMIN_CUSTOMER_LIST_FAIL:
      return { loading: false, error: action.payload }
    default:
      return state
  }
}

// Customer Update Reducer
export const adminCustomerUpdateReducer = (state = {}, action) => {
  switch (action.type) {
    case ADMIN_CUSTOMER_UPDATE_REQUEST:
      return { loading: true }
    case ADMIN_CUSTOMER_UPDATE_SUCCESS:
      return { loading: false, success: true, customer: action.payload }
    case ADMIN_CUSTOMER_UPDATE_FAIL:
      return { loading: false, error: action.payload }
    case ADMIN_CUSTOMER_UPDATE_RESET:
      return {}
    default:
      return state
  }
}

// Customer Delete Reducer
export const adminCustomerDeleteReducer = (state = {}, action) => {
  switch (action.type) {
    case ADMIN_CUSTOMER_DELETE_REQUEST:
      return { loading: true }
    case ADMIN_CUSTOMER_DELETE_SUCCESS:
      return { loading: false, success: true }
    case ADMIN_CUSTOMER_DELETE_FAIL:
      return { loading: false, error: action.payload }
    default:
      return state
  }
}

// Category List Reducer
export const adminCategoryListReducer = (state = { categories: [] }, action) => {
  switch (action.type) {
    case ADMIN_CATEGORY_LIST_REQUEST:
      return { loading: true, categories: [] }
    case ADMIN_CATEGORY_LIST_SUCCESS:
      return { loading: false, categories: action.payload }
    case ADMIN_CATEGORY_LIST_FAIL:
      return { loading: false, error: action.payload }
    default:
      return state
  }
}

// Category Create Reducer
export const adminCategoryCreateReducer = (state = {}, action) => {
  switch (action.type) {
    case ADMIN_CATEGORY_CREATE_REQUEST:
      return { loading: true }
    case ADMIN_CATEGORY_CREATE_SUCCESS:
      return { loading: false, success: true, category: action.payload }
    case ADMIN_CATEGORY_CREATE_FAIL:
      return { loading: false, error: action.payload }
    case ADMIN_CATEGORY_CREATE_RESET:
      return {}
    default:
      return state
  }
}

// Product List Reducer
export const adminProductListReducer = (state = { products: [] }, action) => {
  switch (action.type) {
    case ADMIN_PRODUCT_LIST_REQUEST:
      return { loading: true, products: [] }
    case ADMIN_PRODUCT_LIST_SUCCESS:
      return { loading: false, products: action.payload }
    case ADMIN_PRODUCT_LIST_FAIL:
      return { loading: false, error: action.payload }
    default:
      return state
  }
}

// Product Create Reducer
export const adminProductCreateReducer = (state = {}, action) => {
  switch (action.type) {
    case ADMIN_PRODUCT_CREATE_REQUEST:
      return { loading: true }
    case ADMIN_PRODUCT_CREATE_SUCCESS:
      return { loading: false, success: true, product: action.payload }
    case ADMIN_PRODUCT_CREATE_FAIL:
      return { loading: false, error: action.payload }
    case ADMIN_PRODUCT_CREATE_RESET:
      return {}
    default:
      return state
  }
}

// Product Update Reducer
export const adminProductUpdateReducer = (state = {}, action) => {
  switch (action.type) {
    case ADMIN_PRODUCT_UPDATE_REQUEST:
      return { loading: true }
    case ADMIN_PRODUCT_UPDATE_SUCCESS:
      return { loading: false, success: true, product: action.payload }
    case ADMIN_PRODUCT_UPDATE_FAIL:
      return { loading: false, error: action.payload }
    case ADMIN_PRODUCT_UPDATE_RESET:
      return {}
    default:
      return state
  }
}

// Product Delete Reducer
export const adminProductDeleteReducer = (state = {}, action) => {
  switch (action.type) {
    case ADMIN_PRODUCT_DELETE_REQUEST:
      return { loading: true }
    case ADMIN_PRODUCT_DELETE_SUCCESS:
      return { loading: false, success: true }
    case ADMIN_PRODUCT_DELETE_FAIL:
      return { loading: false, error: action.payload }
    case ADMIN_PRODUCT_DELETE_RESET:  // ← THÊM
      return {}
    default:
      return state
  }
}

// Service List Reducer
export const adminServiceListReducer = (state = { services: [], pagination: {} }, action) => {
  switch (action.type) {
    case ADMIN_SERVICE_LIST_REQUEST:
      return { loading: true, services: [] }
    case ADMIN_SERVICE_LIST_SUCCESS:
      return {
        loading: false,
        services: action.payload.servicePackages,
        pagination: action.payload.pagination,
      }
    case ADMIN_SERVICE_LIST_FAIL:
      return { loading: false, error: action.payload }
    default:
      return state
  }
}

// Service Create Reducer
export const adminServiceCreateReducer = (state = {}, action) => {
  switch (action.type) {
    case ADMIN_SERVICE_CREATE_REQUEST:
      return { loading: true }
    case ADMIN_SERVICE_CREATE_SUCCESS:
      return { loading: false, success: true, service: action.payload }
    case ADMIN_SERVICE_CREATE_FAIL:
      return { loading: false, error: action.payload }
    case ADMIN_SERVICE_CREATE_RESET:
      return {}
    default:
      return state
  }
}

// Service Update Reducer
export const adminServiceUpdateReducer = (state = {}, action) => {
  switch (action.type) {
    case ADMIN_SERVICE_UPDATE_REQUEST:
      return { loading: true }
    case ADMIN_SERVICE_UPDATE_SUCCESS:
      return { loading: false, success: true, service: action.payload }
    case ADMIN_SERVICE_UPDATE_FAIL:
      return { loading: false, error: action.payload }
    case ADMIN_SERVICE_UPDATE_RESET:
      return {}
    default:
      return state
  }
}

// Service Delete Reducer
export const adminServiceDeleteReducer = (state = {}, action) => {
  switch (action.type) {
    case ADMIN_SERVICE_DELETE_REQUEST:
      return { loading: true }
    case ADMIN_SERVICE_DELETE_SUCCESS:
      return { loading: false, success: true }
    case ADMIN_SERVICE_DELETE_FAIL:
      return { loading: false, error: action.payload }
    case ADMIN_SERVICE_DELETE_RESET: 
      return {}
    default:
      return state
  }
}

// Category Update Reducer
export const adminCategoryUpdateReducer = (state = {}, action) => {
  switch (action.type) {
    case ADMIN_CATEGORY_UPDATE_REQUEST:
      return { loading: true }
    case ADMIN_CATEGORY_UPDATE_SUCCESS:
      return { loading: false, success: true, category: action.payload }
    case ADMIN_CATEGORY_UPDATE_FAIL:
      return { loading: false, error: action.payload }
    case ADMIN_CATEGORY_UPDATE_RESET:
      return {}
    default:
      return state
  }
}

// Category Delete Reducer
export const adminCategoryDeleteReducer = (state = {}, action) => {
  switch (action.type) {
    case ADMIN_CATEGORY_DELETE_REQUEST:
      return { loading: true }
    case ADMIN_CATEGORY_DELETE_SUCCESS:
      return { loading: false, success: true }
    case ADMIN_CATEGORY_DELETE_FAIL:
      return { loading: false, error: action.payload }
    case ADMIN_CATEGORY_DELETE_RESET:  // ← THÊM
      return {}
    default:
      return state
  }
}