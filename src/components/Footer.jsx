import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import siteLogo from '../assets/SiteLogo.svg'

gsap.registerPlugin(ScrollTrigger)

export default function Footer({ onNavigatePlayground }) {
  const footerRootRef = useRef(null)
  const pinSectionRef = useRef(null)
  const containerRef = useRef(null)
  const introRef = useRef(null)
  const introContentRef = useRef(null)
  const svgRef = useRef(null)
  const pathRef = useRef(null)
  const textRef = useRef(null)
  const textPathRef = useRef(null)
  const textPart1Ref = useRef(null)
  const textPart2Ref = useRef(null)
  const orbRef = useRef(null)
  const footerCardRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const pinSection = pinSectionRef.current
      const container = containerRef.current
      const intro = introRef.current
      const introContent = introContentRef.current
      const svg = svgRef.current
      const path = pathRef.current
      const text = textRef.current
      const textPath = textPathRef.current
      const textPart1 = textPart1Ref.current
      const textPart2 = textPart2Ref.current
      const orb = orbRef.current
      const footerCard = footerCardRef.current

      if (!pinSection || !container || !svg || !path || !text || !textPath || !footerCard) return

      const viewBoxWidth = 3898
      const viewBoxHeight = 891

      // Binary search along path for given X coordinate
      const findLengthAtX = (targetX) => {
        let start = 0
        let end = path.getTotalLength()
        for (let i = 0; i < 24; i++) {
          const mid = (start + end) / 2
          if (path.getPointAtLength(mid).x < targetX) {
            start = mid
          } else {
            end = mid
          }
        }
        return (start + end) / 2
      }

      const clampNormalize = (val, min, max) => {
        return Math.min(Math.max((val - min) / (max - min), 0), 1)
      }

      const part1 = 'Clean code, clean design, '
      const part2 = 'seamless experience'
      const part1Chars = part1.split('')
      const part2Chars = part2.split('')
      const totalChars = part1Chars.length + part2Chars.length

      let samplePoints = []
      let endPoint = { x: 0, y: 0 }
      const bCoord = { x: 0, y: 0 }
      const originCoord = { x: 0, y: 0 }
      let maxRadius = 800
      let lastCharIndex = -1

      const currentViewBox = { x: 0, y: 0 }

      const applyViewBox = () => {
        if (svg) {
          svg.setAttribute(
            'viewBox',
            `${currentViewBox.x} ${currentViewBox.y} ${viewBoxWidth} ${viewBoxHeight}`
          )
        }
      }

      const quickToY = gsap.quickTo(currentViewBox, 'y', { duration: 0.25, ease: 'power1.out' })
      const quickToX = gsap.quickTo(currentViewBox, 'x', {
        duration: 0.25,
        ease: 'power1.out',
        onUpdate: applyViewBox,
      })

      let H = -200

      const computeH = () => {
        if (!container || !footerCard || !svg) return -200
        const cRect = container.getBoundingClientRect()
        const fRect = footerCard.getBoundingClientRect()
        const t = (fRect.top - cRect.top) / 2
        const r = cRect.height / 2
        const ctm = svg.getScreenCTM()
        return ctm ? (t - r) / Math.abs(ctm.d) : -200
      }

      const measureAndInit = () => {
        // Temporarily populate text to measure exact end position
        textPart1.textContent = part1
        textPart2.textContent = part2 + '.'

        let measuredLen = 0
        try {
          const charCount = text.getNumberOfChars()
          if (charCount > 0) {
            const endPos = text.getEndPositionOfChar(charCount - 1)
            measuredLen = findLengthAtX(endPos.x)
          } else {
            measuredLen = path.getTotalLength() * 0.72
          }
        } catch {
          measuredLen = path.getTotalLength() * 0.72
        }

        // Clear text back to empty
        textPart1.textContent = ''
        textPart2.textContent = ''
        lastCharIndex = -1

        endPoint = path.getPointAtLength(measuredLen)

        // Precompute 1000 trajectory points along the curve
        samplePoints = []
        const totalSamples = 1000
        for (let i = 0; i < totalSamples; i++) {
          const pt = path.getPointAtLength((i / (totalSamples - 1)) * measuredLen)
          samplePoints.push({ x: pt.x, y: pt.y })
        }

        // Guillaume Zhu exact coordinate calculation for landing in footer center
        const fRect = footerCard.getBoundingClientRect()
        const svgRect = svg.getBoundingClientRect()
        const fMidX = fRect.left + fRect.width / 2
        const fMidY = fRect.top + fRect.height / 2

        bCoord.x = (fMidX - svgRect.left) * (viewBoxWidth / (svgRect.width || 1))
        bCoord.y = (fMidY - svgRect.top) * (viewBoxHeight / (svgRect.height || 1))

        H = computeH()
        maxRadius = Math.hypot(fRect.width / 2, fRect.height / 2) + 40

        if (orb) {
          orb.setAttribute('cx', endPoint.x)
          orb.setAttribute('cy', endPoint.y)
        }
      }

      const runInit = () => {
        measureAndInit()
        applyViewBox()
      }

      if (document.fonts) {
        document.fonts.ready.then(runInit)
      } else {
        runInit()
      }

      // Initial state
      if (introContent) {
        introContent.style.opacity = '1'
        introContent.style.transform = 'translateY(0px) scale(1)'
      }
      if (intro) {
        intro.style.pointerEvents = 'auto'
      }

      gsap.set(footerCard, {
        clipPath: 'circle(0px at 50% 50%)',
        WebkitClipPath: 'circle(0px at 50% 50%)',
        pointerEvents: 'none',
      })
      if (orb) {
        gsap.set(orb, { autoAlpha: 0 })
      }

      // Main ScrollTrigger for pinning and progressive scroll reveal (Guillaume Zhu exact sequence)
      ScrollTrigger.create({
        trigger: pinSection,
        start: 'top top',
        end: 'bottom bottom',
        pin: container,
        scrub: 0.5,
        invalidateOnRefresh: true,
        onRefresh: () => {
          measureAndInit()
        },
        onUpdate: (self) => {
          const p = self.progress

          if (introContent) {
            const introNorm = clampNormalize(p, 0.015, 0.08)
            const introOpacity = 1 - introNorm
            const introY = -35 * introNorm
            const introScale = 1 - 0.04 * introNorm
            introContent.style.opacity = introOpacity.toString()
            introContent.style.transform = `translateY(${introY}px) scale(${introScale})`
          }
          if (intro) {
            const introNorm = clampNormalize(p, 0.015, 0.08)
            intro.style.pointerEvents = (1 - introNorm) > 0.05 ? 'auto' : 'none'
          }

          const ie = 0.80
          const t = clampNormalize(p, 0.08, ie)
          const n = clampNormalize(p, ie, 1.0)

          const targetCharCount = Math.floor(t * totalChars)
          if (targetCharCount !== lastCharIndex) {
            const p1Visible = Math.min(targetCharCount, part1Chars.length)
            const p2Visible = Math.max(0, targetCharCount - part1Chars.length)
            textPart1.textContent = part1Chars.slice(0, p1Visible).join('')
            textPart2.textContent = part2Chars.slice(0, p2Visible).join('')
            lastCharIndex = targetCharCount
          }

          const camBaseY = endPoint.y - viewBoxHeight / 2 - 30
          const camBaseX = endPoint.x - bCoord.x

          if (p < ie) {
            if (samplePoints.length > 0) {
              const sampleIdx = Math.min(
                Math.floor(t * (samplePoints.length - 1)),
                samplePoints.length - 1
              )
              const curPt = samplePoints[sampleIdx]
              quickToY(curPt.y - viewBoxHeight / 2 - 30)
              quickToX(curPt.x - bCoord.x)
            }
            if (text) {
              text.setAttribute('transform', 'translate(0, 0)')
            }
            if (orb) {
              orb.style.opacity = '0'
              orb.style.visibility = 'hidden'
            }
            footerCard.style.clipPath = 'circle(0px at 50% 50%)'
            footerCard.style.webkitClipPath = 'circle(0px at 50% 50%)'
            footerCard.style.pointerEvents = 'none'
          } else {
            // Drop & Reveal Phase (Guillaume Zhu exact behavior when n goes from 0 to 1)
            const isDotVisible = n > 0.06
            const textLiftNorm = clampNormalize(n, 0.25, 0.55)
            const textLiftY = H * textLiftNorm
            if (text) {
              text.setAttribute('transform', `translate(0, ${textLiftY})`)
            }

            // Camera dips gently down following the falling dot
            const camPanDown = 70 * textLiftNorm
            quickToY(camBaseY + camPanDown)
            quickToX(camBaseX)

            // Dot moves from endPoint straight into the center of the footer
            const dropNorm = clampNormalize(n, 0.25, 0.55)
            const targetOrb = {
              x: currentViewBox.x + bCoord.x,
              y: currentViewBox.y + bCoord.y,
            }
            const curOrbX = gsap.utils.interpolate(endPoint.x, targetOrb.x, dropNorm)
            const curOrbY = gsap.utils.interpolate(endPoint.y, targetOrb.y, dropNorm)

            // Circular reveal blooms outward from the landed dot (50% 50% of footer)
            const revealNorm = clampNormalize(n, 0.55, 1.0)
            const currentRadius = gsap.utils.interpolate(0, maxRadius, revealNorm)

            if (revealNorm > 0) {
              const clipVal = `circle(${currentRadius.toFixed(1)}px at 50% 50%)`
              footerCard.style.clipPath = clipVal
              footerCard.style.webkitClipPath = clipVal
            } else {
              footerCard.style.clipPath = 'circle(0px at 50% 50%)'
              footerCard.style.webkitClipPath = 'circle(0px at 50% 50%)'
            }

            footerCard.style.pointerEvents = revealNorm > 0.4 ? 'auto' : 'none'

            // Dot dissolves seamlessly as circular reveal expands beyond 12px to 24px
            if (orb) {
              const dotFadeOut = clampNormalize(currentRadius, 12, 24)
              const dotAlpha = isDotVisible ? (1 - dotFadeOut) : 0
              orb.setAttribute('cx', curOrbX)
              orb.setAttribute('cy', curOrbY)
              orb.style.opacity = dotAlpha.toString()
              orb.style.visibility = dotAlpha > 0.005 ? 'visible' : 'hidden'
            }
          }
        },
      })
    }, footerRootRef)

    return () => ctx.revert()
  }, [])

  return (
    <footer ref={footerRootRef} id="footer" className="relative z-10 w-full">
      {/* Pinned Interactive Footer Section */}
      <section
        ref={pinSectionRef}
        className="relative w-full bg-[#0A0A0A] text-white"
        style={{ height: '480vh' }}
      >
        <div
          ref={containerRef}
          className="h-screen h-[100dvh] w-full relative overflow-hidden flex flex-col justify-between"
        >
        {/* Intro text "What’s next?" - Full viewport flexbox, guaranteed dead-center */}
        <div
          ref={introRef}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center px-5 sm:px-8 text-center pointer-events-auto select-none"
        >
          <div
            ref={introContentRef}
            className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center will-change-transform will-change-opacity"
          >
            <h2
              style={{ fontFamily: "var(--font-serif-garamond), 'EB Garamond', serif" }}
              className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-normal tracking-tight text-white leading-none mb-5 sm:mb-7"
            >
              What’s next?
            </h2>

            <a
              href="/playground"
              onClick={(e) => {
                e.preventDefault()
                onNavigatePlayground?.()
              }}
              className="group inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors duration-300 font-mono text-xs sm:text-sm tracking-widest uppercase cursor-pointer"
            >
              <span>Detour through the another project.</span>
              <span className="inline-block transform transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                ↗
              </span>
            </a>
          </div>
        </div>

        {/* SVG curved path and typewriter text */}
        <svg
          ref={svgRef}
          className="absolute top-1/2 left-0 -translate-y-1/2 pointer-events-none w-[340vw] sm:w-[280vw] md:w-[240vw] max-w-none overflow-visible z-10"
          viewBox="0 0 3898 891"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="quoteGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#E4E4E7" />
              <stop offset="100%" stopColor="#A1A1AA" />
            </linearGradient>
          </defs>

          <path
            ref={pathRef}
            id="quoteCurvePath"
            d="M0.398438 611.016C175.398 377.517 857.398 -285.484 1461.4 139.638C1911.53 456.46 2114.4 805.516 2679.4 611.016C3088.4 470.219 3704.54 -33.3124 4354.9 781.516C4700.9 1215.02 5305.6 1466.52 6108.4 328.516"
          />

          <text
            ref={textRef}
            className="select-none tracking-tight"
            style={{
              fontFamily: "var(--font-serif-garamond), 'EB Garamond', serif",
              fontSize: '205px',
              fontStyle: 'italic',
              fontWeight: 500,
              fill: '#FFFFFF',
            }}
          >
            <textPath
              ref={textPathRef}
              href="#quoteCurvePath"
              textAnchor="start"
              startOffset="0"
            >
              <tspan ref={textPart1Ref} fill="#F4F4F5" />
              <tspan ref={textPart2Ref} fill="url(#quoteGradient)" />
            </textPath>
          </text>

          <circle
            ref={orbRef}
            cx="0"
            cy="0"
            r="14"
            fill="#FFFFFF"
            className="opacity-0 pointer-events-none"
            style={{
              filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.95))',
            }}
          />
        </svg>

        {/* Revealed Edge-to-Edge Footer - Seamless left-to-right, clean and minimal */}
        <div
          ref={footerCardRef}
          className="absolute bottom-0 left-0 right-0 w-full bg-[#0A0A0A] px-6 sm:px-12 md:px-16 lg:px-20 pt-8 sm:pt-10 pb-8 sm:pb-12 z-30 pointer-events-none flex flex-col justify-between overflow-hidden"
          style={{
            clipPath: 'circle(0px at 50% 50%)',
            WebkitClipPath: 'circle(0px at 50% 50%)',
            minHeight: '260px',
          }}
        >
          {/* Quotes inside revealed footer */}
          <div className="w-full">
            <h3
              style={{ fontFamily: "var(--font-serif-garamond), 'EB Garamond', serif" }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl uppercase tracking-wider text-white font-normal leading-[1.25] max-w-4xl"
            >
              Designed with Clarity.<br className="hidden sm:inline" />
            </h3>
          </div>

          {/* Bottom Footer Bar */}
          <div className="w-full pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 text-xs text-zinc-500 font-sans">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 flex items-center justify-center">
                <img src={siteLogo} alt="Bk Logo" className="w-full h-full object-contain invert" />
              </div>
              <span className="text-zinc-500 font-normal text-[11px] sm:text-xs">
                Copyright © 2026 Bintang Kartika | All Rights Reserved
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-zinc-400 font-mono text-[11px] sm:text-xs">
              <span className="uppercase tracking-widest text-[10px] sm:text-[11px] text-zinc-600 font-medium">
                GET IN TOUCH:
              </span>
              <a
                href="https://github.com/BintangKartika06"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors duration-200"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/bintangkartika06/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors duration-200"
              >
                LinkedIn
              </a>
              <a
                href="https://upwork.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors duration-200"
              >
                Upwork
              </a>
              <a
                href="mailto:bintangkartika3008@gmail.com"
                className="hover:text-white transition-colors duration-200"
              >
                Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </footer>
  )
}
