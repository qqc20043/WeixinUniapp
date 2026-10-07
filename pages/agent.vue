<template>
	<div class="tea-app agent-page">
		<!-- 宣纸底纹背景 -->
		<div class="paper-texture"></div>

		<!-- 顶部导航 -->
		<header class="tea-header">
			<div class="header-left" @click="goBack">
				<van-icon name="arrow-left" size="20" color="#2C5E30" />
			</div>
			<h1 class="page-title">智能茶饮顾问</h1>
			<div class="header-right" @click="clearSession">
				<van-icon name="delete-o" size="20" color="#8B5A2B" />
			</div>
		</header>

		<!-- 模型状态徽章：由后端 /api/agent/llm-info 提供，不写死 -->
		<div class="model-badge">
			<span class="dot" :class="{ mock: llm.mock }"></span>
			<span class="model-name">{{ llm.model || '读取中…' }}</span>
			<span class="model-mode">{{ llm.mock ? '（Mock）' : '真实模型' }}</span>
			<span class="model-mode">{{ streamMode ? '· 流式' : '· 降级' }}</span>
		</div>

		<!-- 消息区 -->
		<main class="tea-content" id="msgList">
			<div v-for="(m, i) in messages" :key="i" :class="['msg', m.role]">
				<div class="bubble">{{ m.content }}<span v-if="m.typing" class="cursor">▍</span></div>
				<!-- 工具调用事件：面试演示的关键画面 -->
				<div v-if="m.tool" class="tool-tag">
					🔧 调用工具：{{ m.tool }}
				</div>
				<!-- 统计徽章 -->
				<div v-if="m.stats" class="stats">
					<span class="chip">耗时 {{ m.stats.latencyMs }}ms</span>
					<span class="chip">tokens {{ m.stats.promptTokens }}+{{ m.stats.completionTokens }}</span>
					<span class="chip">¥{{ m.stats.costYuan }}</span>
				</div>
			</div>
		</main>

		<!-- 快捷问题 -->
		<div class="chips">
			<span v-for="(c, i) in quickChips" :key="i" class="chip-btn" @click="askQuick(c)">{{ c }}</span>
		</div>

		<!-- 输入栏 -->
		<footer class="input-bar">
			<input class="q-input" v-model="input" placeholder="问问茶知识、找茶、下单…" confirm-type="send"
				@confirm="ask" :disabled="busy" />
			<button class="send-btn" :disabled="busy || !input.trim()" @click="ask">
				{{ busy ? '思考中' : '发送' }}
			</button>
		</footer>
	</div>
</template>

