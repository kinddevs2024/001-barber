import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import Header from './components/Header'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Gallery from './pages/Gallery'
import Team from './pages/Team'
import Delivery from './pages/Delivery'
import Booking from './pages/Booking'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'
import SuperAdmin from './pages/SuperAdmin'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-white">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/team" element={<Team />} />
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <Admin />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/super-admin" 
            element={
              <ProtectedRoute requireSuperAdmin={true}>
                <SuperAdmin />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Analytics />
    </Router>
  )
}

export default App
