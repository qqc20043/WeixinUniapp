<template>
  <div class="register-container">
    <!-- 移动端注册原型展示区 -->
    <div class="mobile-preview">
      <div class="mobile-frame">
		<image class="bg-img" src="/static/login_back.png" mode="scaleToFill"></image>
        <div class="register-page">
          <!-- 顶部logo/标题 -->
          <div class="register-header">
            <div class="logo">
              <span class="logo-icon">T</span>
              <div>
                <h1 class="app-name">Teaflow</h1>
                <p class="app-desc">一杯好茶，一刻登录的安然</p>
              </div>
            </div>
          </div>

          <!-- 欢迎语 -->
          <div class="welcome-text">
            <h2>欢迎开启你的茶间</h2>
            <p>使用手机号/邮箱注册，为你的账号沏上第一杯茶。</p>
          </div>

          <!-- 注册表单 -->
          <form class="register-form" @submit.prevent="handleRegister">
            <!-- 账号输入框 -->
            <div class="form-item" :class="{ 'input-focus': accountFocus || accountValue }">
              <label class="form-label" for="account">账号</label>
              <span class="form-tip">支持手机号/邮箱</span>
              <div class="input-wrapper">
                <span class="input-prefix">@</span>
                <input
                  type="text"
                  id="account"
                  class="form-input"
                  v-model="accountValue"
                  @focus="accountFocus = true"
                  @blur="accountFocus = false"
                  placeholder="请输入手机号或邮箱"
                />
              </div>
            </div>

            <!-- 密码输入框 -->
            <div class="form-item" :class="{ 'input-focus': pwdFocus || pwdValue }">
              <label class="form-label" for="password">密码</label>
              <span class="form-tip">至少6位字符</span>
              <div class="input-wrapper">
                <span class="input-prefix">✱</span>
                <input
                  :type="showPwd ? 'text' : 'password'"
                  id="password"
                  class="form-input"
                  v-model="pwdValue"
                  @focus="pwdFocus = true"
                  @blur="pwdFocus = false"
                  placeholder="请输入登录密码"
                />
                <span class="pwd-toggle" @click="showPwd = !showPwd">
                  <svg v-if="showPwd" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 2.76m-4.2-4.2A9.96 9.96 0 0 0 12 8a9.96 9.96 0 0 0-4.2 1.2m0 0 3.1 3.1"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                </span>
              </div>
            </div>

            <!-- 确认密码输入框 -->
            <div class="form-item" :class="{ 
              'input-focus': confirmPwdFocus || confirmPwdValue, 
              'input-error': pwdValue !== confirmPwdValue && confirmPwdValue 
            }">
              <label class="form-label" for="confirmPassword">确认密码</label>
              <div class="input-wrapper">
                <span class="input-prefix">✱</span>
                <input
                  :type="showConfirmPwd ? 'text' : 'password'"
                  id="confirmPassword"
                  class="form-input"
                  v-model="confirmPwdValue"
                  @focus="confirmPwdFocus = true"
                  @blur="confirmPwdFocus = false"
                  placeholder="请再次输入密码"
                />
                <span class="pwd-toggle" @click="showConfirmPwd = !showConfirmPwd">
                  <svg v-if="showConfirmPwd" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 2.76m-4.2-4.2A9.96 9.96 0 0 0 12 8a9.96 9.96 0 0 0-4.2 1.2m0 0 3.1 3.1"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                </span>
              </div>
              <span v-if="pwdValue !== confirmPwdValue && confirmPwdValue" class="error-text">两次输入的密码不一致</span>
            </div>

            <!-- 注册按钮 -->
            <button 
              type="submit" 
              class="register-btn" 
              :disabled="!accountValue || !pwdValue || !confirmPwdValue || pwdValue !== confirmPwdValue"
              @click="onSubmit"
            >
              立即注册 →
            </button>
          </form>

          <!-- 底部链接 -->
          <div class="register-footer">
            <p>已有账号？<navigator class="login-link" url="/pages/login" open-type="reLaunch">返回登录</navigator></p>
            <p class="agreement">
              注册即表示同意 <navigator class="login-link" url="/pages/login" open-type="reLaunch">《用户协议》</navigator> 和 
			  <navigator class="login-link" url="/pages/login" open-type="reLaunch">《隐私政策》</navigator>
            </p>
          </div>

          <!-- 轻提示 -->
          <div class="toast" :class="{ visible: toastVisible, error: toastError }">
            <div class="toast-dot" />
            <span>{{ toastMessage }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { register } from '../api/index.js'

// 表单数据
const accountValue = ref('')
const pwdValue = ref('')
const confirmPwdValue = ref('')

// 交互状态
const accountFocus = ref(false)
const pwdFocus = ref(false)
const confirmPwdFocus = ref(false)
const showPwd = ref(false)
const showConfirmPwd = ref(false)

// 提示弹窗
const toastVisible = ref(false)
const toastError = ref(false)
const toastMessage = ref('登录成功，正在为你沏好一杯茶…')
const toastTimer = ref(null)

// 注册
const onSubmit = () => {
  handleRegister()
}

// 注册处理
const handleRegister = async() => {
  if (accountValue.value && pwdValue.value && confirmPwdValue.value && pwdValue.value === confirmPwdValue.value) {
	try {
		const data = {
			"username": accountValue.value,
			"phone": accountValue.value,
			"password": pwdValue.value
		}
		await register(data).then(res=> {
			uni.navigateTo({
			  url: '/pages/login',
			  events: { 
			    // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
			    acceptDataFromOpenedPage: function(data) {
			      console.log(data)
			    }
			  },
			  success: function(res) {
			    // 通过eventChannel向被打开页面传送数据
			    res.eventChannel.emit('acceptDataFromOpenerPage', { data: accountValue.value })
			  }
			});
			showToast(`注册成功！账号：${accountValue.value}`, false)
		})
	}catch(error) {
		showToast(`注册失败！`, false)
	}
    // 模拟注册重置
    setTimeout(() => {
      accountValue.value = ""
      pwdValue.value = ""
      confirmPwdValue.value = ""
    }, 1500)
  }
}

const showToast = (msg, isError = false) => {
  if (toastTimer.value) clearTimeout(toastTimer.value)
  toastMessage.value = msg
  toastError.value = isError
  toastVisible.value = true
  toastTimer.value = setTimeout(() => {
    toastVisible.value = false
  }, 2200)
}

</script>

<style scoped>
	/* 背景图样式 */
	.bg-img {
	  position: absolute;
	  top: 0;
	  left: 0;
	  width: 100%;
	  height: 100%;
	}
	
.toast {
  position: absolute;
  left: 50%;
  top: 22px;
  transform: translateX(-50%) translateY(20px);
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(4, 23, 12, 0.96);
  color: #f9fff8;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.85);
  opacity: 0;
  pointer-events: none;
  transition: all 0.2s ease-out;
  z-index: 9999;
}

.toast.visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.toast-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #9bffb9;
}