<script setup>
	import { ref, onMounted, nextTick } from 'vue'
	import {
		agentChat,
		agentChatStream,
		agentClearSession,
		agentLlmInfo
	} from '@/api/index.js'

	/**
	 * 智能茶饮顾问（小程序端）
	 *
	 * 双端适配要点：
	 *  1. 小程序不支持浏览器的 fetch + ReadableStream，改用 uni.request 的
	 *     enableChunked 分块接收（微信基础库 2.20.2+）—— 封装在 api/index.js 的
	 *     agentChatStream 里，本页只消费事件；
	 *  2. 基础库不支持分块时自动降级到非流式接口 /api/agent/chat，
	 *     体验从「打字机」变为「一次性输出」，功能不受影响；
	 *  3. Agent 服务（8081）与商城接口（8080）是两个微服务，鉴权头与地址都不同，
	 *     因此请求封装在 api/index.js 中分开维护。
	 */
	const messages = ref([{
		role: 'bot',
		content: '你好，我是漫思茶的智能茶饮顾问 🍵\n可以问我：\n· 推荐几款绿茶\n· 送长辈什么茶合适\n· 明前龙井和雨前龙井的区别'
	}])
	const input = ref('')
	const busy = ref(false)
	const llm = ref({})
	const streamMode = ref(true)
	const sessionId = ref('mp-' + Math.random().toString(36).slice(2, 8))
	const quickChips = ref(['推荐几款绿茶', '送长辈什么茶合适', '明前龙井和雨前龙井的区别'])

	onMounted(async () => {
		llm.value = (await agentLlmInfo()) || { model: '连接失败', mock: false }
	})

	const scrollBottom = () => {
		nextTick(() => {
			uni.pageScrollTo({ scrollTop: 99999, duration: 100 })
		})
	}

	const pushBot = () => {
		messages.value.push({ role: 'bot', content: '', typing: true, tool: '', stats: null })
		return messages.value.length - 1
	}

	const askQuick = (text) => { input.value = text; ask() }

	/** 鉴权失效的统一文案（与后端固定文案一致） */
	const AUTH_EXPIRED_TEXT = '🔑 登录已过期，请重新登录后再继续，我在这等你回来。'
	/** 本次会话是否已触发过鉴权失效，用于忽略其后的 delta */
	let authExpiredFired = false

	const ask = async () => {
		const text = (input.value || '').trim()
		if (!text || busy.value) return
		messages.value.push({ role: 'user', content: text })
		input.value = ''
		busy.value = true
		const idx = pushBot()
		scrollBottom()

		authExpiredFired = false   // 新一轮对话重置鉴权失效标志，避免跳转失败后消息被永久吞掉
		const payload = { message: text, sessionId: sessionId.value }

		// 优先流式；未收到任何数据则降级为非流式
		const r = await agentChatStream(payload, ({ event, data }) => {
			handleEvent(event, data, idx)
			scrollBottom()
		})

		if (!r.finished) {
			streamMode.value = false
			await askFallback(payload, idx)
		}
	}

	const handleEvent = (event, j, idx) => {
		const m = messages.value[idx]
		if (!m) return

		// 鉴权失败：后端把它作为 tool 事件下发（data.type === 'auth_expired'），
		// 而不是独立事件名——因此必须在这里先判 type，否则会被当成普通工具调用
		// 显示成「调用工具: auth_expired」，且不会跳转登录页（实测踩过）。
		if (j && j.type === 'auth_expired') {
			m.content = AUTH_EXPIRED_TEXT
			m.typing = false
			m.tool = ''
			busy.value = false
			authExpiredFired = true      // 置位后忽略后续 delta，避免文案被追加重复
			handleAuthExpired()
			return
		}

		// auth_expired 之后后端仍会推固定文案的 delta + done，这里直接吞掉
		if (authExpiredFired) {
			if (event === 'done') { m.typing = false; m.stats = j }
			return
		}

		if (event === 'delta') {
			m.content += j.content || ''
		} else if (event === 'tool') {
			m.tool = (j.name || j.type || '') + (j.args ? ' ' + j.args : '')
		} else if (event === 'done') {
			m.typing = false
			m.stats = j
			busy.value = false
		} else if (event === 'auth_expired') {
			// 兼容独立事件名的写法（后端当前不发，保留以防协议调整）
			m.content = AUTH_EXPIRED_TEXT
			m.typing = false
			busy.value = false
			authExpiredFired = true
			handleAuthExpired()
		} else if (event === 'error') {
			m.content += '\n[出错] ' + (j.message || '')
			m.typing = false
			busy.value = false
		}
	}

	/**
	 * 登录态失效的统一处理：清 token + 跳登录页。
	 * 用 reLaunch 而非 navigateTo：登录页必须成为栈底，
	 * 否则用户能返回到已失效的问茶页继续发消息，且页面栈可能超 10 层导致跳转失败。
	 * 加 authRedirecting 标志，避免 SSE 多次触发时重复跳转。
	 */
	let authRedirecting = false
	const handleAuthExpired = () => {
		if (authRedirecting) return
		authRedirecting = true
		try { uni.removeStorageSync('token') } catch (e) { /* 忽略 */ }
		setTimeout(() => {
			uni.reLaunch({
				url: '/pages/login',
				complete: () => { authRedirecting = false }
			})
		}, 1200)
	}

	/** 降级：非流式一次性返回 */
	const askFallback = async (payload, idx) => {
		const m = messages.value[idx]
		try {
			const res = await agentChat(payload)
			m.content = (res && res.answer) ? res.answer : '[请求失败] 返回为空'
		} catch (e) {
			m.content = '[连接失败] 请确认 agent-service(8081) 已启动'
		}
		m.typing = false
		busy.value = false
	}

	const clearSession = async () => {
		await agentClearSession(sessionId.value)
		sessionId.value = 'mp-' + Math.random().toString(36).slice(2, 8)
		messages.value = [{ role: 'bot', content: '会话已清空，我们重新开始 🍵' }]
	}

	const goBack = () => { uni.navigateBack({ fail: () => uni.redirectTo({ url: '/pages/homepage' }) }) }
