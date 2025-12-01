import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input } from "@material-tailwind/react";
import { Analytics } from "@vercel/analytics/react";
import { useAuth } from "../context/AuthContext";
import { AUTH_BASE_URL, API_ENDPOINTS } from "../data/api";
import { apiRequest } from "../utils/api";
import Footer from "../components/Footer";

function SuperAdmin() {
  const navigate = useNavigate();
  const { isAuthenticated, isSuperAdmin, logout } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    tg_username: "",
    phone_number: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated() || !isSuperAdmin()) {
      navigate("/");
      return;
    }

    fetchAdmins();
  }, [navigate, isAuthenticated, isSuperAdmin]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch all users and filter for admins
      // Try different possible endpoints
      let response;
      let data;

      try {
        // Try /users/admins endpoint first
        response = await apiRequest(
          "/users/admins",
          {
            method: "GET",
          },
          false
        );

        if (response.ok) {
          data = await response.json();
        } else {
          throw new Error("First endpoint failed");
        }
      } catch {
        try {
          // Try /users endpoint with role filter
          response = await apiRequest(
            "/users?role=admin",
            {
              method: "GET",
            },
            false
          );

          if (response.ok) {
            data = await response.json();
          } else {
            throw new Error("Second endpoint failed");
          }
        } catch {
          try {
            // Try /users endpoint and filter client-side
            response = await apiRequest(
              "/users",
              {
                method: "GET",
              },
              false
            );

            if (response.ok) {
              data = await response.json();
            } else {
              throw new Error("All endpoints failed");
            }
          } catch {
            throw new Error("Adminlarni yuklash muvaffaqiyatsiz");
          }
        }
      }

      const adminsList = Array.isArray(data)
        ? data
        : data.data || data.admins || data.users || [];
      setAdmins(adminsList.filter((u) => u.role === "admin"));
    } catch (err) {
      console.error("Error fetching admins:", err);
      setError(err.message || "Adminlarni yuklash muvaffaqiyatsiz");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Register new admin with admin role
      const response = await fetch(
        `${AUTH_BASE_URL}${API_ENDPOINTS.register}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            name: formData.name,
            tg_username: formData.tg_username,
            phone_number: formData.phone_number,
            password: formData.password,
            role: "admin", // Set role as admin
          }),
          mode: "cors",
        }
      );

      const data = await response.json();

      if (response.ok || response.status === 201) {
        setSuccess("Admin muvaffaqiyatli qo'shildi!");
        setFormData({
          name: "",
          tg_username: "",
          phone_number: "",
          password: "",
        });
        setShowAddForm(false);
        fetchAdmins(); // Refresh admin list
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(
          data.message || data.error || "Admin qo'shish muvaffaqiyatsiz"
        );
      }
    } catch (err) {
      console.error("Error adding admin:", err);
      setError("Tarmoq xatosi. Iltimos, qayta urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm("Bu adminni o'chirishni xohlaysizmi?")) {
      return;
    }

    try {
      setError("");
      // Assuming there's a delete endpoint
      const response = await apiRequest(
        `/users/${adminId}`,
        {
          method: "DELETE",
        },
        false
      );

      if (response.ok) {
        setSuccess("Admin muvaffaqiyatli o'chirildi!");
        fetchAdmins(); // Refresh admin list
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.message || "Adminni o'chirish muvaffaqiyatsiz");
      }
    } catch (err) {
      console.error("Error deleting admin:", err);
      setError("Tarmoq xatosi. Iltimos, qayta urinib ko'ring.");
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
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
    <div className="pt-16 sm:pt-20 md:pt-[92px] min-h-screen bg-white">
      <section className="w-full py-8 sm:py-10 md:py-12 lg:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[127px]">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black">
              Super Admin Boshqaruv Paneli
            </h1>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate("/admin")}
                size="sm"
                className="bg-barber-olive hover:bg-barber-gold">
                Admin paneli
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

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
              {success}
            </div>
          )}

          <div className="mb-6">
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-barber-olive hover:bg-barber-gold text-white">
              {showAddForm ? "Formani yopish" : "+ Yangi admin qo'shish"}
            </Button>
          </div>

          {showAddForm && (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg border border-gray-200 mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-black mb-6">
                Yangi admin qo'shish
              </h2>
              <form
                onSubmit={handleAddAdmin}
                className="space-y-4 sm:space-y-5 md:space-y-6">
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  label="To'liq ism"
                  required
                  size="lg"
                  disabled={isSubmitting}
                />

                <Input
                  type="text"
                  name="tg_username"
                  value={formData.tg_username}
                  onChange={handleInputChange}
                  label="Telegram foydalanuvchi nomi"
                  placeholder="@username"
                  required
                  size="lg"
                  disabled={isSubmitting}
                />

                <Input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  label="Telefon raqami"
                  placeholder="+998901234567"
                  required
                  size="lg"
                  disabled={isSubmitting}
                />

                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  label="Parol"
                  required
                  size="lg"
                  disabled={isSubmitting}
                />

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    size="lg"
                    className="bg-barber-olive hover:bg-barber-gold text-white font-semibold"
                    loading={isSubmitting}>
                    {isSubmitting ? "Qo'shilmoqda..." : "Admin qo'shish"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({
                        name: "",
                        tg_username: "",
                        phone_number: "",
                        password: "",
                      });
                      setError("");
                    }}
                    size="lg"
                    variant="outlined"
                    className="border-gray-300 text-gray-700">
                    Bekor qilish
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-barber-dark text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Ism
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Telegram
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Telefon
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Rol
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Amallar
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {admins.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-4 py-8 text-center text-gray-500">
                        Adminlar topilmadi
                      </td>
                    </tr>
                  ) : (
                    admins.map((admin) => (
                      <tr
                        key={admin.id || admin._id}
                        className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">
                          {admin.id || admin._id}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {admin.name || admin.fullName || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {admin.tg_username ||
                            admin.telegram_username ||
                            "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {admin.phone_number || admin.phone || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            {admin.role || "admin"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleDeleteAdmin(admin.id || admin._id)
                            }
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs">
                            O'chirish
                          </Button>
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
      <Analytics />
    </div>
  );
}

export default SuperAdmin;
