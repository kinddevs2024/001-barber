import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    // Always scroll to top first when pathname changes
    window.scrollTo(0, 0)
    
    // If there's a hash, wait a bit then scroll to the hash element smoothly
    if (hash) {
      const timer = setTimeout(() => {
        const element = document.getElementById(hash.substring(1))
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [pathname, hash])

  return null
}

export default ScrollToTop

