// src/actions/cartActions.js
import axios from 'axios'
import {
  CART_ADD_ITEM,
  CART_REMOVE_ITEM,
  CART_UPDATE_ITEM,
  CART_GET_REQUEST,
  CART_GET_SUCCESS,
  CART_GET_FAIL,
  CART_CLEAR_ITEMS,
} from '../constants/cartOrderConstants'

// Lấy giỏ hàng từ server
export const getCart = () => async (dispatch, getState) => {
  try {
    dispatch({ type: CART_GET_REQUEST })

    const {
      userLogin: { userInfo },
    } = getState()

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    }

    const { data } = await axios.get('/api/client/cart', config)

    dispatch({
      type: CART_GET_SUCCESS,
      payload: data,
    })

    localStorage.setItem('cartItems', JSON.stringify(data.items || []))
  } catch (error) {
    dispatch({
      type: CART_GET_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    })
  }
}

// Thêm sản phẩm vào giỏ hàng
export const addToCart = (product_id, quantity) => async (dispatch, getState) => {
  try {
    const {
      userLogin: { userInfo },
    } = getState()

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    }

    const { data } = await axios.post(
      '/api/client/cart',
      { product_id, quantity },
      config
    )

    // ✅ FIX: Backend trả về { message, cart: { items, total } }
    dispatch({
      type: CART_ADD_ITEM,
      payload: data.cart || data,  // ← Hỗ trợ cả 2 format
    })

    localStorage.setItem('cartItems', JSON.stringify(data.cart?.items || data.items || []))
  } catch (error) {
    console.error('Add to cart error:', error.response?.data || error.message)
    throw error
  }
}

// Cập nhật số lượng sản phẩm
export const updateCartItem = (product_id, quantity) => async (dispatch, getState) => {
  try {
    const {
      userLogin: { userInfo },
    } = getState()

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    }

    const { data } = await axios.put(
      '/api/client/cart',
      { product_id, quantity },
      config
    )

    dispatch({
      type: CART_UPDATE_ITEM,
      payload: data.cart || data,
    })

    localStorage.setItem('cartItems', JSON.stringify(data.cart?.items || data.items || []))
  } catch (error) {
    console.error('Update cart error:', error.response?.data || error.message)
    throw error
  }
}

// Xóa sản phẩm khỏi giỏ hàng
export const removeFromCart = (product_id) => async (dispatch, getState) => {
  try {
    const {
      userLogin: { userInfo },
    } = getState()

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    }

    const { data } = await axios.delete(
      `/api/client/cart/${product_id}`,
      config
    )

    dispatch({
      type: CART_REMOVE_ITEM,
      payload: data.cart || data,
    })

    localStorage.setItem('cartItems', JSON.stringify(data.cart?.items || data.items || []))
  } catch (error) {
    console.error('Remove from cart error:', error.response?.data || error.message)
    throw error
  }
}

// Xóa toàn bộ giỏ hàng
export const clearCart = () => async (dispatch, getState) => {
  try {
    const {
      userLogin: { userInfo },
    } = getState()

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    }

    await axios.delete('/api/client/cart', config)

    dispatch({ type: CART_CLEAR_ITEMS })
    localStorage.removeItem('cartItems')
  } catch (error) {
    console.error('Clear cart error:', error.response?.data || error.message)
    throw error
  }
}