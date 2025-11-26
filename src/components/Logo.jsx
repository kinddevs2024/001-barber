import { Link } from 'react-router-dom'

function Logo({ className = '', linkTo = '/', onClick, variant = 'light' }) {
  // Determine colors based on variant
  const isDark = variant === 'dark'
  const textColor = isDark ? 'text-white' : 'text-black'
  const borderColor = isDark ? 'border-white' : 'border-black'

  const logoContent = (
    <div className={`flex p-5 m-5 md:p-0 md:m-0 flex-col items-start ${className}`}>
      {/* 001 with rectangular outline */}
      <div className="relative inline-block">
        <div className={`border-2 ${borderColor} px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-1 md:py-1`}>
          <span className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-black tracking-tight ${textColor}`}>
            001
          </span>
        </div>
      </div>
      {/* BARBERSHOP text below */}
      <span className={`text-[11px]  font-semibold tracking-wider ${textColor} mt-0.5 sm:mt-1`}>
        BARBERSHOP
      </span>
    </div>
  )

  if (linkTo) {
    return (
      <Link 
        to={linkTo} 
        className="hover:opacity-80 transition-opacity"
        onClick={onClick}
        aria-label="001 Barbershop Home"
      >
        {logoContent}
      </Link>
    )
  }

  return logoContent
}

export default Logo
