import { useState } from 'react'
import { Button, Input } from '@material-tailwind/react'
import { API_BASE_URL, API_ENDPOINTS } from '../data/api'

function RegisterForm() {
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
        }, 5000)
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.message || 'Registration failed. Please try again.')
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.')
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
    // Clear error when user starts typing
    if (error) setError('')
  }

  return (
    <form className="space-y-3 sm:space-y-4 md:space-y-6" onSubmit={handleFormSubmit}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-sm">
          ✅ Registration successful! You can now log in.
        </div>
      )}

      <Input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        placeholder="Enter your name"
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
        type="text"
        name="tg_username"
        value={formData.tg_username}
        onChange={handleInputChange}
        placeholder="Enter your Telegram username (e.g., @username)"
        required
        size="lg"
        className="!text-black !bg-white"
        labelProps={{
          className: "hidden"
        }}
        disabled={isSubmitting}
        aria-label="Telegram username"
      />
      
      <Input
        type="tel"
        name="phone_number"
        value={formData.phone_number}
        onChange={handleInputChange}
        placeholder="Enter your phone number (e.g., +998901234567)"
        required
        size="lg"
        className="!text-black !bg-white"
        labelProps={{
          className: "hidden"
        }}
        disabled={isSubmitting}
        aria-label="Phone number"
      />
      
      <Input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleInputChange}
        placeholder="Enter your password"
        required
        size="lg"
        className="!text-black !bg-white"
        labelProps={{
          className: "hidden"
        }}
        disabled={isSubmitting}
        aria-label="Password"
      />
      
      <Button
        type="submit"
        disabled={isSubmitting}
        size="lg"
        className="w-full bg-barber-olive hover:bg-barber-gold text-white font-semibold rounded-xl sm:rounded-2xl text-sm sm:text-base py-3 sm:py-3.5 md:py-4"
        loading={isSubmitting}
      >
        {isSubmitting ? 'Registering...' : 'Register'}
      </Button>
      
      <p className="text-white text-xs sm:text-sm opacity-70 text-center">
        Create an account to book appointments online
      </p>
    </form>
  )
}

export default RegisterForm

