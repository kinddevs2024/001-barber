import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input } from "@material-tailwind/react";
import { Analytics } from "@vercel/analytics/react";
import { AUTH_BASE_URL, API_ENDPOINTS } from "../data/api";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    tg_username: "",
    phone_number: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch(
        `${AUTH_BASE_URL}${API_ENDPOINTS.register}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
          },
          body: JSON.stringify({
            name: formData.name,
            tg_username: formData.tg_username,
            phone_number: formData.phone_number,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok || response.status === 201) {
        // API returns { token, user } - auto-login the user
        const authToken = data.token || data.access_token || data.accessToken;
        const userData = data.user || data;

        if (authToken && userData) {
          // Auto-login after successful registration
          login(userData, authToken);
          setSuccess(true);
          setFormData({
            name: "",
            tg_username: "",
            phone_number: "",
            password: "",
          });

          // Redirect based on user role
          setTimeout(() => {
            const userRole = userData.role || userData.role_type;
            if (userRole === "SUPER_ADMIN" || userRole === "super_admin") {
              navigate("/super-admin");
            } else if (userRole === "admin" || userData.isAdmin) {
              navigate("/admin");
            } else if (userRole === "client" || !userRole) {
              navigate("/booking");
            } else {
              navigate("/booking");
            }
          }, 1500);
        } else {
          // If no token, redirect to login
          setSuccess(true);
          setFormData({
            name: "",
            tg_username: "",
            phone_number: "",
            password: "",
          });
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        }
      } else {
        setError(
          data.message ||
            data.error ||
            "Ro'yxatdan o'tish muvaffaqiyatsiz. Iltimos, qayta urinib ko'ring."
        );
      }
    } catch (err) {
      setError(
        "Tarmoq xatosi. Iltimos, internet aloqangizni tekshiring va qayta urinib ko'ring."
      );
      console.error("Registration error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  return (
    <div className="pt-16 sm:pt-20 md:pt-[92px] min-h-screen bg-white">
      <section className="w-full py-8 sm:py-10 md:py-12 lg:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[127px]">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg border border-gray-200">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-2 text-center">
                Ro'yxatdan o'tish
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mb-6 text-center">
                Yangi hisob yarating
              </p>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
                  ✅ Ro'yxatdan o'tish muvaffaqiyatli! Yo'naltirilmoqda...
                </div>
              )}

              <form
                onSubmit={handleFormSubmit}
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

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full bg-barber-olive hover:bg-barber-gold text-white font-semibold"
                  loading={isSubmitting}>
                  {isSubmitting
                    ? "Ro'yxatdan o'tilmoqda..."
                    : "Ro'yxatdan o'tish"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Hisobingiz bormi?{" "}
                  <Link
                    to="/login"
                    className="text-barber-olive hover:text-barber-gold font-semibold">
                    Bu yerda kiring
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
      <Analytics />
    </div>
  );
}

export default Register;
