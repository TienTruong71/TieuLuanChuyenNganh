import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ProductScreen from './screens/ProductScreen'
import LoginScreen from './screens/LoginScreen'
import RegisterScreen from './screens/RegisterScreen'
import ProfileScreen from './screens/ProfileScreen'
import ServicesScreen from './screens/ServicesScreen'
import AboutScreen from './screens/AboutScreen'
import ContactScreen from './screens/ContactScreen'
import PolicyScreen from './screens/PolicyScreen'
import AdminScreen from './screens/AdminScreen'
import TermsScreen from './screens/TermsScreen'

const App = () => {
  return (
    <Router>
      <Header />
      <Switch>
        <Route path='/' component={AboutScreen} exact />
        <Route path='/product' component={ProductScreen}/>
        <Route path='/login' component={LoginScreen} />
        <Route path='/register' component={RegisterScreen} />
        <Route path='/profile' component={ProfileScreen} />
        <Route path='/contact' component={ContactScreen} />
        <Route path='/services' component={ServicesScreen} />
        <Route path='/policy' component={PolicyScreen} />
        <Route path='/terms' component={TermsScreen} />
        <Route path='/admin' component={AdminScreen} />
      </Switch>
      <Footer />
    </Router>
  )
}

export default App