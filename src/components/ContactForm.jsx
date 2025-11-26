import { useState } from 'react'
import { Button, Input, Textarea } from '@material-tailwind/react'
import { contactInfo } from '../data/contact'

function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Format message for Telegram (plain text format for better compatibility)
    const telegramMessage = `📋 Yangi Aloqa Formasi\n\n` +
      `👤 Ism: ${formData.name}\n` +
      `📧 Email: ${formData.email}\n` +
      `💬 Xabar:\n${formData.message}\n\n` +
      `📍 Manba: 001 Barbershop Veb-sayt`

    try {
      // Copy message to clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(telegramMessage)
      }
      
      // Open Telegram bot
      const telegramUrl = contactInfo.telegramBot
      window.open(telegramUrl, '_blank')
      
      // Show success message with instructions
      setTimeout(() => {
        alert('✅ Xabar buferga nusxalandi!\n\n📱 Telegram bot ochilmoqda...\n\nIltimos, xabarni yopishtiring (Ctrl+V / Cmd+V) va botga yuboring.')
      }, 100)
      
      // Reset form after a short delay
      setTimeout(() => {
        setFormData({ name: '', email: '', message: '' })
        setIsSubmitting(false)
      }, 500)
    } catch (error) {
      // Fallback: just open Telegram and show message in alert
      const telegramUrl = contactInfo.telegramBot
      window.open(telegramUrl, '_blank')
      
      alert(`📱 Telegram bot ochilmoqda...\n\nIltimos, ushbu xabarni nusxalang va botga yuboring:\n\n${telegramMessage}`)
      
      // Reset form
      setFormData({ name: '', email: '', message: '' })
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <form className="space-y-3 sm:space-y-4 md:space-y-6" onSubmit={handleFormSubmit}>
      <Input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        placeholder="Ismingizni kiriting"
        required
        size="lg"
        className="!text-black !bg-white"
        labelProps={{
          className: "hidden"
        }}
        disabled={isSubmitting}
        aria-label="Your name"
      />
      <Input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        placeholder="Email manzilingizni kiriting"
        required
        size="lg"
        className="!text-black !bg-white"
        labelProps={{
          className: "hidden"
        }}
        disabled={isSubmitting}
        aria-label="Your email address"
      />
      <Textarea
        name="message"
        value={formData.message}
        onChange={handleInputChange}
        placeholder="Xabaringizni kiriting"
        rows={5}
        required
        size="lg"
        className="!text-black !bg-white min-h-[120px]"
        labelProps={{
          className: "hidden"
        }}
        disabled={isSubmitting}
        aria-label="Your message"
      />
      <Button
        type="submit"
        disabled={isSubmitting}
        size="lg"
        className="w-full bg-barber-olive hover:bg-barber-gold text-white font-semibold rounded-xl sm:rounded-2xl text-sm sm:text-base py-3 sm:py-3.5 md:py-4"
        loading={isSubmitting}
      >
        {isSubmitting ? (
          'Yuborilmoqda...'
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
            </svg>
            Telegram orqali yuborish
          </span>
        )}
      </Button>
      <p className="text-white text-xs sm:text-sm opacity-70 text-center">
        Xabaringiz bizning Telegram botimizga yuboriladi
      </p>
    </form>
  )
}

export default ContactForm
