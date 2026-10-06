import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

/**
 * uni-app 构建配置（Vue 3 + Vite）
 *
 * 说明：本工程原为 HBuilderX 工程（无 CLI 依赖），
 * 为支持命令行构建（H5 / mp-weixin）而补齐 CLI 工具链，
 * 这样在服务器（W4 部署）上也能构建，不依赖 GUI。
 */
export default defineConfig({
  plugins: [uni()]
})
