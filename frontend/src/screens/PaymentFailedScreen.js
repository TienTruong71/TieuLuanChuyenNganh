import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import '../styles/checkout.css'

const PaymentFailedScreen = () => {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const reason = params.get('reason')
  const code = params.get('code')

  const getErrorMessage = () => {
    switch (reason) {
      case 'invalid_signature':
        return 'Chữ ký không hợp lệ. Giao dịch có thể bị giả mạo.'
      case 'payment_not_found':
        return 'Không tìm thấy thông tin thanh toán.'
      case 'payment_failed':
        return `Thanh toán thất bại. Mã lỗi: ${code || 'Không xác định'}`
      default:
        return 'Đã xảy ra lỗi trong quá trình thanh toán.'
    }
  }

  const getVNPayErrorMessage = (errorCode) => {
    const errorMessages = {
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản bị khóa',
      '13': 'Giao dịch không thành công do: Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản không đủ số dư để thực hiện giao dịch',
      '65': 'Giao dịch không thành công do: Tài khoản đã vượt quá hạn mức giao dịch trong ngày',
      '75': 'Ngân hàng thanh toán đang bảo trì',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định',
      '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)',
    }
    return errorMessages[errorCode] || null
  }

  return (
    <main className='page-main'>
      <div className='payment-result-container failed'>
        <div className='result-icon'>
          <span role='img' aria-label='failed'>❌</span>
        </div>
        <h1>Thanh Toán Thất Bại</h1>
        <p className='error-reason'>{getErrorMessage()}</p>
        
        {code && getVNPayErrorMessage(code) && (
          <div className='error-detail'>
            <p><strong>Chi tiết:</strong> {getVNPayErrorMessage(code)}</p>
          </div>
        )}

        <div className='action-buttons'>
          <Link to='/cart' className='btn-primary'>
            Quay Lại Giỏ Hàng
          </Link>
          <Link to='/orders' className='btn-secondary'>
            Xem Đơn Hàng
          </Link>
        </div>

        <div className='help-section'>
          <p>Nếu bạn gặp vấn đề, vui lòng liên hệ hotline: <strong>1900 xxxx</strong></p>
        </div>
      </div>
    </main>
  )
}

export default PaymentFailedScreen