import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getFeedbacks } from '../actions/feedbackActions'
import '../styles/feedback.css'

const FeedbackList = ({ productId, serviceId, onAverageRatingChange }) => {
    const dispatch = useDispatch()
    const feedback = useSelector((state) => state.feedback)
    const { feedbacks, loading, error, pagination } = feedback
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        dispatch(getFeedbacks(currentPage, 5, productId, serviceId))
    }, [dispatch, currentPage, productId, serviceId])

    useEffect(() => {
        if (feedbacks && feedbacks.length > 0) {
            const averageRating = parseFloat(
                (feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length).toFixed(1)
            )
            
            if (onAverageRatingChange) {
                onAverageRatingChange(averageRating, feedbacks.length)
            }
        } else if (onAverageRatingChange) {
            onAverageRatingChange(0, 0)
        }
    }, [feedbacks, onAverageRatingChange])

    if (loading) {
        return <div className='feedback-loading'>Đang tải đánh giá...</div>
    }

    return (
        <div className='feedback-list-container'>
            <h3>Đánh giá từ khách hàng</h3>
            
            {error && <div className='feedback-error'>{error}</div>}
            
            {feedbacks && feedbacks.length > 0 ? (
                <>
                    <div className='feedbacks-list'>
                        {feedbacks.map((fb) => (
                            <div key={fb._id} className='feedback-item'>
                                <div className='feedback-header'>
                                    <div className='feedback-user'>
                                        <span className='user-name'>
                                            {fb.user_id?.full_name || 'Khách hàng ẩn danh'}
                                        </span>
                                        <span className='feedback-date'>
                                            {new Date(fb.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                    <div className='feedback-rating'>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span
                                                key={star}
                                                className={`star ${
                                                    star <= fb.rating ? 'filled' : ''
                                                }`}
                                            >
                                                ★
                                            </span>
                                        ))}
                                        <span className='rating-value'>({fb.rating}/5)</span>
                                    </div>
                                </div>

                                {fb.comment && (
                                    <div className='feedback-comment'>{fb.comment}</div>
                                )}
                            </div>
                        ))}
                    </div>

                    {pagination && pagination.pages > 1 && (
                        <div className='feedback-pagination'>
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                            >
                                ← Trước
                            </button>
                            <span>
                                Trang {currentPage} / {pagination.pages}
                            </span>
                            <button
                                onClick={() =>
                                    setCurrentPage(
                                        Math.min(pagination.pages, currentPage + 1)
                                    )
                                }
                                disabled={currentPage === pagination.pages}
                            >
                                Sau →
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className='feedback-empty'>Chưa có đánh giá nào cho sản phẩm này</div>
            )}
        </div>
    )
}

export default FeedbackList
