import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'

const protect = asyncHandler(async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1]

      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      req.user = await User.findById(decoded.id).select('-password').populate('role_id')
      
      if (!req.user) {
        res.status(401)
        throw new Error('User not found')
      }
      
      next()
    } catch (error) {
      console.error('❌ Auth error:', error)
      res.status(401)
      throw new Error('Not authorized, token failed')
    }
  }

  if (!token) {
    res.status(401)
    throw new Error('Not authorized, no token')
  }
})

// ✅ Sửa admin middleware - thêm optional chaining
export const admin = (req, res, next) => {
  if (req.user && (
    req.user.isAdmin || 
    req.user.role_id?.role_name === 'admin'
  )) {
    next()
  } else {
    console.error('❌ Admin check failed:', {
      hasUser: !!req.user,
      isAdmin: req.user?.isAdmin,
      roleName: req.user?.role_id?.role_name,
    })
    res.status(403)
    throw new Error('Không có quyền Admin')
  }
}

// ✅ Sửa staff middleware
export const staff = (req, res, next) => {
  if (req.user && req.user.role_id?.role_name === 'staff') {
    next()
  } else {
    res.status(403)
    throw new Error('Không có quyền Staff')
  }
}

// ✅ Customer middleware đã đúng rồi
export const customer = (req, res, next) => {
  if (req.user && (
    req.user.role_id?.role_name?.toLowerCase() === 'customer' ||
    req.user.role === 'Customer'
  )) {
    next()
  } else {
    res.status(403)
    throw new Error('Không có quyền Customer')
  }
}

export { protect }