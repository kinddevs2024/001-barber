import { useState } from 'react'
import { Button, Input, Dialog, DialogHeader, DialogBody, DialogFooter } from '@material-tailwind/react'
import { API_BASE_URL, API_ENDPOINTS } from '../data/api'

function RegisterModal({ open, handleOpen }) {
  const [formData, setFormData] = useState({ 
    name: '', 
    tg_username: '', 
    phone_number: '', 
    password: '' 
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.register}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          tg_username: formData.tg_username,
          phone_number: formData.phone_number,
          password: formData.password
        })
      })

      if (response.ok) {
        setSuccess(true)
        setFormData({ name: '', tg_username: '', phone_number: '', password: '' })
        setTimeout(() => {
          setSuccess(false)
          handleOpen()
        }, 2000)
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.message || 'Ro\'yxatdan o\'tish muvaffaqiyatsiz. Iltimos, qayta urinib ko\'ring.')
      }
    } catch (error) {
      setError('Tarmoq xatosi. Iltimos, internet aloqangizni tekshiring va qayta urinib ko\'ring.')
      console.error('Registration error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError('')
  }

  const handleClose = () => {
    setFormData({ name: '', tg_username: '', phone_number: '', password: '' })
    setError('')
    setSuccess(false)
    handleOpen()
  }

  return (
    <Dialog open={open} handler={handleOpen} size="md" className="max-w-md">
      <DialogHeader className="text-2xl font-bold text-black">Onlayn bron qilish uchun ro'yxatdan o'tish</DialogHeader>
      <DialogBody>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-sm">
              ✅ Ro'yxatdan o'tish muvaffaqiyatli! Endi tizimga kirishingiz mumkin.
            </div>
          )}

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
            loading={isSubmitting}
          >
            {isSubmitting ? 'Ro\'yxatdan o\'tilmoqda...' : 'Ro\'yxatdan o\'tish'}
          </Button>
        </form>
      </DialogBody>
      <DialogFooter>
        <Button
          variant="text"
          color="red"
          onClick={handleClose}
          className="mr-1"
        >
          Yopish
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

export default RegisterModal

