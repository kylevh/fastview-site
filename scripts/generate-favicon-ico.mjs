import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import toIco from 'to-ico'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const svgPath = path.join(root, 'public', 'fastview-logo.svg')
const outPath = path.join(root, 'public', 'favicon.ico')

const svg = fs.readFileSync(svgPath)
const sizes = [16, 32, 48]
const pngBuffers = await Promise.all(
  sizes.map((size) => sharp(svg).resize(size, size).png().toBuffer()),
)
const ico = await toIco(pngBuffers)
fs.writeFileSync(outPath, ico)

console.log(`Wrote ${path.relative(root, outPath)} (${sizes.join(', ')} px)`)
