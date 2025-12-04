import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { listProducts } from '../actions/productActions'
import axios from 'axios'

const ProductScreen = () => {
  const history = useHistory()
  const dispatch = useDispatch()

  const [categories, setCategories] = useState([])
  const [loadingCat, setLoadingCat] = useState(false)
  const [errorCat, setErrorCat] = useState(null)

  const [currentCategory, setCurrentCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredProducts, setFilteredProducts] = useState([])

  const productList = useSelector((state) => state.productList)
  const { loading, error, products: rawProducts } = productList

  const products = Array.isArray(rawProducts) 
    ? rawProducts 
    : rawProducts?.products || rawProducts?.data || []

  // Lấy danh mục từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCat(true)
        const { data } = await axios.get('/api/client/categories')
        setCategories(data)
      } catch (err) {
        setErrorCat(err.response?.data?.message || err.message)
      } finally {
        setLoadingCat(false)
      }
    }
    fetchCategories()
  }, [])

  // Lấy danh sách sản phẩm từ Redux
  useEffect(() => {
    dispatch(listProducts())
  }, [dispatch])

  // Lọc sản phẩm
  useEffect(() => {
    if (!products) {
      setFilteredProducts([])
      return
    }

    let filtered = [...products]

    // Lọc theo category
    if (currentCategory !== 'all') {
      filtered = filtered.filter(
        (p) =>
          p.category_id?._id?.toString() === currentCategory.toString() ||
          p.category_id?.toString() === currentCategory.toString()
      )
    }

    // Lọc theo search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.product_name?.toLowerCase().includes(query) ||
          p.title?.toLowerCase().includes(query) ||
          p.brand?.toLowerCase().includes(query)
      )
    }

    setFilteredProducts(filtered)
  }, [JSON.stringify(products), currentCategory, searchQuery])

  const handleSearch = (e) => {
    e.preventDefault()
  }

  const handleCategoryClick = (catId) => {
    setCurrentCategory(catId)
    setSearchQuery('')
  }

  const handleProductClick = (productId) => {
    console.log('🎯 handleProductClick called')
    console.log('🎯 productId:', productId)
    console.log('🎯 typeof productId:', typeof productId)
    
    if (!productId) {
      console.error('❌ Product ID is null/undefined!')
      return
    }
    
    console.log('🎯 Navigating to:', `/product/${productId}`)
    history.push(`/product/${productId}`)
  }

  const getCategoryName = () => {
    if (searchQuery) return `Kết quả tìm kiếm: "${searchQuery}"`
    if (currentCategory === 'all') return 'Tất cả sản phẩm'

    const foundCat = categories.find((c) => c._id === currentCategory)
    return foundCat?.category_name || foundCat?.name || foundCat?.title || 'Danh mục'
  }

  // ✅ Helper: Get first image from product (handle multiple formats)
  const getProductImage = (product) => {
    // Check images array
    if (Array.isArray(product.images) && product.images.length > 0) {
      const img = product.images[0]
      
      // Format 1: {image_url: "...", is_primary: true}
      if (typeof img === 'object' && img !== null) {
        return img.image_url || img.url || null
      }
      
      // Format 2: "https://..."
      if (typeof img === 'string') {
        return img
      }
    }
    
    // Fallback: single image field
    return product.image || null
  }

  return (
    <main className='page-main'>
      <section className='hero'>
        <form className='search-bar' onSubmit={handleSearch}>
          <input
            type='text'
            placeholder='Tìm theo tên, hãng, model...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type='submit'>Tìm kiếm</button>
        </form>
      </section>

      <div className='layout'>
        {/* ==== DANH MỤC ==== */}
        <aside className='left'>
          <div className='label-box'>
            <div className='label-title'>Danh mục</div>

            {loadingCat ? (
              <div className='loading'>Đang tải danh mục...</div>
            ) : errorCat ? (
              <div className='error'>{errorCat}</div>
            ) : (
              <div className='categories-list'>
                {/* Tất cả */}
                <div
                  key='all'
                  className={`category-card ${currentCategory === 'all' ? 'active' : ''}`}
                  onClick={() => handleCategoryClick('all')}
                >
                  <div style={{
                    fontSize: '48px',
                    marginBottom: '8px'
                  }}>
                    
                  </div>
                  <div style={{
                    fontWeight: '700',
                    color: currentCategory === 'all' ? '#00bfff' : '#f0f0f0',
                    fontFamily: '"Poppins", sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Tất cả SẢN PHẨM
                  </div>
                </div>

                {/* Danh mục động */}
                {categories.map((category) => {
                  const catName =
                    category?.category_name?.trim() ||
                    category?.name?.trim() ||
                    category?.title?.trim() ||
                    'Không rõ danh mục'

                  const catImage =
                    category?.image?.startsWith('http')
                      ? category.image
                      : category?.image
                      ? `http://localhost:5000${category.image}`
                      : null

                  return (
                    <div
                      key={category._id}
                      className={`category-card ${
                        currentCategory === category._id ? 'active' : ''
                      }`}
                      onClick={() => handleCategoryClick(category._id)}
                    >
                      {catImage ? (
                        <img
                          src={catImage}
                          alt={catName}
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'block'
                          }}
                        />
                      ) : null}
                      <div style={{
                        fontSize: '48px',
                        display: catImage ? 'none' : 'block'
                      }}>
                        🏍️
                      </div>
                      <div>{catName}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </aside>

        {/* ==== SẢN PHẨM ==== */}
        <section className='right'>
          <div className='product-section'>
            <h3>{getCategoryName()}</h3>

            <div className='product-list'>
              {loading ? (
                <div className='loading'>Đang tải sản phẩm...</div>
              ) : error ? (
                <div className='error'>{error}</div>
              ) : filteredProducts.length === 0 ? (
                <div className='empty'>
                  {products.length === 0 
                    ? 'Chưa có sản phẩm nào' 
                    : 'Không tìm thấy sản phẩm nào'}
                </div>
              ) : (
                filteredProducts.map((product) => {
                  console.log('🔍 Product:', product.product_name, 'ID:', product._id)
                  const title =
                    product.product_name || product.title || 'Không có tên'

                  const categoryName =
                    product.category_id?.category_name ||
                    product.category_id?.name ||
                    product.category_id?.title ||
                    'Không rõ hãng'

                  const price =
                    typeof product.price === 'object'
                      ? product.price?.value ||
                        product.price?.$numberDecimal ||
                        0
                      : product.price || 0

                  // ✅ Use helper function
                  const rawImage = getProductImage(product)

                  const imageUrl = rawImage?.startsWith('http')
                    ? rawImage
                    : rawImage
                    ? `http://localhost:5000${rawImage}`
                    : null

                  return (
                    <div 
                      key={product._id} 
                      className='product-card'
                      onClick={() => {
                        console.log('🔍 Click product:', product)
                        console.log('🔍 Product ID:', product._id)
                        handleProductClick(product._id)
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={title}
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div style={{
                        display: imageUrl ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '200px',
                        background: '#f0f0f0',
                        fontSize: '48px'
                      }}>
                        🏍️
                      </div>
                      <div className='title'>{title}</div>
                      <div className='meta'>{categoryName}</div>
                      <div className='price'>
                        {price.toLocaleString('vi-VN')} ₫
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default ProductScreen