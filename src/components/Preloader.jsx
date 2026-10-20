import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import logoLoadScreen from '../assets/Logo_LoadScreen.svg'

export default function Preloader({ onComplete }) {
  const [isHidden, setIsHidden] = useState(false)
  const containerRef = useRef(null)
  const logoWrapperRef = useRef(null)
  const curtainWhiteRef = useRef(null)
  const curtainZincRef = useRef(null)
  const curtainBlackRef = useRef(null)

  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
      })

      gsap.set([curtainWhiteRef.current, curtainZincRef.current, curtainBlackRef.current], {
        yPercent: 0,
      })

      gsap.set(logoWrapperRef.current, {
        opacity: 0,
        y: 8,
        scale: 0.97,
        force3D: true,
      })

      tl.to(logoWrapperRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.4,
        ease: 'power2.out',
        force3D: true,
        delay: 0.15,
      })

      .to(logoWrapperRef.current, {
        scale: 1.015,
        duration: 0.35,
        ease: 'sine.out',
        force3D: true,
      })

      .to(
        curtainWhiteRef.current,
        {
          yPercent: -100,
          duration: 0.95,
          ease: 'power4.inOut',
          force3D: true,
        }
      )
      .to(
        logoWrapperRef.current,
        {
          y: -60,
          duration: 0.95,
          ease: 'power4.inOut',
          force3D: true,
        },
        '<'
      )
      // 4. Zinc curtain slides up (creates the layered stripe effect)
      .to(
        curtainZincRef.current,
        {
          yPercent: -100,
          duration: 0.95,
          ease: 'power4.inOut',
          force3D: true,
        },
        '-=0.8'
      )
      // 5. Black curtain slides up (completes the stepped layered curtain sequence)
      .to(
        curtainBlackRef.current,
        {
          yPercent: -100,
          duration: 0.95,
          ease: 'power4.inOut',
          force3D: true,
          onStart: () => {
            setTimeout(() => {
              if (onCompleteRef.current) {
                onCompleteRef.current()
              }
            }, 200)
          },
          onComplete: () => {
            setIsHidden(true)
          },
        },
        '-=0.8'
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  if (isHidden) return null

  return (
    <aside
      ref={containerRef}
      aria-label="Loading portfolio"
      className="fixed inset-0 z-[9999] pointer-events-auto overflow-hidden select-none"
    >
      <div
        ref={curtainBlackRef}
        className="absolute inset-0 bg-[#070707] will-change-transform transform-gpu z-10"
      />

      <div
        ref={curtainZincRef}
        className="absolute inset-0 bg-zinc-900 will-change-transform transform-gpu z-20 border-b border-white/5"
      />

      <div
        ref={curtainWhiteRef}
        className="absolute inset-0 bg-white flex items-center justify-center will-change-transform transform-gpu z-30 border-b border-black/5"
      >
        <div
          ref={logoWrapperRef}
          className="flex items-center justify-center px-6 will-change-transform transform-gpu"
        >
          <img
            src={logoLoadScreen}
            alt="Bintang Kartika Logo"
            className="w-44 sm:w-56 md:w-64 max-w-[80vw] h-auto object-contain select-none pointer-events-none"
            draggable="false"
          />
        </div>
      </div>
    </aside>
  )
}
