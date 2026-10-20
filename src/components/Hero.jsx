import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function Hero({ isReady }) {
  const sectionRef = useRef(null)
  const availableRef = useRef(null)
  const quoteRef = useRef(null)
  const webDevRef = useRef(null)
  const headlineInnerRef = useRef(null)

  useEffect(() => {
    if (!isReady) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.15 })

      tl.fromTo(
        availableRef.current,
        { opacity: 0, y: -20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power2.out', force3D: true }
      )
        .fromTo(
          quoteRef.current,
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, duration: 1.0, ease: 'power3.out', force3D: true },
          '-=0.6'
        )
        .fromTo(
          webDevRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', force3D: true },
          '-=0.6'
        )
        .fromTo(
          headlineInnerRef.current,
          {
            y: '100%',
            opacity: 0,
          },
          {
            y: '0%',
            opacity: 1,
            duration: 1.3,
            ease: 'power4.out',
            force3D: true,
          },
          '-=0.7'
        )
    }, sectionRef)

    return () => ctx.revert()
  }, [isReady])

  return (
    <section
      ref={sectionRef}
      className="min-h-[calc(115vh-6rem)] sm:min-h-[calc(110vh-8rem)] flex flex-col justify-between pt-2 sm:pt-4 pb-2 md:pb-4"
      data-purpose="hero-statement"
      id="hero"
    >
      {/* Top: Available for freelance badge (elevated up towards header) */}
      <div
        ref={availableRef}
        className={`text-center w-full -mt-2 sm:-mt-8 lg:-mt-10 mb-4 sm:mb-6 ${
          isReady ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="inline-flex items-center space-x-2 text-center text-xs tracking-widest text-zinc-600 font-normal uppercase py-1 px-4 rounded-full bg-zinc-100/70">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-medium tracking-[0.2em]">
            Available for freelance
          </span>
        </div>
      </div>

      {/* Middle: Editorial quote */}
      <div className="flex-grow flex items-center justify-start w-full my-6 sm:my-10">
        <div
          ref={quoteRef}
          className={`max-w-xl ${
            isReady ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <p
            style={{ fontFamily: "var(--font-serif-editorial), serif" }}
            className="italic text-zinc-700 text-xl sm:text-2xl leading-relaxed"
          >
            <span
              style={{ fontFamily: "var(--font-serif-headline), serif" }}
              className="text-3xl not-italic text-black font-semibold mr-1"
            >
              “
            </span>{' '}
            Turning complex ideas into simple,<br />
            beautiful digital experiences.<br />
          </p>
        </div>
      </div>

      {/* Above Headline: Web Developer label */}
      <div
        ref={webDevRef}
        className={`text-center w-full mb-3 md:mb-5 ${
          isReady ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="text-xs sm:text-sm md:text-base tracking-[0.22em] font-normal text-zinc-500 uppercase">
          Web Developer
        </span>
      </div>

      {/* Bottom: BINTANG KARTIKA headline with peek-above-fold effect */}
      <div className="overflow-hidden pb-1 sm:pb-3">
        <div
          ref={headlineInnerRef}
          className={`will-change-transform ${isReady ? 'opacity-100' : 'opacity-0'}`}
        >
          <h1
            style={{ fontFamily: "var(--font-serif-headline), 'EB Garamond', serif" }}
            className="font-normal text-left sm:text-center text-black uppercase tracking-tight select-none transform transition-transform duration-700 hover:scale-[1.008]"
          >
            <span className="hidden md:block whitespace-nowrap text-[clamp(3.5rem,8.6vw,11.5rem)] leading-none">
              BINTANG KARTIKA
            </span>
            <span className="block md:hidden headline-giant text-left sm:text-center">
              BINTANG
              <div>KARTIKA</div>
            </span>
          </h1>
        </div>
      </div>
    </section>
  )
}
