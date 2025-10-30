import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'

const AdminScreen = () => {
  const history = useHistory()
  const [activeTab, setActiveTab] = useState('dashboard')
  
  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin || {}

  useEffect(() => {
    // Redirect if not admin
    if (!userInfo || !userInfo.isAdmin) {
      history.push('/login')
    }
  }, [history, userInfo])

  if (!userInfo || !userInfo.isAdmin) {
    return null
  }

  // Mock data for dashboard
  const stats = [
    { id: 1, title: 'Tổng người dùng', value: '1,234', icon: '👥', trend: '+12%' },
    { id: 2, title: 'Sản phẩm', value: '567', icon: '🚗', trend: '+5%' },
    { id: 3, title: 'Đơn hàng', value: '89', icon: '📦', trend: '+23%' },
    { id: 4, title: 'Doanh thu', value: '2.4M', icon: '💰', trend: '+18%' }
  ]

  const recentUsers = [
    { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@email.com', role: 'User', date: '2024-01-15' },
    { id: 2, name: 'Trần Thị B', email: 'tranthib@email.com', role: 'User', date: '2024-01-14' },
    { id: 3, name: 'Lê Văn C', email: 'levanc@email.com', role: 'User', date: '2024-01-13' }
  ]

  const recentOrders = [
    { id: 'ORD-001', product: 'Sedan A', customer: 'Nguyễn Văn A', status: 'Đang xử lý', amount: '$20,000' },
    { id: 'ORD-002', product: 'SUV B', customer: 'Trần Thị B', status: 'Hoàn thành', amount: '$28,500' },
    { id: 'ORD-003', product: 'EV D', customer: 'Lê Văn C', status: 'Chờ thanh toán', amount: '$40,000' }
  ]

  return (
    <main className='page-main'>
      <div className='admin-container'>
        <div className='admin-header'>
          <h1>🛠️ Bảng điều khiển Admin</h1>
          <p>Chào mừng trở lại, {userInfo.name}!</p>
        </div>

        {/* Tab Navigation */}
        <div className='admin-tabs'>
          <button 
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Người dùng
          </button>
          <button 
            className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            🚗 Sản phẩm
          </button>
          <button 
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 Đơn hàng
          </button>
          <button 
            className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            🔧 Dịch vụ
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className='admin-content'>
            {/* Stats Cards */}
            <div className='stats-grid'>
              {stats.map(stat => (
                <div key={stat.id} className='stat-card'>
                  <div className='stat-icon'>{stat.icon}</div>
                  <div className='stat-info'>
                    <div className='stat-title'>{stat.title}</div>
                    <div className='stat-value'>{stat.value}</div>
                    <div className='stat-trend'>{stat.trend} từ tháng trước</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className='admin-grid'>
              <div className='admin-section'>
                <h2>Người dùng mới</h2>
                <div className='table-container'>
                  <table className='admin-table'>
                    <thead>
                      <tr>
                        <th>Tên</th>
                        <th>Email</th>
                        <th>Vai trò</th>
                        <th>Ngày đăng ký</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map(user => (
                        <tr key={user.id}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td><span className='badge'>{user.role}</span></td>
                          <td>{user.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className='admin-section'>
                <h2>Đơn hàng gần đây</h2>
                <div className='table-container'>
                  <table className='admin-table'>
                    <thead>
                      <tr>
                        <th>Mã</th>
                        <th>Sản phẩm</th>
                        <th>Trạng thái</th>
                        <th>Giá</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map(order => (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>{order.product}</td>
                          <td>
                            <span className={`status-badge ${
                              order.status === 'Hoàn thành' ? 'success' : 
                              order.status === 'Đang xử lý' ? 'warning' : 'pending'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className='price-cell'>{order.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className='admin-content'>
            <div className='admin-section full-width'>
              <div className='section-header'>
                <h2>Quản lý người dùng</h2>
                <button className='btn-add'>+ Thêm người dùng</button>
              </div>
              <div className='search-bar-admin'>
                <input type='text' placeholder='Tìm kiếm người dùng...' />
                <button>🔍 Tìm</button>
              </div>
              <div className='table-container'>
                <table className='admin-table'>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tên</th>
                      <th>Email</th>
                      <th>Vai trò</th>
                      <th>Trạng thái</th>
                      <th>Ngày tạo</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map(user => (
                      <tr key={user.id}>
                        <td>#{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td><span className='badge'>{user.role}</span></td>
                        <td><span className='status-badge success'>Active</span></td>
                        <td>{user.date}</td>
                        <td>
                          <div className='action-buttons'>
                            <button className='btn-action edit'>✏️</button>
                            <button className='btn-action delete'>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className='admin-content'>
            <div className='admin-section full-width'>
              <div className='section-header'>
                <h2>Quản lý sản phẩm</h2>
                <button className='btn-add'>+ Thêm sản phẩm</button>
              </div>
              <div className='coming-soon'>
                <div className='coming-soon-icon'>🚗</div>
                <h3>Quản lý sản phẩm</h3>
                <p>Tính năng đang được phát triển. Bạn sẽ có thể thêm, sửa, xóa sản phẩm tại đây.</p>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className='admin-content'>
            <div className='admin-section full-width'>
              <div className='section-header'>
                <h2>Quản lý đơn hàng</h2>
                <button className='btn-add'>+ Tạo đơn hàng</button>
              </div>
              <div className='coming-soon'>
                <div className='coming-soon-icon'>📦</div>
                <h3>Quản lý đơn hàng</h3>
                <p>Tính năng đang được phát triển. Bạn sẽ có thể xem và quản lý đơn hàng tại đây.</p>
              </div>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className='admin-content'>
            <div className='admin-section full-width'>
              <div className='section-header'>
                <h2>Quản lý dịch vụ</h2>
                <button className='btn-add'>+ Thêm dịch vụ</button>
              </div>
              <div className='coming-soon'>
                <div className='coming-soon-icon'>🔧</div>
                <h3>Quản lý dịch vụ</h3>
                <p>Tính năng đang được phát triển. Bạn sẽ có thể thêm, sửa, xóa dịch vụ tại đây.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default AdminScreen