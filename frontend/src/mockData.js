// src/mockData.js - Dữ liệu mock để test không cần backend

export const mockProducts = [
  { 
    id: 1, 
    title: 'Sedan A - Ưu đãi 10%', 
    price: '$20,000', 
    img: 'https://via.placeholder.com/400x200?text=Sedan+A', 
    category: 'sedan', 
    deal: true, 
    popular: true 
  },
  { 
    id: 2, 
    title: 'SUV B - Giảm 5%', 
    price: '$28,500', 
    img: 'https://via.placeholder.com/400x200?text=SUV+B', 
    category: 'suv', 
    deal: true, 
    popular: false 
  },
  { 
    id: 3, 
    title: 'Truck C', 
    price: '$32,000', 
    img: 'https://via.placeholder.com/400x200?text=Truck+C', 
    category: 'truck', 
    deal: false, 
    popular: true 
  },
  { 
    id: 4, 
    title: 'EV D - Ưu đãi đặc biệt', 
    price: '$40,000', 
    img: 'https://via.placeholder.com/400x200?text=EV+D', 
    category: 'electric', 
    deal: true, 
    popular: true 
  },
  { 
    id: 5, 
    title: 'Sport E', 
    price: '$55,000', 
    img: 'https://via.placeholder.com/400x200?text=Sport+E', 
    category: 'sports', 
    deal: false, 
    popular: true 
  },
  { 
    id: 6, 
    title: 'Sedan F', 
    price: '$22,000', 
    img: 'https://via.placeholder.com/400x200?text=Sedan+F', 
    category: 'sedan', 
    deal: false, 
    popular: false 
  },
  { 
    id: 7, 
    title: 'SUV G', 
    price: '$30,000', 
    img: 'https://via.placeholder.com/400x200?text=SUV+G', 
    category: 'suv', 
    deal: false, 
    popular: true 
  },
  { 
    id: 8, 
    title: 'EV H', 
    price: '$45,000', 
    img: 'https://via.placeholder.com/400x200?text=EV+H', 
    category: 'electric', 
    deal: false, 
    popular: false 
  }
]

export const mockUsers = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@carsauto.com',
    username: 'admin',
    password: 'admin123',
    isAdmin: true
  },
  {
    id: 2,
    name: 'Test User',
    email: 'test@test.com',
    username: 'test',
    password: 'test123',
    isAdmin: false
  }
]