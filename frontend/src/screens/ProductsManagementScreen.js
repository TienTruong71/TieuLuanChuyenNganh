import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import '../styles/admin.css'
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listProductsByCategory,
  listAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../actions/adminActions'
import {
  ADMIN_CATEGORY_CREATE_RESET,
  ADMIN_CATEGORY_UPDATE_RESET,
  ADMIN_CATEGORY_DELETE_RESET,
  ADMIN_PRODUCT_CREATE_RESET,
  ADMIN_PRODUCT_UPDATE_RESET,
  ADMIN_PRODUCT_DELETE_RESET,
} from '../constants/adminConstants'

const ProductsManagementScreen = () => {
  const dispatch = useDispatch()

  const [viewMode, setViewMode] = useState('category')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)

  // Category form
  const [categoryName, setCategoryName] = useState('')
  const [categoryDesc, setCategoryDesc] = useState('')
  const [categoryImages, setCategoryImages] = useState([]) // only one file
  const [categoryImagePreviews, setCategoryImagePreviews] = useState([])

  // Product form
  const [productName, setProductName] = useState('')
  const [productDesc, setProductDesc] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [productStock, setProductStock] = useState('')
  const [productType, setProductType] = useState('product')
  const [productImages, setProductImages] = useState([]) // will only contain at most 1 file
  const [imagePreviews, setImagePreviews] = useState([]) // For drag & drop preview (single)

  const categoryList = useSelector((state) => state.adminCategoryList)
  const { loading: loadingCategories, categories, error: errorCategories } = categoryList

  const categoryCreate = useSelector((state) => state.adminCategoryCreate)
  const { loading: loadingCategoryCreate, success: successCategoryCreate } = categoryCreate

  const categoryUpdate = useSelector((state) => state.adminCategoryUpdate)
  const { loading: loadingCategoryUpdate, success: successCategoryUpdate } = categoryUpdate

  const categoryDelete = useSelector((state) => state.adminCategoryDelete)
  const { success: successCategoryDelete } = categoryDelete

  const productList = useSelector((state) => state.adminProductList)
  const { loading: loadingProducts, products, error: errorProducts } = productList

  const productCreate = useSelector((state) => state.adminProductCreate)
  const { loading: loadingProductCreate, success: successProductCreate } = productCreate

  const productUpdate = useSelector((state) => state.adminProductUpdate)
  const { loading: loadingProductUpdate, success: successProductUpdate } = productUpdate

  const productDelete = useSelector((state) => state.adminProductDelete)
  const { success: successProductDelete } = productDelete

  // ✅ Helper: Lấy label và icon cho loại sản phẩm
  const getProductTypeInfo = (type) => {
    const typeMap = {
      vehicle: { label: 'Xe ô tô', icon: '🚗', class: 'vehicle' },
      accessory: { label: 'Phụ kiện', icon: '🔧', class: 'accessory' },
      part: { label: 'Linh kiện', icon: '⚙️', class: 'part' },
      product: { label: 'Sản phẩm khác', icon: '📦', class: 'product' },
    }
    return typeMap[type] || typeMap['product']
  }

  
  const formatPrice = (price) => {
    return parseFloat(price || 0).toLocaleString('vi-VN')
  }

  // ✅ Helper: Lấy class màu cho tồn kho
  const getStockClass = (stock) => {
    if (stock === 0) return 'stock-out'
    if (stock < 5) return 'stock-low'
    if (stock < 20) return 'stock-medium'
    return 'stock-good'
  }

  useEffect(() => {
    dispatch(listCategories())
  }, [dispatch])

  useEffect(() => {
    if (successCategoryCreate) {
      alert('Tạo danh mục thành công!')
      setShowCategoryModal(false)
      setCategoryName('')
      setCategoryDesc('')
      setCategoryImages([])
      setCategoryImagePreviews([])
      setEditingCategory(null)
      dispatch({ type: ADMIN_CATEGORY_CREATE_RESET })
      dispatch(listCategories())
    }
  }, [successCategoryCreate, dispatch])

  useEffect(() => {
    if (successCategoryUpdate) {
      alert('Cập nhật danh mục thành công!')
      setShowCategoryModal(false)
      setCategoryName('')
      setCategoryDesc('')
      setCategoryImages([])
      setCategoryImagePreviews([])
      setEditingCategory(null)
      dispatch({ type: ADMIN_CATEGORY_UPDATE_RESET })
      dispatch(listCategories())
    }
  }, [successCategoryUpdate, dispatch])

  useEffect(() => {
    if (successCategoryDelete) {
      alert('Xóa danh mục thành công!')
      setSelectedCategory('')
      dispatch(listCategories())
    }
  }, [successCategoryDelete, dispatch])

  useEffect(() => {
    if (successProductCreate) {
      alert('Tạo sản phẩm thành công!')
      setShowProductModal(false)
      resetProductForm()
      dispatch({ type: ADMIN_PRODUCT_CREATE_RESET })
      if (selectedCategory) {
        dispatch(listProductsByCategory(selectedCategory))
      } else if (viewMode === 'all') {
        dispatch(listAllProducts())
      }
    }
  }, [successProductCreate, dispatch, selectedCategory, viewMode])
 
  useEffect(() => {
    if (successProductUpdate) {
      alert('Cập nhật sản phẩm thành công!')
      setShowProductModal(false)
      resetProductForm()
      dispatch({ type: ADMIN_PRODUCT_UPDATE_RESET })
      if (selectedCategory) {
        dispatch(listProductsByCategory(selectedCategory))
      } else if (viewMode === 'all') {
        dispatch(listAllProducts())
      }
    }
  }, [successProductUpdate, dispatch, selectedCategory, viewMode])

  useEffect(() => {
    if (successProductDelete) {
      alert('Xóa sản phẩm thành công!')
      if (selectedCategory) {
        dispatch(listProductsByCategory(selectedCategory))
      } else if (viewMode === 'all') {
        dispatch(listAllProducts())
      }
    }
  }, [successProductDelete, dispatch, selectedCategory, viewMode])

  useEffect(() => {
    return () => {
      dispatch({ type: ADMIN_CATEGORY_CREATE_RESET })
      dispatch({ type: ADMIN_CATEGORY_UPDATE_RESET })
      dispatch({ type: ADMIN_CATEGORY_DELETE_RESET })
      dispatch({ type: ADMIN_PRODUCT_CREATE_RESET })
      dispatch({ type: ADMIN_PRODUCT_UPDATE_RESET })
      dispatch({ type: ADMIN_PRODUCT_DELETE_RESET })
    }
  }, [dispatch])

  useEffect(() => {
    if (selectedCategory && viewMode === 'category') {
      dispatch(listProductsByCategory(selectedCategory))
    } else if (viewMode === 'all') {
      dispatch(listAllProducts())
    }
  }, [selectedCategory, viewMode, dispatch])

  const resetProductForm = () => {
    setProductName('')
    setProductDesc('')
    setProductPrice('')
    setProductStock('')
    setProductType('product')
    setProductImages([])
    setImagePreviews([])
    setEditingProduct(null)
  }

  const handleCategorySubmit = (e) => {
    e.preventDefault()
    
    const formData = new FormData()
    formData.append('category_name', categoryName)
    formData.append('description', categoryDesc)
    
    // Append single image if exists
    if (categoryImages.length > 0) {
      formData.append('image', categoryImages[0])
    }

    if (editingCategory) {
      dispatch(updateCategory(editingCategory._id, formData))
    } else {
      dispatch(createCategory(formData))
    }
  }

  const handleEditCategory = (category) => {
    setEditingCategory(category)
    setCategoryName(category.category_name)
    setCategoryDesc(category.description || '')
    setCategoryImages(category.image ? [category.image] : [])
    setCategoryImagePreviews(category.image ? [category.image] : [])
    setShowCategoryModal(true)
  }

  const handleDeleteCategory = (categoryId) => {
    if (window.confirm('Bạn có chắc muốn xóa danh mục này? Danh mục có sản phẩm sẽ không thể xóa.')) {
      dispatch(deleteCategory(categoryId))
    }
  }

  const handleProductSubmit = (e) => {
    e.preventDefault()

    if (!productName || !productPrice || !selectedCategory) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    const formData = new FormData()
    formData.append('category_id', selectedCategory)
    formData.append('product_name', productName)
    formData.append('description', productDesc)
    formData.append('price', productPrice)
    formData.append('stock_quantity', productStock)
    formData.append('type', productType)

    // Append single image if present
    if (productImages.length > 0) {
      formData.append('image', productImages[0])
    }

    if (editingProduct) {
      dispatch(updateProduct(editingProduct._id, formData))
    } else {
      dispatch(createProduct(formData))
    }
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setProductName(product.product_name)
    setProductDesc(product.description || '')
    setProductPrice(product.price)
    setProductStock(product.stock_quantity)
    setProductType(product.type || 'product')
    // product.images now array of strings
    setProductImages(product.images && product.images.length > 0 ? [product.images[0]] : [])
    setImagePreviews(product.images && product.images.length > 0 ? [product.images[0]] : [])
    setShowProductModal(true)
  }

  const handleDeleteProduct = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      dispatch(deleteProduct(id))
    }
  }

  // Handle file selection for category (single image)
  const handleCategoryFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    if (categoryImages.length > 0) {
      alert('Đã có ảnh, hãy xóa trước khi thêm ảnh mới')
      return
    }
    if (files.length > 1) {
      alert('Chỉ được chọn 1 ảnh cho danh mục')
    }
    const file = files[0]
    setCategoryImages([file])
    const reader = new FileReader()
    reader.onload = (e) => setCategoryImagePreviews([e.target.result])
    reader.readAsDataURL(file)
  }

  // Handle drag and drop for category (single image)
  const handleCategoryDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))
    if (files.length === 0) return
    if (categoryImages.length > 0) {
      alert('Đã có ảnh, hãy xóa trước khi thêm ảnh mới')
      return
    }
    if (files.length > 1) {
      alert('Chỉ được thả 1 ảnh cho danh mục')
    }
    const file = files[0]
    setCategoryImages([file])
    const reader = new FileReader()
    reader.onload = (e) => setCategoryImagePreviews([e.target.result])
    reader.readAsDataURL(file)
  }

  const handleCategoryDragOver = (e) => {
    e.preventDefault()
  }

  const removeCategoryImage = () => {
    setCategoryImages([])
    setCategoryImagePreviews([])
  }

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    if (files.length > 1) {
      alert('Chỉ được chọn 1 ảnh duy nhất')
    }
    const file = files[0]
    setProductImages([file])
    // preview
    const reader = new FileReader()
    reader.onload = (e) => setImagePreviews([e.target.result])
    reader.readAsDataURL(file)
  }

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))
    if (files.length === 0) return
    if (files.length > 1) {
      alert('Chỉ được thả 1 ảnh duy nhất')
    }
    const file = files[0]
    setProductImages([file])
    const reader = new FileReader()
    reader.onload = (e) => setImagePreviews([e.target.result])
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  // Remove image
  const removeImage = () => {
    setProductImages([])
    setImagePreviews([])
  }

  return (
    <div className='products-management'>
      <div className='management-header'>
        <h2>Quản lý sản phẩm</h2>
        <button className='btn-add' onClick={() => setShowCategoryModal(true)}>
          + Thêm danh mục
        </button>
      </div>

      {/* Categories Selection */}
      <div className='categories-section'>
        <div className='categories-header'>
          <h3>Chọn danh mục:</h3>
          <div className='view-mode-toggle'>
            <button
              className={`toggle-btn ${viewMode === 'category' ? 'active' : ''}`}
              onClick={() => setViewMode('category')}
            >
              📂 Theo danh mục
            </button>
            <button
              className={`toggle-btn ${viewMode === 'all' ? 'active' : ''}`}
              onClick={() => setViewMode('all')}
            >
              📋 Tất cả
            </button>
          </div>
        </div>
        {loadingCategories ? (
          <div className='loading-spinner'></div>
        ) : errorCategories ? (
          <div className='error-message'>{errorCategories}</div>
        ) : viewMode === 'category' ? (
          <div className='category-pills'>
            {categories && categories.length > 0 ? (
              categories.map((cat) => (
                <div key={cat._id} className='category-pill-container'>
                  <button
                    className={`category-pill ${selectedCategory === cat._id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat._id)}
                  >
                    {cat.image && (
                      <img src={cat.image} alt={cat.category_name} className='category-icon' />
                    )}
                    <span>{cat.category_name}</span>
                  </button>
                  <div className='category-actions'>
                    <button
                      className='btn-category-edit'
                      onClick={() => handleEditCategory(cat)}
                      title='Sửa danh mục'
                    >
                      ✏️
                    </button>
                    <button
                      className='btn-category-delete'
                      onClick={() => handleDeleteCategory(cat._id)}
                      title='Xóa danh mục'
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>Chưa có danh mục nào. Vui lòng tạo danh mục trước.</p>
            )}
          </div>
        ) : null}
      </div>

      {/* Products List */}
      {(selectedCategory || viewMode === 'all') && (
        <div className='products-section'>
          <div className='section-header'>
            <h3>{viewMode === 'all' ? 'Tất cả sản phẩm' : 'Sản phẩm trong danh mục'}</h3>
            <button className='btn-add' onClick={() => setShowProductModal(true)}>
              + Thêm sản phẩm
            </button>
          </div>

          {loadingProducts ? (
            <div className='loading-container'>
              <div className='loading-spinner'></div>
            </div>
          ) : errorProducts ? (
            <div className='error-message'>{errorProducts}</div>
          ) : products && products.length > 0 ? (
            <div className='products-grid'>
              {products.map((product) => {
                const typeInfo = getProductTypeInfo(product.type)
                const stockClass = getStockClass(product.stock_quantity)
                const inventoryClass = getStockClass(product.inventory_quantity || 0)

                return (
                  <div key={product._id} className='product-card-admin'>
                    {product.images && product.images.length > 0 && (() => {
                      const rawImg = product.images[0];
                      let displayImg = rawImg;

                      // Handle Object structure if corrupted
                      if (typeof rawImg === 'object' && rawImg !== null) {
                        if (rawImg.image_url) displayImg = rawImg.image_url;
                        else if (rawImg.url) displayImg = rawImg.url;
                        else {
                          // Try to reconstruct from array-like object
                          const charKeys = Object.keys(rawImg).filter(k => !isNaN(parseInt(k))).sort((a, b) => a - b);
                          displayImg = charKeys.map(k => rawImg[k]).join('');
                        }
                      }

                      // Handle URL prefixes
                      if (typeof displayImg === 'string') {
                        if (displayImg.startsWith('/uploads')) {
                          displayImg = `http://localhost:5000${displayImg}`;
                        }
                      }

                      return (
                        <img
                          src={displayImg}
                          alt={product.product_name}
                          className='product-image'
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                          }}
                        />
                      );
                    })()}
                    <div className='product-info'>
                      <h4>{product.product_name}</h4>
                      {viewMode === 'all' && product.category_id && (
                        <span className='product-category-tag'>
                          📂 {product.category_id.category_name}
                        </span>
                      )}
                      <p className='product-desc'>{product.description}</p>
                      <div className='product-details'>
                        <span className='product-price'>{formatPrice(product.price)}đ</span>

                        {/* ✅ HIỂN THỊ CẢ 2 GIÁ TRỊ TỒN KHO */}
                        <div className='product-stock-info'>
                          <span className={`product-stock ${stockClass}`}>
                            🏪 Hiện Có: {product.stock_quantity}
                          </span>
                          <span className={`product-stock ${inventoryClass}`}>
                            📦 Tổng Kho: {product.inventory_quantity || 0}
                          </span>
                        </div>

                        {/* ✅ Hiển thị loại sản phẩm với icon */}
                        <span className={`product-type ${typeInfo.class}`}>
                          {typeInfo.icon} {typeInfo.label}
                        </span>
                      </div>
                    </div>
                    <div className='product-actions'>
                      <button className='btn-edit' onClick={() => handleEditProduct(product)}>
                        ✏️ Sửa
                      </button>
                      <button
                        className='btn-delete'
                        onClick={() => handleDeleteProduct(product._id)}
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className='empty-state'>
              <p>Chưa có sản phẩm nào trong danh mục này</p>
            </div>
          )}
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className='modal-overlay' onClick={() => setShowCategoryModal(false)}>
          <div className='modal-content' onClick={(e) => e.stopPropagation()}>
            <h3>{editingCategory ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</h3>
            <form onSubmit={handleCategorySubmit}>
              <div className='form-group'>
                <label>Tên danh mục: *</label>
                <input
                  type='text'
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                />
              </div>
              <div className='form-group'>
                <label>Hình ảnh danh mục:</label>
                <div
                  className='image-upload-area'
                  onDrop={handleCategoryDrop}
                  onDragOver={handleCategoryDragOver}
                >
                  <div className='upload-placeholder'>
                    <div className='upload-icon'>📁</div>
                    <p>Kéo thả 1 ảnh vào đây hoặc nhấn để chọn</p>
                    <input
                      type='file'
                      accept='image/*'
                      onChange={handleCategoryFileSelect}
                      style={{ display: 'none' }}
                      id='category-image-upload'
                    />
                    <label htmlFor='category-image-upload' className='upload-btn'>
                      Chọn từ máy tính
                    </label>
                  </div>
                </div>
                {categoryImagePreviews.length > 0 && (
                  <div className='image-previews' onDrop={handleCategoryDrop} onDragOver={handleCategoryDragOver}>
                    {categoryImagePreviews.map((preview, index) => (
                      <div key={index} className='image-preview-item'>
                        <img src={preview} alt={`Preview ${index + 1}`} />
                        <button
                          type='button'
                          className='remove-image-btn'
                          onClick={() => removeCategoryImage(index)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className='form-group'>
                <label>Mô tả:</label>
                <textarea
                  value={categoryDesc}
                  onChange={(e) => setCategoryDesc(e.target.value)}
                  rows='3'
                />
              </div>
              <div className='modal-buttons'>
                <button
                  type='submit'
                  className='btn-confirm'
                  disabled={loadingCategoryCreate || loadingCategoryUpdate}
                >
                  {loadingCategoryCreate || loadingCategoryUpdate
                    ? 'Đang xử lý...'
                    : editingCategory
                      ? 'Cập nhật'
                      : 'Tạo danh mục'}
                </button>
                <button
                  type='button'
                  className='btn-cancel'
                  onClick={() => {
                    setShowCategoryModal(false)
                    setCategoryName('')
                    setCategoryDesc('')
                    setCategoryImages([])
                    setCategoryImagePreviews([])
                    setEditingCategory(null)
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className='modal-overlay' onClick={() => setShowProductModal(false)}>
          <div className='modal-content modal-large' onClick={(e) => e.stopPropagation()}>
            <h3>{editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</h3>
            <form onSubmit={handleProductSubmit}>
              <div className='form-grid'>
                <div className='form-group'>
                  <label>Tên sản phẩm: *</label>
                  <input
                    type='text'
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                  />
                </div>
                <div className='form-group'>
                  <label>Giá (VNĐ): *</label>
                  <input
                    type='number'
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    required
                    min='0'
                  />
                </div>
                <div className='form-group'>
                  <label>Hiện có: *</label>
                  <input
                    type='number'
                    value={productStock}
                    onChange={(e) => setProductStock(e.target.value)}
                    required
                    min='0'
                  />
                </div>
                <div className='form-group'>
                  <label>Loại sản phẩm: *</label>
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className='product-type-select'
                  >
                    <option value='vehicle'>Xe ô tô</option>
                    <option value='accessory'>Phụ kiện</option>
                    <option value='part'>Linh kiện</option>
                    <option value='product'>Sản phẩm khác</option>
                  </select>
                  <small className='form-hint'>
                    {productType === 'vehicle' && '💡 Xe ô tô: Khách hàng sẽ đặt cọc 20% khi mua'}
                    {productType === 'accessory' && '💡 Phụ kiện: Thanh toán đầy đủ (COD hoặc VNPay)'}
                    {productType === 'part' && '💡 Linh kiện: Thanh toán đầy đủ (COD hoặc VNPay)'}
                    {productType === 'product' && '💡 Sản phẩm khác: Thanh toán đầy đủ (COD hoặc VNPay)'}
                  </small>
                </div>
              </div>
              <div className='form-group'>
                <label>Mô tả:</label>
                <textarea
                  value={productDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
                  rows='3'
                  placeholder='Nhập mô tả chi tiết sản phẩm...'
                />
              </div>
              <div className='form-group'>
                <label>Hình ảnh sản phẩm:</label>
                <div
                  className='image-upload-area'
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <div className='upload-placeholder'>
                    <div className='upload-icon'>📸</div>
                    <p>Kéo thả 1 ảnh vào đây hoặc nhấn để chọn</p>
                    <input
                      type='file'
                      accept='image/*'
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                      id='image-upload'
                    />
                    <label htmlFor='image-upload' className='upload-btn'>
                      Chọn từ máy tính
                    </label>
                  </div>
                </div>
                {imagePreviews.length > 0 && (
                  <div className='image-previews'>
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className='image-preview-item'>
                        <img src={preview} alt={`Preview ${index + 1}`} />
                        <button
                          type='button'
                          className='remove-image-btn'
                          onClick={removeImage}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className='modal-buttons'>
                <button
                  type='submit'
                  className='btn-confirm'
                  disabled={loadingProductCreate || loadingProductUpdate}
                >
                  {loadingProductCreate || loadingProductUpdate
                    ? 'Đang xử lý...'
                    : editingProduct
                      ? 'Cập nhật'
                      : 'Tạo sản phẩm'}
                </button>
                <button
                  type='button'
                  className='btn-cancel'
                  onClick={() => {
                    setShowProductModal(false)
                    resetProductForm()
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

export default ProductsManagementScreen