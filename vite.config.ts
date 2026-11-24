import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? ''
const base =
  process.env.GITHUB_ACTIONS === 'true' &&
  repositoryName.length > 0 &&
  !repositoryName.endsWith('.github.io')
    ? `/${repositoryName}/`
    : '/'

export default defineConfig({
  base,
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'search',
        },
      },
    }),
  ],
})
