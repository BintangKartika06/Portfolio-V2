import { useEffect, useRef, useMemo } from 'react'
import gsap from 'gsap'
import { playgroundProjects } from '../data/playgroundProjects'
import siteLogo from '../assets/SiteLogo.svg'

// Golden angle for Fibonacci sphere distribution (Guillaume Zhu formula)
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

/**
 * Tangent normal matrix calculation (Guillaume Zhu)
 * Orients each card to face outward perpendicular to the sphere center.
 */
function getOrientationMatrix(e, t, n) {
  let r = 0, i = -1, a = 0
  let o = i * n - a * t, s = a * e - r * n, c = r * t - i * e
  let l = Math.hypot(o, s, c)
  if (l < 1e-6) {
    r = 0; i = 0; a = 1
    o = i * n - a * t; s = a * e - r * n; c = r * t - i * e
    l = Math.hypot(o, s, c)
  }
  const u = 1 / l
  o *= u; s *= u; c *= u
  const d = t * c - n * s, f = n * o - e * c, p = e * s - t * o
  return [o, -d, e, s, -f, t, c, -p, n]
}

/**
 * Rodrigues' axis-angle rotation matrix
 */
function getAxisAngleMatrix(e, t, n, r) {
  const i = Math.cos(r), a = Math.sin(r), o = 1 - i
  return [
    o * e * e + i,     o * e * t - a * n, o * e * n + a * t,
    o * e * t + a * n, o * t * t + i,     o * t * n - a * e,
    o * e * n - a * t, o * t * n + a * e, o * n * n + i
  ]
}

