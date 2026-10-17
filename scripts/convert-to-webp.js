import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

function getFiles(dir) {
  let results = []
  const list = fs.readdirSync(dir)
  for (const file of list) {
    const full = path.join(dir, file)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      results = results.concat(getFiles(full))
    } else if (/\.(png|jpe?g)$/i.test(file)) {
      results.push(full)
    }
  }
  return results
}

async function convertImage(srcPath, maxWidth = 1920, quality = 85) {
  const dir = path.dirname(srcPath)
  const ext = path.extname(srcPath)
  const baseName = path.basename(srcPath, ext)
  const destPath = path.join(dir, `${baseName}.webp`)

  const image = sharp(srcPath)
  const meta = await image.metadata()

  let pipeline = image.rotate() 
  if (meta.width && meta.width > maxWidth) {
    pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true })
  }

  await pipeline.webp({ quality, effort: 6 }).toFile(destPath)

  const originalSize = fs.statSync(srcPath).size
  const newSize = fs.statSync(destPath).size
  const saving = (((originalSize - newSize) / originalSize) * 100).toFixed(1)

  console.log(
    `✓ Converted: ${path.relative('src/assets', destPath)}: ${(originalSize / 1024).toFixed(0)} KB -> ${(newSize / 1024).toFixed(0)} KB (-${saving}%)`
  )
}

async function run() {
  console.log('--- Optimizing Portrait Image ---')
  const portraitPath = path.resolve('src/assets/FullSizeRender.jpeg')
  if (fs.existsSync(portraitPath)) {
    await convertImage(portraitPath, 1200, 85)
  }

  console.log('\n--- Optimizing Project Images ---')
  const projectFiles = getFiles('src/assets/image_project')
  for (const file of projectFiles) {
    await convertImage(file, 1920, 85)
  }

  console.log('\nDone!')
}

run().catch(console.error)
