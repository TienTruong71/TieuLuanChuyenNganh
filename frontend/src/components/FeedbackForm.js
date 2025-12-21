import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createFeedback } from '../actions/feedbackActions'
import '../styles/feedback.css'

const FeedbackForm = ({ productId, serviceId, onSuccess }) => {
    const dispatch = useDispatch()
    const userLogin = useSelector((state) => state.userLogin)
    const { userInfo } = userLogin
    const feedback = useSelector((state) => state.feedback)
    const { loading, error, message } = feedback

    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [hoverRating, setHoverRating] = useState(0)

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!userInfo) {
            alert('Vui lòng đăng nhập để gửi đánh giá')
            return
        }

        try {
            await dispatch(createFeedback({
                product_id: productId,
                service_id: serviceId,
                rating,
                comment,
            }))
            
            setRating(5)
            setComment('')
            
            if (onSuccess) {
                onSuccess()
            }
        } catch (err) {
            console.error('Lỗi gửi đánh giá:', err)
        }
    }

    return (
        <div className='feedback-form-container'>
            <h3>Gửi đánh giá của bạn</h3>
            
            {error && <div className='feedback-error'>{error}</div>}
            {message && <div className='feedback-success'>{message}</div>}
            
            {userInfo ? (
                <form onSubmit={handleSubmit} className='feedback-form'>
                    <div className='form-group'>
                        <label>Đánh giá:</label>
                        <div className='rating-input'>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={`star-button ${
                                        (hoverRating || rating) >= star ? 'active' : ''
                                    }`}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                        <span className='rating-display'>{rating} / 5 sao</span>
                    </div>

                    <div className='form-group'>
                        <label htmlFor='comment'>Bình luận:</label>
                        <textarea
                            id='comment'
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder='Chia sẻ trải nghiệm của bạn về sản phẩm này...'
                            rows='4'
                        />
                    </div>

                    <button
                        type='submit'
                        disabled={loading}
                        className='btn-feedback-submit'
                    >
                        {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                </form>
            ) : (
                <div className='feedback-login-prompt'>
                    Vui lòng <a href='/login'>đăng nhập</a> để gửi đánh giá
                </div>
            )}
        </div>
    )
}

export default FeedbackForm
