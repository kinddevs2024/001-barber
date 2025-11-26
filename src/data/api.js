// API configuration
// Update this with your actual API base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.103:3000/api'
export const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL || 'http://192.168.1.103:3000'
export const SERVICES_BASE_URL = import.meta.env.VITE_SERVICES_BASE_URL || 'http://192.168.1.103:3000'
export const BARBERS_BASE_URL = import.meta.env.VITE_BARBERS_BASE_URL || 'http://192.168.1.103:3000'
export const BOOKINGS_BASE_URL = import.meta.env.VITE_BOOKINGS_BASE_URL || 'http://192.168.1.103:3000'

export const API_ENDPOINTS = {
  register: '/auth/register',
  login: '/auth/login',
  barbers: '/users/barbers',
  services: '/barber-services',
  bookings: '/bookings',
  bookingsMy: '/bookings/my',
  bookingsMultiple: '/bookings/multiple',
  bookingsPending: '/bookings/pending',
  bookingsClient: '/bookings/client',
  bookingsBarber: '/bookings/barber',
  bookingApprove: '/bookings',
  bookingReject: '/bookings',
  bookingStatus: '/bookings'
}

