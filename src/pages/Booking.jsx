import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '@material-tailwind/react'
import { useAuth } from '../context/AuthContext'
import { API_BASE_URL, API_ENDPOINTS, SERVICES_BASE_URL, BARBERS_BASE_URL, BOOKINGS_BASE_URL } from '../data/api'
import { apiRequest } from '../utils/api'
import Footer from '../components/Footer'

function Booking() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    barber_id: '',
    service_id: '',
    date: '',
    time: ''
  })
  const [services, setServices] = useState([])
  const [barbers, setBarbers] = useState([])
  const [myBookings, setMyBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }

    // Fetch services and barbers
    const fetchData = async () => {
      try {
        console.log('Fetching services from:', `${SERVICES_BASE_URL}${API_ENDPOINTS.services}`)
        console.log('Fetching barbers from:', `${BARBERS_BASE_URL}${API_ENDPOINTS.barbers}`)
        
        const [servicesRes, barbersRes] = await Promise.all([
          fetch(`${SERVICES_BASE_URL}${API_ENDPOINTS.services}`, {
            method: 'GET',
            headers: {
              'Accept': '*/*',
              'Content-Type': 'application/json'
            },
            mode: 'cors'
          }),
          fetch(`${BARBERS_BASE_URL}${API_ENDPOINTS.barbers}`, {
            method: 'GET',
            headers: {
              'Accept': '*/*',
              'Content-Type': 'application/json'
            },
            mode: 'cors'
          })
        ])

        console.log('Services response status:', servicesRes.status)
        console.log('Barbers response status:', barbersRes.status)

        if (!servicesRes.ok) {
          const errorText = await servicesRes.text()
          console.error('Services fetch error:', errorText)
          throw new Error(`Failed to fetch services: ${servicesRes.status}`)
        }

        if (!barbersRes.ok) {
          const errorText = await barbersRes.text()
          console.error('Barbers fetch error:', errorText)
          throw new Error(`Failed to fetch barbers: ${barbersRes.status}`)
        }

        const servicesData = await servicesRes.json()
        const barbersData = await barbersRes.json()
        
        console.log('Services data:', servicesData)
        console.log('Barbers data:', barbersData)

        // Handle services response
        const servicesList = Array.isArray(servicesData) ? servicesData : (servicesData.data || servicesData.services || [])
        setServices(servicesList)
        
        // Handle barbers response
        const barbersList = Array.isArray(barbersData) ? barbersData : (barbersData.data || barbersData.barbers || [])
        setBarbers(barbersList)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load services and barbers')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    fetchMyBookings()
  }, [navigate, isAuthenticated])

  // Fetch user's bookings
  const fetchMyBookings = async () => {
    try {
      setLoadingBookings(true)
      console.log('Fetching my bookings from:', `${BOOKINGS_BASE_URL}${API_ENDPOINTS.bookingsMy}`)
      
      const response = await apiRequest(API_ENDPOINTS.bookingsMy, {
        method: 'GET'
      }, true) // Use bookings base URL

      console.log('My bookings response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('My bookings fetch error:', errorText)
        throw new Error(`Failed to fetch bookings: ${response.status}`)
      }

      const data = await response.json()
      console.log('My bookings data:', data)
      
      const bookingsList = Array.isArray(data) ? data : (data.data || data.bookings || [])
      setMyBookings(bookingsList)
    } catch (err) {
      console.error('Error fetching my bookings:', err)
      // Don't show error to user, just log it
    } finally {
      setLoadingBookings(false)
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess(false)

    try {
      const bookingData = {
        client_id: parseInt(user.id || user._id),
        barber_id: parseInt(formData.barber_id),
        service_id: parseInt(formData.service_id),
        date: formData.date,
        time: formData.time
      }

      console.log('Submitting booking:', bookingData)
      console.log('User:', user)

      // Use BOOKINGS_BASE_URL (without /api) for bookings endpoint
      const response = await apiRequest(API_ENDPOINTS.bookings, {
        method: 'POST',
        body: JSON.stringify(bookingData)
      }, true) // Use bookings base URL

      const data = await response.json()
      console.log('Booking response:', data)

      if (response.ok || response.status === 201) {
        setSuccess(true)
        setFormData({ barber_id: '', service_id: '', date: '', time: '' })
        // Refresh bookings list after successful booking
        fetchMyBookings()
        setTimeout(() => {
          setSuccess(false)
        }, 5000)
      } else {
        const errorMessage = data.message || data.error || `Bron qilish muvaffaqiyatsiz (${response.status}). Iltimos, qayta urinib ko'ring.`
        setError(errorMessage)
        console.error('Booking failed:', data)
      }
    } catch (err) {
      console.error('Booking error:', err)
        setError(err.message || 'Tarmoq xatosi. Iltimos, internet aloqangizni tekshiring va qayta urinib ko\'ring.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    })
    if (error) setError('')
  }

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]

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
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-6 text-center">Vaqt belgilash</h1>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
                ✅ Bron muvaffaqiyatli yaratildi!
              </div>
            )}

            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg border border-gray-200">
              <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Barber</label>
                  <select
                    value={formData.barber_id}
                    onChange={(e) => handleInputChange('barber_id', e.target.value)}
                    disabled={isSubmitting}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-barber-olive focus:border-barber-olive text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Barberni tanlang</option>
                    {barbers.map((barber) => (
                      <option key={barber.id || barber._id} value={String(barber.id || barber._id)}>
                        {barber.name || barber.fullName || 'Barber'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Xizmat</label>
                  <select
                    value={formData.service_id}
                    onChange={(e) => handleInputChange('service_id', e.target.value)}
                    disabled={isSubmitting}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-barber-olive focus:border-barber-olive text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Xizmatni tanlang</option>
                    {services.map((service) => {
                      const serviceName = service.name || service.title || 'Service'
                      const servicePrice = service.price ? ` - ${service.price}` : ''
                      const serviceDuration = service.duration ? ` (${service.duration} min)` : ''
                      return (
                        <option key={service.id || service._id} value={String(service.id || service._id)}>
                          {serviceName}{servicePrice}{serviceDuration}
                        </option>
                      )
                    })}
                  </select>
                </div>

                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  label="Sana"
                  min={today}
                  required
                  size="lg"
                  disabled={isSubmitting}
                />

                <Input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  label="Vaqt"
                  required
                  size="lg"
                  disabled={isSubmitting}
                />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full bg-barber-olive hover:bg-barber-gold text-white font-semibold"
                  loading={isSubmitting}
                >
                  {isSubmitting ? 'Bron qilinmoqda...' : 'Vaqt belgilash'}
                </Button>
              </form>
            </div>
          </div>

          {/* My Bookings Section */}
          <div className="mt-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-6 text-center">Mening Bronlarim</h2>
            
            {loadingBookings ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-barber-gold mx-auto mb-4"></div>
                <p className="text-gray-600">Bronlaringiz yuklanmoqda...</p>
              </div>
            ) : myBookings.length === 0 ? (
              <div className="bg-white rounded-2xl sm:rounded-3xl p-8 shadow-lg border border-gray-200 text-center">
                <p className="text-gray-600 text-lg">Sizda hali bronlar yo'q.</p>
                <p className="text-gray-500 text-sm mt-2">Boshlash uchun yuqorida vaqt belgilang!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myBookings.map((booking) => {
                  const getStatusColor = (status) => {
                    switch (status?.toLowerCase()) {
                      case 'approved':
                        return 'bg-green-100 text-green-800 border-green-300'
                      case 'rejected':
                        return 'bg-red-100 text-red-800 border-red-300'
                      case 'pending':
                        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
                      default:
                        return 'bg-gray-100 text-gray-800 border-gray-300'
                    }
                  }

                  const barberName = booking.barber?.name || booking.barber_name || 'N/A'
                  const serviceName = booking.service?.name || booking.service_name || 'N/A'
                  const servicePrice = booking.service?.price ? parseFloat(booking.service.price).toLocaleString('uz-UZ') + ' UZS' : 'N/A'
                  const serviceDuration = booking.service?.duration ? `${booking.service.duration} min` : 'N/A'

                  return (
                    <div
                      key={booking.id || booking._id}
                      className="bg-white rounded-2xl sm:rounded-3xl p-6 shadow-lg border border-gray-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg sm:text-xl font-bold text-black">{serviceName}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                              {booking.status || 'pending'}
                            </span>
                          </div>
                          <div className="space-y-2 text-sm sm:text-base text-gray-700">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">Barber:</span>
                              <span>{barberName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">Sana:</span>
                              <span>{booking.date || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">Vaqt:</span>
                              <span>{booking.time || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">Narx:</span>
                              <span>{servicePrice}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">Davomiyligi:</span>
                              <span>{serviceDuration}</span>
                            </div>
                            {booking.comment && (
                              <div className="flex items-start gap-2 mt-2">
                                <span className="font-semibold">Izoh:</span>
                                <span className="text-gray-600">{booking.comment}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

export default Booking

