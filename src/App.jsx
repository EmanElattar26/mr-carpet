import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/customer/Home'
import NewOrder from './pages/customer/NewOrder'
import TrackOrder from './pages/customer/TrackOrder'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import Orders from './pages/admin/Orders'
import DriverApp from './pages/driver/DriverApp'
import Categories from './pages/admin/Categories'
import Customers from './pages/admin/Customers'
import Messages from './pages/admin/Messages'
import Drivers from './pages/admin/Drivers'
import Users from './pages/admin/Users'




function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/new-order" element={<NewOrder />} />
        <Route path="/track" element={<TrackOrder />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/orders" element={<Orders />} />
        <Route path="/driver" element={<DriverApp />} />
        <Route path="/admin/categories" element={<Categories />} />
        <Route path="/admin/customers" element={<Customers />} />
        <Route path="/admin/messages" element={<Messages />} />

        <Route path="/admin/users" element={<Users />} />

        <Route path="/admin/drivers" element={<Drivers />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App