import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** Same-origin proxy so GET /health works in dev without CORS on the Render app (often only /api/* has CORS). */
const sdciDevProxy = {
  '/sdci-api': {
    target: 'https://fastview-sdci.onrender.com',
    changeOrigin: true,
    secure: true,
    rewrite: (path: string) => path.replace(/^\/sdci-api/, ''),
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { proxy: sdciDevProxy },
  preview: { proxy: sdciDevProxy },
})
