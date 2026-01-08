import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import '../styles/admin.css'
import {
  listServices,
  createService,
  updateService,
  deleteService,
} from '../actions/adminActions'
import {
  ADMIN_SERVICE_CREATE_RESET,
  ADMIN_SERVICE_UPDATE_RESET,
  ADMIN_SERVICE_DELETE_RESET,
} from '../constants/adminConstants'

const ServicesManagementScreen = () => {
  const dispatch = useDispatch()

  const [showServiceModal, setShowServiceModal] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Service form
  const [serviceName, setServiceName] = useState('')
  const [serviceDesc, setServiceDesc] = useState('')
  const [servicePrice, setServicePrice] = useState('')
  const [serviceDuration, setServiceDuration] = useState('')

  const serviceList = useSelector((state) => state.adminServiceList)
  const { loading: loadingServices, services, pagination, error: errorServices } = serviceList

  const serviceCreate = useSelector((state) => state.adminServiceCreate)
  const { loading: loadingServiceCreate, success: successServiceCreate } = serviceCreate

  const serviceUpdate = useSelector((state) => state.adminServiceUpdate)
  const { loading: loadingServiceUpdate, success: successServiceUpdate } = serviceUpdate

  const serviceDelete = useSelector((state) => state.adminServiceDelete)
  const { loading: loadingServiceDelete, success: successServiceDelete } = serviceDelete

  useEffect(() => {
    dispatch(listServices(currentPage, 10, searchTerm))
  }, [dispatch, currentPage, searchTerm])

  useEffect(() => {
    if (successServiceCreate) {
      alert('Tạo dịch vụ thành công!')
      setShowServiceModal(false)
      resetForm()
      dispatch({ type: ADMIN_SERVICE_CREATE_RESET })
      dispatch(listServices(currentPage, 10, searchTerm))
    }
  }, [successServiceCreate, dispatch, currentPage, searchTerm])

  useEffect(() => {
    if (successServiceUpdate) {
      alert('Cập nhật dịch vụ thành công!')
      setShowServiceModal(false)
      resetForm()
      dispatch({ type: ADMIN_SERVICE_UPDATE_RESET })
      dispatch(listServices(currentPage, 10, searchTerm))
    }
  }, [successServiceUpdate, dispatch, currentPage, searchTerm])

  useEffect(() => {
    if (successServiceDelete) {
      alert('Xóa dịch vụ thành công!')
      dispatch(listServices(currentPage, 10, searchTerm))
    }
  }, [successServiceDelete, dispatch, currentPage, searchTerm])

  // ✅ Cleanup: Reset success states khi unmount component
  useEffect(() => {
    return () => {
      dispatch({ type: ADMIN_SERVICE_CREATE_RESET })
      dispatch({ type: ADMIN_SERVICE_UPDATE_RESET })
      dispatch({ type: ADMIN_SERVICE_DELETE_RESET })
    }
  }, [dispatch])

  const resetForm = () => {
    setServiceName('')
    setServiceDesc('')
    setServicePrice('')
    setServiceDuration('')
    setEditingService(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const serviceData = {
      service_name: serviceName,
      description: serviceDesc,
      price: parseFloat(servicePrice),
      duration: serviceDuration,
    }

    if (editingService) {
      dispatch(updateService(editingService._id, serviceData))
    } else {
      dispatch(createService(serviceData))
    }
  }

  const handleEdit = (service) => {
    setEditingService(service)
    setServiceName(service.service_name)
    setServiceDesc(service.description || '')
    setServicePrice(service.price)
    setServiceDuration(service.duration)
    setShowServiceModal(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa dịch vụ này?')) {
      dispatch(deleteService(id))
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    dispatch(listServices(1, 10, searchTerm))
  }

  const formatPrice = (price) => {
    return parseFloat(price || 0).toLocaleString('vi-VN')
  }

  return (
    <div className='services-management'>
      <div className='management-header'>
        <h2>Quản lý dịch vụ</h2>
        <button className='btn-add' onClick={() => setShowServiceModal(true)}>
          + Thêm dịch vụ
        </button>
      </div>

      {/* Search */}
      <form className='search-bar-admin' onSubmit={handleSearch}>
        <input
          type='text'
          placeholder='Tìm kiếm theo tên dịch vụ...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* <button type='submit'>🔍 Tìm</button> */}
      </form>

      {/* Services Grid */}
      {loadingServices ? (
        <div className='loading-container'>
          <div className='loading-spinner'></div>
        </div>
      ) : errorServices ? (
        <div className='error-message'>{errorServices}</div>
      ) : services && services.length > 0 ? (
        <>
          <div className='services-grid'>
            {services.map((service) => (
              <div key={service._id} className='service-card-admin'>
                <div className='service-header'>
                  <h3>{service.service_name}</h3>
                  <span className='service-price'>{formatPrice(service.price)}đ</span>
                </div>
                <p className='service-description'>{service.description}</p>
                <div className='service-footer'>
                  <span className='service-duration'>
                    ⏱️ {service.duration}
                  </span>
                  <div className='service-actions'>
                    <button className='btn-edit' onClick={() => handleEdit(service)}>
                      ✏️
                    </button>
                    <button className='btn-delete' onClick={() => handleDelete(service._id)}>
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className='pagination'>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ← Trước
              </button>
              <span>
                Trang {currentPage} / {pagination.pages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === pagination.pages}
              >
                Sau →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className='empty-state'>
          <div className='empty-icon'>🔧</div>
          <h3>Chưa có dịch vụ nào</h3>
          <p>Hãy thêm dịch vụ đầu tiên</p>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <div className='modal-overlay' onClick={() => setShowServiceModal(false)}>
          <div className='modal-content' onClick={(e) => e.stopPropagation()}>
            <h3>{editingService ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ mới'}</h3>
            <form onSubmit={handleSubmit}>
              <div className='form-group'>
                <label>Tên dịch vụ: *</label>
                <input
                  type='text'
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  required
                />
              </div>
              <div className='form-group'>
                <label>Mô tả:</label>
                <textarea
                  value={serviceDesc}
                  onChange={(e) => setServiceDesc(e.target.value)}
                  rows='3'
                />
              </div>
              <div className='form-grid'>
                <div className='form-group'>
                  <label>Giá (VNĐ): *</label>
                  <input
                    type='number'
                    value={servicePrice}
                    onChange={(e) => setServicePrice(e.target.value)}
                    required
                  />
                </div>
                <div className='form-group'>
                  <label>Thời gian: *</label>
                  <input
                    type='text'
                    value={serviceDuration}
                    onChange={(e) => setServiceDuration(e.target.value)}
                    placeholder='Ví dụ: 2 giờ'
                    required
                  />
                </div>
              </div>
              <div className='modal-buttons'>
                <button
                  type='submit'
                  className='btn-confirm'
                  disabled={loadingServiceCreate || loadingServiceUpdate}
                >
                  {loadingServiceCreate || loadingServiceUpdate
                    ? 'Đang xử lý...'
                    : editingService
                    ? 'Cập nhật'
                    : 'Tạo dịch vụ'}
                </button>
                <button
                  type='button'
                  className='btn-cancel'
                  onClick={() => {
                    setShowServiceModal(false)
                    resetForm()
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServicesManagementScreen