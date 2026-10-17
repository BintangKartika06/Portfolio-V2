/* global process */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { projects } from '../src/data/projects.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const distDir = path.resolve(rootDir, 'dist')

const BASE_URL = (process.env.SITE_URL || 'https://bintang-portfolio.vercel.app').replace(/\/$/, '')
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

function replaceMetaTags(template, { title, description, url, image, type = 'website' }) {
  let html = template

  // Replace Title
  html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`)
  html = html.replace(/<meta name="title" content=".*?" \/>/i, `<meta name="title" content="${title}" />`)

  // Replace Description
  html = html.replace(
    /<meta name="description" content=".*?" \/>/i,
    `<meta name="description" content="${description}" />`
  )

  // Replace Canonical & OG URL
  html = html.replace(/<link rel="canonical" href=".*?" \/>/i, `<link rel="canonical" href="${url}" />`)
  html = html.replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${url}" />`)
  html = html.replace(/<meta name="twitter:url" content=".*?" \/>/i, `<meta name="twitter:url" content="${url}" />`)

  // Replace OG / Twitter Title
  html = html.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${title}" />`)
  html = html.replace(/<meta name="twitter:title" content=".*?" \/>/i, `<meta name="twitter:title" content="${title}" />`)

  // Replace OG / Twitter Description
  html = html.replace(
    /<meta property="og:description" content=".*?" \/>/i,
    `<meta property="og:description" content="${description}" />`
  )
  html = html.replace(
    /<meta name="twitter:description" content=".*?" \/>/i,
    `<meta name="twitter:description" content="${description}" />`
  )

  // Replace OG / Twitter Image
  html = html.replace(/<meta property="og:image" content=".*?" \/>/i, `<meta property="og:image" content="${image}" />`)
  html = html.replace(
    /<meta name="twitter:image" content=".*?" \/>/i,
    `<meta name="twitter:image" content="${image}" />`
  )

  // Replace OG Image Type if image ends with .png, .webp, or .jpg
  const imageType = image.endsWith('.webp') ? 'image/webp' : image.endsWith('.png') ? 'image/png' : 'image/jpeg'
  if (html.includes('<meta property="og:image:type"')) {
    html = html.replace(/<meta property="og:image:type" content=".*?" \/>/i, `<meta property="og:image:type" content="${imageType}" />`)
  }

  // Replace OG Type
  html = html.replace(/<meta property="og:type" content=".*?" \/>/i, `<meta property="og:type" content="${type}" />`)

  return html
}

function injectBody(template, bodyContent) {
  return template.replace('<div id="root"></div>', `<div id="root">${bodyContent}</div>`)
}

// Generate Semantic HTML for Home
function generateHomeBody() {
  const projectsListHtml = projects
    .map(
      (p) => `
      <article style="margin-bottom: 2rem;">
        <h3><a href="/project/${p.slug}">${p.title}</a></h3>
        <p><strong>${p.category}</strong> (${p.year}) — ${p.subtitle}</p>
        <p>${p.summary}</p>
        <p>Tools: ${p.tools.join(', ')}</p>
      </article>
    `
    )
    .join('')

  return `
    <header>
      <nav>
        <a href="/">Home</a>
        <a href="/playground">Playground</a>
      </nav>
    </header>
    <main>
      <section id="hero">
        <h1>Bintang Kartika</h1>
        <p>Web Developer & Frontend Specialist</p>
        <p>Crafting immersive digital experiences with modern web technologies, React, and GSAP animations.</p>
      </section>
      <section id="about">
        <h2>About Me</h2>
        <p>Passionate frontend engineer focusing on smooth user interactions, performance, and modern aesthetics.</p>
      </section>
      <section id="projects">
        <h2>Featured Projects</h2>
        ${projectsListHtml}
      </section>
    </main>
    <footer>
      <p>&copy; ${new Date().getFullYear()} Bintang Kartika. All rights reserved.</p>
    </footer>
  `
}

// Generate Semantic HTML for Project Detail
function generateProjectBody(p) {
  const toolsHtml = p.tools.map((tool) => `<span>${tool}</span>`).join(', ')
  const coverImg = (p.heroImage || p.image || '').startsWith('file://') ? DEFAULT_IMAGE : (p.heroImage || p.image)
  const galleryHtml = (p.gallery || [])
    .map((imgUrl, i) => {
      const src = imgUrl && !imgUrl.startsWith('file://') ? imgUrl : DEFAULT_IMAGE
      return `<img src="${src}" alt="${p.title} preview screenshot ${i + 1}" loading="lazy" />`
    })
    .join('\n')

  return `
    <header>
      <nav>
        <a href="/">&larr; Back to all projects</a>
      </nav>
    </header>
    <main>
      <article>
        <h1>${p.title}</h1>
        <p><strong>Category:</strong> ${p.category} | <strong>Year:</strong> ${p.year} | <strong>Role:</strong> ${p.role}</p>
        <p><strong>Tools:</strong> ${toolsHtml}</p>
        <section>
          <h2>Overview</h2>
          <p>${p.description}</p>
          <p>${p.summary}</p>
          ${p.liveUrl ? `<p><a href="${p.liveUrl}" target="_blank" rel="noopener noreferrer">Visit Live Project &rarr;</a></p>` : ''}
        </section>
        <section>
          <h2>Project Showcase</h2>
          <img src="${coverImg}" alt="${p.title} cover image" />
          ${galleryHtml}
        </section>
        ${p.nextProject ? `<aside><p>Next Project: <a href="/project/${p.nextProject.slug}">${p.nextProject.title}</a></p></aside>` : ''}
      </article>
    </main>
    <footer>
      <p>&copy; ${new Date().getFullYear()} Bintang Kartika. All rights reserved.</p>
    </footer>
  `
}

