import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input } from "@material-tailwind/react";
import { Analytics } from "@vercel/analytics/react";
import { useAuth } from "../context/AuthContext";
import { API_ENDPOINTS, BOOKINGS_BASE_URL, AUTH_BASE_URL } from "../data/api";
import { apiRequest } from "../utils/api";
import Footer from "../components/Footer";
import fakeBookings from "../data/fakeData/bookings.json";

function Admin() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, isSuperAdmin, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all"); // all, pending, approved, rejected
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState({
    name: "",
    tg_username: "",
    phone_number: "",
    password: "",
    role: "admin",
  });
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false);

  useEffect(() => {
    // ProtectedRoute handles authentication, but double-check here
    if (isAuthenticated() && (isAdmin() || isSuperAdmin())) {
      fetchBookings();
    }
  }, [isAuthenticated, isAdmin, isSuperAdmin, filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      let endpoint = API_ENDPOINTS.bookings;
      if (filter === "pending") {
        endpoint = API_ENDPOINTS.bookingsPending;
      }

      console.log("Fetching bookings from:", endpoint);
      const response = await apiRequest(
        endpoint,
        {
          method: "GET",
        },
        true,
        5000
      ); // Use bookings base URL with 5 second timeout

      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.status}`);
      }

      const data = await response.json();
      let bookingsList = Array.isArray(data)
        ? data
        : data.data || data.bookings || [];

      // Use fake data if API returns empty array
      if (!bookingsList || bookingsList.length === 0) {
        console.warn("No bookings from API, using fake data");
        bookingsList = fakeBookings;
      }

      // Filter bookings if needed
      if (filter !== "all" && filter !== "pending") {
        const filtered = bookingsList.filter(
          (booking) => booking.status?.toLowerCase() === filter.toLowerCase()
        );
        setBookings(filtered);
      } else {
        setBookings(bookingsList);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      if (err.message && err.message.includes("timeout")) {
        console.warn("Request timeout after 5 seconds, using fake data");
        setError(
          "Backend javob bermadi (5 soniya), demo ma'lumotlar ishlatilmoqda."
        );
      } else {
        console.warn("Using fake data due to API error");
        setError(
          err.message ||
            "Bronlarni yuklash muvaffaqiyatsiz. Demo ma'lumotlar ishlatilmoqda."
        );
      }
      // Use fake data as fallback
      let bookingsList = fakeBookings;
      // Filter bookings if needed
      if (filter !== "all" && filter !== "pending") {
        const filtered = bookingsList.filter(
          (booking) => booking.status?.toLowerCase() === filter.toLowerCase()
        );
        setBookings(filtered);
      } else {
        setBookings(bookingsList);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId) => {
    try {
      setError("");
      setSuccess("");
      console.log("Approving booking:", bookingId);
      const response = await apiRequest(
        `${API_ENDPOINTS.bookingApprove}/${bookingId}/approve`,
        {
          method: "PATCH",
        },
        true
      ); // Use bookings base URL

      if (response.ok) {
        setSuccess("Bron muvaffaqiyatli tasdiqlandi");
        fetchBookings();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.message || "Bronni tasdiqlash muvaffaqiyatsiz");
      }
    } catch (err) {
      setError(err.message || "Bronni tasdiqlash muvaffaqiyatsiz");
    }
  };

  const handleReject = async (bookingId) => {
    try {
      setError("");
      setSuccess("");
      console.log("Rejecting booking:", bookingId);
      const response = await apiRequest(
        `${API_ENDPOINTS.bookingReject}/${bookingId}/reject`,
        {
          method: "PATCH",
        },
        true
      ); // Use bookings base URL

      if (response.ok) {
        setSuccess("Bron muvaffaqiyatli rad etildi");
        fetchBookings();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.message || "Bronni rad etish muvaffaqiyatsiz");
      }
    } catch (err) {
      setError(err.message || "Bronni rad etish muvaffaqiyatsiz");
    }
  };

  const handleDelete = async (bookingId) => {
    try {
      setError("");
      setSuccess("");
      console.log("Deleting booking:", bookingId);
      const response = await apiRequest(
        `${API_ENDPOINTS.bookings}/${bookingId}`,
        {
          method: "DELETE",
        },
        true
      ); // Use bookings base URL

      if (response.ok) {
        setSuccess("Bron muvaffaqiyatli o'chirildi");
        setDeleteConfirm(null);
        fetchBookings();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.message || "Bronni o'chirish muvaffaqiyatsiz");
        setDeleteConfirm(null);
      }
    } catch (err) {
      setError(err.message || "Bronni o'chirish muvaffaqiyatsiz");
      setDeleteConfirm(null);
    }
  };

  const handleStatusChange = async (bookingId, status) => {
    try {
      setError("");
      setSuccess("");
      console.log("Updating booking status:", bookingId, status);
      const response = await apiRequest(
        `${API_ENDPOINTS.bookingStatus}/${bookingId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
        true
      ); // Use bookings base URL

      if (response.ok) {
        setSuccess("Bron holati muvaffaqiyatli yangilandi");
        fetchBookings();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.message || "Bron holatini yangilash muvaffaqiyatsiz");
      }
    } catch (err) {
      setError(err.message || "Bron holatini yangilash muvaffaqiyatsiz");
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setIsSubmittingAdmin(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${AUTH_BASE_URL}${API_ENDPOINTS.register}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(adminForm),
          mode: "cors",
        }
      );

      if (response.ok || response.status === 201) {
        setSuccess("Admin muvaffaqiyatli qo'shildi");
        setShowAddAdmin(false);
        setAdminForm({
          name: "",
          tg_username: "",
          phone_number: "",
          password: "",
          role: "admin",
        });
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.message || "Admin qo'shish muvaffaqiyatsiz");
      }
    } catch (err) {
      setError(err.message || "Admin qo'shish muvaffaqiyatsiz");
    } finally {
      setIsSubmittingAdmin(false);
    }
  };

  const handleAdminFormChange = (name, value) => {
    setAdminForm({
      ...adminForm,
      [name]: value,
    });
    if (error) setError("");
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="pt-16 sm:pt-20 md:pt-[92px] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-barber-gold mx-auto mb-4"></div>
          <p className="text-black">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 sm:pt-20 md:pt-[92px] min-h-screen bg-gray-50">
      <section className="w-full py-8 sm:py-10 md:py-12 lg:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[127px]">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-2">
                Admin Boshqaruv Paneli
              </h1>
              <p className="text-gray-600">
                Bronlarni boshqarish va nazorat qilish
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              {isSuperAdmin() && (
                <Button
                  onClick={() => setShowAddAdmin(true)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white">
                  + Admin qo'shish
                </Button>
              )}
              <Button
                onClick={fetchBookings}
                size="sm"
                variant="outlined"
                className="border-gray-300 text-gray-700 hover:bg-gray-50">
                Yangilash
              </Button>
              <Button
                onClick={() => navigate("/booking")}
                size="sm"
                className="bg-barber-olive hover:bg-barber-gold text-white">
                Vaqt belgilash
              </Button>
              <Button
                onClick={logout}
                size="sm"
                variant="outlined"
                className="border-red-500 text-red-500 hover:bg-red-50">
                Chiqish
              </Button>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
              ✅ {success}
            </div>
          )}

          {/* Filter and Stats */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bronlarni filtrlash
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full sm:w-auto min-w-[200px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-barber-olive focus:border-barber-olive text-base">
                <option value="all">Barcha bronlar ({bookings.length})</option>
                <option value="pending">Kutilmoqda</option>
                <option value="approved">Tasdiqlangan</option>
                <option value="rejected">Rad etilgan</option>
              </select>
            </div>
            <div className="flex gap-2 text-sm">
              <div className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
                Kutilmoqda:{" "}
                {
                  bookings.filter((b) => b.status?.toLowerCase() === "pending")
                    .length
                }
              </div>
              <div className="px-3 py-2 bg-green-100 text-green-800 rounded-lg">
                Tasdiqlangan:{" "}
                {
                  bookings.filter((b) => b.status?.toLowerCase() === "approved")
                    .length
                }
              </div>
              <div className="px-3 py-2 bg-red-100 text-red-800 rounded-lg">
                Rad etilgan:{" "}
                {
                  bookings.filter((b) => b.status?.toLowerCase() === "rejected")
                    .length
                }
              </div>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-barber-dark text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Mijoz
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Telefon
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Barber
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Xizmat
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Sana
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Vaqt
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Holat
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Amallar
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.length === 0 ? (
                    <tr>
                      <td
                        colSpan="9"
                        className="px-4 py-8 text-center text-gray-500">
                        Bronlar topilmadi
                      </td>
                    </tr>
                  ) : (
                    bookings.map((booking) => (
                      <tr
                        key={booking.id || booking._id}
                        className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium">
                          {booking.id || booking._id}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {booking.client?.name || booking.client_name || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {booking.client?.phone_number ||
                            booking.phone_number ||
                            "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {booking.barber?.name || booking.barber_name || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {booking.service?.name ||
                            booking.service_name ||
                            (booking.services && booking.services.length > 0
                              ? booking.services
                                  .map((s) => s.name || s.service_name)
                                  .join(", ")
                              : "N/A")}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {booking.date || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {booking.time || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                              booking.status
                            )}`}>
                            {booking.status || "pending"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex flex-wrap gap-2">
                            {booking.status?.toLowerCase() === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleApprove(booking.id || booking._id)
                                  }
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs">
                                  ✓ Tasdiqlash
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleReject(booking.id || booking._id)
                                  }
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs">
                                  ✗ Rad etish
                                </Button>
                              </>
                            )}
                            <select
                              value={booking.status || "pending"}
                              onChange={(e) =>
                                handleStatusChange(
                                  booking.id || booking._id,
                                  e.target.value
                                )
                              }
                              className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-barber-olive focus:border-barber-olive text-xs">
                              <option value="pending">Kutilmoqda</option>
                              <option value="approved">Tasdiqlangan</option>
                              <option value="rejected">Rad etilgan</option>
                            </select>
                            <Button
                              size="sm"
                              onClick={() =>
                                setDeleteConfirm(booking.id || booking._id)
                              }
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs">
                              🗑️ O'chirish
                            </Button>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-black mb-4">
              Bronni o'chirish
            </h3>
            <p className="text-gray-700 mb-6">
              Bu bronni o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setDeleteConfirm(null)}
                variant="outlined"
                className="border-gray-300 text-gray-700">
                Bekor qilish
              </Button>
              <Button
                onClick={() => handleDelete(deleteConfirm)}
                className="bg-red-600 hover:bg-red-700 text-white">
                O'chirish
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {showAddAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-black mb-4">
              Yangi Admin Qo'shish
            </h3>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleAddAdmin} className="space-y-4">
              <Input
                type="text"
                name="name"
                value={adminForm.name}
                onChange={(e) => handleAdminFormChange("name", e.target.value)}
                label="Ism"
                placeholder="Ism kiriting"
                required
                size="lg"
                disabled={isSubmittingAdmin}
              />

              <Input
                type="text"
                name="tg_username"
                value={adminForm.tg_username}
                onChange={(e) =>
                  handleAdminFormChange("tg_username", e.target.value)
                }
                label="Telegram foydalanuvchi nomi"
                placeholder="@username"
                required
                size="lg"
                disabled={isSubmittingAdmin}
              />

              <Input
                type="tel"
                name="phone_number"
                value={adminForm.phone_number}
                onChange={(e) =>
                  handleAdminFormChange("phone_number", e.target.value)
                }
                label="Telefon raqami"
                placeholder="+998901234567"
                required
                size="lg"
                disabled={isSubmittingAdmin}
              />

              <Input
                type="password"
                name="password"
                value={adminForm.password}
                onChange={(e) =>
                  handleAdminFormChange("password", e.target.value)
                }
                label="Parol"
                placeholder="Parol kiriting"
                required
                size="lg"
                disabled={isSubmittingAdmin}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol
                </label>
                <select
                  value={adminForm.role}
                  onChange={(e) =>
                    handleAdminFormChange("role", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-barber-olive focus:border-barber-olive text-base"
                  disabled={isSubmittingAdmin}>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  type="button"
                  onClick={() => {
                    setShowAddAdmin(false);
                    setAdminForm({
                      name: "",
                      tg_username: "",
                      phone_number: "",
                      password: "",
                      role: "admin",
                    });
                    setError("");
                  }}
                  variant="outlined"
                  className="border-gray-300 text-gray-700"
                  disabled={isSubmittingAdmin}>
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSubmittingAdmin}
                  loading={isSubmittingAdmin}>
                  {isSubmittingAdmin ? "Qo'shilmoqda..." : "Qo'shish"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
      <Analytics />
    </div>
  );
}

export default Admin;
