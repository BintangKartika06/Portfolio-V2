import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects } from '../data/projects'

gsap.registerPlugin(ScrollTrigger)

export default function FeaturedProjects({ onSelectProject }) {
  const containerRef = useRef(null)
  const introTitleRef = useRef(null)
  const introStatementRef = useRef(null)
  const pinnedSectionRef = useRef(null)
  const trackRef = useRef(null)
  const slideRefs = useRef([])
  const cursorBadgeRef = useRef(null)

  useEffect(() => {
    const cleanupFns = []
    const ctx = gsap.context(() => {
      const pinnedSection = pinnedSectionRef.current
      const track = trackRef.current
      const introTitle = introTitleRef.current
      const introStatement = introStatementRef.current
      if (!pinnedSection || !track) return

      slideRefs.current = slideRefs.current.slice(0, projects.length)

      // Entrance animation for Intro Statement & Title (run once cleanly without reverse thrashing)
      if (introStatement) {
        gsap.fromTo(
          introStatement,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: introStatement,
              start: 'top 85%',
              toggleActions: 'play none none none',
              once: true,
            },
          }
        )
      }

      if (introTitle) {
        gsap.fromTo(
          introTitle,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: introTitle,
              start: 'top 85%',
              toggleActions: 'play none none none',
              once: true,
            },
          }
        )
      }

      // Compute pin scroll distances
      const totalTrackDistance = () => track.scrollWidth - window.innerWidth

      const mainTl = gsap.timeline({
        scrollTrigger: {
          trigger: pinnedSection,
          pin: true,
          scrub: 0.3,
          start: 'top top',
          end: () => `+=${totalTrackDistance()}`,
          invalidateOnRefresh: true,
        },
      })

      // Smooth horizontal glide through all projects
      mainTl.to(track, {
        x: () => -totalTrackDistance(),
        duration: 1,
        ease: 'none',
        force3D: true,
      })

      // Subsequent slides (1..5) text entrance animations
      slideRefs.current.forEach((slide, idx) => {
        if (!slide || idx === 0) return

        const title = slide.querySelector('.cs-title')
        const info = slide.querySelector('.cs-info')
        const summary = slide.querySelector('.cs-summary')
        const btn = slide.querySelector('.cs-btn')

        const textGroup = [title, info, summary, btn].filter(Boolean)
        if (textGroup.length > 0) {
          gsap.fromTo(
            textGroup,
            { y: 25, opacity: 0.3 },
            {
              y: 0,
              opacity: 1,
              duration: 0.5,
              stagger: 0.04,
              ease: 'power2.out',
              force3D: true,
              scrollTrigger: {
                trigger: slide,
                containerAnimation: mainTl,
                start: 'left 84%',
                toggleActions: 'play none none none',
              },
            }
          )
        }
      })

      // Floating custom cursor follower for project thumbnails
      const cursorBadge = cursorBadgeRef.current
      if (cursorBadge && window.matchMedia('(pointer: fine)').matches) {
        gsap.set(cursorBadge, {
          xPercent: -50,
          yPercent: -50,
          scale: 0,
          opacity: 0,
        })

        const xTo = gsap.quickTo(cursorBadge, 'x', { duration: 0.25, ease: 'power2.out' })
        const yTo = gsap.quickTo(cursorBadge, 'y', { duration: 0.25, ease: 'power2.out' })

        const handleMouseMove = (e) => {
          xTo(e.clientX)
          yTo(e.clientY)
        }

        const handleMouseEnter = (e) => {
          xTo(e.clientX)
          yTo(e.clientY)
          gsap.to(cursorBadge, {
            scale: 1,
            opacity: 1,
            duration: 0.28,
            ease: 'back.out(1.7)',
            overwrite: 'auto',
          })
        }

        const handleMouseLeave = () => {
          gsap.to(cursorBadge, {
            scale: 0.2,
            opacity: 0,
            duration: 0.2,
            ease: 'power2.in',
            overwrite: 'auto',
          })
        }

        const assets = containerRef.current?.querySelectorAll('.cs-asset')
        assets?.forEach((asset) => {
          asset.addEventListener('mousemove', handleMouseMove)
          asset.addEventListener('mouseenter', handleMouseEnter)
          asset.addEventListener('mouseleave', handleMouseLeave)
          cleanupFns.push(() => {
            asset.removeEventListener('mousemove', handleMouseMove)
            asset.removeEventListener('mouseenter', handleMouseEnter)
            asset.removeEventListener('mouseleave', handleMouseLeave)
          })
        })
      }
    }, containerRef)

    const timer = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 250)

    return () => {
      cleanupFns?.forEach((fn) => fn())
      clearTimeout(timer)
      ctx.revert()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      id="projects"
      className="relative w-full bg-white text-black select-none font-sf"
      style={{ fontFamily: 'var(--font-sf)' }}
      data-purpose="featured-projects-experience"
    >
      {/* Floating Custom Cursor Follower for Thumbnails (Matches screenshot) */}
      <div
        ref={cursorBadgeRef}
        className="fixed top-0 left-0 pointer-events-none z-[150] hidden lg:flex items-center justify-center opacity-0 scale-0 will-change-transform"
      >
        <div className="bg-[#242424]/95 backdrop-blur-md text-white px-5 py-2.5 rounded-full shadow-[0_12px_32px_rgba(0,0,0,0.55)] border border-white/10 select-none">
          <span
            className="text-xs font-semibold tracking-wider uppercase font-sf text-zinc-100"
            style={{ fontFamily: 'var(--font-sf)' }}
          >
            VIEW PROJECT
          </span>
        </div>
      </div>
      {/* 
        Introductory Section matching "Sebelum masuk page.png" & "Screenshot 2026-09-23 204503.png"
      */}
      <div className="w-full pt-16 sm:pt-24 lg:pt-28 pb-10 sm:pb-14 lg:pb-16 px-5 sm:px-10 md:px-14 lg:px-20 bg-white">
        <div className="w-full max-w-[94vw] mx-auto">
          
          {/* Top Row: "Trusted by the best companies..." placed on the right as shown in Screenshot */}
          <div className="flex justify-end mb-10 sm:mb-14 lg:mb-20">
            <p
              ref={introStatementRef}
              className="text-base sm:text-2xl md:text-3xl lg:text-[2.2vw] font-normal text-black leading-[1.3] max-w-xl text-left"
              style={{ fontFamily: 'var(--font-sf)' }}
            >
              Trusted by the best companies to create new growth and improve business operations.
            </p>
          </div>

          {/* Centered Heading: "Featured Projects" */}
          <div className="w-full text-center">
            <h2
              ref={introTitleRef}
              className="text-4xl sm:text-6xl md:text-7xl lg:text-[6.5vw] font-normal text-black tracking-tight leading-none"
              style={{ fontFamily: 'var(--font-sf)' }}
            >
              Featured Projects
            </h2>
          </div>

        </div>
      </div>

      {/* 
        Pinned Horizontal Case Studies Section
        Strictly follows CONTOH IMAGE 1.png with sharp images, clean Apple SF typography,
        and fully responsive mobile design.
      */}
      <section
        ref={pinnedSectionRef}
        className="relative w-full h-screen overflow-hidden bg-white flex items-center"
      >
        <div
          ref={trackRef}
          className="flex flex-row flex-nowrap items-center will-change-transform h-full"
        >
          {projects.map((project, idx) => (
            <div
              key={project.id}
              ref={(el) => (slideRefs.current[idx] = el)}
              className="w-screen shrink-0 h-screen flex flex-col justify-center px-5 sm:px-10 md:px-14 lg:px-20 py-4 sm:py-6 lg:py-12"
            >
              <div className="w-full max-w-[94vw] mx-auto flex flex-col lg:grid lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-16 xl:gap-24 items-center justify-center h-full max-h-[90vh]">
                
                {/* 
                  Mobile Visual / Desktop Right Column
                  On mobile: placed on top for immediate recognition
                  On desktop: placed on the right (col-span-6)
                */}
                <div className="w-full lg:col-span-6 order-1 lg:order-2 flex items-center justify-center">
                  <div
                    onClick={() => onSelectProject?.(project)}
                    className="cs-asset w-full h-[30vh] sm:h-[38vh] md:h-[45vh] lg:h-[82vh] max-h-[85vh] overflow-hidden bg-zinc-100 cursor-pointer lg:cursor-none rounded-none shadow-xs"
                  >
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-out hover:scale-103"
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                  </div>
                </div>

                {/* 
                  Left Column: Typography & Metadata matching CONTOH IMAGE 1.png
                  On mobile: neatly organized below the image without vertical overflow
                */}
                <div className="w-full lg:col-span-6 flex flex-col justify-center max-w-xl order-2 lg:order-1">
                  
                  {/* Large Project Name Title */}
                  <h3
                    className="cs-title text-2xl sm:text-4xl md:text-5xl lg:text-[4.5vw] xl:text-[5vw] font-normal text-black mb-3 sm:mb-6 lg:mb-10 leading-[1.08] tracking-[-0.02em]"
                    style={{ fontFamily: 'var(--font-sf)' }}
                  >
                    {project.title}
                  </h3>

                  {/* Year Info Item (Client changed to Year; Velocity removed) */}
                  <div className="cs-info mb-3 sm:mb-6 lg:mb-10">
                    <span
                      className="block text-xs sm:text-sm text-black/70 mb-1 sm:mb-2 font-normal"
                      style={{ fontFamily: 'var(--font-sf)' }}
                    >
                      Year
                    </span>
                    <span
                      className="block text-xl sm:text-2xl md:text-3xl lg:text-[2.8vw] font-normal text-black leading-none tracking-tight"
                      style={{ fontFamily: 'var(--font-sf)' }}
                    >
                      {project.year}
                    </span>
                  </div>

                  {/* Project Summary */}
                  <div className="cs-summary mb-4 sm:mb-8 lg:mb-12">
                    <span
                      className="block text-xs sm:text-sm text-black/70 mb-1.5 sm:mb-2 font-normal"
                      style={{ fontFamily: 'var(--font-sf)' }}
                    >
                      Project Summary
                    </span>
                    <p
                      className="text-xs sm:text-sm lg:text-base text-zinc-600 leading-relaxed font-normal max-w-lg line-clamp-3 sm:line-clamp-4"
                      style={{ fontFamily: 'var(--font-sf)' }}
                    >
                      {project.summary || project.description}
                    </p>
                  </div>

                  {/* Minimalist Button matching CONTOH IMAGE 1.png */}
                  <div className="cs-btn">
                    <button
                      type="button"
                      onClick={() => onSelectProject?.(project)}
                      className="border border-black rounded-full px-6 py-2 sm:px-8 sm:py-2.5 text-xs sm:text-sm font-normal text-black bg-transparent hover:bg-black hover:text-white transition-all duration-300 cursor-pointer inline-flex items-center justify-center select-none"
                      style={{ fontFamily: 'var(--font-sf)' }}
                    >
                      View Work
                    </button>
                  </div>

                </div>

              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
