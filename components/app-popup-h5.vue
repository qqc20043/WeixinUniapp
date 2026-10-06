<script setup>
/**
 * van-popup 的 H5 替身（轻量自绘版）。
 *
 * 背景：vant 4 的 Popup 在 uni-app H5 下出现「状态已关、DOM 节点残留」的
 * 补丁脱节问题（遮罩正常隐藏、弹窗元素滞留可见）。本组件在 H5 端于 main.js
 * 里覆盖 vant 的 van-popup 同名注册，API 对齐本项目实际用到的子集：
 * props: show / position / round / z-index / custom-style
 * emits: update:show / close / click-overlay（遮罩点击时三者齐发，
 *        与小程序端 vant-weapp「点遮罩触发 close」的行为对齐）
 * 实现：v-if 直接卸载，无过渡动画，不依赖任何 vant 内部机制。
 */
import { computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  position: { type: String, default: 'center' },
  round: { type: Boolean, default: false },
  zIndex: { type: [Number, String], default: 2000 },
  customStyle: { type: [Object, String], default: () => ({}) },
  closeOnClickOverlay: { type: Boolean, default: true },
})

const emit = defineEmits(['update:show', 'close', 'click-overlay', 'open'])

const bodyStyle = computed(() => {
  const base = {}
  if (props.position === 'bottom') {
    Object.assign(base, { left: '0', right: '0', bottom: '0' })
  } else {
    Object.assign(base, { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '88%', maxWidth: '420px' })
  }
  if (props.round) base.borderRadius = '16px'
  if (typeof props.customStyle === 'string') {
    props.customStyle.split(';').forEach((kv) => {
      const [k, v] = kv.split(':')
      if (k && v) base[k.trim()] = v.trim()
    })
  } else if (props.customStyle && typeof props.customStyle === 'object') {
    Object.assign(base, props.customStyle)
  }
  return base
})

function onOverlay() {
  emit('click-overlay')
  emit('close')
  if (props.closeOnClickOverlay) emit('update:show', false)
}
</script>

<template>
  <view v-if="show" class="app-popup-root" :style="{ zIndex }">
    <view class="app-popup-overlay" @click="onOverlay" />
    <view class="app-popup-body" :class="'app-popup-' + position + (round ? ' app-popup-round' : '')" :style="bodyStyle">
      <slot />
    </view>
  </view>
</template>

<style>
.app-popup-root { position: fixed; top: 0; left: 0; right: 0; bottom: 0; }
.app-popup-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.7); }
.app-popup-body { position: absolute; background: #fff; overflow: hidden; }
.app-popup-bottom { max-height: 80%; }
.app-popup-round { border-radius: 16px 16px 0 0; }
.app-popup-center.app-popup-round { border-radius: 16px; }
</style>
