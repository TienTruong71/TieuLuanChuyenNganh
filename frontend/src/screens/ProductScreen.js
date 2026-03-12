import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { listProducts } from '../actions/productActions'
import axios from 'axios'
import { Pagination, Input, Select, ConfigProvider, theme } from 'antd'
import '../styles/home.css'
import '../styles/antd-theme.css'

const { Search } = Input;
const { Option } = Select;

const ProductScreen = () => {
  const history = useHistory()
  const dispatch = useDispatch()

  const [categories, setCategories] = useState([])
  const [loadingCat, setLoadingCat] = useState(false)
  const [errorCat, setErrorCat] = useState(null)

  const [queryParams, setQueryParams] = useState({
    current: 1,
    pageSize: 10,
    search: '',
    category: 'all',
    sortField: 'createdAt',
    sortOrder: 'descend'
  })

  // Local state for search bar text as user types
  const [searchText, setSearchText] = useState('')

  const productList = useSelector((state) => state.productList)
  const { loading, error, products: rawProducts, pagination } = productList

  const products = Array.isArray(rawProducts)
    ? rawProducts
    : rawProducts?.products || rawProducts?.data || []

  // Lấy danh mục từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCat(true)
        const { data } = await axios.get('/api/client/categories')
        setCategories(data.categories || data || [])
      } catch (err) {
        setErrorCat(err.response?.data?.message || err.message)
      } finally {
        setLoadingCat(false)
      }
    }
    fetchCategories()
  }, [])

  // Lấy danh sách sản phẩm từ Redux khi queryParams thay đổi
  useEffect(() => {
    const listParams = { ...queryParams }
    if (listParams.category === 'all') delete listParams.category
    dispatch(listProducts(listParams))
  }, [dispatch, queryParams])

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setQueryParams((prev) => {
        if (prev.search !== searchText) {
          return { ...prev, search: searchText, current: 1 }
        }
        return prev
      })
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [searchText])

  const handleSearch = (value) => {
    setQueryParams({ ...queryParams, search: value, current: 1 })
  }

  const handleSort = (value) => {
    const [sortField, sortOrder] = value.split('-')
    setQueryParams({ ...queryParams, sortField, sortOrder, current: 1 })
  }

  const handlePageChange = (page, pageSize) => {
    setQueryParams({ ...queryParams, current: page, pageSize })
  }

  const handleCategoryClick = (catId) => {
    setQueryParams({ ...queryParams, category: catId, current: 1 })
    setSearchText('')
  }

  const handleProductClick = (productId) => {
    if (!productId) {
      console.error('Product ID is null/undefined!')
      return
    }
    history.push(`/product/${productId}`)
  }

  const getCategoryName = () => {
    if (queryParams.search) return `Kết quả tìm kiếm: "${queryParams.search}"`
    if (queryParams.category === 'all') return 'Tất cả sản phẩm'

    const foundCat = categories.find((c) => c._id === queryParams.category)
    return foundCat?.category_name || foundCat?.name || foundCat?.title || 'Danh mục'
  }

  // ✅ Helper: Get first image from product (FIX cho data bị lỗi)
  const getProductImage = (product) => {
    if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
      return product.image || null
    }

    const firstImage = product.images[0]

    // Case 1: Đã là string bình thường
    if (typeof firstImage === 'string') {
      return firstImage
    }

    // Case 2: Object có image_url hoặc url
    if (typeof firstImage === 'object' && firstImage !== null) {
      if (firstImage.image_url) return firstImage.image_url
      if (firstImage.url) return firstImage.url

      // 🔥 FIX: Data bị lưu sai dạng {0: 'h', 1: 't', 2: 't', 3: 'p', ...}
      if (firstImage.hasOwnProperty('0') && firstImage.hasOwnProperty('1')) {
        const charKeys = Object.keys(firstImage)
          .filter(key => !isNaN(parseInt(key)))
          .sort((a, b) => parseInt(a) - parseInt(b))

        const reconstructedUrl = charKeys.map(key => firstImage[key]).join('')

        if (reconstructedUrl.startsWith('http')) {
          return reconstructedUrl
        }
      }
    }

    return null
  }

  return (
    <main className='page-main'>
      <section className='hero flex justify-center py-8'>
        <div className="w-full max-w-2xl px-4 ant-dark-theme-override">
          <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
            <Search
              placeholder="Tìm kiếm sản phẩm, phụ kiện, linh kiện..."
              allowClear
              enterButton="Tìm kiếm"
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              className="w-full"
            />
          </ConfigProvider>
        </div>
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
                <div
                  key='all'
                  className={`category-card ${queryParams.category === 'all' ? 'active' : ''}`}
                  onClick={() => handleCategoryClick('all')}
                >
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}></div>
                  <div style={{
                    fontWeight: '700',
                    color: queryParams.category === 'all' ? '#00bfff' : '#f0f0f0',
                    fontFamily: '"Poppins", sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Tất cả SẢN PHẨM
                  </div>
                </div>

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
                      className={`category-card ${queryParams.category === category._id ? 'active' : ''}`}
                      onClick={() => handleCategoryClick(category._id)}
                    >
                      {catImage ? (
                        <img
                          src={catImage}
                          alt={catName}
                          onError={(e) => {
                            e.target.style.display = 'none'
                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'block'
                          }}
                        />
                      ) : null}
                      <div style={{ fontSize: '48px', display: catImage ? 'none' : 'block' }}>
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
            <div className="flex justify-between items-center mb-4 ant-dark-theme-override">
              <h3 className="m-0 text-xl font-bold text-white mb-2">{getCategoryName()}</h3>
              <div className="flex items-center space-x-2">
                <span className="text-gray-300 font-medium">Sắp xếp:</span>
                <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
                  <Select defaultValue="createdAt-descend" style={{ width: 180 }} onChange={handleSort} size="large">
                    <Option value="createdAt-descend">Mới nhất</Option>
                    <Option value="createdAt-ascend">Cũ nhất</Option>
                    <Option value="price-ascend">Giá tăng dần</Option>
                    <Option value="price-descend">Giá giảm dần</Option>
                  </Select>
                </ConfigProvider>
              </div>
            </div>

            <div className='product-list'>
              {loading ? (
                <div className='loading'>Đang tải sản phẩm...</div>
              ) : error ? (
                <div className='error'>{error}</div>
              ) : products.length === 0 ? (
                <div className='empty'>
                  {products.length === 0
                    ? 'Chưa có sản phẩm nào'
                    : 'Không tìm thấy sản phẩm nào'}
                </div>
              ) : (
                <>
                  {products.map((product) => {
                    const title = product.product_name || product.title || 'Không có tên'

                    const categoryName =
                      product.category_id?.category_name ||
                      product.category_id?.name ||
                      product.category_id?.title ||
                      'Không rõ hãng'

                    const price =
                      typeof product.price === 'object'
                        ? product.price?.value || product.price?.$numberDecimal || 0
                        : product.price || 0

                    const rawImage = getProductImage(product)

                    let imageUrl = null
                    if (rawImage) {
                      if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) {
                        imageUrl = rawImage
                      } else {
                        imageUrl = `http://localhost:5000${rawImage}`
                      }
                    }

                    return (
                      <div
                        key={product._id}
                        className='product-card'
                        onClick={() => handleProductClick(product._id)}
                        style={{ cursor: 'pointer' }}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={title}
                            onError={(e) => {
                              e.target.style.display = 'none'
                              if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'
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
                  })}
                </>
              )}
            </div>

            {!loading && !error && products.length > 0 && (
              <div className="flex flex-col items-center mt-10 w-full ant-dark-theme-override">
                <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
                  <Pagination
                    current={pagination?.current || 1}
                    pageSize={pagination?.pageSize || 10}
                    total={pagination?.total || 0}
                    onChange={handlePageChange}
                    showSizeChanger
                    pageSizeOptions={['10', '20', '30', '50']}
                    className="shadow-sm bg-[rgba(255,255,255,0.06)] px-4 py-3 rounded-xl border border-[rgba(255,255,255,0.08)] backdrop-blur-md"
                  />
                </ConfigProvider>
              </div>
            )}

          </div>
        </section>
      </div>
    </main>
  )
}

export default ProductScreen