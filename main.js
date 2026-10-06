import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
// #ifdef H5
// 小程序端用 wxcomponents 里的 vant-weapp；H5 端注册同名 vant 4 组件，
// 让 pages.json 里 van-* 模板在网页端也能解析（图标/弹层/单元格等）
import Vant from 'vant'
import 'vant/lib/index.css'
import AppPopupH5 from './components/app-popup-h5.vue'
// #endif
export function createApp() {
  const app = createSSRApp(App)
  app.use(createPinia())
  // #ifdef H5
  app.use(Vant)
  // van-popup 用本地替身覆盖：vant 4 Popup 在 uni-app H5 下有「状态已关、DOM 残留」的补丁脱节问题
  app.component('van-popup', AppPopupH5)
  // #endif
  return {
    app
  }
}
// #endif