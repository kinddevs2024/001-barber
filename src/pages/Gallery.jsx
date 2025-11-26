import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@material-tailwind/react'
import { galleryServices, pricingData } from '../data'
import { imagePool, getImagesInOrder } from '../data/images'
import ContactForm from '../components/ContactForm'
import RegisterModal from '../components/RegisterModal'
import Footer from '../components/Footer'

function Gallery() {
  const galleryPricing = pricingData.slice(8, 16)
  const [registerModalOpen, setRegisterModalOpen] = useState(false)

  const handleRegisterModal = () => setRegisterModalOpen((cur) => !cur)

  return (
    <div className="pt-16 sm:pt-20 md:pt-[92px]">
      {/* Our Services Section */}
      <section className="w-full bg-white py-8 sm:py-10 md:py-12 lg:py-16" data-aos="fade-up">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[127px]">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black text-center mb-6 sm:mb-8 md:mb-12">Bizning Xizmatlarimiz</h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {galleryServices.map((service, i) => (
              <motion.div
                key={service.id}
                className="relative rounded-2xl sm:rounded-3xl overflow-hidden"
                data-aos="zoom-in"
                data-aos-delay={i * 100}
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-full h-[200px] xs:h-[220px] sm:h-[250px] md:h-[280px] lg:h-[300px] relative">
                  <img 
                    src={getImagesInOrder(galleryServices.length)[i]} 
                    alt={service.label} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 py-2 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6">
                  <div className="text-white font-semibold text-sm sm:text-base md:text-lg">{service.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="w-full bg-barber-dark py-8 sm:py-10 md:py-12 lg:py-16" data-aos="fade-up">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[127px]">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-6 sm:mb-8 md:mb-12">Eng Yaxshi Soch Olish va Qirqish Xizmatlarini Boshdan Kechiring</h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {getImagesInOrder(9).map((imgSrc, i) => (
              <motion.div
                key={i}
                className="w-full h-[200px] xs:h-[220px] sm:h-[250px] md:h-[280px] lg:h-[300px] rounded-2xl sm:rounded-3xl overflow-hidden"
                data-aos="zoom-in"
                data-aos-delay={i * 50}
                whileHover={{ scale: 1.05 }}
              >
                <img 
                  src={imgSrc} 
                  alt={`Gallery image ${i + 1}`} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="w-full bg-barber-olive py-8 sm:py-10 md:py-12 lg:py-16" data-aos="fade-up">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[127px]">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black text-center mb-6 sm:mb-8 md:mb-12">Narxlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 max-w-4xl mx-auto">
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              {galleryPricing.slice(0, 4).map((item, i) => (
                <div key={item.id} className="flex justify-between items-center py-2 sm:py-3 border-b border-black border-opacity-20" data-aos="fade-up" data-aos-delay={i * 50}>
                  <span className="text-black font-medium text-sm sm:text-base">{item.name}</span>
                  <span className="text-black font-semibold text-sm sm:text-base">{item.price}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              {galleryPricing.slice(4, 8).map((item, i) => (
                <div key={item.id} className="flex justify-between items-center py-2 sm:py-3 border-b border-black border-opacity-20" data-aos="fade-up" data-aos-delay={i * 50}>
                  <span className="text-black font-medium text-sm sm:text-base">{item.name}</span>
                  <span className="text-black font-semibold text-sm sm:text-base">{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="w-full bg-barber-dark py-8 sm:py-10 md:py-12 lg:py-16" data-aos="fade-up">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[127px] grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
          <div className="w-full h-[300px] xs:h-[450px] sm:h-[400px] md:h-[450px] lg:h-[500px] xl:h-[600px] rounded-2xl sm:rounded-3xl overflow-hidden order-2 lg:order-1" data-aos="fade-right">
            <img 
              src={imagePool[3]} 
              alt="Contact 001 Barbershop" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col justify-center order-1 lg:order-2" data-aos="fade-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 md:mb-8">Biz bilan bog'laning!</h2>
            <ContactForm />
          </div>
        </div>
      </section>

      <Footer />
      <RegisterModal open={registerModalOpen} handleOpen={handleRegisterModal} />
    </div>
  )
}

export default Gallery
