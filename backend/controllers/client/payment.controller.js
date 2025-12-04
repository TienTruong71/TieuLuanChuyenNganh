// controllers/paymentController.js
import asyncHandler from 'express-async-handler'
import Payment from '../../models/paymentModel.js'
import Order from '../../models/orderModel.js'
import { vnpayConfig } from '../../config/vnpayConfig.js'
import crypto from 'crypto'
import qs from 'qs'

/**
 * @desc    Tạo URL thanh toán VNPay chuẩn sandbox
 * @route   POST /api/payments/vnpay
 * @access  Private (Registered Customer)
 */
export const createVNPayPayment = asyncHandler(async (req, res) => {
  const { order_id, amount } = req.body

  //  Kiểm tra order tồn tại
  const order = await Order.findById(order_id)
  if (!order) {
    res.status(404)
    throw new Error('Không tìm thấy đơn hàng')
  }

  // Tạo payment record với trạng thái pending
  const payment = await Payment.create({
    order_id,
    amount,
    method: 'e_wallet',
    status: 'pending',
  })

  // Tạo ngày giờ dạng 
  const date = new Date()
  const createDate =
    date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    date.getDate().toString().padStart(2, '0') +
    date.getHours().toString().padStart(2, '0') +
    date.getMinutes().toString().padStart(2, '0') +
    date.getSeconds().toString().padStart(2, '0')

  // Tạo object params VNPay
  const vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: vnpayConfig.vnp_TmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: payment._id.toString(), // dùng payment._id để tra cứu
    vnp_OrderInfo: `Payment order ${order_id}`, // DÙNG ASCII
    vnp_OrderType: 'other',
    vnp_Amount: parseInt(amount) * 100, // VNPay yêu cầu *100
    vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
    vnp_IpAddr: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    vnp_CreateDate: createDate,
  }

  // Sắp xếp object trước khi hash
  const sortedParams = sortObject(vnp_Params)

  // Chuẩn bị string để tạo HMAC SHA512
  const signData = qs.stringify(sortedParams, { encode: false })

  // Tạo chữ ký bảo mật
  const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret)
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

  //  Gắn chữ ký vào params
  sortedParams.vnp_SecureHash = signed

  //  Tạo URL cuối cùng, encode khi gửi trình duyệt
  const paymentUrl = vnpayConfig.vnp_Url + '?' + qs.stringify(sortedParams, { encode: true })

  // Trả về URL cho client
  res.status(200).json({
    message: 'Tạo URL VNPay thành công',
    order_id: order._id,
    payment_id: payment._id,
    url: paymentUrl,
  })
})

/**
 * @desc    Xử lý callback VNPay trả về
 * @route   GET /api/payments/vnpay_return
 * @access  Public
 */
export const vnpayReturn = asyncHandler(async (req, res) => {
  // Lấy query params VNPay gửi về
  let vnp_Params = req.query
  const secureHash = vnp_Params.vnp_SecureHash
  delete vnp_Params.vnp_SecureHash
  delete vnp_Params.vnp_SecureHashType

  // Sắp xếp object trước khi tính hash
  vnp_Params = sortObject(vnp_Params)
  const signData = qs.stringify(vnp_Params, { encode: false })

  // Tạo HMAC SHA512 đúng cách
  const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret)
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

  // So sánh chữ ký
  if (secureHash !== signed) {
    // ✅ Redirect về frontend với lỗi
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?reason=invalid_signature`)
  }

  // Lấy paymentId và code response
  const paymentId = vnp_Params.vnp_TxnRef
  const rspCode = vnp_Params.vnp_ResponseCode

  // Tìm payment record
  const payment = await Payment.findById(paymentId)
  if (!payment) {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?reason=payment_not_found`)
  }

  // Tìm order liên quan
  const order = await Order.findById(payment.order_id)

  // ✅ Xử lý kết quả thanh toán
  if (rspCode === '00') {
    payment.status = 'completed'
    payment.transaction_id = vnp_Params.vnp_TransactionNo // Lưu mã GD từ VNPay
    await payment.save()

    if (order) {
      order.status = 'processing'
      order.payment_method = 'e_wallet'
      await order.save()
    }

    console.log('✅ Payment success:', { order_id: order._id, payment_id: payment._id })

    // ✅ Redirect về frontend success page
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment/success?order_id=${order._id}&payment_id=${payment._id}`
    )
  } else {
    payment.status = 'failed'
    await payment.save()

    console.log('❌ Payment failed:', { code: rspCode, payment_id: payment._id })

    // ✅ Redirect về frontend failed page
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment/failed?reason=payment_failed&code=${rspCode}`
    )
  }
})

// === Utility: sắp xếp key object theo alphabet ===
function sortObject(obj) {
  const sorted = {}
  const keys = Object.keys(obj).sort()
  for (const key of keys) {
    sorted[key] = obj[key]
  }
  return sorted
}
