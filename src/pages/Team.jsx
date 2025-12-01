import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@material-tailwind/react";
import { motion } from "framer-motion";
import { Analytics } from "@vercel/analytics/react";
import { barbersData, contactInfo } from "../data";
import { imagePool, getImagesInOrder } from "../data/images";
import { API_BASE_URL, API_ENDPOINTS, BARBERS_BASE_URL } from "../data/api";
import ContactForm from "../components/ContactForm";
import RegisterModal from "../components/RegisterModal";
import Footer from "../components/Footer";

function Team() {
  const navigate = useNavigate();
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `${BARBERS_BASE_URL}${API_ENDPOINTS.barbers}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch barbers");
        }

        const data = await response.json();
        // Handle both array response and object with data property
        const barbersList = Array.isArray(data)
          ? data
          : data.data || data.barbers || [];
        setBarbers(barbersList);
      } catch (err) {
        console.error("Error fetching barbers:", err);
        setError(err.message);
        // Fallback to static data on error
        setBarbers(barbersData);
      } finally {
        setLoading(false);
      }
    };

    fetchBarbers();
  }, []);

  // Use API barbers if available, otherwise fallback to static data
  const displayBarbers = barbers.length > 0 ? barbers : barbersData;
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  const handleRegisterModal = () => setRegisterModalOpen((cur) => !cur);

  return (
    <div className="pt-16 sm:pt-20 md:pt-[92px]">
      {/* About Us Section */}
      <section
        className="w-full bg-white py-8 sm:py-10 md:py-12 lg:py-16"
        data-aos="fade-up">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[127px] grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
          <div className="order-2 lg:order-1" data-aos="fade-right">
            <div className="text-xs sm:text-sm font-semibold text-barber-gold mb-3 sm:mb-4 tracking-wider">
              BIZ HAQIMIZDA
            </div>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-bold text-black mb-4 sm:mb-6 md:mb-8 leading-tight">
              Litsenziyalangan Professional Barberlar
            </h1>
            <p className="text-black text-base sm:text-lg mb-4 sm:mb-6 opacity-80">
              Toshkentdagi tajribali barberlar jamoamiz har bir soch olishga
              yillik tajriba va ehtiros olib keladi. {contactInfo.description}{" "}
              Biz eng yuqori sifatli parvarish xizmatlarini taqdim etishga
              sodiqmiz.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/booking")}
              className="w-full sm:w-auto px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-black text-white rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base hover:bg-gray-800"
              aria-label="Book an appointment">
              VAQT BELGILASH
            </Button>
          </div>
          <div
            className="w-full h-[400px] xs:h-[450px] sm:h-[500px] md:h-[600px] lg:h-[700px] rounded-2xl sm:rounded-3xl overflow-hidden order-1 lg:order-2"
            data-aos="fade-left">
            <img
              src={imagePool[0]}
              alt="Professional barbers at 001 Barbershop"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Our Barbers Section */}
      <section
        className="w-full bg-barber-olive py-8 sm:py-10 md:py-12 lg:py-16"
        data-aos="fade-up">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[127px]">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-6 sm:mb-8 md:mb-12">
            Bizning Barberlarimiz
          </h2>

          {loading && (
            <div className="text-center py-12">
              <p className="text-white text-lg">Barberlar yuklanmoqda...</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-4 mb-6">
              <p className="text-yellow-300 text-sm">
                ⚠️ {error}. Standart ma'lumotlar ishlatilmoqda.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {displayBarbers.map((barber, i) => {
              // Handle both API response format and static data format
              const barberId = barber.id || barber._id || i + 1;
              const barberName = barber.name || barber.fullName || "Barber";
              const barberRole =
                barber.role || barber.position || barber.specialty || "Barber";
              const barberDescription =
                barber.description ||
                barber.bio ||
                barber.about ||
                "Professional barber with years of experience.";
              const barberImage =
                barber.image ||
                barber.photo ||
                barber.avatar ||
                getImagesInOrder(displayBarbers.length)[i];
              const instagramUrl =
                barber.social?.instagram ||
                barber.instagram ||
                barber.socialMedia?.instagram ||
                "https://www.instagram.com/001_barbershop_";

              return (
                <motion.div
                  key={barberId}
                  className="bg-barber-dark rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 overflow-hidden"
                  data-aos="zoom-in"
                  data-aos-delay={i * 100}
                  whileHover={{ y: -10 }}>
                  <div className="w-full h-[200px] xs:h-[220px] sm:h-[250px] md:h-[280px] lg:h-[300px] rounded-xl sm:rounded-2xl mb-3 sm:mb-4 overflow-hidden">
                    <img
                      src={barberImage}
                      alt={barberName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1 uppercase">
                    {barberName}
                  </h3>
                  <p className="text-barber-gold mb-2 sm:mb-3 md:mb-4 text-sm sm:text-base">
                    {barberRole}
                  </p>
                  <p className="text-white text-xs sm:text-sm mb-3 sm:mb-4 md:mb-6 opacity-80">
                    {barberDescription}
                  </p>
                  <div className="flex gap-2 sm:gap-3 md:gap-4">
                    {[...Array(3)].map((_, j) => (
                      <a
                        key={j}
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-barber-gold rounded-full flex items-center justify-center hover:bg-barber-olive transition-colors touch-manipulation"
                        aria-label={`${barberName} Instagram`}>
                        <svg
                          className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Full Service Section */}
      <section
        className="w-full bg-barber-dark py-8 sm:py-10 md:py-12 lg:py-16"
        data-aos="fade-up">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[127px]">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 md:mb-6 text-left">
            To'liq xizmat ko'rsatadigan barbershop va erkaklar parvarish
            studiyasi
          </h2>
          <p className="text-white text-sm sm:text-base md:text-lg mb-4 sm:mb-6 md:mb-8 text-left opacity-90 max-w-3xl">
            Toshkentdagi {contactInfo.tagline} da biz to'liq parvarish
            xizmatlari assortimentini taklif qilamiz. Klassik soch olishdan
            zamonaviy uslublargacha, issiq sochiq bilan qirqishdan soqol
            tuzatishgacha, bizning malakali barberlarimiz sizga eng yaxshi
            ko'rinish va his qilishda yordam berish uchun bu yerda.
          </p>
          <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-start">
            <Button
              size="lg"
              variant="filled"
              onClick={() => navigate("/#narxlar")}
              className="w-full xs:w-auto px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-white text-black rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base hover:bg-gray-100"
              aria-label="View pricing">
              Narxlarni ko'rish
            </Button>
            <Button
              size="lg"
              variant="outlined"
              onClick={() => navigate("/booking")}
              className="w-full xs:w-auto px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-transparent border-2 border-white text-white rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base hover:bg-white hover:text-black"
              aria-label="Book an appointment online">
              Onlayn bron qilish
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        className="w-full bg-barber-dark py-8 sm:py-10 md:py-12 lg:py-16"
        data-aos="fade-up">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[127px] grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
          <div
            className="w-full h-[300px] xs:h-[450px] sm:h-[400px] md:h-[450px] lg:h-[500px] xl:h-[600px] rounded-2xl sm:rounded-3xl overflow-hidden order-2 lg:order-1"
            data-aos="fade-right">
            <img
              src={imagePool[4]}
              alt="Contact 001 Barbershop"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div
            className="flex flex-col justify-center order-1 lg:order-2"
            data-aos="fade-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 md:mb-8">
              Biz bilan bog'laning!
            </h2>
            <ContactForm />
          </div>
        </div>
      </section>

      <Footer />
      <RegisterModal
        open={registerModalOpen}
        handleOpen={handleRegisterModal}
      />
      <Analytics />
    </div>
  );
}

export default Team;
