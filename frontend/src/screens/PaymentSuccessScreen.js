import React, { useEffect } from 'react'
import { useHistory, useLocation, Link } from 'react-router-dom'
import '../styles/checkout.css'

const PaymentSuccessScreen = () => {
  const history = useHistory();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const order_id = params.get('order_id');
  const payment_id = params.get('payment_id');

  return (
    <main className='page-main'>
      <div className='payment-result-container success'>
        <div className='result-icon'>✅</div>
        <h1>Thanh Toán Thành Công!</h1>
        <p>Đơn hàng của bạn đã được thanh toán thành công qua VNPay.</p>
        
        {order_id && (
          <div className='order-info'>
            <p>Mã đơn hàng: <strong>#{order_id.slice(-8)}</strong></p>
          </div>
        )}

        <div className='action-buttons'>
          <Link to={`/orders/${order_id}`} className='btn-primary'>
            Xem Chi Tiết Đơn Hàng
          </Link>
          <Link to='/orders' className='btn-secondary'>
            Xem Tất Cả Đơn Hàng
          </Link>
        </div>
      </div>
    </main>
  );
};

export default PaymentSuccessScreen;