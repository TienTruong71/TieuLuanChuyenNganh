// src/actions/productActions.js
import axios from 'axios'
import {
  PRODUCT_LIST_REQUEST,
  PRODUCT_LIST_SUCCESS,
  PRODUCT_LIST_FAIL,
  PRODUCT_DETAILS_REQUEST,
  PRODUCT_DETAILS_SUCCESS,
  PRODUCT_DETAILS_FAIL,
} from '../constants/productConstants'

// =====================================================
// GET PRODUCT LIST
// =====================================================
export const listProducts = (paramsObj = {}) => async (dispatch) => {
  try {
    dispatch({ type: PRODUCT_LIST_REQUEST })

    // Build query params
    const params = new URLSearchParams()
    if (paramsObj.current) params.append('current', paramsObj.current)
    if (paramsObj.pageSize) params.append('pageSize', paramsObj.pageSize)
    if (paramsObj.search) params.append('search', paramsObj.search)
    if (paramsObj.category) params.append('category', paramsObj.category)
    if (paramsObj.sortField) params.append('sortField', paramsObj.sortField)
    if (paramsObj.sortOrder) params.append('sortOrder', paramsObj.sortOrder)
    if (paramsObj.minPrice) params.append('minPrice', paramsObj.minPrice)
    if (paramsObj.maxPrice) params.append('maxPrice', paramsObj.maxPrice)

    const { data } = await axios.get(`/api/client/products?${params.toString()}`)

    dispatch({
      type: PRODUCT_LIST_SUCCESS,
      payload: data,
    })
  } catch (error) {
    dispatch({
      type: PRODUCT_LIST_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    })
  }
}

// =====================================================
// GET PRODUCT DETAILS BY ID
// =====================================================
export const getProductDetails = (id) => async (dispatch) => {
  try {
    dispatch({ type: PRODUCT_DETAILS_REQUEST })

    const { data } = await axios.get(`/api/client/products/${id}`)

    dispatch({
      type: PRODUCT_DETAILS_SUCCESS,
      payload: data,
    })
  } catch (error) {
    dispatch({
      type: PRODUCT_DETAILS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    })
  }
}