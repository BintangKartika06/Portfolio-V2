export const projects = [
  {
    id: '01',
    slug: 'milk-and-madu',
    title: 'Milk & Madu',
    category: 'Culinary & Lifestyle',
    year: '2026',
    subtitle: 'Multi-branch Operations',
    role: 'Support Developer',
    summary: 'A premier culinary and lifestyle brand under Double Six Group, featuring custom location portals and interactive digital dining experiences.',
    description: "Milk & Madu is one of the outlets under Double Six Group. I handled the Location and What's On pages — built on WordPress with custom code and GSAP animations.",
    liveUrl: 'https://milkandmadu.com/',
    tools: ['WordPress', 'GSAP'],
    image: new URL('../assets/image_project/Milk&Madu/Thumbnail MM.webp', import.meta.url).href,
    heroImage: new URL('../assets/image_project/Milk&Madu/Preview Project.webp', import.meta.url).href,
    gallery: [
      new URL('../assets/image_project/Milk&Madu/Image_1.webp', import.meta.url).href,
      new URL('../assets/image_project/Milk&Madu/Image_ 2.webp', import.meta.url).href,
      new URL('../assets/image_project/Milk&Madu/Image_3.webp', import.meta.url).href
    ],
    nextProject: {
      title: 'Cocoon Beach Club',
      slug: 'cocoon-beach-club'
    },
    link: '/project/milk-and-madu'
  },
  {
    id: '02',
    slug: 'cocoon-beach-club',
    title: 'Cocoon Beach Club',
    category: 'Luxury Beachfront Venue',
    year: '2026',
    subtitle: 'Beach Club Venue',
    role: 'Frontend Developer',
    summary: 'Beachfront lifestyle destination in Seminyak, delivering an immersive digital experience for reservations, dining, and curated events.',
    description: 'Immersive digital presence for Cocoon Beach Club, highlighting beachfront lifestyle, dining experiences, events calendar, and reservations.',
    liveUrl: 'https://cocoonbeachclub.com/',
    tools: ['WordPress', 'Tailwind CSS', 'GSAP'],
    image: new URL('../assets/image_project/Cocoon Beach Club/Thumbnail_Cocoon.webp', import.meta.url).href,
    heroImage: new URL('../assets/image_project/Cocoon Beach Club/Preview_project.webp', import.meta.url).href,
    gallery: [
      new URL('../assets/image_project/Cocoon Beach Club/Image_1.webp', import.meta.url).href,
      new URL('../assets/image_project/Cocoon Beach Club/Image_2.webp', import.meta.url).href
    ],
    nextProject: {
      title: 'Bali 66',
      slug: 'bali-66'
    },
    link: '/project/cocoon-beach-club'
  },
  {
    id: '03',
    slug: 'bali-66',
    title: 'Bali 66',
    category: 'Hospitality Holding Portal',
    year: '2026',
    subtitle: 'Beach & Lifestyle Destination',
    role: 'Frontend Developer',
    summary: 'Comprehensive group portal connecting iconic beach venues, dining concepts, and hospitality operations across Bali.',
    description: 'Corporate hub and lifestyle portal showcasing the venues, culinary brands, and hospitality experiences across Bali 66 (Double Six Group).',
    liveUrl: 'https://bali66.com/',
    tools: ['Wordpress','React', 'Tailwind CSS', 'GSAP'],
    image: new URL('../assets/image_project/Bali66/Thumbnail_bali66.webp', import.meta.url).href,
    heroImage: new URL('../assets/image_project/Bali66/Preview Project.webp', import.meta.url).href,
    gallery: [
      new URL('../assets/image_project/Bali66/Image_1.webp', import.meta.url).href,
      new URL('../assets/image_project/Bali66/Image_2.webp', import.meta.url).href
    ],
    nextProject: {
      title: 'Final Project Website Villa',
      slug: 'final-project-website-villa'
    },
    link: '/project/bali-66'
  },
  {
    id: '04',
    slug: 'final-project-website-villa',
    title: 'Final Project Website Villa',
    category: 'Villa & Hospitality Booking',
    year: '2025',
    subtitle: 'Villa Booking & Showcase',
    role: 'Full-stack Developer',
    summary: 'Architectural villa showcase and direct booking platform designed with immersive visual tours and smooth room selection.',
    description: 'Academic final project delivering a comprehensive villa reservation platform featuring room previews, interactive booking management, and luxury hospitality branding.',
    tools: ['React.js', 'Tailwind CSS'],
    image: new URL('../assets/image_project/Final Project Website Villa/Thumbnail.webp', import.meta.url).href,
    heroImage: new URL('../assets/image_project/Final Project Website Villa/Preview Project.webp', import.meta.url).href,
    gallery: [
      new URL('../assets/image_project/Final Project Website Villa/Image_ (1).webp', import.meta.url).href,
      new URL('../assets/image_project/Final Project Website Villa/Image_ (2).webp', import.meta.url).href,
      new URL('../assets/image_project/Final Project Website Villa/Image_ (3).webp', import.meta.url).href,
      new URL('../assets/image_project/Final Project Website Villa/Image_ (4).webp', import.meta.url).href
    ],
    nextProject: {
      title: 'New Student Registration Form',
      slug: 'new-student-registration-form'
    },
    link: '/project/final-project-website-villa'
  },
  {
    id: '05',
    slug: 'new-student-registration-form',
    title: 'New Student Registration Form',
    category: 'Academic & Registration System',
    year: '2026',
    subtitle: 'Online Admission Portal',
    role: 'Back-end Developer',
    summary: 'An interactive and responsive online registration portal designed to streamline student admissions with structured multi-step validation and intuitive form UX.',
    description: 'A comprehensive student admission and enrollment interface engineered to simplify academic onboarding. Built with real-time field validation, clean data capture layouts, and accessible input components to ensure a seamless registration journey for prospective students.',
    tools: ['PHP', 'Laragon'],
    image: new URL('../assets/image_project/New Student Registration Form/Thumbnail.webp', import.meta.url).href,
    heroImage: new URL('../assets/image_project/New Student Registration Form/PreviewProject.webp', import.meta.url).href,
    gallery: [
      new URL('../assets/image_project/New Student Registration Form/Image (1).webp', import.meta.url).href,
      new URL('../assets/image_project/New Student Registration Form/Image (2).webp', import.meta.url).href,
      new URL('../assets/image_project/New Student Registration Form/Image (3).webp', import.meta.url).href
    ],
    nextProject: {
      title: 'Login Page Milk & Madu',
      slug: 'login-page-milk-and-madu'
    },
    link: '/project/new-student-registration-form'
  },
  {
    id: '06',
    slug: 'login-page-milk-and-madu',
    title: 'Login Page Milk & Madu',
    category: 'Internal Portal & Auth',
    year: '2025',
    subtitle: 'Operational Portal UI',
    role: 'Frontend Developer',
    summary: 'Secure authentication interface and staff portal tailored for Milk & Madu daily operational management and analytics.',
    description: 'Authentication interface and internal employee/management access portal customized for Milk & Madu operations with secure form validation and responsive design.',
    tools: ['React', 'Tailwind CSS'],
    image: new URL('../assets/image_project/Login Page Milk & Madu/Thumbnail.webp', import.meta.url).href,
    heroImage: new URL('../assets/image_project/Login Page Milk & Madu/Preview Project.webp', import.meta.url).href,
    gallery: [],
    nextProject: {
      title: 'Portfolio V1',
      slug: 'portofolio-v1'
    },
    link: '/project/login-page-milk-and-madu'
  },
  {
    id: '07',
    slug: 'portofolio-v1',
    title: 'Portfolio V1',
    category: 'Personal Archive',
    year: '2024',
    subtitle: 'Personal Archive & Showcase',
    role: 'Frontend Developer',
    summary: 'First generation personal developer portfolio showcasing early interactive experiments, responsive web design, and component architecture.',
    description: 'Personal archive showcasing early frontend development foundations, responsive layout systems, and clean component architecture built with Tailwind CSS and modern web standards.',
    liveUrl: 'https://bintangkartika-portofolio.netlify.app/',
    tools: ['Tailwind CSS', 'JavaScript', 'HTML5'],
    image: new URL('../assets/image_project/Portofolio V1/Thumbnail.webp', import.meta.url).href,
    heroImage: new URL('../assets/image_project/Portofolio V1/Preview Project.webp', import.meta.url).href,
    gallery: [
      new URL('../assets/image_project/Portofolio V1/Image_1.webp', import.meta.url).href
    ],
    nextProject: {
      title: 'Milk & Madu',
      slug: 'milk-and-madu'
    },
    link: '/project/portofolio-v1'
  }
]
