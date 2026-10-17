import { projects } from './projects'

/**
 * Playground Projects Data
 * 
 * Anda dapat menambahkan project baru di bawah ini.
 * Setiap project yang ditambahkan di sini akan langsung OTOMATIS tampil
 * di dalam halaman 3D Interactive Playground (/playground).
 * 
 * Format object:
 * {
 *   id: string,
 *   title: string,
 *   category: string,
 *   year: string,
 *   subtitle: string,
 *   slug: string, // jika cocok dengan slug di projects.js, akan membuka halaman detail saat diklik
 *   image: string, // URL gambar preview card
 *   liveUrl?: string, // optional URL eksternal
 *   tools?: string[],
 * }
 */

export const playgroundProjects = [
  ...projects.map((p) => ({
    id: p.id,
    title: p.title,
    category: p.category,
    year: p.year,
    subtitle: p.subtitle,
    slug: p.slug,
    image: p.image,
    liveUrl: p.liveUrl,
    tools: p.tools,
  })),

  // Tambahkan project eksperimen / archive tambahan di sini jika diinginkan:
  /*
  {
    id: '06',
    title: 'Visual Experiment 01',
    category: 'Creative Coding & Motion',
    year: '2026',
    subtitle: 'Shader Study',
    slug: 'visual-experiment-01',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    tools: ['Three.js', 'GLSL'],
  },
  */
]

export default playgroundProjects
