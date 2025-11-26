import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@material-tailwind/react'
import { useAuth } from '../context/AuthContext'
import { API_BASE_URL, API_ENDPOINTS, BOOKINGS_BASE_URL } from '../data/api'
import { apiRequest } from '../utils/api'
import Footer from '../components/Footer'

function Admin() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isAdmin, isSuperAdmin, logout } = useAuth()
  const [bookings, setBookings] = useState([])
  const [filter, setFilter] = useState('all') // all, pending, approved, rejected
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated() || (!isAdmin() && !isSuperAdmin())) {
      navigate('/')
      return
    }

    fetchBookings()
  }, [navigate, isAuthenticated, isAdmin, isSuperAdmin, filter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError('')
      
      let endpoint = API_ENDPOINTS.bookings
      if (filter === 'pending') {
        endpoint = API_ENDPOINTS.bookingsPending
      }

      console.log('Fetching bookings from:', endpoint)
      const response = await apiRequest(endpoint, {
        method: 'GET'
      }, true) // Use bookings base URL

      const data = await response.json()
      const bookingsList = Array.isArray(data) ? data : (data.data || data.bookings || [])
      
      // Filter bookings if needed
      if (filter !== 'all' && filter !== 'pending') {
        const filtered = bookingsList.filter(booking => 
          booking.status?.toLowerCase() === filter.toLowerCase()
        )
        setBookings(filtered)
      } else {
        setBookings(bookingsList)
      }
    } catch (err) {
      setError(err.message || 'Bronlarni yuklash muvaffaqiyatsiz')
      console.error('Error fetching bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (bookingId) => {
    try {
      console.log('Approving booking:', bookingId)
      const response = await apiRequest(`${API_ENDPOINTS.bookingApprove}/${bookingId}/approve`, {
        method: 'PATCH'
      }, true) // Use bookings base URL

      if (response.ok) {
        fetchBookings()
      } else {
        const data = await response.json()
        alert(data.message || 'Bronni tasdiqlash muvaffaqiyatsiz')
      }
    } catch (err) {
      alert(err.message || 'Bronni tasdiqlash muvaffaqiyatsiz')
    }
  }

  const handleReject = async (bookingId) => {
    try {
      console.log('Rejecting booking:', bookingId)
      const response = await apiRequest(`${API_ENDPOINTS.bookingReject}/${bookingId}/reject`, {
        method: 'PATCH'
      }, true) // Use bookings base URL

      if (response.ok) {
        fetchBookings()
      } else {
        const data = await response.json()
        alert(data.message || 'Bronni rad etish muvaffaqiyatsiz')
      }
    } catch (err) {
      alert(err.message || 'Bronni rad etish muvaffaqiyatsiz')
    }
  }

  const handleStatusChange = async (bookingId, status) => {
    try {
      console.log('Updating booking status:', bookingId, status)
      const response = await apiRequest(`${API_ENDPOINTS.bookingStatus}/${bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      }, true) // Use bookings base URL

      if (response.ok) {
        fetchBookings()
      } else {
        const data = await response.json()
        alert(data.message || 'Bron holatini yangilash muvaffaqiyatsiz')
      }
    } catch (err) {
      alert(err.message || 'Bron holatini yangilash muvaffaqiyatsiz')
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="pt-16 sm:pt-20 md:pt-[92px] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-barber-gold mx-auto mb-4"></div>
          <p className="text-black">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 sm:pt-20 md:pt-[92px] min-h-screen bg-white">
      <section className="w-full py-8 sm:py-10 md:py-12 lg:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[127px]">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black">Admin Boshqaruv Paneli</h1>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate('/booking')}
                size="sm"
                className="bg-barber-olive hover:bg-barber-gold"
              >
                Vaqt belgilash
              </Button>
              <Button
                onClick={logout}
                size="sm"
                variant="outlined"
                className="border-red-500 text-red-500 hover:bg-red-50"
              >
                Chiqish
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Bronlarni filtrlash</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-barber-olive focus:border-barber-olive text-base"
            >
              <option value="all">Barcha bronlar</option>
              <option value="pending">Kutilmoqda</option>
              <option value="approved">Tasdiqlangan</option>
              <option value="rejected">Rad etilgan</option>
            </select>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-barber-dark text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Mijoz</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Barber</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Xizmat</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Sana</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Vaqt</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Holat</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                        Bronlar topilmadi
                      </td>
                    </tr>
                  ) : (
                    bookings.map((booking) => (
                      <tr key={booking.id || booking._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{booking.id || booking._id}</td>
                        <td className="px-4 py-3 text-sm">
                          {booking.client?.name || booking.client_name || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {booking.barber?.name || booking.barber_name || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {booking.service?.name || booking.service_name || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm">{booking.date || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm">{booking.time || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                            {booking.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            {booking.status?.toLowerCase() === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(booking.id || booking._id)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs"
                                >
                                  Tasdiqlash
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleReject(booking.id || booking._id)}
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs"
                                >
                                  Rad etish
                                </Button>
                              </>
                            )}
                            <select
                              value={booking.status || 'pending'}
                              onChange={(e) => handleStatusChange(booking.id || booking._id, e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-barber-olive focus:border-barber-olive text-sm"
                            >
                              <option value="pending">Kutilmoqda</option>
                              <option value="approved">Tasdiqlangan</option>
                              <option value="rejected">Rad etilgan</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

export default Admin

