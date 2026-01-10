import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createSupportRequest, clearSupportMessage, getActiveSupportRequest, closeSupportRequest, sendSupportMessage } from '../actions/supportActions'
import '../styles/support.css'

const SupportButton = () => {
    const dispatch = useDispatch()
    const userLogin = useSelector((state) => state.userLogin)
    const { userInfo } = userLogin
    const support = useSelector((state) => state.support)
    const { loading, error, message, success, activeRequest } = support

    const [isOpen, setIsOpen] = useState(false)
    const [messageText, setMessageText] = useState('')
    const [isLocked, setIsLocked] = useState(false)
    const [pollInterval, setPollInterval] = useState(null)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }

    // Scroll khi có tin nhắn mới
    useEffect(() => {
        scrollToBottom()
    }, [activeRequest?.messages])

    // Lấy support request hiện tại khi component mount
    useEffect(() => {
        if (userInfo) {
            dispatch(getActiveSupportRequest())
        }
    }, [userInfo, dispatch])

    // Kiểm tra xem có support pending không
    useEffect(() => {
        if (activeRequest && (activeRequest.status === 'pending' || activeRequest.status === 'in_progress')) {
            setIsLocked(true)
            setIsOpen(true)
        } else {
            setIsLocked(false)
            setIsOpen(false)
        }
    }, [activeRequest])

    // Polling: Cập nhật tin nhắn mới mỗi 3 giây
    useEffect(() => {
        if (isOpen && isLocked && userInfo) {
            // Lấy ngay khi mở
            dispatch(getActiveSupportRequest())

            // Setup polling
            const interval = setInterval(() => {
                dispatch(getActiveSupportRequest())
            }, 3000) // 3 giây

            setPollInterval(interval)

            return () => {
                clearInterval(interval)
                setPollInterval(null)
            }
        }
    }, [isOpen, isLocked, userInfo, dispatch])

    useEffect(() => {
        if (success) {
            setTimeout(() => {
                setMessageText('')
                dispatch(clearSupportMessage())
            }, 1500)
        }
    }, [success, dispatch])

    // Xử lý khi AI Chat được mở
    useEffect(() => {
        const handleAIChatOpen = () => {
            setIsOpen(false)
        }

        window.addEventListener('ai-chat-opened', handleAIChatOpen)
        return () => {
            window.removeEventListener('ai-chat-opened', handleAIChatOpen)
        }
    }, [])

    const toggleSupport = () => {
        if (!isLocked) {
            if (!isOpen) {
                window.dispatchEvent(new CustomEvent('support-opened'))
            }
            setIsOpen(!isOpen)
        } else {
            // Nếu locked thì click X chỉ toggle, không đóng box
            setIsOpen(!isOpen)
        }
    }

    const handleCloseRequest = async () => {
        if (activeRequest && activeRequest._id) {
            try {
                await dispatch(closeSupportRequest(activeRequest._id))
            } catch (err) {
                console.error('Lỗi đóng yêu cầu hỗ trợ:', err)
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!userInfo) {
            alert('Vui lòng đăng nhập để liên hệ hỗ trợ')
            return
        }

        if (!messageText.trim()) {
            alert('Vui lòng nhập tin nhắn')
            return
        }

        try {
            if (activeRequest && activeRequest._id) {
                // Gửi tin nhắn vào chat hiện tại
                await dispatch(sendSupportMessage(activeRequest._id, messageText))
            } else {
                // Tạo support request mới
                await dispatch(createSupportRequest(messageText))
            }
        } catch (err) {
            console.error('Lỗi gửi yêu cầu hỗ trợ:', err)
        }
    }

    return (
        <div className='support-container'>
            {/* Support Button */}
            <button
                className='support-button'
                onClick={() => {
                    if (!isLocked) {
                        if (!isOpen) {
                            window.dispatchEvent(new CustomEvent('support-opened'))
                        }
                        setIsOpen(!isOpen)
                    } else {
                        // Nếu locked, click button mở/đóng box
                        setIsOpen(!isOpen)
                    }
                }}
                title={isLocked ? 'Bạn đã có yêu cầu hỗ trợ đang chờ xử lý' : 'Liên hệ hỗ trợ'}
                style={{ opacity: isLocked ? 0.7 : 1, cursor: 'pointer' }}
            >
                💬{isLocked && <span className='support-badge'>!</span>}
            </button>

            {/* Support Chat Box */}
            {isOpen && (
                <div className='support-chat-box'>
                    <div className='support-header'>
                        <h4>💬 Hỗ trợ khách hàng</h4>
                        <button
                            className='close-btn'
                            onClick={toggleSupport}
                            title='Tắt đoạn chat'
                        >
                            ✕
                        </button>
                    </div>

                    {error && (
                        <div className='support-error'>{error}</div>
                    )}
                    {success && message && (
                        <div className='support-success'>{message}</div>
                    )}

                    {!userInfo ? (
                        <div className='support-login-prompt'>
                            <p>Vui lòng <a href='/login'>đăng nhập</a> để liên hệ hỗ trợ</p>
                        </div>
                    ) : activeRequest && (activeRequest.status === 'pending' || activeRequest.status === 'in_progress') ? (
                        <>
                            {/* Chat Messages */}
                            <div className='support-messages'>
                                {activeRequest.messages && activeRequest.messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`support-message ${msg.senderRole === 'customer' ? 'customer' : 'staff'}`}
                                    >
                                        <div className='message-sender'>
                                            <span className='sender-name'>{msg.senderName}</span>
                                            <span className='sender-role'>{msg.senderRole === 'customer' ? '👤' : '👨‍💼'}</span>
                                        </div>
                                        <div className='message-text'>{msg.text}</div>
                                        <div className='message-time'>
                                            {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <form onSubmit={handleSubmit} className='support-form'>
                                <div className='support-input-group'>
                                    <textarea
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        placeholder='Nhập tin nhắn...'
                                        rows='2'
                                        className='support-input'
                                    />
                                    <button
                                        type='submit'
                                        disabled={loading}
                                        className='btn-send-message'
                                        title='Gửi'
                                    >
                                        {loading ? '...' : '➤'}
                                    </button>
                                </div>
                                <button
                                    type='button'
                                    className='btn-close-chat'
                                    onClick={handleCloseRequest}
                                >
                                    Đóng yêu cầu
                                </button>
                            </form>
                        </>
                    ) : (
                        <form onSubmit={handleSubmit} className='support-form'>
                            <textarea
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                placeholder='Mô tả vấn đề của bạn...'
                                rows='4'
                                className='support-textarea'
                            />
                            <button
                                type='submit'
                                disabled={loading}
                                className='btn-send-support'
                            >
                                {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    )
}

export default SupportButton
