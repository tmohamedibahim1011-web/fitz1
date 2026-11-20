import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function copyToBuildPlugin() {
  return {
    name: 'copy-to-build',
    closeBundle() {
      try {
        const distDir = path.resolve(__dirname, 'dist')
        const buildDir = path.resolve(__dirname, 'build')
        if (fs.existsSync(distDir)) {
          fs.cpSync(distDir, buildDir, { recursive: true })
        }
      } catch (e) {
        console.warn('Could not sync to build directory:', e.message)
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), copyToBuildPlugin()],
})
