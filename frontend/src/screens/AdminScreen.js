import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  getDashboardStats,
  listOrders,
  updateOrder,
  deleteOrder,
  listCustomers,
  updateCustomer,
  deleteCustomer,
} from '../actions/adminActions'
import '../styles/admin.css'
import { ADMIN_ORDER_UPDATE_RESET, ADMIN_CUSTOMER_UPDATE_RESET } from '../constants/adminConstants'
import ProductsManagementScreen from './ProductsManagementScreen'
import ServicesManagementScreen from './ServicesManagementScreen'
import StaffManagementScreen from './StaffManagementScreen'
import SupportAdminPanel from '../components/SupportAdminPanel'

const AdminScreen = () => {
  const history = useHistory()
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState('dashboard')
  
  // Pagination states
  const [orderPage, setOrderPage] = useState(1)
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatus, setOrderStatus] = useState('')
  const [customerPage, setCustomerPage] = useState(1)
  const [customerSearch, setCustomerSearch] = useState('')
  
  // Modal states
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderNewStatus, setOrderNewStatus] = useState('')
  
  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin || {}

  const dashboardStats = useSelector((state) => state.adminDashboardStats)
  const { loading: loadingStats, stats, error: errorStats } = dashboardStats

  const orderList = useSelector((state) => state.adminOrderList)
  const { loading: loadingOrders, orders, pagination: orderPagination, error: errorOrders } = orderList

  const orderUpdate = useSelector((state) => state.adminOrderUpdate)
  const { loading: loadingOrderUpdate, success: successOrderUpdate } = orderUpdate

  const orderDelete = useSelector((state) => state.adminOrderDelete)
  const { loading: loadingOrderDelete, success: successOrderDelete } = orderDelete

  const customerList = useSelector((state) => state.adminCustomerList)
  const { loading: loadingCustomers, customers, pagination: customerPagination, error: errorCustomers } = customerList

  const customerDelete = useSelector((state) => state.adminCustomerDelete)
  const { loading: loadingCustomerDelete, success: successCustomerDelete } = customerDelete

  // Check if user is admin
  const isAdmin = userInfo && (
    userInfo.isAdmin || 
    userInfo.role?.role_name === 'admin' || 
    userInfo.role_id?.role_name === 'admin' ||
    userInfo.role_name === 'admin'
  )

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      history.push('/login')
    }
  }, [history, isAdmin])

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === 'dashboard') {
        dispatch(getDashboardStats())
      } else if (activeTab === 'orders') {
        dispatch(listOrders(orderPage, 10, orderSearch, orderStatus))
      } else if (activeTab === 'users') {
        dispatch(listCustomers(customerPage, 10, customerSearch))
      }
    }
  }, [dispatch, userInfo, activeTab, orderPage, orderSearch, orderStatus, customerPage, customerSearch])

  useEffect(() => {
    if (successOrderUpdate) {
      alert('Cập nhật đơn hàng thành công!')
      setShowOrderModal(false)
      dispatch({ type: ADMIN_ORDER_UPDATE_RESET })
      dispatch(listOrders(orderPage, 10, orderSearch, orderStatus))
    }
  }, [successOrderUpdate, dispatch, orderPage, orderSearch, orderStatus])

  useEffect(() => {
    if (successOrderDelete) {
      alert('Xóa đơn hàng thành công!')
      dispatch(listOrders(orderPage, 10, orderSearch, orderStatus))
    }
  }, [successOrderDelete, dispatch, orderPage, orderSearch, orderStatus])

  useEffect(() => {
    if (successCustomerDelete) {
      alert('Vô hiệu hóa khách hàng thành công!')
      dispatch(listCustomers(customerPage, 10, customerSearch))
    }
  }, [successCustomerDelete, dispatch, customerPage, customerSearch])

  if (!isAdmin) {
    return null
  }

  const handleOrderUpdate = (order) => {
    setSelectedOrder(order)
    setOrderNewStatus(order.status)
    setShowOrderModal(true)
  }

  const handleOrderStatusSubmit = () => {
    if (selectedOrder && orderNewStatus) {
      dispatch(updateOrder(selectedOrder._id, { status: orderNewStatus }))
    }
  }

  const handleOrderDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa đơn hàng này?')) {
      dispatch(deleteOrder(id))
    }
  }

  const handleCustomerDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn vô hiệu hóa khách hàng này?')) {
      dispatch(deleteCustomer(id))
    }
  }

  const handleOrderSearch = (e) => {
    e.preventDefault()
    setOrderPage(1)
    dispatch(listOrders(1, 10, orderSearch, orderStatus))
  }

  const handleCustomerSearch = (e) => {
    e.preventDefault()
    setCustomerPage(1)
    dispatch(listCustomers(1, 10, customerSearch))
  }

  const formatPrice = (price) => {
    return parseFloat(price || 0).toLocaleString('vi-VN')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Chờ xử lý', class: 'pending' },
      processing: { label: 'Đang xử lý', class: 'warning' },
      shipped: { label: 'Đã gửi', class: 'info' },
      delivered: { label: 'Hoàn thành', class: 'success' },
      cancelled: { label: 'Đã hủy', class: 'danger' },
    }
    const config = statusMap[status] || { label: status, class: 'default' }
    return <span className={`admin-status-badge ${config.class}`}>{config.label}</span>
  }

  return (
    <main className='page-main'>
      <div className='admin-container'>
        <div className='admin-header'>
          <h1>🛠️ Bảng điều khiển Admin</h1>
          <p>Chào mừng trở lại, {userInfo.full_name || userInfo.name}!</p>
        </div>

        {/* Tab Navigation */}
        <div className='admin-tabs'>
          <button 
            className={`admin-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Khách hàng
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 Đơn hàng
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            🚗 Sản phẩm
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            🔧 Dịch vụ
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'support' ? 'active' : ''}`}
            onClick={() => setActiveTab('support')}
          >
            💬 Hỗ trợ
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            👥 Nhân viên
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className='admin-content'>
            {loadingStats ? (
              <div className='loading-container'>
                <div className='loading-spinner'></div>
                <p>Đang tải thống kê...</p>
              </div>
            ) : errorStats ? (
              <div className='error-message'>{errorStats}</div>
            ) : stats ? (
              <>
                {/* Stats Cards */}
                <div className='admin-stats-grid'>
                  <div className='admin-stat-card'>
                    <div className='admin-stat-icon'>💰</div>
                    <div className='admin-stat-info'>
                      <div className='admin-stat-title'>Tổng doanh thu</div>
                      <div className='admin-stat-value'>{formatPrice(stats.totalRevenue)}đ</div>
                      <div className='admin-stat-trend'>30 ngày gần nhất</div>
                    </div>
                  </div>
                  <div className='admin-stat-card'>
                    <div className='admin-stat-icon'>📦</div>
                    <div className='admin-stat-info'>
                      <div className='admin-stat-title'>Đơn hàng hoàn thành</div>
                      <div className='admin-stat-value'>{stats.orderCount}</div>
                      <div className='admin-stat-trend'>30 ngày gần nhất</div>
                    </div>
                  </div>
                  <div className='admin-stat-card'>
                    <div className='admin-stat-icon'>👥</div>
                    <div className='admin-stat-info'>
                      <div className='admin-stat-title'>Khách hàng mới</div>
                      <div className='admin-stat-value'>{stats.newCustomers}</div>
                      <div className='admin-stat-trend'>30 ngày gần nhất</div>
                    </div>
                  </div>
                  <div className='admin-stat-card'>
                    <div className='admin-stat-icon'>⚠️</div>
                    <div className='admin-stat-info'>
                      <div className='admin-stat-title'>Sản phẩm tồn kho thấp</div>
                      <div className='admin-stat-value'>{stats.lowStockProducts}</div>
                      <div className='admin-stat-trend'>Dưới 5 sản phẩm</div>
                    </div>
                  </div>
                </div>

                {/* Order Status Stats */}
                <div className='admin-section'>
                  <h2>Thống kê trạng thái đơn hàng</h2>
                  <div className='order-status-grid'>
                    <div className='status-stat pending'>
                      <span className='status-label'>Chờ xử lý</span>
                      <span className='status-count'>{stats.orderStatusStats?.pending || 0}</span>
                    </div>
                    <div className='status-stat warning'>
                      <span className='status-label'>Đang xử lý</span>
                      <span className='status-count'>{stats.orderStatusStats?.processing || 0}</span>
                    </div>
                    <div className='status-stat info'>
                      <span className='status-label'>Đã gửi</span>
                      <span className='status-count'>{stats.orderStatusStats?.shipped || 0}</span>
                    </div>
                    <div className='status-stat success'>
                      <span className='status-label'>Hoàn thành</span>
                      <span className='status-count'>{stats.orderStatusStats?.delivered || 0}</span>
                    </div>
                    <div className='status-stat danger'>
                      <span className='status-label'>Đã hủy</span>
                      <span className='status-count'>{stats.orderStatusStats?.cancelled || 0}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className='admin-content'>
            <div className='admin-section full-width'>
              <div className='section-header'>
                <h2>Quản lý khách hàng</h2>
              </div>
              <form className='admin-search-bar' onSubmit={handleCustomerSearch}>
                <input 
                  type='text' 
                  placeholder='Tìm kiếm theo tên, email, số điện thoại...'
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
                {/* <button type='submit'>🔍 Tìm</button> */}
              </form>

              {loadingCustomers ? (
                <div className='loading-container'>
                  <div className='loading-spinner'></div>
                </div>
              ) : errorCustomers ? (
                <div className='error-message'>{errorCustomers}</div>
              ) : (
                <>
                  <div className='admin-table-container'>
                    <table className='admin-table'>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Tên</th>
                          <th>Email</th>
                          <th>Số điện thoại</th>
                          <th>Địa chỉ</th>
                          <th>Ngày tạo</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers && customers.length > 0 ? (
                          customers.map((customer) => (
                            <tr key={customer._id}>
                              <td>#{customer._id.slice(-6)}</td>
                              <td>{customer.full_name}</td>
                              <td>{customer.email}</td>
                              <td>{customer.phone}</td>
                              <td>{customer.address || 'N/A'}</td>
                              <td>{formatDate(customer.createdAt)}</td>
                              <td>
                                <div className='admin-action-buttons'>
                                  <button 
                                    className='admin-btn-action delete'
                                    onClick={() => handleCustomerDelete(customer._id)}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan='7' style={{ textAlign: 'center' }}>
                              Không có khách hàng nào
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {customerPagination && customerPagination.pages > 1 && (
                    <div className='pagination'>
                      <button
                        onClick={() => setCustomerPage(customerPage - 1)}
                        disabled={customerPage === 1}
                      >
                        ← Trước
                      </button>
                      <span>
                        Trang {customerPage} / {customerPagination.pages}
                      </span>
                      <button
                        onClick={() => setCustomerPage(customerPage + 1)}
                        disabled={customerPage === customerPagination.pages}
                      >
                        Sau →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className='admin-content'>
            <div className='admin-section full-width'>
              <div className='section-header'>
                <h2>Quản lý đơn hàng</h2>
              </div>

              {/* Filters */}
              <div className='admin-filters-bar'>
                <form className='admin-search-bar' onSubmit={handleOrderSearch}>
                  <input 
                    type='text' 
                    placeholder='Tìm kiếm theo tên khách hàng, email...'
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />
                  <select
                    className='admin-order-status-select'
                    value={orderStatus}
                    onChange={(e) => {
                      setOrderStatus(e.target.value)
                      setOrderPage(1)
                    }}
                  >
                    <option value=''>Tất cả trạng thái</option>
                    <option value='pending'>Chờ xử lý</option>
                    <option value='processing'>Đang xử lý</option>
                    <option value='shipped'>Đã gửi</option>
                    <option value='delivered'>Hoàn thành</option>
                    <option value='cancelled'>Đã hủy</option>
                  </select>
                  {/* <button type='submit'>🔍 Tìm</button> */}
                </form>
              </div>

              {loadingOrders ? (
                <div className='loading-container'>
                  <div className='loading-spinner'></div>
                </div>
              ) : errorOrders ? (
                <div className='error-message'>{errorOrders}</div>
              ) : (
                <>
                  <div className='admin-table-container'>
                    <table className='admin-table'>
                      <thead>
                        <tr>
                          <th>Mã ĐH</th>
                          <th>Khách hàng</th>
                          <th>Tổng tiền</th>
                          <th>Trạng thái</th>
                          <th>Ngày tạo</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders && orders.length > 0 ? (
                          orders.map((order) => (
                            <tr key={order._id}>
                              <td>#{order._id.slice(-8)}</td>
                              <td>
                                {/* ✅ Kiểm tra user_id trước khi hiển thị */}
                                {order.user_id ? (
                                  <>
                                    {order.user_id.full_name || 'N/A'}<br />
                                    <small>{order.user_id.email || 'N/A'}</small>
                                  </>
                                ) : (
                                  <span style={{ color: '#999' }}>
                                    Khách vãng lai / Đã xóa
                                  </span>
                                )}
                              </td>
                              <td className='price-cell'>{formatPrice(order.total_amount)}đ</td>
                              <td>{getStatusBadge(order.status)}</td>
                              <td>{formatDate(order.createdAt)}</td>
                              <td>
                                <div className='action-buttons'>
                                  <button 
                                    className='btn-action edit'
                                    onClick={() => handleOrderUpdate(order)}
                                  >
                                    ✏️
                                  </button>
                                  <button 
                                    className='btn-action delete'
                                    onClick={() => handleOrderDelete(order._id)}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan='6' style={{ textAlign: 'center' }}>
                              Không có đơn hàng nào
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {orderPagination && orderPagination.pages > 1 && (
                    <div className='pagination'>
                      <button
                        onClick={() => setOrderPage(orderPage - 1)}
                        disabled={orderPage === 1}
                      >
                        ← Trước
                      </button>
                      <span>
                        Trang {orderPage} / {orderPagination.pages}
                      </span>
                      <button
                        onClick={() => setOrderPage(orderPage + 1)}
                        disabled={orderPage === orderPagination.pages}
                      >
                        Sau →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className='admin-content'>
            <ProductsManagementScreen />
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className='admin-content'>
            <ServicesManagementScreen />
          </div>
        )}

        {/* Order Update Modal */}
        {showOrderModal && selectedOrder && (
          <div className='modal-overlay' onClick={() => setShowOrderModal(false)}>
            <div className='modal-content' onClick={(e) => e.stopPropagation()}>
              <h3>Cập nhật trạng thái đơn hàng</h3>
              <p>Mã: #{selectedOrder._id.slice(-8)}</p>
              <div className='form-group'>
                <label>Trạng thái mới:</label>
                <select
                  className='form-group-select'
                  value={orderNewStatus}
                  onChange={(e) => setOrderNewStatus(e.target.value)}
                >
                  <option value='pending'>Chờ xử lý</option>
                  <option value='processing'>Đang xử lý</option>
                  <option value='shipped'>Đã gửi</option>
                  <option value='delivered'>Hoàn thành</option>
                  <option value='cancelled'>Đã hủy</option>
                </select>
              </div>
              <div className='modal-buttons'>
                <button
                  className='btn-confirm'
                  onClick={handleOrderStatusSubmit}
                  disabled={loadingOrderUpdate}
                >
                  {loadingOrderUpdate ? 'Đang cập nhật...' : 'Xác nhận'}
                </button>
                <button
                  className='btn-cancel'
                  onClick={() => setShowOrderModal(false)}
                  disabled={loadingOrderUpdate}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Support Tab */}
        {activeTab === 'support' && (
          <div className='admin-content'>
            <SupportAdminPanel />
          </div>
        )}

        {/* Staff Tab */}
        {activeTab === 'staff' && (
          <div className='admin-content'>
            <StaffManagementScreen />
          </div>
        )}
      </div>
    </main>
  )
}

export default AdminScreen