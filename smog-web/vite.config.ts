import { ConfigEnv, defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default ({ command, mode }: ConfigEnv) =>{
  const env = loadEnv(mode, process.cwd());

  return defineConfig({
    plugins: [vue()],
    server: {
      host: '0.0.0.0'
    },
    base: env.VITE_BASE_PATH
  })
}