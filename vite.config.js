import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Setup __dirname untuk ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Paksa resolve ke path ESM helper Babel
      '@babel/runtime/helpers/createSuper':
        resolve(__dirname, 'node_modules/@babel/runtime/helpers/esm/createSuper.js'),
    },
  },
  optimizeDeps: {
    include: [
      '@babel/runtime/helpers/createSuper',
      '@babel/runtime/helpers/typeof',
      '@babel/runtime/helpers/classCallCheck',
      '@babel/runtime/helpers/inherits',
      '@babel/runtime/helpers/possibleConstructorReturn'
    ]
  },
  build: {
    target: 'es2015',
    commonjsOptions: {
      include: [/node_modules/, '@babel/runtime/**'],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: [], // pastikan semua di-bundle
    }
  }
})
