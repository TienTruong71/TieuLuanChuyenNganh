import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import { verifyOTPReducer } from './reducers/userReducers'
// Import existing reducers
import {
  userLoginReducer,
  userRegisterReducer,
  userDetailsReducer,
  verifyEmailReducer
} from './reducers/userReducers'

import {
  productListReducer,
  productDetailsReducer,
} from './reducers/productReducers'

import {
  serviceListReducer,
  serviceDetailsReducer,
  bookingCreateReducer,
  bookingListMyReducer,
  bookingDetailsReducer,
  bookingCancelReducer,
} from './reducers/bookingReducers'

import { cartReducer } from './reducers/cartReducers'

import {
  orderCreateReducer,
  orderListMyReducer,
  orderDetailsReducer,
  orderCancelReducer,
} from './reducers/orderReducers'

import { feedbackReducer } from './reducers/feedbackReducers'

import { supportReducer } from './reducers/supportReducers'

import { supportAdminReducer } from './reducers/supportAdminReducers'

import {
  adminStaffListReducer,
  adminStaffCreateReducer,
  adminStaffUpdateReducer,
  adminStaffDeleteReducer,
} from './reducers/staffReducers'

// ✅ Import TẤT CẢ admin reducers
import {
  adminDashboardStatsReducer,
  adminOrderListReducer,
  adminOrderUpdateReducer,
  adminOrderDeleteReducer,
  adminCustomerListReducer,
  adminCustomerUpdateReducer,
  adminCustomerDeleteReducer,
  adminCategoryListReducer,
  adminCategoryCreateReducer,
  adminProductListReducer,
  adminProductCreateReducer,
  adminProductUpdateReducer,
  adminProductDeleteReducer,
  adminServiceListReducer,
  adminServiceCreateReducer,
  adminServiceUpdateReducer,
  adminServiceDeleteReducer,
  adminCategoryUpdateReducer,
  adminCategoryDeleteReducer,
} from './reducers/adminReducers'

import {
  notificationListReducer,
  notificationMarkReadReducer,
} from './reducers/notificationReducers'

const reducer = combineReducers({
  // User reducers
  userLogin: userLoginReducer,
  userRegister: userRegisterReducer,
  userDetails: userDetailsReducer,
  verifyOTP: verifyOTPReducer,
  verifyEmail: verifyEmailReducer,
  // Product reducers
  productList: productListReducer,
  productDetails: productDetailsReducer,

  // Cart reducer
  cart: cartReducer,

  // Order reducers
  orderCreate: orderCreateReducer,
  orderListMy: orderListMyReducer,
  orderDetails: orderDetailsReducer,
  orderCancel: orderCancelReducer,

  // Booking reducers
  serviceList: serviceListReducer,
  serviceDetails: serviceDetailsReducer,
  bookingCreate: bookingCreateReducer,
  bookingListMy: bookingListMyReducer,
  bookingDetails: bookingDetailsReducer,
  bookingCancel: bookingCancelReducer,

  // Feedback reducer
  feedback: feedbackReducer,

  // Support reducer
  support: supportReducer,

  // Support Admin reducer
  supportAdmin: supportAdminReducer,

  // ✅ Admin reducers - Dashboard & Orders & Customers
  adminDashboardStats: adminDashboardStatsReducer,
  adminOrderList: adminOrderListReducer,
  adminOrderUpdate: adminOrderUpdateReducer,
  adminOrderDelete: adminOrderDeleteReducer,
  adminCustomerList: adminCustomerListReducer,
  adminCustomerUpdate: adminCustomerUpdateReducer,
  adminCustomerDelete: adminCustomerDeleteReducer,

  // ✅ Admin reducers - Categories
  adminCategoryList: adminCategoryListReducer,
  adminCategoryCreate: adminCategoryCreateReducer,

  // ✅ Admin reducers - Products
  adminProductList: adminProductListReducer,
  adminProductCreate: adminProductCreateReducer,
  adminProductUpdate: adminProductUpdateReducer,
  adminProductDelete: adminProductDeleteReducer,

  // ✅ Admin reducers - Services
  adminServiceList: adminServiceListReducer,
  adminServiceCreate: adminServiceCreateReducer,
  adminServiceUpdate: adminServiceUpdateReducer,
  adminServiceDelete: adminServiceDeleteReducer,

  // ✅ Admin reducers - Staff
  adminStaffList: adminStaffListReducer,
  adminStaffCreate: adminStaffCreateReducer,
  adminStaffUpdate: adminStaffUpdateReducer,
  adminStaffDelete: adminStaffDeleteReducer,

  adminCategoryUpdate: adminCategoryUpdateReducer,
  adminCategoryDelete: adminCategoryDeleteReducer,

  // Notifications
  notificationList: notificationListReducer,
  notificationMarkRead: notificationMarkReadReducer,
})

const getUserInfoFromStorage = () => {
  try {
    const userInfo = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : null

    if (userInfo && !userInfo.token) {
      localStorage.removeItem('userInfo')
      return null
    }
    return userInfo
  } catch (error) {
    return null
  }
}

const userInfoFromStorage = getUserInfoFromStorage()

const cartItemsFromStorage = localStorage.getItem('cartItems')
  ? JSON.parse(localStorage.getItem('cartItems'))
  : []

const initialState = {
  userLogin: { userInfo: userInfoFromStorage },
  cart: { cartItems: cartItemsFromStorage, total: 0 },
}

const middleware = [thunk]

const store = createStore(
  reducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
)

export default store