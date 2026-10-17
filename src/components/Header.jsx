import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import siteLogo from '../assets/SiteLogo.svg'

export default function Header({ isNavOpen, onToggleMenu, isReady, onHomeClick }) {
  const headerRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    if (!isReady || !headerRef.current) return

    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: -25 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }
    )
  }, [isReady])

  const handleLogoClick = (e) => {
    e.preventDefault()
    if (onHomeClick) {
      onHomeClick()
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      if (window.location.pathname === '/' && !window.location.hash && !window.location.search) {
        window.location.reload()
      } else {
        window.location.href = '/'
      }
    }
  }

  const handleToggle = (e) => {
    e.stopPropagation()
    let coords = null
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      coords = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      }
    }
    onToggleMenu(coords)
  }

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-[120] h-20 flex items-center justify-between px-6 sm:px-10 md:px-14 lg:px-20 bg-transparent pointer-events-none mix-blend-difference transition-opacity duration-300 ${
        isReady ? 'opacity-100' : 'opacity-0'
      }`}
      data-purpose="top-navigation"
    >
      <a
        href="/"
        onClick={handleLogoClick}
        aria-label="Reload Bintang Kartika Home"
        className="pointer-events-auto flex items-center group cursor-pointer"
      >
        <div className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center">
          <img
            src={siteLogo}
            alt="Bk Monogram Logo"
            className="w-full h-full object-contain brightness-0 invert transition-opacity duration-300 group-hover:opacity-75"
          />
        </div>
      </a>

      <button
        ref={buttonRef}
        type="button"
        aria-label={isNavOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
        onClick={handleToggle}
        className="pointer-events-auto flex flex-col justify-center items-center w-12 h-12 bg-transparent border-none cursor-pointer p-2 focus:outline-none"
      >
        <div className="w-7 h-5 relative flex flex-col justify-between items-end">
          <span
            className={`h-[2px] rounded-full block bg-white transition-transform duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] origin-center ${
              isNavOpen
                ? 'w-7 translate-y-[9px] rotate-45'
                : 'w-7 translate-y-0 rotate-0'
            }`}
          />
          <span
            className={`h-[2px] rounded-full block bg-white transition-all duration-300 ease-out ${
              isNavOpen
                ? 'w-0 opacity-0'
                : 'w-4.5 opacity-100'
            }`}
          />
          <span
            className={`h-[2px] rounded-full block bg-white transition-transform duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] origin-center ${
              isNavOpen
                ? 'w-7 -translate-y-[9px] -rotate-45'
                : 'w-7 translate-y-0 rotate-0'
            }`}
          />
        </div>
      </button>
    </header>
  )
}
