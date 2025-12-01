import { API_BASE_URL, BOOKINGS_BASE_URL } from "../data/api";

// Get token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Timeout wrapper for fetch requests (5000ms = 5 seconds)
export const fetchWithTimeout = (url, options = {}, timeout = 5000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Request timeout after 5000ms")),
        timeout
      )
    ),
  ]);
};

// Make authenticated API request with timeout support
export const apiRequest = async (
  endpoint,
  options = {},
  useBookingsBase = false,
  timeout = 5000
) => {
  const token = getAuthToken();

  const baseURL = useBookingsBase ? BOOKINGS_BASE_URL : API_BASE_URL;

  const headers = {
    "Content-Type": "application/json",
    Accept: "*/*",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  console.log("Making API request:", {
    url: `${baseURL}${endpoint}`,
    method: options.method || "GET",
    hasToken: !!token,
    headers,
    timeout,
  });

  const response = await fetchWithTimeout(
    `${baseURL}${endpoint}`,
    {
      ...options,
      headers,
      mode: "cors",
    },
    timeout
  );

  console.log("API response:", {
    status: response.status,
    statusText: response.statusText,
    url: response.url,
  });

  if (response.status === 401) {
    // Unauthorized - clear token and redirect to login
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  return response;
};