export default function Playground({ onBack, onSelectProject, onClose }) {
  const containerRef = useRef(null)
  const stageRef = useRef(null)
  const cardsRef = useRef([])
  const captionRef = useRef(null)
  const captionTitleRef = useRef(null)
  const captionMetaRef = useRef(null)

  // 24 cards for full spherical density identical to Guillaume Zhu's playground
  const items = useMemo(() => {
    const base = playgroundProjects && playgroundProjects.length > 0 ? playgroundProjects : []
    if (base.length === 0) return []
    const targetCount = 24
    const repeated = []
    for (let i = 0; i < targetCount; i++) {
      const source = base[i % base.length]
      repeated.push({
        ...source,
        instanceKey: `${source.id || i}-${i}`,
      })
    }
    return repeated
  }, [])

  const count = items.length

  // Fibonacci sphere coordinate points
  const spherePoints = useMemo(() => {
    return items.map((_, i) => {
      const t = 1 - (2 * i) / (count - 1 || 1)
      const lat = Math.acos(Math.max(-1, Math.min(1, t))) - Math.PI / 2
      const lon = (i * GOLDEN_ANGLE) % (2 * Math.PI)
      return {
        x: Math.cos(lat) * Math.cos(lon),
        y: Math.sin(lat),
        z: Math.cos(lat) * Math.sin(lon),
      }
    })
  }, [items, count])

  // 3x3 global rotation matrix
  const CRef = useRef([1, 0, 0, 0, 1, 0, 0, 0, 1])
  const wRef = useRef([0, 0, 0, 0, 0, 0, 0, 0, 0])
  const radiusRef = useRef(500)
  const expandProgressRef = useRef(0)

  // Cached layout metrics to completely eliminate layout thrashing
  const cachedHalfHRef = useRef(140)
  const cachedGapRef = useRef(24)
  const lastCaptionIdxRef = useRef(-1)

  // Interaction & Tweening states
  const entranceDoneRef = useRef(false)
  const isDraggingRef = useRef(false)
  const isTweeningRef = useRef(false)
  const activeFrontIndexRef = useRef(0)
  const totalDragRef = useRef(0)
  const lastPointerRef = useRef({ x: 0, y: 0 })
  const tweenRef = useRef(null)

  // GSAP quickTo momentum values & setters
  const jRef = useRef({ x: 0, y: 0 })
  const mTargetRef = useRef({ x: 0, y: 0 })
  const nPrevRef = useRef(0)
  const pPrevRef = useRef(0)
  const IMatRef = useRef([0, 0, 0, 0, 0, 0, 0, 0, 0])
  const quickXRef = useRef(null)
  const quickYRef = useRef(null)

  // Synchronously reset quickTo internal state and targets to prevent momentum jumps
  const resetQuickTo = () => {
    mTargetRef.current.x = 0
    mTargetRef.current.y = 0
    nPrevRef.current = 0
    pPrevRef.current = 0
    jRef.current.x = 0
    jRef.current.y = 0
    if (quickXRef.current) quickXRef.current(0, 0)
    if (quickYRef.current) quickYRef.current(0, 0)
  }

  // Multiply 3x3 matrix into C
  const multiplyGlobal = (e) => {
    const C = CRef.current
    const w = wRef.current
    for (let t = 0; t < 3; t++) {
      const n = e[t * 3], r = e[t * 3 + 1], i = e[t * 3 + 2]
      for (let c = 0; c < 3; c++) {
        w[t * 3 + c] = n * C[c] + r * C[3 + c] + i * C[6 + c]
      }
    }
    for (let c = 0; c < 9; c++) C[c] = w[c]
  }

  // Transform sphere point with global matrix C
  const D = (index) => {
    const C = CRef.current
    const pt = spherePoints[index]
    if (!pt) return [0, 0, 1]
    return [
      C[0] * pt.x + C[1] * pt.y + C[2] * pt.z,
      C[3] * pt.x + C[4] * pt.y + C[5] * pt.z,
      C[6] * pt.x + C[7] * pt.y + C[8] * pt.z,
    ]
  }

  // Find index of card closest to the dead front center
  const getClosestFrontIndex = () => {
    let bestIdx = 0
    let minDistSq = Infinity
    for (let n = 0; n < count; n++) {
      const [r, i, a] = D(n)
      if (a <= 0) continue
      const distSq = r * r + i * i
      if (distSq < minDistSq) {
        minDistSq = distSq
        bestIdx = n
      }
    }
    return bestIdx
  }

  // Position 3D Caption right beneath the centered front card at all times
  const updateCaption = () => {
    if (!captionRef.current) return
    if (!entranceDoneRef.current) {
      captionRef.current.classList.remove('is-visible')
      return
    }

    const frontIdx = getClosestFrontIndex()
    const [e, t, z] = D(frontIdx)

    activeFrontIndexRef.current = frontIdx

    // Update text content directly on DOM nodes to avoid React layout thrashing
    if (frontIdx !== lastCaptionIdxRef.current) {
      lastCaptionIdxRef.current = frontIdx
      const item = items[frontIdx]
      if (item) {
        if (captionTitleRef.current) captionTitleRef.current.textContent = item.title
        if (captionMetaRef.current) captionMetaRef.current.textContent = `${item.category} · ${item.year}`
      }
    }

    const S = radiusRef.current
    const v = expandProgressRef.current || 1
    const r = getOrientationMatrix(e, -t, z)
    const posX = e * S * v
    const posY = -t * S * v
    const posZ = z * S * v
    const offsetY = cachedHalfHRef.current + cachedGapRef.current

    // Follow the card in 3D space continuously (Guillaume Zhu formula)
    captionRef.current.style.transform = `translate3d(${posX}px, ${posY}px, ${posZ}px) matrix3d(${r[0]},${r[3]},${r[6]},0,${r[1]},${r[4]},${r[7]},0,${r[2]},${r[5]},${r[8]},0,0,0,0,1) translateY(${offsetY}px) scaleX(-1)`

    // Reveal caption smoothly when card is facing forward (z > 0.88), fade out when turning away
    if (z > 0.88) {
      captionRef.current.classList.add('is-visible')
    } else {
      captionRef.current.classList.remove('is-visible')
    }
  }

  // Render cards in 3D Fibonacci space with silky smooth GPU transforms
  const renderCards = (v = 1) => {
    const S = radiusRef.current
    const cardEls = cardsRef.current
    if (!cardEls || cardEls.length === 0) return

    // Smooth opacity fade calculation for entrance
    const entranceFade = gsap.utils.clamp(0, 1, (v - 0.04) / 0.22)
    const entranceScale = gsap.utils.interpolate(0.72, 1, Math.min(1, v * 1.15))

    for (let n = 0; n < count; n++) {
      const el = cardEls[n]
      if (!el) continue

      const [r, i, a] = D(n)
      const o = a > 0 ? v : 1
      const s = r, c = -i, l = a
      const u = s * o, d = c * o, f = l * o + (1 - o)
      const pLen = Math.hypot(u, d, f) || 1
      const mat = getOrientationMatrix(u / pLen, d / pLen, f / pLen)

      const translate = `translate3d(${r * S * o}px, ${-i * S * o}px, ${a * S * o}px)`
      const matrix = `matrix3d(${mat[0]},${mat[3]},${mat[6]},0,${mat[1]},${mat[4]},${mat[7]},0,${mat[2]},${mat[5]},${mat[8]},0,0,0,0,1)`

      el.style.transform = `${translate} ${matrix} scaleX(-1) scale(${entranceScale})`

      // Smooth visibility: All cards in front & sides (a > -0.30) are 100% visible
      // This ensures 20+ cards surround the viewport completely, leaving no black voids!
      if (a > -0.30) {
        const op = n === 0 ? 1 : entranceFade
        el.style.opacity = String(op)
        el.style.pointerEvents = 'auto'
      } else {
        const fade = Math.max(0, (a + 0.50) / 0.20)
        const op = Math.min(entranceFade, fade)
        el.style.opacity = String(op)
        el.style.pointerEvents = op > 0.4 ? 'auto' : 'none'
      }
    }
  }

  // Tactile ripple elastic wave across neighbor cards upon click (Guillaume Zhu)
  const triggerRipple = (targetIdx) => {
    const targetPt = spherePoints[targetIdx]
    if (!targetPt) return

    const neighbors = spherePoints
      .map((pt, idx) => {
        const dot = targetPt.x * pt.x + targetPt.y * pt.y + targetPt.z * pt.z
        return {
          index: idx,
          angularDist: Math.acos(gsap.utils.clamp(-1, 1, dot)),
        }
      })
      .sort((a, b) => a.angularDist - b.angularDist)
      .slice(0, 9)

    neighbors.forEach(({ index: cardIdx }, rank) => {
      const el = cardsRef.current[cardIdx]
      if (!el) return
      const img = el.querySelector('img')
      if (!img) return
      const isTarget = rank === 0
      const ratio = Math.max(0, rank - 1) / Math.max(1, neighbors.length - 2)
      const s = isTarget ? 0.9 : gsap.utils.interpolate(0.95, 0.98, ratio)
      const c = isTarget ? 1.06 : gsap.utils.interpolate(1.05, 1.02, ratio)

      gsap.to(img, {
        keyframes: [
          { scale: s, duration: 0.1, ease: 'power2.in' },
          { scale: c, duration: 0.4, ease: 'back.out(2)' },
          { scale: 1, duration: 0.2, ease: 'power2.out' },
        ],
        delay: rank * 0.025,
        overwrite: true,
      })
    })
  }

  // Smooth Snap-to-center via Rodrigues' shortest geodesic arc
  const snapToCard = (targetIdx, immediate = false) => {
    if (tweenRef.current) {
      tweenRef.current.kill()
      tweenRef.current = null
    }

    const [r, i, o] = D(targetIdx)
    const s = Math.hypot(r, i)

    if (s < 0.02) {
      activeFrontIndexRef.current = targetIdx
      resetQuickTo()
      updateCaption()
      return
    }

    const c = i / s, l = -r / s
    const u = Math.acos(Math.max(-1, Math.min(1, o)))

    resetQuickTo()

    if (immediate) {
      multiplyGlobal(getAxisAngleMatrix(c, l, 0, u))
      renderCards(expandProgressRef.current || 1)
      resetQuickTo()
      updateCaption()
      return
    }

    isTweeningRef.current = true
    const initialMatrix = [...CRef.current]
    const tweenObj = { t: 0 }

    const snapTween = gsap.to(tweenObj, {
      t: 1,
      duration: 1.0,
      ease: 'expo.inOut',
      onUpdate: () => {
        for (let k = 0; k < 9; k++) CRef.current[k] = initialMatrix[k]
        multiplyGlobal(getAxisAngleMatrix(c, l, 0, u * tweenObj.t))
        renderCards(expandProgressRef.current || 1)
        updateCaption()
      },
      onComplete: () => {
        activeFrontIndexRef.current = targetIdx
        isTweeningRef.current = false
        if (tweenRef.current === snapTween) {
          tweenRef.current = null
        }
        resetQuickTo()
        updateCaption()
      },
    })
    tweenRef.current = snapTween
  }

  // Auto-snap to closest front card when drag / momentum settles
  const snapToClosest = () => {
    if (isDraggingRef.current || isTweeningRef.current) return
    if (Math.abs(mTargetRef.current.x - jRef.current.x) > 0.5) return
    if (Math.abs(mTargetRef.current.y - jRef.current.y) > 0.5) return
    const closest = getClosestFrontIndex()
    snapToCard(closest)
  }

  // Setup Orbit & Responsive Dimensions
  useEffect(() => {
    let interactionEnabled = false

    const updateDimensions = () => {
      const t = window.innerWidth
      const h = window.innerHeight
      const cardEl = cardsRef.current[0]
      const cardW = cardEl && cardEl.offsetWidth > 0 ? cardEl.offsetWidth : 360
      if (cardEl && cardEl.offsetHeight > 0) {
        cachedHalfHRef.current = cardEl.offsetHeight / 2
      }
      if (containerRef.current) {
        const computedGap = parseFloat(getComputedStyle(containerRef.current).getPropertyValue('--caption-gap'))
        if (!isNaN(computedGap)) cachedGapRef.current = computedGap
      }

      const isMobile = t <= 500

      let S
      if (isMobile) {
        S = 340
        gsap.set(stageRef.current, { z: 230 })
        gsap.set(containerRef.current, { perspective: 1000 })
      } else {
        const mult = t <= 1400 ? 1.06 : 1.0
        const r = 0.6 * t * mult
        const i = 2.5 * cardW * mult
        const o = 1.1 * h * mult
        S = Math.max(r, Math.min(i, o))
        const s = 0.38 * t
        gsap.set(stageRef.current, { z: s - S })
        gsap.set(containerRef.current, { perspective: t * 2.8 })
      }
      radiusRef.current = S
      renderCards(expandProgressRef.current || 0)
      updateCaption()
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)

    // Ultra-lightweight rotation calculation step from GSAP QuickTo
    const applyRotation = () => {
      const j = jRef.current
      const e = ((j.y - pPrevRef.current) * Math.PI) / 180
      const t = ((j.x - nPrevRef.current) * Math.PI) / 180
      pPrevRef.current = j.y
      nPrevRef.current = j.x

      if (t !== 0 || e !== 0) {
        const n = Math.cos(e), r = Math.sin(e)
        const i = Math.cos(t), a = Math.sin(t)
        const I = IMatRef.current
        I[0] = n;      I[1] = 0; I[2] = r
        I[3] = a * r;  I[4] = i; I[5] = -a * n
        I[6] = -i * r; I[7] = a; I[8] = i * n
        multiplyGlobal(I)
      }

      renderCards(expandProgressRef.current || 1)
      updateCaption()
    }

    const quickY = gsap.quickTo(jRef.current, 'y', {
      duration: 1.6,
      ease: 'power2.out',
      onUpdate: applyRotation,
      onComplete: snapToClosest,
    })
    const quickX = gsap.quickTo(jRef.current, 'x', {
      duration: 1.6,
      ease: 'power2.out',
    })

    quickXRef.current = quickX
    quickYRef.current = quickY

    // Drag & Wheel event handling
    const container = containerRef.current
    if (!container) return

    const handlePointerDown = (e) => {
      if (!interactionEnabled) return
      if (tweenRef.current) {
        tweenRef.current.kill()
        tweenRef.current = null
        isTweeningRef.current = false
      }
      isDraggingRef.current = true
      totalDragRef.current = 0
      lastPointerRef.current = { x: e.clientX, y: e.clientY }

      // Seamless momentum reset: zero out quickTo internal target and velocity
      resetQuickTo()
    }

    const handlePointerMove = (e) => {
      if (!isDraggingRef.current) return
      const dx = e.clientX - lastPointerRef.current.x
      const dy = e.clientY - lastPointerRef.current.y
      totalDragRef.current += Math.hypot(dx, dy)
      lastPointerRef.current = { x: e.clientX, y: e.clientY }

      mTargetRef.current.y += dx * 0.16
      mTargetRef.current.x += dy * 0.16
      quickY(mTargetRef.current.y)
      quickX(mTargetRef.current.x)
    }

    const handlePointerUp = () => {
      if (!isDraggingRef.current) return
      isDraggingRef.current = false
      snapToClosest()
    }

    const handleWheel = (e) => {
      if (!interactionEnabled) return
      e.preventDefault()
      if (tweenRef.current) {
        tweenRef.current.kill()
        tweenRef.current = null
        isTweeningRef.current = false
      }
      resetQuickTo()
      mTargetRef.current.y -= e.deltaX * 0.12
      mTargetRef.current.x -= e.deltaY * 0.12
      quickY(mTargetRef.current.y)
      quickX(mTargetRef.current.x)
    }

    container.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    container.addEventListener('wheel', handleWheel, { passive: false })

    // Align initial front card (0) to dead center immediately
    snapToCard(0, true)

    // ENTRANCE ANIMATION: Smooth floral blooming expansion (Guillaume Zhu)
    // IMPORTANT: Absolutely NO auto-rotation / auto-moving afterwards!
    expandProgressRef.current = 0
    renderCards(0)

    const animProgress = { v: 0 }

    const entranceTl = gsap.to(animProgress, {
      v: 1,
      duration: 2.6,
      ease: 'power4.out',
      delay: 0.1,
      onUpdate: () => {
        expandProgressRef.current = animProgress.v
        renderCards(animProgress.v)
        if (!interactionEnabled && animProgress.v >= 0.6) {
          interactionEnabled = true
        }
        if (animProgress.v >= 0.8 && !entranceDoneRef.current) {
          entranceDoneRef.current = true
          updateCaption()
        }
      },
      onComplete: () => {
        interactionEnabled = true
        entranceDoneRef.current = true
        resetQuickTo()
        updateCaption()
      },
    })

    return () => {
      window.removeEventListener('resize', updateDimensions)
      container.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      container.removeEventListener('wheel', handleWheel)
      entranceTl.kill()
      if (tweenRef.current) tweenRef.current.kill()
    }
  }, [count])

  // Keyboard navigation (Arrow keys & Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onBack?.()
      } else if (e.key === 'ArrowRight') {
        const next = (activeFrontIndexRef.current + 1) % count
        triggerRipple(next)
        snapToCard(next)
      } else if (e.key === 'ArrowLeft') {
        const prev = (activeFrontIndexRef.current - 1 + count) % count
        triggerRipple(prev)
        snapToCard(prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [count, onBack])

  // Handle click on card:
  // - If card is already in center front, open project detail
  // - Otherwise, rotate card to center front with tactile ripple
  const handleCardClick = (idx, project) => {
    if (totalDragRef.current > 6) return // User was dragging, prevent accidental click

    if (idx === activeFrontIndexRef.current) {
      onSelectProject?.(project)
    } else {
      triggerRipple(idx)
      snapToCard(idx)
    }
  }

  const handleCaptionClick = (e) => {
    e.stopPropagation()
    const activeItem = items[activeFrontIndexRef.current]
    if (activeItem) {
      onSelectProject?.(activeItem)
    }
  }

  return (
    <div
      className="playground-sphere select-none"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0A0A0A',
        color: '#ffffff',
        zIndex: 150,
        overflow: 'hidden',
      }}
    >
      {/* Minimal, Clean Header: Logo on left & Close (✕) on right */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-10 md:px-14 py-6 pointer-events-auto">
        <button
          onClick={onBack}
          className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center cursor-pointer transition-opacity duration-300 hover:opacity-70 focus:outline-none"
          aria-label="Back to home"
        >
          <img
            src={siteLogo}
            alt="Site Logo"
            className="w-full h-full object-contain brightness-0 invert"
          />
        </button>

        <button
          onClick={onClose || onBack}
          className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/80 hover:text-white hover:border-white/40 hover:bg-white/[0.08] transition-all duration-300 cursor-pointer focus:outline-none"
          aria-label="Close playground"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L13 13M1 13L13 1"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </header>

      {/* 3D Orbit Sphere Container */}
      <main
        ref={containerRef}
        className="playground-sphere__container cursor-grab active:cursor-grabbing touch-none"
      >
        <div
          ref={stageRef}
          className="playground-sphere__stage"
        >
          {/* Visual Cards (Pure media, clean without clutter text) */}
          {items.map((item, idx) => (
            <div
              key={item.instanceKey}
              ref={(el) => (cardsRef.current[idx] = el)}
              onClick={() => handleCardClick(idx, item)}
              className="playground-sphere__media"
              style={{
                backgroundColor: '#18181b',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <img
                src={item.image}
                alt={item.title}
                draggable="false"
                loading="eager"
                className="w-full h-full object-cover select-none pointer-events-none"
              />
            </div>
          ))}

          {/* 3D Floating Caption: Anchored directly below the centered card */}
          <div
            ref={captionRef}
            className="playground-sphere__caption"
            aria-live="polite"
          >
            <h2 ref={captionTitleRef} className="playground-sphere__caption-title">
              {items[0]?.title}
            </h2>
            <p ref={captionMetaRef} className="playground-sphere__caption-meta">
              {items[0]?.category} · {items[0]?.year}
            </p>
            <div className="playground-sphere__caption-action">
              <button
                onClick={handleCaptionClick}
                className="inline-flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-white/90 hover:text-white transition-all duration-300 cursor-pointer py-1.5 px-4 rounded-full border border-white/20 hover:border-white/50 bg-white/[0.08] backdrop-blur-md hover:scale-105 shadow-lg"
              >
                <span>View Project</span>
                <span className="text-xs">↗</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
