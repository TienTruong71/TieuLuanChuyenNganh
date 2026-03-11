import asyncHandler from 'express-async-handler'
import Payment from '../../models/paymentModel.js'
import Order from '../../models/orderModel.js'
import { vnpayConfig } from '../../config/vnpayConfig.js'
import crypto from 'crypto'
import moment from 'moment'


export const createVNPayPayment = asyncHandler(async (req, res) => {
  const { order_id, amount } = req.body

  const order = await Order.findById(order_id)
  if (!order) {
    res.status(404)
    throw new Error('Không tìm thấy đơn hàng')
  }

  const validAmount = Math.floor(Number(amount))

  if (validAmount < 5000 || validAmount >= 1000000000) {
    res.status(400)
    throw new Error('Số tiền phải từ 5,000đ đến dưới 1 tỷ đồng')
  }

  const payment = await Payment.create({
    order_id,
    amount: validAmount,
    method: 'e_wallet',
    status: 'pending',
  })

  let ipAddr = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket?.remoteAddress ||
    '127.0.0.1'

  if (ipAddr === '::1' || ipAddr === '::ffff:127.0.0.1') {
    ipAddr = '127.0.0.1'
  }

  const createDate = moment().format('YYYYMMDDHHmmss')

  let vnp_Params = {}
  vnp_Params['vnp_Version'] = '2.1.0'
  vnp_Params['vnp_Command'] = 'pay'
  vnp_Params['vnp_TmnCode'] = vnpayConfig.vnp_TmnCode
  vnp_Params['vnp_Locale'] = 'vn'
  vnp_Params['vnp_CurrCode'] = 'VND'
  vnp_Params['vnp_TxnRef'] = payment._id.toString()
  vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang ' + order_id  
  vnp_Params['vnp_OrderType'] = 'other'
  vnp_Params['vnp_Amount'] = validAmount * 100
  vnp_Params['vnp_ReturnUrl'] = vnpayConfig.vnp_ReturnUrl
  vnp_Params['vnp_IpAddr'] = ipAddr
  vnp_Params['vnp_CreateDate'] = createDate

  vnp_Params = sortObject(vnp_Params)

  const signData = new URLSearchParams(vnp_Params).toString()


  const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret)
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')


  vnp_Params['vnp_SecureHash'] = signed

  const paymentUrl = vnpayConfig.vnp_Url + '?' + new URLSearchParams(vnp_Params).toString()


  res.status(200).json({
    message: 'Tạo URL VNPay thành công',
    order_id: order._id,
    payment_id: payment._id,
    url: paymentUrl,
  })
})


export const vnpayReturn = asyncHandler(async (req, res) => {
  const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000'

  let vnp_Params = req.query
  const secureHash = vnp_Params['vnp_SecureHash']

  delete vnp_Params['vnp_SecureHash']
  delete vnp_Params['vnp_SecureHashType']

  vnp_Params = sortObject(vnp_Params)

  const signData = new URLSearchParams(vnp_Params).toString()

  const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret)
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

  if (secureHash !== signed) {
    return res.redirect(`${frontendUrl}/payment/failed?reason=invalid_signature`)
  }

  const paymentId = vnp_Params['vnp_TxnRef']
  const rspCode = vnp_Params['vnp_ResponseCode']

  const payment = await Payment.findById(paymentId)
  if (!payment) {
    return res.redirect(`${frontendUrl}/payment/failed?reason=payment_not_found`)
  }

  const order = await Order.findById(payment.order_id)

  if (rspCode === '00') {
    payment.status = 'completed'
    payment.transaction_id = vnp_Params['vnp_TransactionNo']
    await payment.save()

    if (order) {
      order.status = 'processing'
      order.payment_method = 'e_wallet'
      await order.save()
    }


    return res.redirect(
      `${frontendUrl}/payment/success?order_id=${order?._id}&payment_id=${payment._id}`
    )
  } else {
    payment.status = 'failed'
    await payment.save()

    return res.redirect(
      `${frontendUrl}/payment/failed?reason=payment_failed&code=${rspCode}`
    )
  }
})

function sortObject(obj) {
  let sorted = {}
  let str = []
  let key
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key))
    }
  }
  str.sort()
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+')
  }
  return sorted
}