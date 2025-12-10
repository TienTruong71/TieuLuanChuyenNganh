import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useHistory } from 'react-router-dom'
import { getProductDetails } from '../actions/productActions'
import { addToCart } from '../actions/cartActions'

const ProductDetailScreen = () => {
  const { id } = useParams()
  const history = useHistory()
  const dispatch = useDispatch()
  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const productDetails = useSelector((state) => state.productDetails)
  const { loading, error, product } = productDetails

  useEffect(() => {
    dispatch(getProductDetails(id))
  }, [dispatch, id])

  const convertBrokenObjectToString = (obj) => {
    if (typeof obj !== 'object' || obj === null) return null
    
    // Kiểm tra xem có phải object chứa từng ký tự không
    if (!obj.hasOwnProperty('0') || !obj.hasOwnProperty('1')) return null
    
    // Lọc bỏ các key không phải số (như 'is_primary')
    const charKeys = Object.keys(obj)
      .filter(key => !isNaN(parseInt(key)))
      .sort((a, b) => parseInt(a) - parseInt(b))
    
    // Ghép lại thành string
    const reconstructedUrl = charKeys.map(key => obj[key]).join('')
    
    if (reconstructedUrl.startsWith('http')) {
      return reconstructedUrl
    }
    
    return null
  }

  const getProductImages = () => {
    if (!product) return []

    const images = []

    // Check images array
    if (Array.isArray(product.images) && product.images.length > 0) {
      product.images.forEach((img) => {
        let url = null

        // Case 1: String bình thường
        if (typeof img === 'string' && img.trim()) {
          url = img
        }
        // Case 2: Object
        else if (typeof img === 'object' && img !== null) {
          // Có image_url hoặc url
          if (img.image_url) {
            url = img.image_url
          } else if (img.url) {
            url = img.url
          } else {
            // 🔥 FIX: Data bị lưu sai dạng {0: 'h', 1: 't', ...}
            url = convertBrokenObjectToString(img)
          }
        }

        // Thêm vào array nếu có URL hợp lệ
        if (url) {
          images.push(url)
        }
      })
    }

    // Fallback: single image field
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

    console.log('🎯 All images:', images)
    return images
  }

  const images = getProductImages()

  // Xử lý thêm vào giỏ hàng
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

  // Xử lý mua ngay
  const buyNowHandler = async () => {
    if (!userInfo) {
      alert('Vui lòng đăng nhập để mua hàng')
      history.push('/login')
      return
    }

    try {
      await dispatch(addToCart(id, quantity))
      history.push('/cart')
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể mua hàng')
    }
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
  
  const brand = product?.brand || 'Chưa rõ'
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
              {/* Main Image */}
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

                    {/* Navigation Arrows - Only if multiple images */}
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

                        {/* Image Counter */}
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

              {/* Thumbnail Images - Only if multiple images */}
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
              {/* Category & Brand */}
              <div className='product-meta'>
                <span className='category-badge'>{categoryName}</span>
                {brand && <span className='brand-badge'>{brand}</span>}
              </div>

              {/* Product Name */}
              <h1 className='product-name'>{productName}</h1>

              {/* Rating */}
              <div className='product-rating'>
                <div className='stars'>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className='star'>★</span>
                  ))}
                </div>
                <span className='rating-text'>(0 đánh giá)</span>
              </div>

              {/* Price */}
              <div className='product-price'>
                <span className='current-price'>
                  {productPrice.toLocaleString('vi-VN')} ₫
                </span>
              </div>

              {/* Stock Status */}
              <div className='stock-status'>
                <span className={`status ${inStock ? 'in-stock' : 'out-of-stock'}`}>
                  {inStock ? `✓ Còn hàng (${stock} sản phẩm)` : '✗ Hết hàng'}
                </span>
              </div>

              {/* Quantity Selector */}
              {inStock && (
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

              {/* Action Buttons */}
              <div className='action-buttons'>
                {inStock ? (
                  <>
                    <button className='btn-add-cart' onClick={addToCartHandler}>
                      <span className='icon' role='img' aria-label='cart'>🛒</span>
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
                )}
              </div>

              {/* Product Features */}
              <div className='product-features'>
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

            {/* Specifications */}
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
          </div>
        )}
      </div>
    </main>
  )
}

export default ProductDetailScreen