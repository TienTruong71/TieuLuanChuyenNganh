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
    console.error('Admin check failed:', {
      hasUser: !!req.user,
      isAdmin: req.user?.isAdmin,
      roleName: req.user?.role_id?.role_name,
    })
    res.status(403)
    throw new Error('Không có quyền Admin')
  }
}

export const inventoryStaff = (req, res, next) => {
  if (req.user && req.user.role_id?.role_name?.toLowerCase() === 'inventory') {
    next()
  } else {
    res.status(403)
    throw new Error('Không có quyền Inventory Staff')
  }
}

export const serviceStaff = (req, res, next) => {
  if (req.user && req.user.role_id?.role_name?.toLowerCase() === 'service') {
    next()
  } else {
    res.status(403)
    throw new Error('Không có quyền Service Staff')
  }
}

export const saleStaff = (req, res, next) => {
  if (req.user && req.user.role_id?.role_name?.toLowerCase() === 'sale') {
    next()
  } else {
    res.status(403)
    throw new Error('Không có quyền Sale Staff')
  }
}

export const anyStaff = (req, res, next) => {
  const roleName = req.user?.role_id?.role_name?.toLowerCase()
  if (req.user && ['inventory', 'service', 'sale'].includes(roleName)) {
    next()
  } else {
    res.status(403)
    throw new Error('Không có quyền Staff')
  }
}

// Admin hoặc bất kỳ Staff nào
export const adminOrStaff = (req, res, next) => {
  const roleName = req.user?.role_id?.role_name?.toLowerCase()
  const userDebug = {
    hasUser: !!req.user,
    userId: req.user?._id,
    isAdmin: req.user?.isAdmin,
    roleId: req.user?.role_id,
    roleName: roleName,
  }
  console.log('🔍 adminOrStaff check:', userDebug)
  
  if (req.user && (
    req.user.isAdmin || 
    roleName === 'admin' ||
    ['inventory', 'service', 'sale'].includes(roleName)
  )) {
    next()
  } else {
    console.error('❌ Permission denied:', userDebug)
    res.status(403)
    throw new Error('Không có quyền Admin hoặc Staff')
  }
}

// Customer middleware đã đúng rồi
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