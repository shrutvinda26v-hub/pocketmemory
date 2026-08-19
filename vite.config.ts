import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vitest/config'

const root = dirname(fileURLToPath(import.meta.url))

function copyMediapipeWasm(): Plugin {
  const copy = () => {
    const src = resolve(root, 'node_modules/@mediapipe/tasks-vision/wasm')
    const dest = resolve(root, 'public/mediapipe/wasm')
    if (!existsSync(src)) return
    mkdirSync(dest, { recursive: true })
    cpSync(src, dest, { recursive: true })
  }

  return {
    name: 'copy-mediapipe-wasm',
    buildStart: copy,
    configureServer() {
      copy()
    },
  }
}

export default defineConfig({
  plugins: [react(), copyMediapipeWasm()],
  server: {
    host: true,
  },
  build: {
    chunkSizeWarningLimit: 800,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
