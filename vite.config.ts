import react from '@vitejs/plugin-react'
import { configDefaults, defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    // gsi-server is a separate Node project with its own package.json and
    // test runner (`cd gsi-server && npm run test`) — keep it out of this
    // suite so `npm run test` at the root doesn't double-run it.
    exclude: [...configDefaults.exclude, 'gsi-server/**'],
  },
})
