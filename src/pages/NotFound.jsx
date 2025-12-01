import { Link } from "react-router-dom";
import { Button } from "@material-tailwind/react";
import { motion } from "framer-motion";
import { Analytics } from "@vercel/analytics/react";
import Footer from "../components/Footer";

function NotFound() {
  return (
    <div className="pt-16 sm:pt-20 md:pt-[92px] min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16 md:py-20">
        <div className="text-center" data-aos="fade-up">
          <motion.h1
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-6xl xs:text-7xl sm:text-8xl md:text-9xl lg:text-[12rem] font-bold text-barber-gold mb-3 sm:mb-4">
            404
          </motion.h1>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-3 sm:mb-4">
            Sahifa topilmadi
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto px-4">
            Kechirasiz, qidirayotgan sahifangiz mavjud emas yoki ko'chirilgan.
          </p>
          <Link to="/">
            <Button
              size="lg"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-barber-olive text-white rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base hover:bg-barber-gold">
              Bosh sahifaga qaytish
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
      <Analytics />
    </div>
  );
}

export default NotFound;
