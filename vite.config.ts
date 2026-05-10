import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Public site origin (no trailing slash). Set `VITE_PUBLIC_SITE_URL` on Vercel when you add a custom domain. */
function publicSiteOrigin(): string {
  const raw = process.env.VITE_PUBLIC_SITE_URL?.trim() || 'https://fastview-site.vercel.app'
  return raw.replace(/\/$/, '')
}

function siteJsonLd(origin: string): string {
  const payload = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FastView',
    alternateName: ['FastView Seattle permits', 'FastView SDCI'],
    url: `${origin}/`,
    description:
      'Unofficial Seattle SDCI construction permit viewer—record lookup, workflow timeline, and discipline review status in one place.',
    publisher: {
      '@type': 'Organization',
      name: 'FastView',
      url: `${origin}/`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${origin}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
  return JSON.stringify(payload)
}

function seoStaticFilesPlugin(origin: string): Plugin {
  return {
    name: 'seo-static-files',
    closeBundle() {
      const outDir = path.resolve(__dirname, 'dist')
      const robots = `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`
      const routes = [
        { path: '/', priority: '1.0' },
        { path: '/support', priority: '0.7' },
        { path: '/permit-workflow', priority: '0.9' },
        { path: '/review-status', priority: '0.9' },
      ]
      const urlEntries = routes
        .map(({ path: p, priority }) => {
          const loc = p === '/' ? `${origin}/` : `${origin}${p}`
          return `  <url>
    <loc>${loc}</loc>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`
        })
        .join('\n')
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`
      fs.mkdirSync(outDir, { recursive: true })
      fs.writeFileSync(path.join(outDir, 'robots.txt'), robots, 'utf8')
      fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap, 'utf8')
    },
  }
}

/** Same-origin proxy so GET /health works in dev without CORS on the Render app (often only /api/* has CORS). */
const sdciDevProxy = {
  '/sdci-api': {
    target: 'https://fastview-sdci.onrender.com',
    changeOrigin: true,
    secure: true,
    rewrite: (pathStr: string) => pathStr.replace(/^\/sdci-api/, ''),
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'html-seo-replace',
      transformIndexHtml(html) {
        const origin = publicSiteOrigin()
        return html.replace(/%SITE_ORIGIN%/g, origin).replace('%SITE_JSONLD%', siteJsonLd(origin))
      },
    },
    seoStaticFilesPlugin(publicSiteOrigin()),
  ],
  server: { proxy: sdciDevProxy },
  preview: { proxy: sdciDevProxy },
})
