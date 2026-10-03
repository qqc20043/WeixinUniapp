<template>
	<div class="page-wrapper">
		<!-- 登录原型（自适应一屏） -->
		<div class="phone-frame">
			<div class="phone-notch" />
			<div class="phone-screen">
				<div class="photo-bg" :style="photoBgStyle" />
				<div class="screen-glow" />
				<div class="tea-decor">
					<div class="tea-leaf" />
					<div class="tea-leaf reverse" />
					<div class="tea-leaf" />
				</div>

				<div class="screen-content">
					<!-- 品牌与欢迎区 -->
					<div class="brand">
						<div class="brand-logo">T</div>
						<div>
							<div class="brand-text-title">Teaflow</div>
							<div class="brand-text-sub">一杯好茶，一刻登录的安然</div>
						</div>
					</div>

					<!-- 标题与引导文案 -->
					<div class="headline">
						<div class="headline-main">欢迎回到你的<span class="em">茶间</span></div>
						<div class="headline-sub">
							使用注册时的手机号 / 邮箱登录。本次操作将在这台设备上记录一枚温润的「安全茶印」，让以后每一次登录都像熟悉的回甘。
						</div>
					</div>

					<!-- 账号密码表单 -->
					<div class="form">
						<div class="field">
							<div class="field-label-row">
								<span>账号</span>
								<span class="helper">支持手机号 / 邮箱</span>
							</div>
							<div class="field-input-wrap" :class="{ focused: accountFocused, error: errors.account }">
								<span class="field-icon">＠</span>
								<input v-model="account" class="field-input" type="text" placeholder="请输入手机号或邮箱"
									@focus="accountFocused = true" @blur="accountFocused = false" @input="onInput"
									@keyup.enter="onSubmit" />
							</div>
						</div>

						<div class="field">
							<div class="field-label-row">
								<span>密码</span>
								<span class="helper">至少 6 位字符</span>
							</div>
							<div class="field-input-wrap" :class="{ focused: passwordFocused, error: errors.password }">
								<span class="field-icon">✶</span>
								<input v-model="password" class="field-input" :type="showPassword ? 'text' : 'password'"
									placeholder="请输入登录密码" @focus="passwordFocused = true"
									@blur="passwordFocused = false" @input="onInput" @keyup.enter="onSubmit" />
								<div class="password-eye" :class="{ active: showPassword }"
									@click="showPassword = !showPassword">
									👁
								</div>
							</div>
							
							<div class="error-text" :class="{ visible: showError }" v-show="showError">
								账号或密码格式不太「对味」，请稍作调整再试。
							</div>
						</div>
						
						<div class="field">
							<div class="field-label-row">
								<span>验证码</span>
							</div>
							<div class="field-input-wrap yzmfield-input" :class="{ focused: accountFocused, error: errors.account }">
								<input v-model="captchaCodeValue" class="field-input" type="text" placeholder="请输入验证码"
									@focus="accountFocused = true" @blur="accountFocused = false" @input="onInput"
									@keyup.enter="onSubmit" />
								<image class="captchYzm" :src="captchaCodeMsg.captcha" mode="scaleToFill" @click="captchaCodeSrcHandle"></image>
							</div>
						</div>
						
						

						<button class="primary-btn" :class="{ disabled: !canSubmit }" :disabled="!canSubmit"
							@click="onSubmit">
							立即登录
							<span class="arrow">➝</span>
						</button>
					</div>

					<!-- 底部链接 -->
					<div class="register-footer">
						<p>没有账号？<navigator class="login-link" url="/pages/register" open-type="reLaunch">前往注册
							</navigator>
						</p>
						<p class="agreement">
							登录即表示同意 <navigator class="login-link" url="/pages/register" open-type="reLaunch">《用户协议》
							</navigator> 和
							<navigator class="login-link" url="/pages/register" open-type="reLaunch">《隐私政策》</navigator>
						</p>
					</div>

					<!-- 底部安全与辅助说明 -->
					<div class="footer-row">
						<span>本次登录会记住此设备，像记住你常点的一杯茶。</span>
						<span class="footer-link" @click="onHelp">遇到问题？</span>
					</div>
				</div>

				<!-- 轻提示 -->
				<div class="toast" :class="{ visible: toastVisible, error: toastError }">
					<div class="toast-dot" />
					<span>{{ toastMessage }}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted,
		getCurrentInstance
	} from 'vue'
	import {
		onLoad
	} from '@dcloudio/uni-app'
	import {
		login,
		userCaptcha,
		userYzmcap
	} from '../api/index'

	// 导入背景图
	import loginBg from '@/static/login_back.png'

	// 响应式数据
	const captchaCodeMsg = ref('')
	const captchaCodeValue = ref('')
	const account = ref('15825785196')
	const password = ref('123456')
	const accountFocused = ref(false)
	const passwordFocused = ref(false)
	const showPassword = ref(false)
	const showError = ref(false)
	const errors = ref({
		account: false,
		password: false
	})
	const toastVisible = ref(false)
	const toastError = ref(false)
	const toastMessage = ref('登录成功，正在为你沏好一杯茶…')
	const toastTimer = ref(null)

	// 计算属性
	const canSubmit = computed(() => {
		return account.value.trim().length > 0 && password.value.trim().length >= 1
	})

	const photoBgStyle = computed(() => {
		const gradient = 'linear-gradient(160deg, rgba(5,21,10,0.96), rgba(7,32,18,0.8), rgba(3,10,6,0.96))'
		return {
			backgroundImage: `${gradient}, url(${loginBg})`,
			backgroundSize: 'cover',
			backgroundPosition: 'center',
			backgroundRepeat: 'no-repeat',
		}
	})

	// 方法

	// onLoad 接收页面参数
	onLoad((option) => {
		// 获取当前组件实例
		const instance = getCurrentInstance()
		// 获取事件通道
		const eventChannel = instance.proxy.getOpenerEventChannel()
		// 获取验证码
		captchaCodeSrcHandle()

		if (eventChannel && typeof eventChannel.emit === 'function') {
			// 向父页面发送数据
			eventChannel.emit('acceptDataFromOpenedPage', {
				data: 'data from test page'
			})
			eventChannel.emit('acceptLoginAndMy', {
				data: 'data from test page'
			})
			eventChannel.emit('acceptAxiosAndLogin', {
				data: 'data from test page'
			})
			// 监听父页面传来的数据
			// 注意：这里的事件监听器会一直存在，需要在 onUnload 中移除
			const acceptDataFromOpenerPageHandler = function(data) {
				console.log('接收到父页面数据：', data)
				// 这里可以处理接收到的数据
				showToast(`注册成功！账号：${data.data}`, false)
			}
			const acceptLoginAndMyHandler = function(data) {
				// 这里可以处理接收到的数据
				showToast(`退出成功！`, false)
			}
			const acceptAxiosAndLoginHandler = function(data) {
				// 这里可以处理接收到的数据
				showToast(`身份过期，请重新登录！`, false)
			}
			eventChannel.on('acceptDataFromOpenerPage', acceptDataFromOpenerPageHandler)
			eventChannel.on('acceptLoginAndMy', acceptLoginAndMyHandler)
			eventChannel.on('acceptAxiosAndLogin', acceptAxiosAndLoginHandler)
		}
	})
	
	const captchaCodeSrcHandle = async() => {
		await userCaptcha().then(res => {
			captchaCodeMsg.value = res.yzm
		})
	}

	const showAgreement = () => {
		showToast('示例：正式版本可在此进入「忘记密码 / 在线客服」页面。', false)
	}

	const onInput = () => {
		showError.value = false
		errors.value.account = false
		errors.value.password = false
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

	const validateAndLogin = async () => {
		const accountVal = account.value.trim()
		const passwordVal = password.value.trim()
		const accountOk = accountVal.length >= 4
		const passwordOk = passwordVal.length >= 6
		if (!accountOk || !passwordOk) {
			showError.value = true
			errors.value = {
				account: !accountOk,
				password: !passwordOk,
			}
			showToast('登录失败：这杯茶好像有点淡，请检查账号和密码。', true)
			return
		}

		try {
			await login({
				"phone": accountVal,
				"password": passwordVal
			}).then(response => {
				console.log(response.code)
				if (response.code == 200) {
					showError.value = false
					errors.value = {
						account: false,
						password: false
					}
					showToast('登录成功，正在为你沏好一杯茶…', false)
					uni.setStorageSync("token", response.token)
					uni.navigateTo({
						url: '/pages/homepage',
						events: {
							// 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
							acceptLoginAndHomePage: function(data) {
								console.log("acceptLoginAndHomePage", data)
							}
						},
						success: function(res) {
							// 通过eventChannel向被打开页面传送数据
							res.eventChannel.emit('acceptLoginAndHomePage', {
								data: accountVal
							})
						}
					});
				} else {
					showError.value = true
					errors.value = {
						account: !accountOk,
						password: !passwordOk,
					}
					showToast(response.msg, true)
				}
			})
		} catch (error) {
			showError.value = true
			errors.value = {
				account: !accountOk,
				password: !passwordOk,
			}
			showToast('登录失败：这杯茶好像有点淡，请检查账号和密码。', true)
		}
	}

	const onSubmit = async() => {
		if (!canSubmit.value) return
		const dat = {
			useruid: captchaCodeMsg.value.uuid,
			useryzm: captchaCodeValue.value
		}
		await userYzmcap(dat)
		validateAndLogin()
	}

	const onHelp = () => {
		showToast('示例：正式版本可在此进入「忘记密码 / 在线客服」页面。', false)
	}
</script>

<style scoped>
	.captchYzm {
		position: absolute;
		top: 2px;
		right: -111px;
		width: 100px;
		height: 38px;
		border-radius: 10px;
	}
	.page-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100vw;
		min-height: 100vh;
		padding: 12px;
		box-sizing: border-box;
		background: radial-gradient(circle at top left, #5ad08a 0%, #07150e 45%, #020805 100%);
		color: #f5fbf7;
		font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto,
			'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
	}

	.phone-frame {
		width: min(360px, 92vw);
		height: min(720px, calc(100vh - 24px));
		border-radius: 30px;
		padding: 10px;
		background: linear-gradient(145deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.02));
		box-shadow: 0 24px 40px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.02);
		position: relative;
	}

	.phone-notch {
		position: absolute;
		top: 10px;
		left: 50%;
		transform: translateX(-50%);
		width: 120px;
		height: 18px;
		background: rgba(6, 18, 10, 0.9);
		border-radius: 999px;
	}

	.phone-screen {
		width: 90%;
		height: 90%;
		border-radius: 22px;
		overflow: hidden;
		position: relative;
		padding: 52px 20px 18px;
		display: flex;
		flex-direction: column;
	}

	.photo-bg {
		position: absolute;
		inset: 0;
		opacity: 0.55;
		filter: saturate(1.1);
		transform: scale(1.05);
	}

	.screen-glow {
		position: absolute;
		inset: -30%;
		background:
			radial-gradient(circle at 0% 0%, rgba(123, 221, 151, 0.55) 0%, transparent 55%),
			radial-gradient(circle at 100% 0%, rgba(123, 205, 152, 0.45) 0%, transparent 55%),
			radial-gradient(circle at 50% 100%, rgba(0, 0, 0, 0.9) 0%, transparent 65%);
		mix-blend-mode: soft-light;
		pointer-events: none;
	}

	.tea-decor {
		position: absolute;
		inset: 0;
		pointer-events: none;
		opacity: 0.75;
	}

	.tea-leaf {
		position: absolute;
		width: 46px;
		height: 22px;
		background: radial-gradient(circle at 20% 30%,
				#f7fff6 0%,
				#c2f1b8 18%,
				#3f9750 80%);
		border-radius: 90% 10% 80% 20% / 80% 20% 80% 20%;
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.55);
		transform-origin: center;
		animation: floatLeaf 9s ease-in-out infinite;
		filter: saturate(1.1);
	}

	.tea-leaf.reverse {
		border-radius: 10% 90% 20% 80% / 20% 80% 20% 80%;
		transform: scale(-1, 1);
	}

	.tea-leaf:nth-child(1) {
		top: 86px;
		right: 36px;
		animation-delay: 0s;
		transform: rotate(-18deg);
	}

	.tea-leaf:nth-child(2) {
		top: 220px;
		left: 30px;
		animation-delay: -3s;
		transform: rotate(15deg);
	}

	.tea-leaf:nth-child(3) {
		bottom: 130px;
		right: 54px;
		animation-delay: -6s;
		transform: rotate(-10deg);
	}

	@keyframes floatLeaf {
		0% {
			transform: translateY(0) rotate(-8deg);
			opacity: 0.95;
		}

		50% {
			transform: translateY(-6px) translateX(3px) rotate(2deg);
			opacity: 1;
		}

		100% {
			transform: translateY(0) rotate(-8deg);
			opacity: 0.95;
		}
	}

	.screen-content {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 22px;
	}

	.brand-logo {
		width: 34px;
		height: 34px;
		border-radius: 12px;
		background:
			radial-gradient(circle at 25% 20%, #ffffff 0%, #eafff0 20%, transparent 50%),
			conic-gradient(from 180deg, #bff5c9, #4bbf70, #1f8651, #143b25, #bff5c9);
		display: flex;
		align-items: center;
		justify-content: center;
		color: #042314;
		font-weight: 800;
		font-size: 18px;
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.35);
	}

	.brand-text-title {
		font-size: 18px;
		font-weight: 600;
		letter-spacing: 0.04em;
		display: block;
	}

	.brand-text-sub {
		font-size: 12px;
		opacity: 0.86;
		margin-top: 2px;
		color: rgba(224, 242, 231, 0.9);
		display: block;
	}

	.headline {
		margin-bottom: 16px;
	}

	.headline-main {
		font-size: 23px;
		font-weight: 700;
		letter-spacing: 0.02em;
		margin-bottom: 6px;
		display: block;
	}

	.headline-main .em {
		color: #eaffb5;
	}

	.headline-sub {
		font-size: 13px;
		line-height: 1.5;
		color: rgba(217, 236, 223, 0.9);
		display: block;
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 12px;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.field-label-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 12px;
		color: rgba(230, 244, 232, 0.92);
	}

	.field-label-row .helper {
		font-size: 11px;
		color: rgba(204, 230, 209, 0.78);
	}
	
	.yzmfield-input {
		width: 50%;
	}
	
	.field-input-wrap {
		position: relative;
		border-radius: 14px;
		background: linear-gradient(135deg, rgba(10, 35, 20, 0.96), rgba(11, 38, 24, 0.98));
		box-shadow:
			0 0 0 1px rgba(151, 219, 173, 0.25),
			0 10px 20px rgba(3, 8, 5, 0.9);
		display: flex;
		align-items: center;
		padding: 10px 12px 10px 34px;
		transition: all 0.22s ease-out;
	}

	.field-input-wrap.focused {
		box-shadow:
			0 0 0 1px rgba(175, 255, 191, 0.9),
			0 0 0 3px rgba(131, 221, 157, 0.35);
		transform: translateY(-1px);
	}

	.field-input-wrap.error {
		box-shadow:
			0 0 0 1px rgba(255, 132, 132, 0.96),
			0 0 0 3px rgba(255, 132, 132, 0.25);
	}

	.field-icon {
		position: absolute;
		left: 12px;
		width: 16px;
		height: 16px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		color: rgba(211, 240, 214, 0.9);
		opacity: 0.9;
	}

	.field-input {
		flex: 1;
		width: 0;
		border: none;
		outline: none;
		background: transparent;
		color: #f4fff7;
		font-size: 13px;
	}

	.password-eye {
		position: absolute;
		right: 10px;
		width: 24px;
		height: 24px;
		border-radius: 999px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: rgba(211, 237, 214, 0.9);
		font-size: 16px;
		cursor: pointer;
		transition: background 0.18s ease-out, transform 0.18s ease-out, color 0.18s;
	}

	.password-eye.active {
		color: #ffe89a;
	}

	.error-text {
		min-height: 16px;
		margin-top: 2px;
		font-size: 11px;
		color: rgba(255, 176, 176, 0.96);
		opacity: 0;
		transform: translateY(-3px);
		transition: all 0.2s ease-out;
	}

	.error-text.visible {
		opacity: 1;
		transform: translateY(0);
	}

	.primary-btn {
		width: 100%;
		margin-top: 60px;
		padding: 10px 0;
		border-radius: 18px;
		border: none;
		outline: none;
		cursor: pointer;
		font-size: 14px;
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: #03170b;
		background: linear-gradient(135deg, #e4ffb0, #bdf985, #6cd46a);
		box-shadow:
			0 16px 30px rgba(0, 0, 0, 0.6),
			0 0 0 1px rgba(222, 255, 188, 0.9);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		transition: all 0.2s ease-out;
	}

	.primary-btn .arrow {
		transition: transform 0.2s ease-out;
		font-size: 14px;
	}

	.primary-btn:not(.disabled):hover {
		transform: translateY(-1px);
		box-shadow:
			0 20px 36px rgba(0, 0, 0, 0.72),
			0 0 0 1px rgba(241, 255, 204, 1);
	}

	.primary-btn:not(.disabled):active {
		transform: translateY(0);
		box-shadow:
			0 4px 12px rgba(0, 0, 0, 0.7),
			0 0 0 1px rgba(241, 255, 204, 1);
	}

	.primary-btn.disabled {
		cursor: default;
		opacity: 0.62;
		box-shadow: 0 6px 14px rgba(0, 0, 0, 0.6);
		filter: grayscale(0.15);
	}

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

	.footer-row {
		margin-top: auto;
		padding-top: 10px;
		font-size: 11px;
		color: rgba(204, 229, 208, 0.9);
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
	}

	.footer-link {
		color: rgba(206, 246, 210, 0.98);
		text-decoration: underline;
		text-decoration-style: dotted;
		cursor: pointer;
		white-space: nowrap;
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

	/* 小屏高度：进一步压缩，确保不溢出 */
	@media (max-height: 740px) {
		.phone-screen {
			padding: 48px 16px 16px;
		}

		.brand {
			margin-bottom: 18px;
		}

		.headline {
			margin-bottom: 12px;
		}

		.headline-main {
			font-size: 21px;
		}

		.headline-sub {
			font-size: 12px;
			line-height: 1.45;
		}

		.form {
			gap: 10px;
			margin-bottom: 10px;
		}

		.primary-btn {
			padding: 9px 0;
			border-radius: 16px;
			letter-spacing: 0.14em;
		}

		a {
			display: inline !important;
			/* 改为行内元素 */
		}
	}
</style>