</script>

<style scoped>
	.tea-app {
		min-height: 100vh;
		background: #F5F1E8;
		display: flex;
		flex-direction: column;
		position: relative;
	}

	.paper-texture {
		position: fixed;
		inset: 0;
		background-image: radial-gradient(#E8DFC8 1px, transparent 1px);
		background-size: 18px 18px;
		opacity: .5;
		pointer-events: none;
	}

	.tea-header {
		display: flex;
		align-items: center;
		padding: 12px 16px;
		background: rgba(245, 241, 232, .96);
		border-bottom: 1px solid #E5DCC6;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.header-left, .header-right { width: 32px; }
	.header-right { text-align: right; }
	.page-title {
		flex: 1;
		text-align: center;
		font-size: 17px;
		color: #2C5E30;
		font-weight: 600;
		letter-spacing: 1px;
	}

	.model-badge {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 16px;
		font-size: 11px;
		color: #7A6A52;
		background: rgba(255, 255, 255, .6);
	}
	.model-badge .dot {
		width: 6px; height: 6px; border-radius: 50%;
		background: #4CAF50;
	}
	.model-badge .dot.mock { background: #E8B84B; }
	.model-name { color: #2C5E30; font-weight: 600; }

	.tea-content {
		flex: 1;
		padding: 14px 16px 100px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.msg { display: flex; flex-direction: column; max-width: 86%; }
	.msg.user { align-self: flex-end; align-items: flex-end; }
	.msg.bot { align-self: flex-start; }

	.bubble {
		padding: 10px 14px;
		border-radius: 12px;
		font-size: 14px;
		line-height: 1.7;
		white-space: pre-wrap;
		word-break: break-word;
	}
	.msg.user .bubble {
		background: #2C5E30;
		color: #F5F1E8;
		border-bottom-right-radius: 4px;
	}
	.msg.bot .bubble {
		background: #FFFFFF;
		color: #3A3226;
		border: 1px solid #E5DCC6;
		border-bottom-left-radius: 4px;
	}

	.cursor { color: #2C5E30; animation: blink 1s infinite; }
	@keyframes blink { 50% { opacity: 0; } }

	.tool-tag {
		margin-top: 6px;
		font-size: 11px;
		color: #2C5E30;
		background: rgba(44, 94, 48, .08);
		border: 1px dashed rgba(44, 94, 48, .35);
		padding: 4px 9px;
		border-radius: 8px;
		font-family: Consolas, monospace;
	}

	.stats { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
	.stats .chip {
		font-size: 10px;
		padding: 3px 8px;
		border-radius: 8px;
		background: rgba(44, 94, 48, .1);
		color: #2C5E30;
		font-family: Consolas, monospace;
	}

	.chips {
		display: flex;
		gap: 8px;
		padding: 8px 16px;
		overflow-x: auto;
		white-space: nowrap;
	}
	.chip-btn {
		flex-shrink: 0;
		font-size: 12px;
		padding: 6px 12px;
		border-radius: 14px;
		background: rgba(255, 255, 255, .9);
		border: 1px solid #D9CFB5;
		color: #6B5B45;
	}

	.input-bar {
		position: fixed;
		left: 0; right: 0; bottom: 0;
		display: flex;
		gap: 8px;
		padding: 10px 16px 16px;
		background: rgba(245, 241, 232, .98);
		border-top: 1px solid #E5DCC6;
	}
	.q-input {
		flex: 1;
		padding: 10px 14px;
		border-radius: 10px;
		border: 1px solid #D9CFB5;
		background: #FFF;
		font-size: 14px;
		color: #3A3226;
	}
	.send-btn {
		padding: 10px 18px;
		border-radius: 10px;
		border: none;
		background: #2C5E30;
		color: #F5F1E8;
		font-size: 14px;
	}
	.send-btn[disabled] { background: #A8B5A9; }
</style>
