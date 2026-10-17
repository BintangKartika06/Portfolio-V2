import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function FullscreenNav({ isOpen, onClose, buttonCoords }) {
  const overlayRef = useRef(null)
  const linksRef = useRef([])
  const timelineRef = useRef(null)

  useEffect(() => {
    if (!overlayRef.current) return

    const overlay = overlayRef.current
    const links = linksRef.current

    const originX = buttonCoords?.x ?? window.innerWidth - 60
    const originY = buttonCoords?.y ?? 40

    if (isOpen) {
      document.body.style.overflow = 'hidden'

      if (timelineRef.current) timelineRef.current.kill()

      const tl = gsap.timeline()
      timelineRef.current = tl

      tl.set(overlay, {
        pointerEvents: 'auto',
        visibility: 'visible',
      })
      .fromTo(
        overlay,
        {
          clipPath: `circle(0% at ${originX}px ${originY}px)`,
        },
        {
          clipPath: `circle(160% at ${originX}px ${originY}px)`,
          duration: 0.75,
          ease: 'power4.inOut',
        }
      )
      .fromTo(
        links,
        {
          opacity: 0,
          y: 45,
          scale: 0.96,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          stagger: 0.07,
          ease: 'power3.out',
        },
        '-=0.35'
      )
    } else {
      document.body.style.overflow = ''

      if (timelineRef.current) timelineRef.current.kill()

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(overlay, {
            pointerEvents: 'none',
            visibility: 'hidden',
          })
        },
      })
      timelineRef.current = tl

      tl.to(links, {
        opacity: 0,
        y: -15,
        duration: 0.2,
        ease: 'power2.in',
      })
      .to(
        overlay,
        {
          clipPath: `circle(0% at ${originX}px ${originY}px)`,
          duration: 0.6,
          ease: 'power4.inOut',
        },
        '-=0.08'
      )
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, buttonCoords])

  const menuItems = [
    { number: '01', label: 'GITHUB', href: 'https://github.com' },
    { number: '02', label: 'UPWORK', href: 'https://upwork.com' },
    { number: '03', label: 'LINKEDIN', href: 'https://linkedin.com' },
    { number: '04', label: 'MAIL', href: 'mailto:contact@bintangkartika.com' },
  ]

  return (
    <nav
      ref={overlayRef}
      id="nav-overlay"
      aria-label="Navigation Overlay"
      className="fixed inset-0 z-[110] bg-[#0A0A0A] text-white flex flex-col justify-center p-6 sm:p-14 md:px-20 pointer-events-none"
      style={{
        clipPath: 'circle(0% at 100% 0%)',
        visibility: 'hidden',
      }}
    >
      <div className="flex flex-col items-center justify-center space-y-8 my-auto text-center">
        {menuItems.map((item, idx) => (
          <a
            key={item.number}
            ref={(el) => (linksRef.current[idx] = el)}
            href={item.href}
            target={item.href.startsWith('http') ? '_blank' : '_self'}
            rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            onClick={onClose}
            className="group flex items-baseline justify-center space-x-4 transition-transform duration-300 hover:scale-105 cursor-pointer select-none"
          >
            <span className="text-xs sm:text-sm font-mono text-zinc-500 tracking-widest font-normal group-hover:text-zinc-300 transition-colors">
              {item.number}
            </span>
            <span
              style={{ fontFamily: "var(--font-serif-headline), serif" }}
              className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-wider text-zinc-200 group-hover:text-white uppercase transition-colors relative"
            >
              {item.label}
              <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full" />
            </span>
          </a>
        ))}
      </div>
    </nav>
  )
}
