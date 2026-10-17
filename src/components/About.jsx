import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import portraitImg from '../assets/FullSizeRender.webp'

gsap.registerPlugin(ScrollTrigger)

export default function About() {
  const sectionRef = useRef(null)
  const imageContainerRef = useRef(null)
  const contactLinkRef = useRef(null)
  const whatIDoTitleRef = useRef(null)
  const skillsListRef = useRef([])
  const aboutMeTitleRef = useRef(null)
  const bioParasRef = useRef([])

  const skills = [
    'Frontend Development',
    'WordPress Development',
    'UI/UX Implementation',
    'Web & SEO Optimization',
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      })

      tl.fromTo(
        imageContainerRef.current,
        {
          clipPath: 'inset(100% 0% 0% 0%)',
          scale: 1.1,
          opacity: 0,
        },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          scale: 1,
          opacity: 1,
          duration: 1.2,
          ease: 'power4.out',
          force3D: true,
        }
      )
        .fromTo(
          contactLinkRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
          '-=0.6'
        )
        .fromTo(
          whatIDoTitleRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
          '-=0.8'
        )
        .fromTo(
          skillsListRef.current,
          { opacity: 0, x: -15 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
          },
          '-=0.5'
        )
        .fromTo(
          aboutMeTitleRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
          '-=0.9'
        )
        .fromTo(
          bioParasRef.current,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
          },
          '-=0.6'
        )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="pt-24 sm:pt-36 pb-16 sm:pb-24"
      data-purpose="author-profile"
      id="about"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16 items-start">
        <div className="md:col-span-3 lg:col-span-3 flex flex-col space-y-4">
          <div
            ref={imageContainerRef}
            className="w-full max-w-[260px] aspect-[3/4] bg-zinc-100 overflow-hidden shadow-xs will-change-transform group"
          >
            <img
              src={portraitImg}
              alt="I Made Bintang Kartika Yasa portrait"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-all duration-500 scale-[1.75] group-hover:scale-[1.82]"
              style={{ transformOrigin: '50% 46%' }}
            />
          </div>
          <div ref={contactLinkRef} className="pt-1">
            <a
              href="mailto:bintangkartika3008@gmail.com"
              className="text-xs font-mono tracking-widest text-zinc-600 hover:text-black uppercase transition-colors inline-block"
            >
              [ CONTACT ]
            </a>
          </div>
        </div>

        <div className="md:col-span-4 lg:col-span-4 space-y-6 md:pt-1">
          <h3
            ref={whatIDoTitleRef}
            className="text-xs font-mono tracking-[0.25em] text-zinc-400 uppercase font-semibold"
          >
            WHAT I DO
          </h3>
          <ul className="space-y-4 text-zinc-700 text-sm font-sans">
            {skills.map((skill, idx) => (
              <li
                key={skill}
                ref={(el) => (skillsListRef.current[idx] = el)}
                className="flex items-center space-x-2"
              >
                <span className="text-zinc-400 text-xs">•</span>
                <span>{skill}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-5 lg:col-span-5 space-y-6 md:pt-1">
          <h3
            ref={aboutMeTitleRef}
            className="text-xs font-mono tracking-[0.25em] text-zinc-400 uppercase font-semibold"
          >
            ABOUT ME
          </h3>
          <div className="space-y-4 text-zinc-700 text-sm font-sans leading-relaxed">
            <p ref={(el) => (bioParasRef.current[0] = el)}>
              I&apos;m{' '}
              <strong className="font-bold text-black">
                I Made Bintang Kartika Yasa
              </strong>
              , Web Developer with experience building and maintaining responsive websites across real industries. Skilled in WordPress, Laravel, and React — with a strong eye for clean CSS and frontend detail. I&apos;ve successfully deployed 50+ production websites, maintained 5+ outlet sites, and worked across teams to deliver solutions that actually work.
            </p>
            <p ref={(el) => (bioParasRef.current[1] = el)}>
              Passionate about turning designs into functional, user-friendly experiences. Committed to writing clean, maintainable code that solves real problems. I am a problem-solving person and enjoy teamwork using the brainstorming method, which can help me think critically to find ideas and solutions in this technological world.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
