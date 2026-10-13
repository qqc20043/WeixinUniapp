// #ifdef H5
/* ============================================================================
 * ⚠️ 修 H5 控制台 TypeError
 *    `Cannot assign to read only property '_' of object '#<Object>'`
 *
 * ── 现象 ──
 *   H5 端每次进入 pages/dingdan（订单页）都会在控制台抛一次这个 TypeError。
 *   已用 CDP 拦截 Object.defineProperty + 逐列定位 build 产物（index-*.js）
 *   确认了完整链路，非推测：
 *
 *   1) dingdan.vue 的三个 <van-popup>（取消/支付/评价弹层）都传**具名 default
 *      插槽**，编译产物形如 `{ default: () => [...], _: 1 }`。
 *   2) H5 端 van-popup 被 components/app-popup-h5.vue 同名覆盖（见下方
 *      app.component('van-popup', ...)），它同样消费 default 插槽。
 *   3) Vue 3 运行时的 setupComponent → initSlots **每次父组件重渲染**都会执行：
 *        const n = t._
 *        n ? (e.slots = _n(t), L(t, "_", n)) : (t, e.slots = {})
 *      其中（全 bundle 唯一一处带 writable 的 defineProperty）
 *        L = (e,t,n,o=false) => Object.defineProperty(e,t,{configurable:!0,enumerable:!1,writable:o,value:n})
 *      `o` 默认 false ⇒ 把 `_` 钉成 **non-writable**。
 *   4) 父组件重渲染时，运行时走 updateComponentPreRender 的 slots 闭包：
 *        const e = t._;
 *        e ? (n && 1===e ? l=!1 : (Object.assign(a,t), n||1!==e||delete a._)) : ...
 *      —— 即 `Object.assign(instance.slots, newChildren)`，试图写入 `_`
 *      ⇒ 撞上 non-writable ⇒ 抛 TypeError。
 *   5) dingdan.vue 的 onShow 里 `orders.value = Array.from(byOrder.values())`
 *      整体换新数组 → 必然触发一次父组件重渲染 ⇒ 每次进订单页必报一次。
 *
 * ── 走过的弯路（都实测否掉，别重走）──
 *   a) 在 app-popup-h5.vue 的 onBeforeMount 里改 `_` → 太晚（initSlots 在 setup 前）；
 *   b) 在 setup() / onMounted 里改 → 第 1 次进订单页 0 错、第 2 次又 1 错
 *      （每次重渲染 initSlots 都会重新把 `_` 钉回去）；
 *   c) 包装全局 Object.assign（写在 main.js 顶层）→ **完全无效**。
 *      原因：ESM 的 import 会被提升到模块代码之前求值，
 *      而 Vue 运行时在模块初始化时就做了局部别名 `var c = Object.assign`
 *      （实测：别名捕获 @ bundle 偏移 3095，而 main.js 的代码被排到 424834）。
 *      运行时随后调用的是已捕获的 `c`，再包装全局 Object.assign 也拦不到。
 *
 * ── 最终做法：包装 Object.defineProperty，拦住「用不可写方式定义 `_`」这一次调用 ──
 *   既然写入者（运行时的 `c(...)`）拦不到，就拦**钉钉子的人**：
 *   `L(t,"_",n)` 走的就是 `Object.defineProperty(slots,"_",{writable:false,...})`。
 *   这里把这一个特定调用改写成 `writable:true`。
 *
 *   为什么这次能生效：Object.defineProperty 是在**调用点**动态取的全局属性
 *   （bundle 里就是 `Object.defineProperty(...)`，不是别名），
 *   所以即使本代码在模块求值顺序上晚于运行时，运行时后续每次 initSlots
 *   都会读到被包装后的版本。
 *
 * ── 收窄影响面 ──
 *   只在严格满足以下全部条件时才放宽：目标对象是普通对象、属性名恰为 "_"、
 *   描述符是「数据描述符且 writable === false 且 configurable === true」。
 *   其余一切情况原样透传，语义与未打补丁时完全一致。
 *   真正 Object.freeze 出来的对象（configurable:false）不受影响、照旧抛错。
 * ========================================================================== */
;(function () {
  if (typeof Object === 'undefined' || typeof Object.defineProperty !== 'function') return
  var origDP = Object.defineProperty
  if (origDP.__dshSafeDefine) return                // 幂等：热重载不重复包装
  var safeDP = function (obj, prop, desc) {
    // 只拦「给 slots 对象钉 `_` 稳定性标记」这一种调用，且只在它不可写但可配置时放宽
    if (prop === '_' && obj && typeof obj === 'object' && !Array.isArray(obj) &&
        desc && typeof desc === 'object' &&
        Object.prototype.hasOwnProperty.call(desc, 'value') &&
        desc.writable === false && desc.configurable === true) {
      var relaxed = {}
      for (var k in desc) { if (Object.prototype.hasOwnProperty.call(desc, k)) relaxed[k] = desc[k] }
      relaxed.writable = true                       // ← 唯一改动
      return origDP.call(Object, obj, prop, relaxed)
    }
    return origDP.apply(Object, arguments)
  }
  safeDP.__dshSafeDefine = true
  Object.defineProperty = safeDP
})()
// #endif

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