import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// O caminho base é configuração, nunca fixo no código (ADR-0001).
// Teste: /semreservas/  ·  definitivo: /
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.BASE_PATH || '/'
  return { base: base.endsWith('/') ? base : base + '/', plugins: [react()] }
})
