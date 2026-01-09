import React from 'react'
import { BrowserRouter as Router, Route, Switch, useLocation } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'

import Header from './components/Header'
import Footer from './components/Footer'
import ProductScreen from './screens/ProductScreen'
import ProductDetailScreen from './screens/ProductDetailScreen'
import LoginScreen from './screens/LoginScreen'
import RegisterScreen from './screens/RegisterScreen'
import ProfileScreen from './screens/ProfileScreen'
import AboutScreen from './screens/AboutScreen'
import ContactScreen from './screens/ContactScreen'
import PolicyScreen from './screens/PolicyScreen'
import AdminScreen from './screens/AdminScreen'
import TermsScreen from './screens/TermsScreen'
import CartScreen from './screens/CartScreen'
import CheckoutScreen from './screens/CheckoutScreen'
import PaymentSuccessScreen from './screens/PaymentSuccessScreen'
import PaymentFailedScreen from './screens/PaymentFailedScreen'
import OrderHistoryScreen from './screens/OrderHistoryScreen'
import OrderDetailScreen from './screens/OrderDetailScreen'
import ServicesScreen from './screens/ServicesScreen'
import BookingScreen from './screens/BookingScreen'
import MyBookingsScreen from './screens/MyBookingsScreen'
import BookingDetailScreen from './screens/BookingDetailScreen'
import AIChat from './components/AIChat'
import SupportButton from './components/SupportButton'
import VerifyOTPScreen from './screens/VerifyOTPScreen'

const AppContent = () => {
  const location = useLocation()
  
  const isAdminRoute = location.pathname === '/admin'
  
  return (
    <>
      {!isAdminRoute && <Header />}
      
      <Switch>
        <Route path='/' component={AboutScreen} exact />
        <Route path='/product' component={ProductScreen} exact />
        <Route path='/product/:id' component={ProductDetailScreen} />
        <Route path='/cart' component={CartScreen} />
        <Route path='/checkout' component={CheckoutScreen} />
        <Route path='/payment/success' component={PaymentSuccessScreen} />
        <Route path='/payment/failed' component={PaymentFailedScreen} />
        <Route path='/orders' component={OrderHistoryScreen} exact />
        <Route path='/orders/:id' component={OrderDetailScreen} />
        <Route path='/login' component={LoginScreen} />
        <Route path='/register' component={RegisterScreen} />
        <Route path='/verify-otp' component={VerifyOTPScreen} />
        <Route path='/profile' component={ProfileScreen} />
        <Route path='/contact' component={ContactScreen} />
        <Route path='/services' component={ServicesScreen} exact />
        <Route path='/policy' component={PolicyScreen} />
        <Route path='/terms' component={TermsScreen} />
        <Route path='/admin' component={AdminScreen} />
        <Route path='/booking/:id' component={BookingScreen} />
        <Route path='/my-bookings' component={MyBookingsScreen} />
        <Route path='/booking-detail/:id' component={BookingDetailScreen} />
      </Switch>
      
      {!isAdminRoute && (
        <>
          <AIChat />
          <SupportButton />
          <Footer />
        </>
      )}
    </>
  )
}

const App = () => {
  return (
    <GoogleOAuthProvider clientId="939950020568-7su5pq39r781kgglsbm8lr7gm55l52gm.apps.googleusercontent.com">
      <Router>
        <AppContent />
      </Router>
    </GoogleOAuthProvider>
  )
}

export default App