.toast.error .toast-dot {
  background: #ff8a8a;
}

/* 全局容器 - 一屏展示，分左右布局（移动端预览+设计说明） */
.register-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
  background-color: #121a16;
  min-height: 100vh;
  box-sizing: border-box;
  gap: 40px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* 移动端预览区 */
.mobile-preview {
  flex: 0 0 auto;
}

/* 手机外框 */
.mobile-frame {
  width: min(375px, 92vw);
  height: 667px;
  border: 12px solid #222;
  border-radius: 32px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  /* background-image: url("/static/login_back.png"); */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* 注册页面主体 */
.register-page {
  width: 100%;
  height: 100%;
  background-color: rgba(18, 26, 22, 0.85);
  backdrop-filter: blur(10px);
  padding: 0 24px;
  box-sizing: border-box;
  overflow-y: auto;
  color: #e0eae5;
}

/* 顶部标题区 */
.register-header {
  padding-top: 40px;
  margin-bottom: 32px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: #4a7c59;
  color: #fff;
  border-radius: 50%;
  font-size: 18px;
  font-weight: 600;
}
.app-name {
  font-size: 18px;
  font-weight: 600;
  color: #e0eae5;
  margin: 0;
}
.app-desc {
  font-size: 12px;
  color: #8db699;
  margin: 0;
}

/* 欢迎语 */
.welcome-text {
  margin-bottom: 32px;
}
.welcome-text h2 {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 8px 0;
}
.welcome-text p {
  font-size: 14px;
  color: #a3c9a8;
  margin: 0;
  line-height: 1.5;
}

/* 表单样式 */
.register-form {
  width: 100%;
}
.form-item {
  position: relative;
  margin-bottom: 20px;
}
.form-label {
  display: block;
  font-size: 12px;
  color: #8db699;
  margin-bottom: 4px;
  transition: all 0.2s ease;
}
.form-tip {
  position: absolute;
  right: 0;
  top: 0;
  font-size: 11px;
  color: #668a76;
}
.input-wrapper {
  position: relative;
  background-color: rgba(26, 47, 38, 0.6);
  border: 1px solid rgba(74, 124, 89, 0.3);
  border-radius: 8px;
  transition: all 0.2s ease;
}
.input-wrapper:focus-within {
  border-color: #4a7c59;
  box-shadow: 0 0 0 2px rgba(74, 124, 89, 0.2);
}
.input-prefix {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #8db699;
  font-size: 14px;
}
.form-input {
  width: 100%;
  height: 48px;
  border: none;
  outline: none;
  padding: 0 12px 0 36px;
  box-sizing: border-box;
  font-size: 14px;
  color: #e0eae5;
  background: transparent;
  border-radius: 8px;
}
.form-input::placeholder {
  color: #668a76;
}
.pwd-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #8db699;
  cursor: pointer;
}
.error-text {
  display: block;
  font-size: 11px;
  color: #d9534f;
  margin-top: 4px;
}
.input-error .input-wrapper {
  border-color: #d9534f;
}

/* 注册按钮 */
.register-btn {
  width: 100%;
  height: 48px;
  background-color: #4a7c59;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-top: 12px;
}
.register-btn:disabled {
  background-color: #2d4a3a;
  color: #668a76;
  cursor: not-allowed;
}
.register-btn:not(:disabled):active {
  background-color: #3a5f45;
}

/* 底部区域 */
.register-footer {
  text-align: center;
  margin-top: 32px;
  font-size: 12px;
  color: #8db699;
}
.login-link {
  display: inline;
  color: #a3c9a8;
  text-decoration: none;
  font-weight: 500;
}
.login-link:hover {
  color: #c5e0cb;
}
.agreement {
  margin-top: 12px;
  font-size: 11px;
  color: #668a76;
}
.agreement a {
  color: #8db699;
  text-decoration: none;
}
.agreement a:hover {
  color: #a3c9a8;
}

/* 响应式适配 - 小屏幕时上下布局 */
@media (max-width: 992px) {
  .register-container {
    flex-direction: column;
    align-items: center;
  }
}
</style>