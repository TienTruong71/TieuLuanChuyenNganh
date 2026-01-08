import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useHistory } from 'react-router-dom'
import { getProductDetails } from '../actions/productActions'
import { addToCart } from '../actions/cartActions'
import FeedbackForm from '../components/FeedbackForm'
import FeedbackList from '../components/FeedbackList'
import '../styles/productDetail.css'
import '../styles/feedback.css'

const ProductDetailScreen = () => {
  const { id } = useParams()
  const history = useHistory()
  const dispatch = useDispatch()
  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [averageRating, setAverageRating] = useState(5)
  const [feedbackCount, setFeedbackCount] = useState(0)
  const [refreshFeedback, setRefreshFeedback] = useState(false)

  const productDetails = useSelector((state) => state.productDetails)
  const { loading, error, product } = productDetails

  useEffect(() => {
    dispatch(getProductDetails(id))
  }, [dispatch, id])

  const convertBrokenObjectToString = (obj) => {
    if (typeof obj !== 'object' || obj === null) return null

    if (!obj.hasOwnProperty('0') || !obj.hasOwnProperty('1')) return null

    const charKeys = Object.keys(obj)
      .filter(key => !isNaN(parseInt(key)))
      .sort((a, b) => parseInt(a) - parseInt(b))

    const reconstructedUrl = charKeys.map(key => obj[key]).join('')

    if (reconstructedUrl.startsWith('http')) {
      return reconstructedUrl
    }

    return null
  }

  const getProductImages = () => {
    if (!product) return []

    const images = []

    if (Array.isArray(product.images) && product.images.length > 0) {
      product.images.forEach((img) => {
        let url = null

        if (typeof img === 'string' && img.trim()) {
          url = img
        }
        else if (typeof img === 'object' && img !== null) {
          if (img.image_url) {
            url = img.image_url
          } else if (img.url) {
            url = img.url
          } else {
            url = convertBrokenObjectToString(img)
          }
        }

        if (url) {
          images.push(url)
        }
      })
    }

    if (images.length === 0 && product.image) {
      if (typeof product.image === 'string') {
        images.push(product.image)
      } else if (typeof product.image === 'object') {
        const reconstructed = convertBrokenObjectToString(product.image)
        if (reconstructed) {
          images.push(reconstructed)
        }
      }
    }

    return images
  }

  const images = getProductImages()

  // ✅ Kiểm tra xem sản phẩm có phải xe không
  const isVehicle = product?.type === 'vehicle'

  // Xử lý đặt lịch trải nghiệm (chỉ cho xe)
  const bookTestDriveHandler = () => {
    if (!userInfo) {
      alert('Vui lòng đăng nhập để đặt lịch trải nghiệm')
      history.push('/login')
      return
    }

    // Chuyển đến trang booking với type=vehicle
    history.push(`/booking/${id}?type=vehicle`)
  }

  // Xử lý thêm vào giỏ hàng (chỉ cho phụ kiện/linh kiện)
  const addToCartHandler = async () => {
    if (!userInfo) {
      alert('Vui lòng đăng nhập để thêm vào giỏ hàng')
      history.push('/login')
      return
    }

    try {
      await dispatch(addToCart(id, quantity))
      alert('Đã thêm vào giỏ hàng!')
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể thêm vào giỏ hàng')
    }
  }

  // Xử lý mua ngay (chỉ cho phụ kiện/linh kiện)
  const buyNowHandler = () => {
    if (!userInfo) {
      alert('Vui lòng đăng nhập để mua hàng')
      history.push('/login')
      return
    }

    const directBuyItem = {
      product_id: product._id,
      product_name: product.product_name || product.title,
      price: productPrice,
      quantity: quantity,
      type: product.type || 'product',
      category: categoryName,
      images: product.images, // Pass images for display in checkout
      image: product.image,
    }

    history.push({
      pathname: '/checkout',
      state: { directBuyItem }
    })
  }

  // Get product data
  const productName = product?.product_name || product?.title || 'Đang tải...'
  const productPrice = typeof product?.price === 'object'
    ? product?.price?.value || product?.price?.$numberDecimal || 0
    : product?.price || 0

  const categoryName = product?.category_id?.category_name ||
    product?.category_id?.name ||
    product?.category_id?.title ||
    'Chưa phân loại'

  const brand = product?.brand || ''
  const description = product?.description || 'Chưa có mô tả'
  const stock = product?.stock_quantity || 0
  const inStock = stock > 0

  const mainImage = images[selectedImage] || images[0] || null

  return (
    <main className='page-main'>
      <div className='product-detail-container'>
        {/* Breadcrumb */}
        <div className='breadcrumb'>
          <button onClick={() => history.push('/')} className='breadcrumb-link'>Trang chủ</button>
          <span> / </span>
          <button onClick={() => history.push('/product')} className='breadcrumb-link'>Sản phẩm</button>
          <span> / </span>
          <span className='current'>{categoryName}</span>
        </div>

        {loading ? (
          <div className='loading-container'>
            <div className='loading-spinner'></div>
            <p>Đang tải thông tin sản phẩm...</p>
          </div>
        ) : error ? (
          <div className='error-container'>
            <div className='error-icon'>
              <span role='img' aria-label='warning'>⚠️</span>
            </div>
            <h2>Không thể tải sản phẩm</h2>
            <p>{error}</p>
            <button onClick={() => history.push('/product')} className='btn-back'>
              Quay lại danh sách sản phẩm
            </button>
          </div>
        ) : (
          <div className='product-detail-content'>
            {/* Left: Images Gallery */}
            <div className='product-images'>
              <div className='main-image'>
                {mainImage ? (
                  <>
                    <img
                      src={mainImage}
                      alt={productName}
                      onError={(e) => {
                        e.target.style.display = 'none'
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                    <div style={{
                      display: 'none',
                      width: '100%',
                      height: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f0f0f0',
                      fontSize: '120px'
                    }}>
                      <span role='img' aria-label='product'>🚗</span>
                    </div>

                    {images.length > 1 && (
                      <>
                        <button
                          className='gallery-nav prev'
                          onClick={() => setSelectedImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1)}
                        >
                          ‹
                        </button>
                        <button
                          className='gallery-nav next'
                          onClick={() => setSelectedImage(selectedImage === images.length - 1 ? 0 : selectedImage + 1)}
                        >
                          ›
                        </button>

                        <div className='image-counter'>
                          {selectedImage + 1} / {images.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f0f0f0',
                    fontSize: '120px'
                  }}>
                    <span role='img' aria-label='product'>🚗</span>
                  </div>
                )}

                {!inStock && (
                  <div className='out-of-stock-badge'>Hết hàng</div>
                )}
              </div>

              {images.length > 1 && (
                <div className='thumbnail-images'>
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img
                        src={img}
                        alt={`${productName} ${index + 1}`}
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.parentElement.classList.add('fallback')
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info */}
            <div className='product-info'>
              <div className='product-meta'>
                <span className='category-badge'>{categoryName}</span>
                {brand && <span className='brand-badge'>{brand}</span>}
                {/* {isVehicle && <span className='vehicle-badge'>🚗 Xe ô tô</span>} */}
              </div>

              <h1 className='product-name'>{productName}</h1>

              <div className='product-rating'>
                <div className='stars'>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`star ${star <= Math.round(averageRating) ? 'filled' : ''}`}>★</span>
                  ))}
                </div>
                <span className='rating-text'>({averageRating.toFixed(1)} sao - {feedbackCount} đánh giá)</span>
              </div>

              <div className='product-price'>
                <span className='current-price'>
                  {productPrice.toLocaleString('vi-VN')} ₫
                </span>
              </div>

              {isVehicle && (
                <div className='vehicle-notice'>
                  <div className='notice-icon'></div>
                  <div className='notice-content'>
                    <h4>Đặt lịch trải nghiệm lái thử</h4>
                    <p>Vui lòng đặt lịch để trải nghiệm và tư vấn mua xe.</p>
                  </div>
                </div>
              )}

              <div className='stock-status'>
                <span className={`status ${inStock ? 'in-stock' : 'out-of-stock'}`}>
                  {inStock ? `✓ Còn hàng (${stock} sản phẩm)` : '✗ Hết hàng'}
                </span>
              </div>

              {!isVehicle && inStock && (
                <div className='quantity-section'>
                  <label>Số lượng:</label>
                  <div className='quantity-control'>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <input
                      type='number'
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1
                        setQuantity(Math.min(Math.max(1, val), stock))
                      }}
                      min='1'
                      max={stock}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                      disabled={quantity >= stock}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className='action-buttons'>
                {isVehicle ? (
                  inStock ? (
                    <button className='btn-book-testdrive' onClick={bookTestDriveHandler}>
                      <span className='icon' role='img' aria-label='calendar'></span>
                      Đặt lịch trải nghiệm
                    </button>
                  ) : (
                    <button className='btn-notify' disabled>
                      Thông báo khi có xe
                    </button>
                  )
                ) : (
                  // Nút thêm giỏ hàng cho phụ kiện/linh kiện
                  inStock ? (
                    <>
                      <button className='btn-add-cart' onClick={addToCartHandler}>
                        {/* <span className='icon' role='img' aria-label='cart'>🛒</span> */}
                        Thêm vào giỏ hàng
                      </button>
                      <button className='btn-buy-now' onClick={buyNowHandler}>
                        Mua ngay
                      </button>
                    </>
                  ) : (
                    <button className='btn-notify' disabled>
                      Thông báo khi có hàng
                    </button>
                  )
                )}
              </div>

              {/* Product Features */}
              <div className='product-features'>
                {isVehicle ? (
                  // Features cho xe
                  <>
                    <div className='feature-item'>
                      <span className='icon' role='img' aria-label='testdrive'>🚗</span>
                      <div>
                        <strong>Lái thử miễn phí</strong>
                        <p>Trải nghiệm trước khi quyết định</p>
                      </div>
                    </div>
                    <div className='feature-item'>
                      <span className='icon' role='img' aria-label='consultant'>👨‍💼</span>
                      <div>
                        <strong>Tư vấn chuyên nghiệp</strong>
                        <p>Đội ngũ chuyên viên giàu kinh nghiệm</p>
                      </div>
                    </div>
                    <div className='feature-item'>
                      <span className='icon' role='img' aria-label='warranty'>✓</span>
                      <div>
                        <strong>Bảo hành chính hãng</strong>
                        <p>Cam kết từ nhà sản xuất</p>
                      </div>
                    </div>
                  </>
                ) : (
                  // Features cho phụ kiện
                  <>
                    <div className='feature-item'>
                      <span className='icon' role='img' aria-label='shipping'>🚚</span>
                      <div>
                        <strong>Miễn phí vận chuyển</strong>
                        <p>Cho đơn hàng từ 500.000₫</p>
                      </div>
                    </div>
                    <div className='feature-item'>
                      <span className='icon' role='img' aria-label='return'>↩️</span>
                      <div>
                        <strong>Đổi trả dễ dàng</strong>
                        <p>Trong vòng 7 ngày</p>
                      </div>
                    </div>
                    <div className='feature-item'>
                      <span className='icon' role='img' aria-label='warranty'>✓</span>
                      <div>
                        <strong>Bảo hành chính hãng</strong>
                        <p>Theo nhà sản xuất</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Product Description */}
        {!loading && !error && (
          <div className='product-description-section'>
            <h2>Mô tả sản phẩm</h2>
            <div className='description-content'>
              {description ? (
                <p>{description}</p>
              ) : (
                <p className='no-description'>Chưa có mô tả chi tiết cho sản phẩm này.</p>
              )}
            </div>

            {product?.specifications && (
              <div className='specifications'>
                <h3>Thông số kỹ thuật</h3>
                <table className='spec-table'>
                  <tbody>
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <tr key={key}>
                        <td className='spec-label'>{key}</td>
                        <td className='spec-value'>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Feedback Section */}
            {product && (
              <>
                <div className='feedback-section-divider'></div>
                <FeedbackList
                  productId={product._id}
                  onAverageRatingChange={(avg, count) => {
                    setAverageRating(avg || 5)
                    setFeedbackCount(count || 0)
                  }}
                />
                <FeedbackForm
                  productId={product._id}
                  onSuccess={() => {
                    setRefreshFeedback(!refreshFeedback)
                  }}
                />
              </>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

export default ProductDetailScreen