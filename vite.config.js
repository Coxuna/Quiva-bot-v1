import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [react(), tailwindcss()],
    build: {
      outDir: 'dist',
    },
    server: {
      fs: {
        allow: ['./'],
      },
      allowedHosts: ['uncommon-urgently-ant.ngrok-free.app'],
    },
    define: {
      __API_URL__: JSON.stringify(env.VITE_API_URL),
      global: 'window',
    },
    resolve: {
      alias: {
        buffer: 'buffer',
      },
    },
    optimizeDeps: {
      include: [
        '@reown/appkit',
        '@reown/appkit-common',
        '@reown/appkit-universal-connector',
        '@hashgraph/sdk',
        'ethers',
      ],
    },
    // Suppress sourcemap warnings for node_modules
    customLogger: {
      warn: (msg) => {
        // Filter out sourcemap warnings
        if (typeof msg === 'string' && msg.includes('Sourcemap for') && msg.includes('points to missing source files')) {
          return;
        }
        console.warn(msg);
      },
      warnOnce: (msg) => {
        // Filter out sourcemap warnings
        if (typeof msg === 'string' && msg.includes('Sourcemap for') && msg.includes('points to missing source files')) {
          return;
        }
        console.warn(msg);
      },
      info: (msg, options) => {
        console.info(msg, options || '');
      },
      error: (msg, options) => {
        console.error(msg, options || '');
      },
      clearScreen: () => {},
      hasErrorLogged: () => false,
    },
  }
})