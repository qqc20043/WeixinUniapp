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
// #endif
export function createApp() {
  const app = createSSRApp(App)
  app.use(createPinia())
  // #ifdef H5
  app.use(Vant)
  // #endif
  return {
    app
  }
}
// #endif