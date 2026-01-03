// src/index.js
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './store'
// Bootstrap CSS first
import './bootstrap.min.css'
import './index.css' // Tailwind CSS
// CSS imports - organized by functionality
import './styles/shared.css' // Global styles, animations, header, footer
import './styles/home.css' // Home/dashboard page
import './styles/auth.css' // Login/register pages
import './styles/productDetail.css' // Product detail page
import './styles/cart.css' // Shopping cart page
import './styles/checkout.css' // Checkout page
import './styles/order.css' // Order history and order detail
import './styles/booking.css' // Service booking and my bookings
import './styles/profile.css' // User profile page
import './styles/pages.css' // Static pages (about, contact, policy, terms)
import './styles/services.css' // Services/booking catalog page
import './styles/admin.css' // Admin panel
import './styles/ai.css' // AI chat widget
import App from './App'

const container = document.getElementById('root')
const root = createRoot(container)
root.render(
  <Provider store={store}>
    <App />
  </Provider>
)