import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import Footer from './Footer'
import ImageLightboxModal from './ImageLightboxModal'

export default function ProjectDetail({ project, onBack, onNavigateNext }) {
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const containerRef = useRef(null)
  const heroImageRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1 })

      if (heroImageRef.current) {
        tl.fromTo(
          heroImageRef.current,
          { scale: 1.06, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.1, ease: 'power3.out' }
        )
      }

      if (contentRef.current) {
        tl.fromTo(
          contentRef.current.children,
          { y: 35, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power2.out' },
          '-=0.7'
        )
      }
    }, containerRef)

    return () => ctx.revert()
  }, [project])

  if (!project) return null

  return (
    <div ref={containerRef} className="min-h-screen bg-white text-[#070707] flex flex-col justify-between">
      <main className="w-full px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20 pt-28 sm:pt-36 pb-20 max-w-7xl mx-auto">
        {/* Back to Projects Button */}
        <div className="mb-10 sm:mb-14">
          <button
            type="button"
            onClick={onBack}
            className="group inline-flex items-center space-x-4 cursor-pointer select-none text-zinc-700 hover:text-black transition-colors"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-black/20 flex items-center justify-center group-hover:bg-black group-hover:border-black group-hover:text-white transition-all duration-300">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transform group-hover:-translate-x-0.5 transition-transform duration-300"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm font-mono uppercase tracking-widest font-semibold">
              Back to Projects
            </span>
          </button>
        </div>

        {/* Hero Section */}
        <div className="relative mb-14 sm:mb-20">
          <div
            ref={heroImageRef}
            className="w-full max-h-[70vh] aspect-[16/10] sm:aspect-[21/10] overflow-hidden rounded-2xl sm:rounded-3xl bg-zinc-100 shadow-xl"
          >
            <img
              src={project.heroImage || project.image}
              alt={project.title}
              decoding="async"
              className="w-full h-full object-cover object-center"
            />
          </div>

          <div ref={contentRef} className="mt-8 sm:mt-12">
            <h1
              style={{ fontFamily: "var(--font-serif-headline), serif" }}
              className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-black mb-6"
            >
              {project.title}
            </h1>

            {project.liveUrl && (
              <div className="mt-6 mb-12 sm:mb-16">
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden rounded-full border-2 border-black text-black font-mono text-xs sm:text-sm uppercase tracking-widest inline-flex items-center px-8 py-3.5 sm:px-10 sm:py-4 transition-colors duration-300 hover:text-white cursor-pointer"
                >
                  <span className="relative z-10 font-semibold">Live Project ↗</span>
                  <span className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out z-0" />
                </a>
              </div>
            )}

            {/* Description & Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-12 pt-8 mb-20 sm:mb-28">
              <div className="md:col-span-7">
                <p className="text-lg sm:text-xl text-zinc-700 font-light leading-relaxed">
                  {project.description ||
                    'Comprehensive custom digital experience crafted with performant frontend architecture and smooth animations.'}
                </p>
              </div>

              <div className="md:col-span-5 grid grid-cols-3 gap-6">
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-3">
                    Year
                  </h3>
                  <p className="font-sans font-medium text-black text-base">{project.year}</p>
                </div>

                <div>
                  <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-3">
                    Role
                  </h3>
                  <p className="font-sans font-medium text-black text-base">
                    {project.role || 'Frontend Developer'}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-3">
                    Tech & Tools
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {project.tools?.map((tool) => (
                      <span
                        key={tool}
                        className="px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-800 text-xs font-mono font-medium"
                      >
                        {tool}
                      </span>
                    )) || (
                      <span className="text-zinc-600 text-sm font-mono">React / GSAP</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Showcase Gallery */}
            {project.gallery && project.gallery.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-20 sm:mb-28">
                {project.gallery.map((imgUrl, i) => (
                  <div
                    key={i}
                    onClick={() => setLightboxIndex(i)}
                    className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-zinc-100 shadow-md aspect-[4/3] group cursor-pointer"
                  >
                    <img
                      src={imgUrl}
                      alt={`${project.title} detail ${i + 1}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-300">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          <line x1="11" y1="8" x2="11" y2="14" />
                          <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Next Project Navigator */}
            {project.nextProject && (
              <div className="flex justify-end pt-10 sm:pt-14">
                <div className="text-right">
                  <p className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-3">
                    Other Project
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigateNext?.(project.nextProject.slug)}
                    className="group relative overflow-hidden rounded-full border-2 border-black text-black font-mono text-xs sm:text-sm uppercase tracking-widest inline-flex items-center px-7 py-3 sm:px-9 sm:py-3.5 transition-colors duration-300 hover:text-white cursor-pointer"
                  >
                    <span className="relative z-10 font-semibold inline-flex items-center space-x-2">
                      <span>{project.nextProject.title}</span>
                      <span className="transform group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-300">
                        ↗
                      </span>
                    </span>
                    <span className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out z-0" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Lightbox Modal for Gallery Images */}
      {lightboxIndex !== null && (
        <ImageLightboxModal
          key={lightboxIndex}
          isOpen={true}
          images={project.gallery || []}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(idx) => setLightboxIndex(idx)}
          title={project.title}
        />
      )}
    </div>
  )
}
