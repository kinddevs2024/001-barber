// API configuration
// Update this with your actual API base URL
const BASE_HOST = "13.60.9.112";
const BASE_PORT = "3000";
const BASE_URL = `http://${BASE_HOST}:${BASE_PORT}`;

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || `${BASE_URL}/api`;
export const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL || BASE_URL;
export const SERVICES_BASE_URL =
  import.meta.env.VITE_SERVICES_BASE_URL || BASE_URL;
export const BARBERS_BASE_URL =
  import.meta.env.VITE_BARBERS_BASE_URL || BASE_URL;
export const BOOKINGS_BASE_URL =
  import.meta.env.VITE_BOOKINGS_BASE_URL || BASE_URL;

export const API_ENDPOINTS = {
  register: "/auth/register",
  login: "/auth/login",
  barbers: "/users/barbers",
  services: "/barber-services",
  bookings: "/bookings",
  bookingsMy: "/bookings/my",
  bookingsMultiple: "/bookings/multiple",
  bookingsPending: "/bookings/pending",
  bookingsClient: "/bookings/client",
  bookingsBarber: "/bookings/barber",
  bookingApprove: "/bookings",
  bookingReject: "/bookings",
  bookingStatus: "/bookings",
};
