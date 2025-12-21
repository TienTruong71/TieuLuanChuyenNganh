import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getSupportRequests, replySupportRequest, getSupportRequestDetail } from '../actions/supportAdminActions'
import '../styles/supportAdmin.css'

const SupportAdminPanel = () => {
  const dispatch = useDispatch()
  const { supportRequests, loading, error, pagination, selectedRequest } = useSelector(state => state.supportAdmin)
  const [replyText, setReplyText] = useState('')
  const [detailOpen, setDetailOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [sidebarMinimized, setSidebarMinimized] = useState(false)
  const [viewingRequestId, setViewingRequestId] = useState(null)
  const [sending, setSending] = useState(false)  // ✅ State riêng cho việc gửi

  // Chỉ fetch list 1 lần khi mount
  useEffect(() => {
    dispatch(getSupportRequests(1))
  }, [dispatch])

  const handleReply = async () => {
    if (!replyText.trim() || !viewingRequestId) {
      return
    }

    setSending(true)
    
    try {
      await dispatch(replySupportRequest(viewingRequestId, {
        text: replyText,
        status: 'in_progress'
      }))
      
      setReplyText('')
      
      // ✅ Chỉ fetch lại request đang xem (không reload toàn bộ)
      dispatch(getSupportRequestDetail(viewingRequestId))
    } catch (err) {
      console.error('Lỗi gửi tin nhắn:', err)
    } finally {
      setSending(false)
    }
  }

  const handleClose = async () => {
    if (viewingRequestId) {
      setSending(true)
      
      try {
        await dispatch(replySupportRequest(viewingRequestId, {
          status: 'resolved'
        }))
        
        setReplyText('')
        setDetailOpen(false)
        setViewingRequestId(null)
        
        // Refresh list sau khi đóng request
        dispatch(getSupportRequests(1))
      } catch (err) {
        console.error('Lỗi đóng yêu cầu:', err)
      } finally {
        setSending(false)
      }
    }
  }

  const openDetail = (request) => {
    setViewingRequestId(request._id)
    dispatch(getSupportRequestDetail(request._id))
    setDetailOpen(true)
    setReplyText('')
  }

  const closeDetail = () => {
    setDetailOpen(false)
    setViewingRequestId(null)
    setReplyText('')
    // Refresh list khi đóng detail
    dispatch(getSupportRequests(1))
  }

  const handlePageChange = (page) => {
    dispatch(getSupportRequests(page))
  }

  const filteredRequests = statusFilter === 'all' 
    ? supportRequests 
    : supportRequests.filter(req => req.status === statusFilter)

  // ✅ Polling - chỉ fetch request đang xem, mỗi 5 giây
  useEffect(() => {
    if (viewingRequestId && detailOpen) {
      const interval = setInterval(() => {
        dispatch(getSupportRequestDetail(viewingRequestId))
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [viewingRequestId, detailOpen, dispatch])

  // ✅ Hỗ trợ gửi tin nhắn bằng Enter (Shift+Enter để xuống dòng)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleReply()
    }
  }

  if (loading && supportRequests.length === 0) {
    return <div className="support-admin-loading">Đang tải...</div>
  }

  // Detail view
  if (selectedRequest && detailOpen) {
    return (
      <div className="support-admin-container support-admin-detail-mode">
        {/* Sidebar danh sách */}
        <div className={`support-admin-sidebar ${sidebarMinimized ? 'minimized' : ''}`}>
          <div className="sidebar-header">
            <h3>Yêu Cầu</h3>
            <button 
              className="sidebar-toggle-btn"
              onClick={() => setSidebarMinimized(!sidebarMinimized)}
              title={sidebarMinimized ? 'Mở rộng' : 'Thu nhỏ'}
            >
              {sidebarMinimized ? '→' : '←'}
            </button>
          </div>

          {!sidebarMinimized && (
            <div className="sidebar-filter">
              <div className="filter-tabs-vertical">
                <button 
                  className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('all')}
                >
                  Tất Cả ({supportRequests.length})
                </button>
                <button 
                  className={`filter-tab ${statusFilter === 'pending' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('pending')}
                >
                  Chờ ({supportRequests.filter(r => r.status === 'pending').length})
                </button>
                <button 
                  className={`filter-tab ${statusFilter === 'in_progress' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('in_progress')}
                >
                  XL ({supportRequests.filter(r => r.status === 'in_progress').length})
                </button>
                <button 
                  className={`filter-tab ${statusFilter === 'resolved' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('resolved')}
                >
                  Xong ({supportRequests.filter(r => r.status === 'resolved').length})
                </button>
              </div>
            </div>
          )}

          <div className="sidebar-list">
            {filteredRequests.map((request) => (
              <div 
                key={request._id} 
                className={`sidebar-item ${viewingRequestId === request._id ? 'active' : ''} ${request.status}`}
                onClick={() => openDetail(request)}
              >
                <div className="sidebar-item-name">{request.user?.name || 'Khách'}</div>
                <div className="sidebar-item-status">
                  <span className={`badge ${request.status}`}>
                    {request.status === 'pending' ? '⏳' : request.status === 'in_progress' ? '⚙️' : '✅'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main detail view */}
        <div className="support-admin-main">
          {/* Detail Header */}
          <div className="detail-header">
            <div className="detail-title">
              <button className="btn-back" onClick={closeDetail}>←</button>
              <div className="title-info">
                <h2>{selectedRequest.user?.name || 'Khách hàng'}</h2>
                <p className="title-subtitle">{selectedRequest.user?.email}</p>
              </div>
            </div>
            <div className="detail-status">
              <span className={`status-badge ${selectedRequest.status}`}>
                {selectedRequest.status === 'pending' ? 'Đang Chờ' : selectedRequest.status === 'in_progress' ? 'Đang Xử Lý' : 'Đã Giải Quyết'}
              </span>
              <span className="detail-date">{new Date(selectedRequest.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>

          {/* Error Message - chỉ hiện khi có lỗi */}
          {error && <div className="support-admin-error">{error}</div>}

          {/* Chat Messages */}
          <div className="detail-messages">
            <div className="messages-container">
              {selectedRequest.messages && selectedRequest.messages.map((msg, idx) => (
                <div key={idx} className={`admin-message ${msg.senderRole}`}>
                  <div className="msg-header">
                    <span className="msg-sender">
                      {msg.senderRole === 'customer' ? '👤' : '👨‍💼'} {msg.senderName}
                    </span>
                    <span className="msg-time">
                      {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div className="msg-content">{msg.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Reply Form */}
          {(selectedRequest.status === 'pending' || selectedRequest.status === 'in_progress') && (
            <div className="detail-reply-form">
              <textarea
                placeholder="Nhập tin nhắn trả lời... (Enter để gửi, Shift+Enter để xuống dòng)"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows="3"
                className="reply-textarea"
                disabled={sending}
              />
              <div className="reply-actions">
                <button 
                  className="btn-send"
                  onClick={handleReply}
                  disabled={sending || !replyText.trim()}
                >
                  {sending ? '⏳' : '📤'} Gửi
                </button>
                <button 
                  className="btn-close-request"
                  onClick={handleClose}
                  disabled={sending}
                >
                  ✓ Đóng Yêu Cầu
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // List view mặc định
  return (
    <div className="support-admin-container">
      {/* Header */}
      <div className="support-admin-header">
        <h2>Quản Lý Yêu Cầu Hỗ Trợ</h2>
        <div className="support-admin-stats">
          <span className="stat">Tổng: {pagination.totalRequests || 0}</span>
          <span className="stat">Đang chờ: {supportRequests.filter(r => r.status === 'pending').length}</span>
          <span className="stat">Đã giải quyết: {supportRequests.filter(r => r.status === 'resolved').length}</span>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="support-admin-error">{error}</div>}

      {/* Filter Tabs */}
      <div className="support-admin-tabs">
        <button 
          className={`tab ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          Tất Cả ({supportRequests.length})
        </button>
        <button 
          className={`tab ${statusFilter === 'pending' ? 'active' : ''}`}
          onClick={() => setStatusFilter('pending')}
        >
          Đang Chờ ({supportRequests.filter(r => r.status === 'pending').length})
        </button>
        <button 
          className={`tab ${statusFilter === 'resolved' ? 'active' : ''}`}
          onClick={() => setStatusFilter('resolved')}
        >
          Đã Giải Quyết ({supportRequests.filter(r => r.status === 'resolved').length})
        </button>
      </div>

      {/* Support Requests List */}
      <div className="support-admin-list">
        {filteredRequests.length === 0 ? (
          <div className="support-admin-empty">Không có yêu cầu hỗ trợ nào</div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request._id} className={`support-admin-item ${request.status}`}>
              <div className="support-admin-item-header">
                <div className="support-admin-item-info">
                  <h4>{request.user?.name || 'Khách hàng'}</h4>
                  <p className="support-admin-item-email">{request.user?.email || 'N/A'}</p>
                  <p className="support-admin-item-phone">{request.user?.phone || 'N/A'}</p>
                </div>
                <div className="support-admin-item-meta">
                  <span className={`status-badge ${request.status}`}>
                    {request.status === 'pending' ? 'Đang Chờ' : request.status === 'in_progress' ? 'Đang Xử Lý' : 'Đã Giải Quyết'}
                  </span>
                  <span className="support-admin-item-date">
                    {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>

              {/* Chat Messages Preview */}
              <div className="support-admin-messages">
                <div className="messages-list">
                  {request.messages && request.messages.slice(-2).map((msg, idx) => (
                    <div key={idx} className={`admin-message ${msg.senderRole}`}>
                      <div className="msg-header">
                        <span className="msg-sender">{msg.senderName}</span>
                        <span className="msg-time">{new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="msg-content">{msg.text}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="support-admin-item-reply-form">
                <button 
                  className="btn-reply-trigger"
                  onClick={() => openDetail(request)}
                >
                  {request.status === 'resolved' ? 'Xem Chi Tiết' : 'Trả Lời'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="support-admin-pagination">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            ← Trước
          </button>
          <span className="pagination-info">
            Trang {pagination.currentPage} / {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  )
}

export default SupportAdminPanel