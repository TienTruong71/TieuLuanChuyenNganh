import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { listStaff, createStaff, updateStaff, deleteStaff } from '../actions/staffActions'
import { ADMIN_STAFF_CREATE_RESET, ADMIN_STAFF_UPDATE_RESET } from '../actions/staffActions'
import '../styles/staff.css'

const StaffManagementScreen = () => {
  const dispatch = useDispatch()
  
  // ✅ Mapping role tiếng Anh <-> tiếng Việt
  const ROLE_MAPPING = {
    'admin': 'Quản trị viên',
    'customer': 'Khách hàng',
    'inventory': 'Nhân viên kho',
    'service': 'Nhân viên dịch vụ',
    'sale': 'Nhân viên bán hàng'
  }

  // ✅ Helper: Lấy tên tiếng Việt từ role tiếng Anh
  const getRoleDisplayName = (roleEnglish) => {
    return ROLE_MAPPING[roleEnglish] || roleEnglish
  }

  // ✅ Danh sách roles cho dropdown (loại bỏ customer vì không phải staff)
  const STAFF_ROLES = [
    { value: 'admin', label: 'Quản trị viên' },
    { value: 'inventory', label: 'Nhân viên kho' },
    { value: 'service', label: 'Nhân viên dịch vụ' },
    { value: 'sale', label: 'Nhân viên bán hàng' }
  ]
  
  // State
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone: '',
    full_name: '',
    position: 'sale', // ✅ Mặc định là sale (tiếng Anh)
    salary: '',
    hired_date: '',
    status: 'active'
  })

  // Redux
  const staffList = useSelector(state => state.adminStaffList)
  const { loading: loadingList, staff, pagination, error: errorList } = staffList

  const staffCreate = useSelector(state => state.adminStaffCreate)
  const { loading: loadingCreate, success: successCreate, error: errorCreate } = staffCreate

  const staffUpdate = useSelector(state => state.adminStaffUpdate)
  const { loading: loadingUpdate, success: successUpdate, error: errorUpdate } = staffUpdate

  const staffDelete = useSelector(state => state.adminStaffDelete)
  const { loading: loadingDelete, success: successDelete, error: errorDelete } = staffDelete

  // Load staff list
  useEffect(() => {
    dispatch(listStaff(page, 10, search))
  }, [dispatch, page, search])

  // Reset form after create/update
  useEffect(() => {
    if (successCreate || successUpdate) {
      setShowForm(false)
      setEditingId(null)
      setFormData({
        username: '',
        password: '',
        email: '',
        phone: '',
        full_name: '',
        position: 'sale',
        salary: '',
        hired_date: '',
        status: 'active'
      })
      dispatch(listStaff(page, 10, search))
      
      if (successCreate) {
        dispatch({ type: ADMIN_STAFF_CREATE_RESET })
      }
      if (successUpdate) {
        dispatch({ type: ADMIN_STAFF_UPDATE_RESET })
      }
    }
  }, [successCreate, successUpdate, dispatch, page, search])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingId) {
      // Update - không cần password
      const updateData = { ...formData }
      delete updateData.password
      delete updateData.username
      dispatch(updateStaff(editingId, updateData))
    } else {
      // Create - cần password
      dispatch(createStaff(formData))
    }
  }

  const handleEdit = (staffMember) => {
    setEditingId(staffMember._id)
    setFormData({
      username: staffMember.username || '',
      email: staffMember.email || '',
      phone: staffMember.phone || '',
      full_name: staffMember.full_name || '',
      position: staffMember.position || 'sale', // ✅ Giữ nguyên giá trị tiếng Anh
      salary: staffMember.salary || '',
      hired_date: staffMember.hired_date ? staffMember.hired_date.split('T')[0] : '',
      status: staffMember.status || 'active',
      password: ''
    })
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Bạn chắc chắn muốn vô hiệu hóa nhân viên này?')) {
      dispatch(deleteStaff(id))
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      username: '',
      password: '',
      email: '',
      phone: '',
      full_name: '',
      position: 'sale',
      salary: '',
      hired_date: '',
      status: 'active'
    })
  }

  const formatSalary = (salary) => {
    if (!salary) return 'N/A'
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(salary)
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('vi-VN')
  }

  return (
    <div className='admin-staff-container'>
      {/* Header */}
      <div className='admin-staff-header'>
        <h2>👥 Quản Lý Nhân Viên</h2>
        <button 
          className='admin-btn-add'
          onClick={() => {
            setEditingId(null)
            setFormData({
              username: '',
              password: '',
              email: '',
              phone: '',
              full_name: '',
              position: 'sale',
              salary: '',
              hired_date: '',
              status: 'active'
            })
            setShowForm(true)
          }}
        >
          + Thêm Nhân Viên
        </button>
      </div>

      {/* Search Bar */}
      <div className='admin-search-bar'>
        <input
          type='text'
          placeholder='Tìm kiếm theo tên, email hoặc số điện thoại...'
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>

      {/* Error Messages */}
      {errorList && <div className='admin-error'>{errorList}</div>}
      {errorCreate && <div className='admin-error'>{errorCreate}</div>}
      {errorUpdate && <div className='admin-error'>{errorUpdate}</div>}
      {errorDelete && <div className='admin-error'>{errorDelete}</div>}

      {/* Form */}
      {showForm && (
        <div className='admin-modal' onClick={() => handleCancel()}>
          <div className='admin-modal-content' onClick={e => e.stopPropagation()}>
            <h3>{editingId ? 'Cập Nhật Nhân Viên' : 'Thêm Nhân Viên Mới'}</h3>
            
            <form onSubmit={handleSubmit} className='admin-form'>
              <div className='admin-form-row'>
                <div className='admin-form-group'>
                  <label>Tên Đăng Nhập *</label>
                  <input
                    type='text'
                    name='username'
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={!!editingId}
                    required={!editingId}
                  />
                </div>
                <div className='admin-form-group'>
                  <label>Mật Khẩu {!editingId && '*'}</label>
                  <input
                    type='password'
                    name='password'
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editingId}
                  />
                </div>
              </div>

              <div className='admin-form-row'>
                <div className='admin-form-group'>
                  <label>Họ Tên *</label>
                  <input
                    type='text'
                    name='full_name'
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                {/* ✅ ĐÃ SỬA: Đổi input thành select dropdown */}
                <div className='admin-form-group'>
                  <label>Chức Vụ *</label>
                  <select
                    name='position'
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                    className='role-select'
                  >
                    <option value=''>-- Chọn chức vụ --</option>
                    {STAFF_ROLES.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  <small className='form-hint'>
                    💡 Chức vụ xác định quyền truy cập của nhân viên vào hệ thống
                  </small>
                </div>
              </div>

              <div className='admin-form-row'>
                <div className='admin-form-group'>
                  <label>Email *</label>
                  <input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className='admin-form-group'>
                  <label>Số Điện Thoại *</label>
                  <input
                    type='tel'
                    name='phone'
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className='admin-form-row'>
                <div className='admin-form-group'>
                  <label>Lương *</label>
                  <input
                    type='number'
                    name='salary'
                    value={formData.salary}
                    onChange={handleInputChange}
                    placeholder='0'
                    required
                  />
                </div>
                <div className='admin-form-group'>
                  <label>Ngày Tuyển Dụng *</label>
                  <input
                    type='date'
                    name='hired_date'
                    value={formData.hired_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className='admin-form-row'>
                <div className='admin-form-group'>
                  <label>Trạng Thái</label>
                  <select
                    name='status'
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value='active'>Hoạt Động</option>
                    <option value='inactive'>Không Hoạt Động</option>
                    <option value='suspended'>Tạm Khóa</option>
                  </select>
                </div>
              </div>

              <div className='admin-modal-buttons'>
                <button 
                  type='submit'
                  className='btn-confirm'
                  disabled={loadingCreate || loadingUpdate}
                >
                  {editingId ? 'Cập Nhật' : 'Tạo Mới'}
                </button>
                <button
                  type='button'
                  className='btn-cancel'
                  onClick={handleCancel}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff List */}
      <div className='admin-staff-list'>
        {loadingList ? (
          <div className='admin-loading'>Đang tải...</div>
        ) : staff && staff.length > 0 ? (
          <table className='admin-table'>
            <thead>
              <tr>
                <th>Tên</th>
                <th>Email</th>
                <th>Chức Vụ</th>
                <th>Lương</th>
                <th>Ngày Tuyển Dụng</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member._id}>
                  <td className='admin-cell-name'>{member.full_name}</td>
                  <td>{member.email}</td>
                  {/* ✅ ĐÃ SỬA: Hiển thị tiếng Việt trong bảng */}
                  <td>
                    <span className={`role-badge role-${member.position}`}>
                      {getRoleDisplayName(member.position)}
                    </span>
                  </td>
                  <td>{formatSalary(member.salary)}</td>
                  <td>{formatDate(member.hired_date)}</td>
                  <td>
                    <span className={`admin-status admin-status-${member.status}`}>
                      {member.status === 'active' ? 'Hoạt Động' : 
                       member.status === 'inactive' ? 'Không Hoạt Động' : 
                       'Tạm Khóa'}
                    </span>
                  </td>
                  <td className='admin-cell-actions'>
                    <button
                      className='btn-edit'
                      onClick={() => handleEdit(member)}
                      title='Chỉnh sửa'
                    >
                      ✏️
                    </button>
                    <button
                      className='btn-delete'
                      onClick={() => handleDelete(member._id)}
                      disabled={loadingDelete}
                      title='Xóa'
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className='admin-empty'>Không có nhân viên nào</div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className='admin-pagination'>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Trước
          </button>
          <span>Trang {page} / {pagination.pages}</span>
          <button
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  )
}

export default StaffManagementScreen