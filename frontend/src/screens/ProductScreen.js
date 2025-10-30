import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { listProducts } from '../actions/productActions'
import axios from 'axios'

const HomeScreen = () => {
  const dispatch = useDispatch()

  const [categories, setCategories] = useState([])
  const [loadingCat, setLoadingCat] = useState(false)
  const [errorCat, setErrorCat] = useState(null)

  const [currentCategory, setCurrentCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredProducts, setFilteredProducts] = useState([])

  const productList = useSelector((state) => state.productList)
  const { loading, error, products = [] } = productList

  // Lấy danh mục từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCat(true)
        const { data } = await axios.get('/api/admin/categories')
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

  // Tự động lọc sản phẩm khi dữ liệu thay đổi
  useEffect(() => {
    filterProducts()
  }, [products, currentCategory, searchQuery])

  // Debug kiểm tra dữ liệu sản phẩm
  useEffect(() => {
    if (products?.length) {
      console.log('Example product:', products[0])
    }
  }, [products])

  //  Hàm lọc sản phẩm
  const filterProducts = () => {
    let filtered = [...products]

    if (currentCategory !== 'all') {
      filtered = filtered.filter((p) => p.category_id === currentCategory)
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (p) =>
          p.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredProducts(filtered)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    filterProducts()
  }

  const handleCategoryClick = (catId) => {
    setCurrentCategory(catId)
    setSearchQuery('')
  }

  // Hiển thị tên danh mục hiện tại
  const getCategoryName = () => {
    if (searchQuery) return `Kết quả tìm kiếm: "${searchQuery}"`
    if (currentCategory === 'all') return 'Tất cả sản phẩm'

    const foundCat = categories.find((c) => c._id === currentCategory)
    return foundCat?.category_name || foundCat?.name || foundCat?.title || 'Danh mục'
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
                  <img
                    src='https://via.placeholder.com/64?text=All'
                    alt='Tất cả'
                    onError={(e) => (e.target.src = 'https://via.placeholder.com/64?text=All')}
                  />
                  <div style={{
                    fontWeight: '700',
                    color: currentCategory === 'all' ? '#00bfff' : '#f0f0f0',
                    fontFamily: '"Poppins", sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Tất cả
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
                      : 'https://via.placeholder.com/64?text=No+Image'

                  return (
                    <div
                      key={category._id}
                      className={`category-card ${
                        currentCategory === category._id ? 'active' : ''
                      }`}
                      onClick={() => handleCategoryClick(category._id)}
                    >
                      <img
                        src={catImage}
                        alt={catName}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/64?text=No+Image'
                        }}
                      />
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
                <div className='empty'>Không tìm thấy sản phẩm nào</div>
              ) : (
                filteredProducts.map((product) => {
          
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

                  const rawImage =
                    Array.isArray(product.images) && product.images.length > 0
                      ? product.images.find((img) => img.is_primary)?.image_url ||
                        product.images[0].image_url
                      : product.image || ''

                  const imageUrl = rawImage?.startsWith('http')
                    ? rawImage
                    : rawImage
                    ? `http://localhost:5000${rawImage}`
                    : 'https://via.placeholder.com/200?text=No+Image'

                  return (
                    <div key={product._id} className='product-card'>
                      <img
                        src={imageUrl}
                        alt={title}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/200?text=No+Image'
                        }}
                      />
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

export default HomeScreen
