// src/actions/adminActions.js
import axios from 'axios'
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
  ADMIN_ORDER_DELETE_REQUEST,
  ADMIN_ORDER_DELETE_SUCCESS,
  ADMIN_ORDER_DELETE_FAIL,
  ADMIN_CUSTOMER_LIST_REQUEST,
  ADMIN_CUSTOMER_LIST_SUCCESS,
  ADMIN_CUSTOMER_LIST_FAIL,
  ADMIN_CUSTOMER_UPDATE_REQUEST,
  ADMIN_CUSTOMER_UPDATE_SUCCESS,
  ADMIN_CUSTOMER_UPDATE_FAIL,
  ADMIN_CUSTOMER_DELETE_REQUEST,
  ADMIN_CUSTOMER_DELETE_SUCCESS,
  ADMIN_CUSTOMER_DELETE_FAIL,
  ADMIN_PRODUCT_LIST_REQUEST,
  ADMIN_PRODUCT_LIST_SUCCESS,
  ADMIN_PRODUCT_LIST_FAIL,
  ADMIN_PRODUCT_CREATE_REQUEST,
  ADMIN_PRODUCT_CREATE_SUCCESS,
  ADMIN_PRODUCT_CREATE_FAIL,
  ADMIN_PRODUCT_UPDATE_REQUEST,
  ADMIN_PRODUCT_UPDATE_SUCCESS,
  ADMIN_PRODUCT_UPDATE_FAIL,
  ADMIN_PRODUCT_DELETE_REQUEST,
  ADMIN_PRODUCT_DELETE_SUCCESS,
  ADMIN_PRODUCT_DELETE_FAIL,
  ADMIN_CATEGORY_LIST_REQUEST,
  ADMIN_CATEGORY_LIST_SUCCESS,
  ADMIN_CATEGORY_LIST_FAIL,
  ADMIN_CATEGORY_CREATE_REQUEST,
  ADMIN_CATEGORY_CREATE_SUCCESS,
  ADMIN_CATEGORY_CREATE_FAIL,
  ADMIN_SERVICE_LIST_REQUEST,
  ADMIN_SERVICE_LIST_SUCCESS,
  ADMIN_SERVICE_LIST_FAIL,
  ADMIN_SERVICE_CREATE_REQUEST,
  ADMIN_SERVICE_CREATE_SUCCESS,
  ADMIN_SERVICE_CREATE_FAIL,
  ADMIN_SERVICE_UPDATE_REQUEST,
  ADMIN_SERVICE_UPDATE_SUCCESS,
  ADMIN_SERVICE_UPDATE_FAIL,
  ADMIN_SERVICE_DELETE_REQUEST,
  ADMIN_SERVICE_DELETE_SUCCESS,
  ADMIN_SERVICE_DELETE_FAIL,
  ADMIN_CATEGORY_UPDATE_REQUEST,
  ADMIN_CATEGORY_UPDATE_SUCCESS, 
  ADMIN_CATEGORY_UPDATE_FAIL,    
  ADMIN_CATEGORY_DELETE_REQUEST,  
  ADMIN_CATEGORY_DELETE_SUCCESS, 
  ADMIN_CATEGORY_DELETE_FAIL
} from '../constants/adminConstants'

// Dashboard stats
export const getDashboardStats = (startDate, endDate) => async (dispatch, getState) => {
  try {
    dispatch({ type: ADMIN_DASHBOARD_STATS_REQUEST })
    const { userLogin: { userInfo } } = getState()
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } }
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    const { data } = await axios.get(`/api/admin/dashboard?${params}`, config)
    dispatch({ type: ADMIN_DASHBOARD_STATS_SUCCESS, payload: data })
  } catch (error) {
    dispatch({
      type: ADMIN_DASHBOARD_STATS_FAIL,
      payload: error.response?.data?.message || error.message,
    })
  }
}

// List orders
export const listOrders = (page = 1, limit = 10, search = '', status = '') => async (dispatch, getState) => {
  try {
    dispatch({ type: ADMIN_ORDER_LIST_REQUEST })
    const { userLogin: { userInfo } } = getState()
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } }
    const params = new URLSearchParams({ page, limit })
    if (search) params.append('search', search)
    if (status) params.append('status', status)
    const { data } = await axios.get(`/api/admin/orders?${params}`, config)
    dispatch({ type: ADMIN_ORDER_LIST_SUCCESS, payload: data })
  } catch (error) {
    dispatch({
      type: ADMIN_ORDER_LIST_FAIL,
      payload: error.response?.data?.message || error.message,
    })
  }
}

// Update order
export const updateOrder = (id, orderData) => async (dispatch, getState) => {
  try {
    dispatch({ type: ADMIN_ORDER_UPDATE_REQUEST })
    const { userLogin: { userInfo } } = getState()
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    }
    const { data } = await axios.put(`/api/admin/orders/${id}`, orderData, config)
    dispatch({ type: ADMIN_ORDER_UPDATE_SUCCESS, payload: data })
  } catch (error) {
    dispatch({
      type: ADMIN_ORDER_UPDATE_FAIL,
      payload: error.response?.data?.message || error.message,
    })
  }
}