// Generate Semantic HTML for Playground
function generatePlaygroundBody() {
  return `
    <header>
      <nav>
        <a href="/">&larr; Back to Home</a>
      </nav>
    </header>
    <main>
      <h1>Interactive Playground & Experiments</h1>
      <p>A creative sandbox exploring shaders, web animations, micro-interactions, and experimental UI mechanics.</p>
    </main>
    <footer>
      <p>&copy; ${new Date().getFullYear()} Bintang Kartika. All rights reserved.</p>
    </footer>
  `
}

function runPrerender() {
  const templatePath = path.resolve(distDir, 'index.html')
  if (!fs.existsSync(templatePath)) {
    console.error('❌ dist/index.html not found. Please run "vite build" first.')
    process.exit(1)
  }

  const baseTemplate = fs.readFileSync(templatePath, 'utf8')
  console.log('🚀 Starting SEO Prerender for all routes...\n')

  // 1. Prerender Home Route
  const homeMeta = {
    title: 'Bintang Kartika — Web Developer & Frontend Specialist',
    description:
      'Personal portfolio of Bintang Kartika, showcasing web development, interactive frontend experiences, and creative engineering.',
    url: `${BASE_URL}/`,
    image: DEFAULT_IMAGE,
    type: 'website',
  }
  const homeHtml = injectBody(replaceMetaTags(baseTemplate, homeMeta), generateHomeBody())
  fs.writeFileSync(path.resolve(distDir, 'index.html'), homeHtml, 'utf8')
  console.log('  ✓ [Route] / -> dist/index.html')

  // 2. Prerender Playground Route
  const playgroundDir = path.resolve(distDir, 'playground')
  ensureDir(playgroundDir)
  const playgroundMeta = {
    title: 'Playground & Creative Lab — Bintang Kartika',
    description:
      'Interactive experiments, shaders, motion animations, and exploratory UI mechanics crafted by Bintang Kartika.',
    url: `${BASE_URL}/playground`,
    image: DEFAULT_IMAGE,
    type: 'website',
  }
  const playgroundHtml = injectBody(replaceMetaTags(baseTemplate, playgroundMeta), generatePlaygroundBody())
  fs.writeFileSync(path.resolve(playgroundDir, 'index.html'), playgroundHtml, 'utf8')
  console.log('  ✓ [Route] /playground -> dist/playground/index.html')

  // 3. Prerender Each Project Detail Route
  for (const project of projects) {
    const projectDir = path.resolve(distDir, 'project', project.slug)
    ensureDir(projectDir)

    const projectMeta = {
      title: `${project.title} — Bintang Kartika`,
      description: project.summary || project.description,
      url: `${BASE_URL}/project/${project.slug}`,
      image: (project.image && !project.image.startsWith('file://')) ? project.image : DEFAULT_IMAGE,
      type: 'article',
    }

    const projectHtml = injectBody(replaceMetaTags(baseTemplate, projectMeta), generateProjectBody(project))
    fs.writeFileSync(path.resolve(projectDir, 'index.html'), projectHtml, 'utf8')
    console.log(`  ✓ [Route] /project/${project.slug} -> dist/project/${project.slug}/index.html`)
  }

  // 4. Generate sitemap.xml
  generateSitemap()

  console.log('\n✨ Prerender complete! All routes now contain full SEO HTML & Social Share meta tags.')
}

function generateSitemap() {
  const currentDate = new Date().toISOString().split('T')[0]
  const urls = [
    { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'weekly' },
    { loc: `${BASE_URL}/playground`, priority: '0.8', changefreq: 'monthly' },
    ...projects.map((p) => ({
      loc: `${BASE_URL}/project/${p.slug}`,
      priority: '0.9',
      changefreq: 'monthly',
    })),
  ]

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`

  fs.writeFileSync(path.resolve(distDir, 'sitemap.xml'), sitemapXml, 'utf8')
  fs.writeFileSync(path.resolve(rootDir, 'public', 'sitemap.xml'), sitemapXml, 'utf8')
  console.log(`  ✓ [Sitemap] sitemap.xml generated with ${urls.length} routes`)
}

runPrerender()
