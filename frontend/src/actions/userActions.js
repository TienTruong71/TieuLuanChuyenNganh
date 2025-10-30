// src/actions/userActions.js

// Action Types - PHẢI EXPORT TẤT CẢ
export const USER_LOGIN_REQUEST = 'USER_LOGIN_REQUEST'
export const USER_LOGIN_SUCCESS = 'USER_LOGIN_SUCCESS'
export const USER_LOGIN_FAIL = 'USER_LOGIN_FAIL'
export const USER_LOGOUT = 'USER_LOGOUT'

export const USER_REGISTER_REQUEST = 'USER_REGISTER_REQUEST'
export const USER_REGISTER_SUCCESS = 'USER_REGISTER_SUCCESS'
export const USER_REGISTER_FAIL = 'USER_REGISTER_FAIL'

// Login action
export const login = (username, password) => async (dispatch) => {
  try {
    dispatch({ type: USER_LOGIN_REQUEST })

    // Mock login for development - xóa phần này khi có backend
    const mockUser = {
      id: 1,
      name: username,
      email: `${username}@carsauto.com`,
      username: username,
      // Check if username is 'admin' to grant admin access
      isAdmin: username.toLowerCase() === 'admin',
      token: 'mock-token-123'
    }

    // Giả lập delay API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    dispatch({
      type: USER_LOGIN_SUCCESS,
      payload: mockUser,
    })

    localStorage.setItem('userInfo', JSON.stringify(mockUser))

    /* 
    // Uncomment phần này khi có backend thật
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    }

    const { data } = await axios.post(
      '/api/users/login',
      { username, password },
      config
    )

    dispatch({
      type: USER_LOGIN_SUCCESS,
      payload: data,
    })

    localStorage.setItem('userInfo', JSON.stringify(data))
    */
  } catch (error) {
    dispatch({
      type: USER_LOGIN_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    })
  }
}

// Logout action
export const logout = () => (dispatch) => {
  localStorage.removeItem('userInfo')
  dispatch({ type: USER_LOGOUT })
}

// Register action
export const register = (email, username, password, passwordStrength) => async (dispatch) => {
  try {
    dispatch({ type: USER_REGISTER_REQUEST })

    // Mock register for development - xóa phần này khi có backend
    const mockUser = {
      id: Date.now(),
      name: username,
      email: email,
      username: username,
      isAdmin: false,
      token: 'mock-token-' + Date.now()
    }

    // Giả lập delay API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    dispatch({
      type: USER_REGISTER_SUCCESS,
      payload: mockUser,
    })

    // Auto login after register
    dispatch({
      type: USER_LOGIN_SUCCESS,
      payload: mockUser,
    })

    localStorage.setItem('userInfo', JSON.stringify(mockUser))

    /*
    // Uncomment phần này khi có backend thật
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    }

    const { data } = await axios.post(
      '/api/users/register',
      { email, username, password, passwordStrength },
      config
    )

    dispatch({
      type: USER_REGISTER_SUCCESS,
      payload: data,
    })

    dispatch({
      type: USER_LOGIN_SUCCESS,
      payload: data,
    })

    localStorage.setItem('userInfo', JSON.stringify(data))
    */
  } catch (error) {
    dispatch({
      type: USER_REGISTER_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    })
  }
}