// Delete order
export const deleteOrder = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: ADMIN_ORDER_DELETE_REQUEST })
    const { userLogin: { userInfo } } = getState()
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } }
    await axios.delete(`/api/admin/orders/${id}`, config)
    dispatch({ type: ADMIN_ORDER_DELETE_SUCCESS })
  } catch (error) {
    dispatch({
      type: ADMIN_ORDER_DELETE_FAIL,
      payload: error.response?.data?.message || error.message,
    })
  }
}

// List customers
export const listCustomers = (page = 1, limit = 10, search = '') => async (dispatch, getState) => {
  try {
    dispatch({ type: ADMIN_CUSTOMER_LIST_REQUEST })
    const { userLogin: { userInfo } } = getState()
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } }
    const params = new URLSearchParams({ page, limit })
    if (search) params.append('search', search)
    const { data } = await axios.get(`/api/admin/customers?${params}`, config)
    dispatch({ type: ADMIN_CUSTOMER_LIST_SUCCESS, payload: data })
  } catch (error) {
    dispatch({
      type: ADMIN_CUSTOMER_LIST_FAIL,
      payload: error.response?.data?.message || error.message,
    })
  }
}

// Update customer
export const updateCustomer = (id, customerData) => async (dispatch, getState) => {
  try {
    dispatch({ type: ADMIN_CUSTOMER_UPDATE_REQUEST })
    const { userLogin: { userInfo } } = getState()
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    }
    const { data } = await axios.put(`/api/admin/customers/${id}`, customerData, config)
    dispatch({ type: ADMIN_CUSTOMER_UPDATE_SUCCESS, payload: data })
  } catch (error) {
    dispatch({
      type: ADMIN_CUSTOMER_UPDATE_FAIL,
      payload: error.response?.data?.message || error.message,
    })
  }
}

// Delete customer
export const deleteCustomer = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: ADMIN_CUSTOMER_DELETE_REQUEST })
    const { userLogin: { userInfo } } = getState()
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } }
    await axios.delete(`/api/admin/customers/${id}`, config)
    dispatch({ type: ADMIN_CUSTOMER_DELETE_SUCCESS })
  } catch (error) {
    dispatch({
      type: ADMIN_CUSTOMER_DELETE_FAIL,
      payload: error.response?.data?.message || error.message,
    })
  }
}

// ========================================
// CATEGORIES ACTIONS
// ========================================

export const listCategories = () => async (dispatch, getState) => {
  try {
    dispatch({ type: ADMIN_CATEGORY_LIST_REQUEST })
    const { userLogin: { userInfo } } = getState()
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } }
    const { data } = await axios.get('/api/admin/categories', config)
    dispatch({ type: ADMIN_CATEGORY_LIST_SUCCESS, payload: data })
  } catch (error) {
    dispatch({
      type: ADMIN_CATEGORY_LIST_FAIL,
      payload: error.response?.data?.message || error.message,
    })
  }
}

export const createCategory = (categoryData) => async (dispatch, getState) => {
  try {
    dispatch({ type: ADMIN_CATEGORY_CREATE_REQUEST })
    const { userLogin: { userInfo } } = getState()
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    }
    const { data } = await axios.post('/api/admin/categories', categoryData, config)
    dispatch({ type: ADMIN_CATEGORY_CREATE_SUCCESS, payload: data })
  } catch (error) {
    dispatch({
      type: ADMIN_CATEGORY_CREATE_FAIL,
      payload: error.response?.data?.message || error.message,
    })
  }
}

// ========================================
// PRODUCTS ACTIONS
// ========================================

export const listProductsByCategory = (categoryId) => async (dispatch, getState) => {
  try {
    dispatch({ type: ADMIN_PRODUCT_LIST_REQUEST })
    const { userLogin: { userInfo } } = getState()
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } }
    const { data } = await axios.get(`/api/admin/products/${categoryId}`, config)
    dispatch({ type: ADMIN_PRODUCT_LIST_SUCCESS, payload: data })
  } catch (error) {
    dispatch({
      type: ADMIN_PRODUCT_LIST_FAIL,
      payload: error.response?.data?.message || error.message,
    })
  }
}

export const createProduct = (productData) => async (dispatch, getState) => {
  try {
    dispatch({ type: ADMIN_PRODUCT_CREATE_REQUEST })
    const { userLogin: { userInfo } } = getState()
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    }
    const { data } = await axios.post('/api/admin/products', productData, config)
    dispatch({ type: ADMIN_PRODUCT_CREATE_SUCCESS, payload: data })
  } catch (error) {
    dispatch({
      type: ADMIN_PRODUCT_CREATE_FAIL,
      payload: error.response?.data?.message || error.message,
    })
  }
}

