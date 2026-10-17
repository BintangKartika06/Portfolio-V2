import { useState, useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Preloader from './components/Preloader'
import Header from './components/Header'
import FullscreenNav from './components/FullscreenNav'
import Hero from './components/Hero'
import About from './components/About'
import FeaturedProjects from './components/FeaturedProjects'
import ProjectDetail from './components/ProjectDetail'
import Footer from './components/Footer'
import Playground from './components/Playground'
import { projects } from './data/projects'
import logoLoadScreen from './assets/Logo_LoadScreen.svg'

gsap.registerPlugin(ScrollTrigger)

function App() {
  const [isNavOpen, setIsNavOpen] = useState(false)
  const isDirectProjectAccess =
    typeof window !== 'undefined' &&
    (window.location.pathname.startsWith('/project/') || window.location.pathname.startsWith('/playground'))
  const [isReady, setIsReady] = useState(isDirectProjectAccess)
  const [buttonCoords, setButtonCoords] = useState(null)
  const [currentPath, setCurrentPath] = useState(() => (typeof window !== 'undefined' ? window.location.pathname : '/'))

  const lenisRef = useRef(null)
  const curtainRef = useRef(null)
  const backFadeRef = useRef(null)
  const transitionTimelineRef = useRef(null)

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
      infinite: false,
    })
    lenisRef.current = lenis

    lenis.on('scroll', ScrollTrigger.update)

    const updateRaf = (time) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(updateRaf)
    gsap.ticker.lagSmoothing(500, 33)

    lenis.scrollTo(0, { immediate: true })
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

    const handleBeforeUnload = () => {
      window.scrollTo(0, 0)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      gsap.ticker.remove(updateRaf)
      lenis.destroy()
    }
  }, [])

  useEffect(() => {
    if (lenisRef.current) {
      if (isNavOpen || currentPath.startsWith('/playground')) {
        lenisRef.current.stop()
      } else {
        lenisRef.current.start()
      }
    }
  }, [isNavOpen, currentPath])

  const handlePreloaderComplete = () => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true })
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    setIsReady(true)
    setTimeout(() => {
      ScrollTrigger.refresh()
    }, 120)
  }

  // Navigation: Forward uses Curtain Transition; Back uses Option 1 (Soft Clean Fade)
  const navigateTo = (targetPath, targetAnchor = null, isBack = false, isPopState = false) => {
    if (!isPopState && targetPath === currentPath && !targetAnchor) return

    // Cancel running transition
    if (transitionTimelineRef.current) {
      transitionTimelineRef.current.kill()
      transitionTimelineRef.current = null
    }

    // BACK NAVIGATION: Option 1 (Soft Fade - Simple, Fast, Never Breaks ScrollTrigger)
    if (isBack) {
      const fadeEl = backFadeRef.current
      if (!fadeEl) {
        if (!isPopState) window.history.pushState(null, '', targetPath)
        setCurrentPath(targetPath)
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
        return
      }

      const tl = gsap.timeline({
        onComplete: () => {
          transitionTimelineRef.current = null
        },
      })
      transitionTimelineRef.current = tl

      tl.to(fadeEl, {
        opacity: 1,
        duration: 0.18,
        ease: 'power2.inOut',
        onComplete: () => {
          if (!isPopState) {
            window.history.pushState(null, '', targetPath)
          }
          setCurrentPath(targetPath)

          if (lenisRef.current) {
            lenisRef.current.scrollTo(0, { immediate: true })
          }
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

          if (targetAnchor) {
            setTimeout(() => {
              const targetEl = document.querySelector(targetAnchor)
              if (targetEl && lenisRef.current) {
                lenisRef.current.scrollTo(targetEl, { immediate: false, duration: 0.6 })
              }
            }, 60)
          }

          if (targetPath === '/') {
            setTimeout(() => {
              ScrollTrigger.refresh()
            }, 80)
          }
        },
      })
      .to(fadeEl, {
        opacity: 0,
        duration: 0.22,
        ease: 'power2.out',
      })
      return
    }

    // FORWARD NAVIGATION: Fullscreen Curtain Transition
    const curtain = curtainRef.current
    if (!curtain) {
      if (!isPopState) window.history.pushState(null, '', targetPath)
      setCurrentPath(targetPath)
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      return
    }

    if (lenisRef.current) lenisRef.current.stop()

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(curtain, { visibility: 'hidden', pointerEvents: 'none' })
        if (lenisRef.current && !targetPath.startsWith('/playground') && !isNavOpen) {
          lenisRef.current.start()
        }
        transitionTimelineRef.current = null
      },
    })
    transitionTimelineRef.current = tl

    // Phase 1: Curtain sweeps up from bottom to completely cover screen
    tl.set(curtain, {
      visibility: 'visible',
      pointerEvents: 'auto',
      clipPath: 'inset(100% 0% 0% 0%)',
    })
      .to(curtain, {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.6,
        ease: 'power4.inOut',
        onComplete: () => {
          if (!isPopState) {
            window.history.pushState(null, '', targetPath)
          }
          setCurrentPath(targetPath)

          if (lenisRef.current) {
            lenisRef.current.scrollTo(0, { immediate: true })
          }
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

          if (targetAnchor) {
            setTimeout(() => {
              const targetEl = document.querySelector(targetAnchor)
              if (targetEl && lenisRef.current) {
                lenisRef.current.scrollTo(targetEl, { immediate: false, duration: 0.7 })
              }
            }, 80)
          }
        },
      })
      // Phase 2: Curtain lifts towards top to reveal new page content
      .to(
        curtain,
        {
          clipPath: 'inset(0% 0% 100% 0%)',
          duration: 0.6,
          ease: 'power4.inOut',
        },
        '+=0.04'
      )
  }

  useEffect(() => {
    const handlePopState = () => {
      setIsNavOpen(false)
      const targetPath = window.location.pathname || '/'
      let targetAnchor = window.location.hash || null

      if (currentPath.startsWith('/project/') && targetPath === '/' && !targetAnchor) {
        targetAnchor = '#projects'
      }

      // Popstate (Back/Forward in browser or mobile gesture) triggers Option 1 (soft fade)
      navigateTo(targetPath, targetAnchor, true, true)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath])

  const handleToggleMenu = (coords) => {
    if (coords) setButtonCoords(coords)
    setIsNavOpen((prev) => !prev)
  }

  // Determine active project from URL
  const selectedSlug = currentPath.startsWith('/project/')
    ? currentPath.replace('/project/', '').replace(/\/$/, '')
    : null

  const selectedProject = selectedSlug
    ? projects.find((p) => p.slug === selectedSlug) ||
      (selectedSlug === 'milk-and-madu' ? projects.find((p) => p.id === '01') : null)
    : null

  useEffect(() => {
    if (selectedProject) {
      document.title = `${selectedProject.title} — Bintang Kartika`
    } else if (currentPath.startsWith('/playground')) {
      document.title = 'Playground & Creative Lab — Bintang Kartika'
    } else {
      document.title = 'Bintang Kartika — Web Developer & Frontend Specialist'
    }
  }, [currentPath, selectedProject])

  const handleSelectProject = (project) => {
    const slug = project.slug || 'milk-and-madu'
    navigateTo(`/project/${slug}`, null, false)
  }

  const handleBackToProjects = () => {
    navigateTo('/', '#projects', true)
  }

  const handleNavigateNext = (nextSlug) => {
    navigateTo(`/project/${nextSlug}`, null, false)
  }

  const handleHomeClick = () => {
    if (currentPath === '/' && !window.location.hash) {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0, { immediate: false, duration: 1 })
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
      }
    } else {
      navigateTo('/', null, true)
    }
  }

  return (
    <div className="min-h-screen bg-white text-[#070707] selection:bg-black selection:text-white">
      {/* 1. Original Milk & Madu style Preloader on initial site open */}
      {!isDirectProjectAccess && <Preloader onComplete={handlePreloaderComplete} />}

      {/* 2. Forward Curtain Transition Overlay (Clean dark curtain with Logo) */}
      <div
        ref={curtainRef}
        className="fixed inset-0 z-[200] bg-[#0A0A0A] pointer-events-none flex flex-col items-center justify-center text-white"
        style={{
          visibility: 'hidden',
          clipPath: 'inset(100% 0% 0% 0%)',
        }}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <img
            src={logoLoadScreen}
            alt="Bintang Kartika Logo"
            className="w-36 sm:w-44 md:w-52 h-auto object-contain brightness-0 invert opacity-90 select-none pointer-events-none"
            draggable="false"
          />
        </div>
      </div>

      {/* 3. Option 1: Simple & Smooth Back Transition Fade Overlay */}
      <div
        ref={backFadeRef}
        className="fixed inset-0 z-[200] bg-white pointer-events-none opacity-0"
      />

      <Header
        isReady={isReady}
        isNavOpen={isNavOpen}
        onToggleMenu={handleToggleMenu}
        onHomeClick={handleHomeClick}
      />

      <FullscreenNav
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        buttonCoords={buttonCoords}
      />

      {/* Main Pages: Rendered directly without parent transform wrapper to keep ScrollTrigger intact */}
      {currentPath.startsWith('/playground') ? (
        <Playground
          onBack={handleHomeClick}
          onClose={() => navigateTo('/', null, true)}
          onSelectProject={handleSelectProject}
        />
      ) : selectedProject ? (
        <ProjectDetail
          project={selectedProject}
          onBack={handleBackToProjects}
          onNavigateNext={handleNavigateNext}
        />
      ) : (
        <>
          <main className="w-full px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20 pt-24 sm:pt-32">
            <Hero isReady={isReady} />
            <About />
          </main>
          <FeaturedProjects onSelectProject={handleSelectProject} />
          <Footer onNavigatePlayground={() => navigateTo('/playground', null, false)} />
        </>
      )}
    </div>
  )
}

export default App
