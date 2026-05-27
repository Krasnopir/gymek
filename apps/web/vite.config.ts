import { defineConfig, type Plugin } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const REQUIRED_VITE_ENV = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_API_BASE_URL',
] as const

/** Vite вшивает VITE_* только на build — пустые значения дают SSR 500 на Render. */
function requireProductionViteEnv(): Plugin {
  return {
    name: 'gymek-require-vite-env',
    config(_config, { command, isSsrBuild }) {
      if (command !== 'build' || isSsrBuild) {
        return
      }
      const missing = REQUIRED_VITE_ENV.filter((key) => !process.env[key]?.trim())
      if (missing.length > 0) {
        throw new Error(
          `Missing env for production web build: ${missing.join(', ')}. ` +
            'Set them in Render → gymek-web → Environment, then redeploy (Clear build cache).',
        )
      }
    },
  }
}

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    requireProductionViteEnv(),
    devtools(),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
