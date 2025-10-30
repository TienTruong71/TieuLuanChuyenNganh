// src/actions/productActions.js

// Action Types - PHẢI EXPORT
export const PRODUCT_LIST_REQUEST = 'PRODUCT_LIST_REQUEST'
export const PRODUCT_LIST_SUCCESS = 'PRODUCT_LIST_SUCCESS'
export const PRODUCT_LIST_FAIL = 'PRODUCT_LIST_FAIL'

// Mock products data
const mockProducts = [
  { id: 1, title: 'Sedan A - Ưu đãi 10%', price: '$20,000', img: 'https://via.placeholder.com/400x200?text=Sedan+A', category: 'sedan', deal: true, popular: true },
  { id: 2, title: 'SUV B - Giảm 5%', price: '$28,500', img: 'https://via.placeholder.com/400x200?text=SUV+B', category: 'suv', deal: true, popular: false },
  { id: 3, title: 'Truck C', price: '$32,000', img: 'https://via.placeholder.com/400x200?text=Truck+C', category: 'truck', deal: false, popular: true },
  { id: 4, title: 'EV D - Ưu đãi đặc biệt', price: '$40,000', img: 'https://via.placeholder.com/400x200?text=EV+D', category: 'electric', deal: true, popular: true },
  { id: 5, title: 'Sport E', price: '$55,000', img: 'https://via.placeholder.com/400x200?text=Sport+E', category: 'sports', deal: false, popular: true },
  { id: 6, title: 'Sedan F', price: '$22,000', img: 'https://via.placeholder.com/400x200?text=Sedan+F', category: 'sedan', deal: false, popular: false },
  { id: 7, title: 'SUV G', price: '$30,000', img: 'https://via.placeholder.com/400x200?text=SUV+G', category: 'suv', deal: false, popular: true },
  { id: 8, title: 'EV H', price: '$45,000', img: 'https://via.placeholder.com/400x200?text=EV+H', category: 'electric', deal: false, popular: false }
]

// List products action
export const listProducts = () => async (dispatch) => {
  try {
    dispatch({ type: PRODUCT_LIST_REQUEST })

    // Mock API call for development - xóa phần này khi có backend
    await new Promise(resolve => setTimeout(resolve, 500))
    
    dispatch({
      type: PRODUCT_LIST_SUCCESS,
      payload: mockProducts,
    })

    /*
    // Uncomment phần này khi có backend thật
    const { data } = await axios.get('/api/products')

    dispatch({
      type: PRODUCT_LIST_SUCCESS,
      payload: data,
    })
    */
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