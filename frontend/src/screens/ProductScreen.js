import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { listProducts } from '../actions/productActions'

const categories = [
  { id: 'all', name: 'Tất cả', img: 'https://via.placeholder.com/64?text=All' },
  { id: 'sedan', name: 'Sedan', img: 'https://via.placeholder.com/64?text=Sedan' },
  { id: 'suv', name: 'SUV', img: 'https://via.placeholder.com/64?text=SUV' },
  { id: 'truck', name: 'Truck', img: 'https://via.placeholder.com/64?text=Truck' },
  { id: 'electric', name: 'Electric', img: 'https://via.placeholder.com/64?text=EV' },
  { id: 'sports', name: 'Sports', img: 'https://via.placeholder.com/64?text=Sport' }
]

const HomeScreen = () => {
  const dispatch = useDispatch()
  
  const [currentCategory, setCurrentCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredProducts, setFilteredProducts] = useState([])

  const productList = useSelector((state) => state.productList)
  const { loading, error, products } = productList

  useEffect(() => {
    dispatch(listProducts())
  }, [dispatch])

  useEffect(() => {
    if (products) {
      filterProducts()
    }
  }, [products, currentCategory, searchQuery])

  const filterProducts = () => {
    let filtered = products

    if (currentCategory !== 'all') {
      filtered = filtered.filter(p => p.category === currentCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
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

  const getCategoryName = () => {
    if (searchQuery) {
      return `Kết quả tìm kiếm: "${searchQuery}"`
    }
    return categories.find(c => c.id === currentCategory)?.name || 'Sản phẩm'
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
        <aside className='left'>
          <div className='label-box'>
            <div className='label-title'>Danh mục</div>
            <div className='categories-list'>
              {categories.map(category => (
                <div
                  key={category.id}
                  className={`category-card ${currentCategory === category.id ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <img src={category.img} alt={category.name} />
                  <div>{category.name}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className='right'>
          <div className='product-section'>
            <h3>{getCategoryName()}</h3>
            <div className='product-list'>
              {loading ? (
                <div style={{color:'#fff', padding:'20px', textAlign:'center'}}>
                  Đang tải...
                </div>
              ) : error ? (
                <div style={{color:'#ff6b6b', padding:'20px', textAlign:'center'}}>
                  {error}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div style={{color:'#fff', padding:'20px', textAlign:'center'}}>
                  Không tìm thấy sản phẩm nào
                </div>
              ) : (
                filteredProducts.map(product => (
                  <div key={product.id} className='product-card'>
                    <img src={product.img} alt={product.title} />
                    <div className='title'>{product.title}</div>
                    <div className='meta'>{product.category.toUpperCase()}</div>
                    <div className='price'>{product.price}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default HomeScreen