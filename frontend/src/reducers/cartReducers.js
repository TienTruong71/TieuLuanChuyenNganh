import {
  CART_ADD_ITEM,
  CART_REMOVE_ITEM,
  CART_UPDATE_ITEM,
  CART_GET_REQUEST,
  CART_GET_SUCCESS,
  CART_GET_FAIL,
  CART_CLEAR_ITEMS,
} from '../constants/cartOrderConstants'

export const cartReducer = (state = { cartItems: [], loading: false }, action) => {
  switch (action.type) {
    case CART_GET_REQUEST:
      return { ...state, loading: true }
    
    case CART_GET_SUCCESS:
      return {
        loading: false,
        cartItems: action.payload.items || [],
        total: action.payload.total || 0,
      }
    
    case CART_GET_FAIL:
      return { loading: false, error: action.payload, cartItems: [] }
    
    case CART_ADD_ITEM:
    case CART_UPDATE_ITEM:
    case CART_REMOVE_ITEM:
      return {
        loading: false,
        cartItems: action.payload.items || [],
        total: action.payload.total || 0,
      }
    
    case CART_CLEAR_ITEMS:
      return { cartItems: [], total: 0 }
    
    default:
      return state
  }
}