export const updateProduct = (id, productData) => async (dispatch, getState) => {
  try {
    dispatch({ type: ADMIN_PRODUCT_UPDATE_REQUEST })
    const { userLogin: { userInfo } } = getState()
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    }
    const { data } = await axios.put(`/api/admin/products/${id}`, productData, config)
    dispatch({ type: ADMIN_PRODUCT_UPDATE_SUCCESS, payload: data })
  } catch (error) {
    dispatch({
      type: ADMIN_PRODUCT_UPDATE_FAIL,
      payload: error.response?.data?.message || error.message,
    })
  }
}

export const deleteProduct = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: ADMIN_PRODUCT_DELETE_REQUEST })
    const { userLogin: { userInfo } } = getState()
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } }
    await axios.delete(`/api/admin/products/${id}`, config)
    dispatch({ type: ADMIN_PRODUCT_DELETE_SUCCESS })
  } catch (error) {
    dispatch({
      type: ADMIN_PRODUCT_DELETE_FAIL,
      payload: error.response?.data?.message || error.message,
    })
  }
}

// ========================================
// SERVICES ACTIONS
// ========================================

export const listServices = (page = 1, limit = 10, search = '') => async (dispatch, getState) => {
  try {
    dispatch({ type: ADMIN_SERVICE_LIST_REQUEST })
    const { userLogin: { userInfo } } = getState()
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } }
    const params = new URLSearchParams({ page, limit })
    if (search) params.append('search', search)
    const { data } = await axios.get(`/api/admin/service-packages?${params}`, config)
    dispatch({ type: ADMIN_SERVICE_LIST_SUCCESS, payload: data })
  } catch (error) {
    dispatch({
      type: ADMIN_SERVICE_LIST_FAIL,
      payload: error.response?.data?.message || error.message,
    })
  }
}

export const createService = (serviceData) => async (dispatch, getState) => {
  try {
    dispatch({ type: ADMIN_SERVICE_CREATE_REQUEST })
    const { userLogin: { userInfo } } = getState()
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    }
    const { data } = await axios.post('/api/admin/service-packages', serviceData, config)
    dispatch({ type: ADMIN_SERVICE_CREATE_SUCCESS, payload: data })
  } catch (error) {
    dispatch({
      type: ADMIN_SERVICE_CREATE_FAIL,
      payload: error.response?.data?.message || error.message,
    })
  }
}

export const updateService = (id, serviceData) => async (dispatch, getState) => {
  try {
    dispatch({ type: ADMIN_SERVICE_UPDATE_REQUEST })
    const { userLogin: { userInfo } } = getState()
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    }
    const { data } = await axios.put(`/api/admin/service-packages/${id}`, serviceData, config)
    dispatch({ type: ADMIN_SERVICE_UPDATE_SUCCESS, payload: data })
  } catch (error) {
    dispatch({
      type: ADMIN_SERVICE_UPDATE_FAIL,
      payload: error.response?.data?.message || error.message,
    })
  }
}

export const deleteService = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: ADMIN_SERVICE_DELETE_REQUEST })
    const { userLogin: { userInfo } } = getState()
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } }
    await axios.delete(`/api/admin/service-packages/${id}`, config)
    dispatch({ type: ADMIN_SERVICE_DELETE_SUCCESS })
  } catch (error) {
    dispatch({
      type: ADMIN_SERVICE_DELETE_FAIL,
      payload: error.response?.data?.message || error.message,
    })
  }
}

// List ALL products (không phân theo category)
export const listAllProducts = () => async (dispatch, getState) => {
  try {
    dispatch({ type: ADMIN_PRODUCT_LIST_REQUEST })
    const { userLogin: { userInfo } } = getState()
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } }
    const { data } = await axios.get('/api/admin/products', config)
    dispatch({ type: ADMIN_PRODUCT_LIST_SUCCESS, payload: data })
  } catch (error) {
    dispatch({
      type: ADMIN_PRODUCT_LIST_FAIL,
      payload: error.response?.data?.message || error.message,
    })
  }
}

// Update category
export const updateCategory = (id, categoryData) => async (dispatch, getState) => {
  try {
    dispatch({ type: ADMIN_CATEGORY_UPDATE_REQUEST })
    const { userLogin: { userInfo } } = getState()
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    }
    const { data } = await axios.put(`/api/admin/categories/${id}`, categoryData, config)
    dispatch({ type: ADMIN_CATEGORY_UPDATE_SUCCESS, payload: data })
  } catch (error) {
    dispatch({
      type: ADMIN_CATEGORY_UPDATE_FAIL,
      payload: error.response?.data?.message || error.message,
    })
  }
}

// Delete category
export const deleteCategory = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: ADMIN_CATEGORY_DELETE_REQUEST })
    const { userLogin: { userInfo } } = getState()
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } }
    await axios.delete(`/api/admin/categories/${id}`, config)
    dispatch({ type: ADMIN_CATEGORY_DELETE_SUCCESS })
  } catch (error) {
    dispatch({
      type: ADMIN_CATEGORY_DELETE_FAIL,
      payload: error.response?.data?.message || error.message,
    })
  }
}