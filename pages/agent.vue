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
				<div class="bubble"><text class="bubble-text" selectable user-select>{{ m.content }}</text><span v-if="m.typing" class="cursor">▍</span></div>
				<!-- 工具调用事件：面试演示的关键画面 -->
				<div v-if="m.tool" class="tool-tag">
					🔧 调用工具：{{ m.tool }}
				</div>
				<!-- 订单拟单卡片：由后端 confirm_ready 事件驱动（携带一次性令牌）。
					 交互对齐千问：消息里直接展示「商品/规格/数量/金额 + 当前地址（可点修改）」，
					 并给一个按钮唤起下单小窗口——用户只在下单窗口里确认一次。
					 不能靠文本里有没有「确认」来渲染，靠结构化事件才可靠。 -->
				<div v-if="m.confirmPhrase" class="order-card">
					<div class="oc-row">
						<span class="oc-emoji">{{ m.order.emoji || '🍵' }}</span>
						<span class="oc-name">{{ m.order.productName || m.confirmSummary }}</span>
					</div>
					<div class="oc-meta">
						<span>{{ m.order.specName }}</span>
						<span>× {{ m.order.quantity }}</span>
						<span class="oc-price">¥{{ m.order.subtotal }}</span>
					</div>
					<!-- 当前收货地址：只展示一行，点「修改」才弹层 -->
					<div class="oc-addr">
						<span class="oc-addr-label">送至</span>
						<span class="oc-addr-text">{{ m.order.addressSummary }}</span>
						<span class="oc-addr-edit" @click="openAddrPicker(m)">修改</span>
					</div>
					<button class="oc-buy" :disabled="busy" @click="openOrderSheet(m)">确认下单</button>
				</div>
				<!-- 购物车卡片：由后端 cart_snapshot 事件驱动（加购/删除成功后服务端主动推）。
					 为什么由服务端推：模型有时只用文字说「已加入购物车」却没真调工具，
					 用户无从判断到底加没加。这里展示的是服务端真实查到的购物车快照。 -->
				<div v-if="m.cart && m.cart.items && m.cart.items.length" class="cart-card">
					<div class="cart-head">
						<span class="cart-title">🛒 购物车</span>
						<span class="cart-count">{{ m.cart.count }} 件</span>
					</div>
					<div v-for="(it, ci) in m.cart.items" :key="ci" class="cart-item">
						<span class="cart-emoji">{{ it.productEmoji || '🍵' }}</span>
						<div class="cart-info">
							<div class="cart-name">{{ it.productName }}</div>
							<div class="cart-spec">{{ it.specName }} × {{ it.quantity }}</div>
						</div>
						<span class="cart-price">¥{{ it.subtotal }}</span>
					</div>
					<div class="cart-total">
						<span>合计</span>
						<span class="cart-total-price">¥{{ m.cart.totalPrice }}</span>
					</div>
					<!-- 按需求：不自动跳转，只给一个入口按钮 -->
					<button class="cart-goto" @click="goCart">去购物车看看</button>
				</div>
				<!-- 推荐选购卡片：由后端 recommend_cards 事件驱动。
					 用户点「选这个」→ 弹规格数量选择 → 直接拟单，全程不必再问规格。 -->
				<div v-if="m.cards && m.cards.length" class="rec-wrap">
					<div v-for="(c, ri) in m.cards" :key="ri" class="rec-card">
						<div class="rec-top">
							<span class="rec-emoji">{{ c.productEmoji || '🍵' }}</span>
							<div class="rec-info">
								<div class="rec-name">{{ c.productName }}</div>
								<div class="rec-sub">{{ c.subtitle }}<span v-if="c.origin"> · {{ c.origin }}</span></div>
							</div>
						</div>
						<div class="rec-specs">
							<span v-for="(s, si) in c.specs" :key="si" class="rec-spec"
								:class="{ on: recPick[c.productId] && recPick[c.productId].specId === s.specId }"
								@click="pickSpec(c, s)">
								{{ s.specName }} ¥{{ s.price }}
							</span>
						</div>
						<div class="rec-actions">
							<div class="rec-qty">
								<span class="qty-btn" @click="recQty(c, -1)">−</span>
								<span class="qty-num">{{ recQtyOf(c) }}</span>
								<span class="qty-btn" @click="recQty(c, 1)">+</span>
							</div>
							<button class="rec-buy" :disabled="busy || !recPick[c.productId]"
								@click="buyRecommended(c)">选这个</button>
						</div>
					</div>
				</div>
				<!-- 统计徽章 -->
				<div v-if="m.stats" class="stats">
					<span class="chip">耗时 {{ m.stats.latencyMs }}ms</span>
					<span class="chip">tokens {{ m.stats.promptTokens }}+{{ m.stats.completionTokens }}</span>
					<span class="chip">¥{{ m.stats.costYuan }}</span>
				</div>
			</div>
		</main>

		<!-- ========== 下单确认小窗口（对齐千问：一处确认即可完成购买） ========== -->
		<van-popup :show="orderSheet.show" @close="orderSheet.show = false" round position="bottom" :z-index="2000">
			<div class="sheet">
				<div class="sheet-title">确认订单</div>
				<div class="sheet-goods">
					<div class="sheet-emoji">{{ orderSheet.emoji || '🍵' }}</div>
					<div class="sheet-goods-info">
						<div class="sheet-goods-name">{{ orderSheet.productName }}</div>
						<div class="sheet-goods-spec">{{ orderSheet.specName }} × {{ orderSheet.quantity }}</div>
					</div>
					<div class="sheet-goods-price">¥{{ orderSheet.subtotal }}</div>
				</div>
				<div class="sheet-line" @click="openAddrPicker(null)">
					<span class="sheet-line-label">收货地址</span>
					<span class="sheet-line-value">{{ orderSheet.addressSummary || '未选择' }}</span>
					<span class="sheet-line-edit">修改</span>
				</div>
				<div class="sheet-total">
					<span>合计</span>
					<span class="sheet-total-price">¥{{ orderSheet.subtotal }}</span>
				</div>
				<button class="sheet-pay" :disabled="busy" @click="doBuy">
					{{ busy ? '处理中…' : '确认购买' }}
				</button>
			</div>
		</van-popup>

		<!-- ========== 收货地址弹层（列表选择 + 新增） ========== -->
		<van-popup :show="addrPicker.show" @close="addrPicker.show = false" round position="bottom" :z-index="2100">
			<div class="sheet">
				<div class="sheet-title">选择收货地址</div>
				<div class="addr-list">
					<div v-for="(a, ai) in addrPicker.list" :key="ai" class="addr-item"
						:class="{ active: addrPicker.picked === a.addressId }"
						@click="chooseAddress(a)">
						<div class="addr-radio">
							<span class="radio-dot" :class="{ on: addrPicker.picked === a.addressId }"></span>
						</div>
						<div class="addr-body">
							<div class="addr-line1">{{ a.fullAddress }}</div>
							<div class="addr-line2">
								<span v-if="a.tag" class="addr-tag" :class="{ corp: a.tag === '公司' }">{{ a.tag }}</span>
								<span v-if="a.isDefault === 1" class="addr-tag default">常用</span>
								<span class="addr-name">{{ a.name }}</span>
								<span class="addr-phone">{{ a.phone }}</span>
							</div>
						</div>
					</div>
					<div v-if="!addrPicker.list.length" class="addr-empty">暂无收货地址</div>
				</div>
				<button class="sheet-pay ghost" :disabled="busy" @click="addNewAddress">新增收货地址</button>
			</div>
		</van-popup>

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
		agentLlmInfo,
		agentHistory
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
	/**
	 * 会话 id 持久化：退出页面再进来要能接上之前的对话。
	 * 登录用户的记忆域其实由后端按 userId 决定（u{userId}），
	 * 这里持久化主要是给匿名访客用（s{sessionId}），以及让前端有稳定的会话标识。
	 */
	const SESSION_KEY = 'agent_session_id'
	const loadSessionId = () => {
		try {
			const saved = uni.getStorageSync(SESSION_KEY)
			if (saved) return saved
		} catch (e) { /* 忽略 */ }
		const sid = 'mp-' + Math.random().toString(36).slice(2, 10)
		try { uni.setStorageSync(SESSION_KEY, sid) } catch (e) { /* 忽略 */ }
		return sid
	}
	const sessionId = ref(loadSessionId())
	const quickChips = ref(['推荐几款绿茶', '送长辈什么茶合适', '明前龙井和雨前龙井的区别'])

	/** 默认欢迎语（没有历史记录时展示） */
	const WELCOME = '你好，我是漫思茶的智能茶饮顾问 🍵\n可以问我：\n· 推荐几款绿茶\n· 送长辈什么茶合适\n· 明前龙井和雨前龙井的区别'

	onMounted(async () => {
		llm.value = (await agentLlmInfo()) || { model: '连接失败', mock: false }
		await restoreHistory()
		scrollBottom()
	})

	/**
	 * 恢复历史对话：退出页面再进来时，把之前的聊天记录拉回来。
	 * 后端按 userId 查（登录用户跨会话共享），所以退出重进也能接上。
	 * 拿到记录时**替换**掉默认欢迎语（避免每次都重复问候一遍）。
	 */
	const restoreHistory = async () => {
		try {
			const r = await agentHistory(sessionId.value)
			const list = (r && r.messages) || []
			if (!list.length) return
			const restored = list.map(x => ({
				role: x.role === 'user' ? 'user' : 'bot',
				content: x.content || '',
				typing: false, tool: '', stats: null,
				confirmToken: '', confirmPhrase: '', confirmSummary: '',
				order: {}, cart: null, cards: null
			}))
			messages.value = restored
		} catch (e) {
			// 拉取失败就用默认欢迎语，不打断使用
		}
	}

	const scrollBottom = () => {
		nextTick(() => {
			uni.pageScrollTo({ scrollTop: 99999, duration: 100 })
		})
	}

	const pushBot = () => {
		messages.value.push({
			role: 'bot', content: '', typing: true, tool: '', stats: null,
			confirmToken: '', confirmPhrase: '', confirmSummary: '',
			order: {},                      // 拟单明细（商品/规格/数量/金额/地址）
			cart: null,                     // 购物车快照（服务端 cart_snapshot 事件）
			cards: null                     // 推荐选购卡片（服务端 recommend_cards 事件）
		})
		return messages.value.length - 1
	}

	/**
	 * 跳购物车。
	 * ⚠️ pages.json 里**没有 tabBar**（本项目用自定义底部导航），所以 gowuc 是普通页面，
	 * 必须用 navigateTo；用 switchTab 会直接 fail（实测过这个坑）。
	 */
	const goCart = () => {
		uni.navigateTo({
			url: '/pages/gowuc',
			fail: () => {
				// 兜底：万一页面栈超过 10 层，先回退再跳
				uni.navigateBack({
					delta: 1,
					complete: () => uni.navigateTo({ url: '/pages/gowuc' })
				})
			}
		})
	}

	// ===== 推荐选购卡片 =====
	/** 用户在各推荐卡上选中的规格：productId → spec 对象 */
	const recPick = ref({})
	/** 用户在各推荐卡上选择的数量：productId → 数量 */
	const recQtyMap = ref({})

	/** 选中某规格（默认选 isDefault=1 那条） */
	const pickSpec = (card, spec) => {
		recPick.value = { ...recPick.value, [card.productId]: spec }
	}

	/** 读某卡片当前数量（默认 1） */
	const recQtyOf = (card) => recQtyMap.value[card.productId] || 1

	/** 加减数量（1-10） */
	const recQty = (card, delta) => {
		const cur = recQtyOf(card)
		const next = Math.min(10, Math.max(1, cur + delta))
		recQtyMap.value = { ...recQtyMap.value, [card.productId]: next }
	}

	/**
	 * 点「选这个」：直接把「商品 + 规格 + 数量」作为拟单指令发给后端。
	 * 用结构化指令（而非自然语言）是为了让后端确定性地拟单，
	 * 不必让模型再解析一遍"用户想要什么规格"——这正是这个卡片要省掉的那一步。
	 */
	const buyRecommended = (card) => {
		if (busy.value) return
		const spec = recPick.value[card.productId]
		if (!spec) {
			uni.showToast({ title: '请先选择规格', icon: 'none' })
			return
		}
		const qty = recQtyOf(card)
		input.value = '选购 ' + card.productId + ' ' + spec.specId + ' ' + qty
		ask()
	}

	const askQuick = (text) => { input.value = text; ask() }

	// ===== 下单小窗口 =====
	const orderSheet = ref({
		show: false, phrase: '', token: '',
		productName: '', emoji: '', specName: '', quantity: 1, subtotal: 0, addressSummary: ''
	})
	/** 地址弹层：列表选择 + 新增 */
	const addrPicker = ref({ show: false, list: [], picked: null, targetMsg: null })

	/**
	 * 唤起下单窗口。用户在这里**只确认一次**：确认购买即发出协议句，
	 * 后端 PICK/CONFIRM 正则直接执行，不再来回追问。
	 */
	const openOrderSheet = (m) => {
		if (busy.value) return
		orderSheet.value = {
			show: true,
			phrase: m.confirmPhrase,
			token: m.confirmToken,
			productName: m.order.productName || '',
			emoji: m.order.emoji || '🍵',
			specName: m.order.specName || '',
			quantity: m.order.quantity || 1,
			subtotal: m.order.subtotal || 0,
			addressSummary: m.order.addressSummary || ''
		}
	}

	/** 窗口内点「确认购买」→ 发协议句，后端不经 LLM 直接下单 */
	const doBuy = () => {
		if (busy.value || !orderSheet.value.phrase) return
		orderSheet.value.show = false
		input.value = orderSheet.value.phrase
		ask()
	}

	/** 打开地址弹层：向后端要地址列表（走「用地址」协议的同源工具） */
	const openAddrPicker = (m) => {
		if (busy.value) return
		addrPicker.value = { show: true, list: [], picked: orderSheet.value.addressId || null, targetMsg: m }
		// 复用已有事件数据：若消息里带过地址列表就直接用
		if (m && m.addresses && m.addresses.length) {
			addrPicker.value.list = m.addresses
			return
		}
		// 否则请求一次（发「换地址」触发后端 request_address_pick）
		input.value = '换地址'
		ask()
	}

	/** 选中地址：若在下单窗口上下文中，直接重新拟单（带上新地址）；否则仅记录 */
	const chooseAddress = (a) => {
		addrPicker.value.picked = a.addressId
		addrPicker.value.show = false
		if (busy.value) return
		// 「用地址 <id>」会触发后端重新拟单（并作废旧令牌），拿到新令牌后再次弹出下单窗口
		input.value = '用地址 ' + a.addressId
		ask()
	}

	/** 新增收货地址：复用 add_address 的对话代填，预填模板 */
	const addNewAddress = () => {
		addrPicker.value.show = false
		if (busy.value) return
		input.value = '收货人 ，电话 ，地址 '
		uni.showToast({ title: '补齐收件人/电话/地址后发送', icon: 'none' })
	}

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

		// 订单拟单就绪：后端在 prepare_order 成功后推 confirm_ready，一次带全
		// 商品/规格/数量/单价/合计/收货地址，供消息卡片与下单窗口使用（用户只确认一次）。
		if (j && j.type === 'confirm_ready') {
			m.confirmToken = j.confirmToken || ''
			m.confirmPhrase = j.confirmPhrase || ('确认下单，令牌 ' + (j.confirmToken || ''))
			m.confirmSummary = j.summary || ''
			m.order = {
				productName: j.productName || '',
				emoji: j.productEmoji || '🍵',
				specName: j.specName || '',
				quantity: j.quantity || 1,
				unitPrice: j.unitPrice || 0,
				subtotal: j.subtotal || 0,
				addressId: j.addressId || 0,
				addressSummary: j.addressSummary || ''
			}
			// 拟单即自动弹出下单窗口——用户在这里一次确认完成购买（对齐千问）
			const bot = messages.value[messages.value.length - 1]
			if (bot) {
				orderSheet.value = {
					show: true,
					phrase: m.confirmPhrase,
					token: m.confirmToken,
					productName: m.order.productName,
					emoji: m.order.emoji,
					specName: m.order.specName,
					quantity: m.order.quantity,
					subtotal: m.order.subtotal,
					addressSummary: m.order.addressSummary
				}
			}
			return
		}

		// 用户说了确认类词汇但没带令牌，后端给的确定性引导（不经过 LLM）
		if (j && j.type === 'confirm_guide') {
			m.confirmToken = ''
			m.confirmPhrase = ''
			m.confirmSummary = ''
			m.order = {}
			return
		}

		// 地址列表（响应「换地址」）→ 填进地址弹层
		if (j && j.type === 'confirm_address') {
			addrPicker.value.list = j.addresses || []
			addrPicker.value.show = true
			return
		}

		// 推荐选购卡片：模型推荐茶叶时推送，前端渲染成可点选列表
		if (j && j.type === 'recommend_cards') {
			m.cards = j.cards || []
			// 默认选中每款茶的默认规格（isDefault=1），让用户少点一步
			const picks = { ...recPick.value }
			const qtys = { ...recQtyMap.value }
			for (const c of m.cards) {
				if (!picks[c.productId] && c.specs && c.specs.length) {
					picks[c.productId] = c.specs.find(s => s.isDefault === 1) || c.specs[0]
				}
				if (!qtys[c.productId]) qtys[c.productId] = 1
			}
			recPick.value = picks
			recQtyMap.value = qtys
			return
		}

		// 购物车快照：加购/删除成功后服务端主动推，展示真实购物车内容
		if (j && j.type === 'cart_snapshot') {
			m.cart = {
				count: j.count || 0,
				totalPrice: j.totalPrice || 0,
				justAdded: !!j.justAdded,
				items: j.items || []
			}
			return
		}

		// 拟单后的地址一句话（可点修改）—— 已并入 confirm_ready，这里只作兜底
		if (j && j.type === 'address_line') {
			if (m.order) m.order.addressSummary = j.addressSummary || m.order.addressSummary
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
		// 清空后换一个新 sessionId 并持久化；同时清服务端记忆。
		// ⚠️ 登录用户的记忆域在后端是 u{userId}（跨会话共享），
		// 只换前端 sessionId 是清不掉的——必须让后端按用户身份清（见 AgentChatController#clear）。
		await agentClearSession(sessionId.value)
		sessionId.value = 'mp-' + Math.random().toString(36).slice(2, 10)
		try { uni.setStorageSync(SESSION_KEY, sessionId.value) } catch (e) { /* 忽略 */ }
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
	/* 文字单独包一层 <text selectable>：小程序里只有 text 支持长按选中复制，
	   div 里的文字默认不可选（实测用户反馈"agent 回复的文字不能复制"）。
	   pre-wrap 必须放在 text 上，否则换行失效。 */
	.bubble-text {
		white-space: pre-wrap;
		word-break: break-word;
		user-select: text;
		-webkit-user-select: text;
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

	/* ---------- 订单拟单卡片：商品 + 地址一行（可点修改）+ 确认下单按钮 ---------- */
	.order-card {
		margin-top: 8px;
		background: #fff;
		border: 1px solid rgba(44, 94, 48, .18);
		border-radius: 12px;
		padding: 12px;
	}
	.oc-row { display: flex; align-items: center; gap: 6px; }
	.oc-emoji { font-size: 16px; }
	.oc-name { font-size: 14px; color: #1a1a1a; font-weight: 600; }
	.oc-meta {
		margin-top: 6px;
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 12px;
		color: #8a8a8a;
	}
	.oc-price { color: #c75000; font-weight: 600; }
	.oc-addr {
		margin-top: 9px;
		padding-top: 9px;
		border-top: 1px dashed rgba(0, 0, 0, .08);
		display: flex;
		align-items: flex-start;
		gap: 6px;
		font-size: 12px;
	}
	.oc-addr-label { color: #8a8a8a; flex-shrink: 0; }
	.oc-addr-text { color: #444; flex: 1; line-height: 1.5; word-break: break-all; }
	.oc-addr-edit {
		flex-shrink: 0;
		color: #2C5E30;
		font-weight: 600;
		padding-left: 4px;
	}
	.oc-buy {
		display: block;
		width: 100%;
		margin-top: 11px;
		padding: 10px 0;
		border: none;
		border-radius: 20px;
		background: #2C5E30;
		color: #fff;
		font-size: 14px;
	}
	.oc-buy[disabled] { background: #A8B5A9; }

	/* ---------- 推荐选购卡片（服务端 recommend_cards 事件驱动） ---------- */
	.rec-wrap { margin-top: 8px; display: flex; flex-direction: column; gap: 10px; }
	.rec-card {
		background: #fff;
		border: 1px solid rgba(44, 94, 48, .18);
		border-radius: 12px;
		padding: 12px;
	}
	.rec-top { display: flex; align-items: center; gap: 9px; }
	.rec-emoji { font-size: 20px; flex-shrink: 0; }
	.rec-info { flex: 1; min-width: 0; }
	.rec-name { font-size: 14px; font-weight: 600; color: #1a1a1a; }
	.rec-sub { font-size: 11px; color: #8a8a8a; margin-top: 3px; }
	.rec-specs {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 10px;
	}
	.rec-spec {
		font-size: 11px;
		padding: 5px 10px;
		border-radius: 14px;
		border: 1px solid rgba(44, 94, 48, .28);
		color: #2C5E30;
		background: rgba(44, 94, 48, .04);
	}
	.rec-spec.on {
		background: #2C5E30;
		color: #fff;
		border-color: #2C5E30;
	}
	.rec-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 11px;
		gap: 10px;
	}
	.rec-qty { display: flex; align-items: center; gap: 0; }
	.qty-btn {
		width: 26px;
		height: 26px;
		line-height: 24px;
		text-align: center;
		border: 1px solid rgba(44, 94, 48, .3);
		color: #2C5E30;
		font-size: 15px;
		box-sizing: border-box;
	}
	.qty-btn:first-child { border-radius: 6px 0 0 6px; }
	.qty-btn:last-child { border-radius: 0 6px 6px 0; }
	.qty-num {
		min-width: 34px;
		height: 26px;
		line-height: 26px;
		text-align: center;
		font-size: 13px;
		color: #1a1a1a;
		border-top: 1px solid rgba(44, 94, 48, .3);
		border-bottom: 1px solid rgba(44, 94, 48, .3);
	}
	.rec-buy {
		flex: 1;
		padding: 8px 0;
		border: none;
		border-radius: 16px;
		background: #2C5E30;
		color: #fff;
		font-size: 13px;
	}
	.rec-buy[disabled] { background: #A8B5A9; }

	/* ---------- 购物车卡片（服务端 cart_snapshot 事件驱动） ---------- */
	.cart-card {
		margin-top: 8px;
		background: #fff;
		border: 1px solid rgba(44, 94, 48, .18);
		border-radius: 12px;
		padding: 12px;
	}
	.cart-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 8px;
		border-bottom: 1px solid rgba(0, 0, 0, .06);
	}
	.cart-title { font-size: 14px; font-weight: 600; color: #2C5E30; }
	.cart-count { font-size: 12px; color: #8a8a8a; }
	.cart-item {
		display: flex;
		align-items: center;
		gap: 9px;
		padding: 9px 0;
		border-bottom: 1px dashed rgba(0, 0, 0, .06);
	}
	.cart-emoji { font-size: 18px; flex-shrink: 0; }
	.cart-info { flex: 1; min-width: 0; }
	.cart-name {
		font-size: 13px;
		color: #1a1a1a;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.cart-spec { font-size: 11px; color: #8a8a8a; margin-top: 3px; }
	.cart-price { font-size: 13px; color: #c75000; font-weight: 600; flex-shrink: 0; }
	.cart-total {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		padding-top: 10px;
		font-size: 12px;
		color: #8a8a8a;
	}
	.cart-total-price { font-size: 17px; color: #c75000; font-weight: 700; }
	.cart-goto {
		display: block;
		width: 100%;
		margin-top: 10px;
		padding: 9px 0;
		border: 1px solid rgba(44, 94, 48, .45);
		border-radius: 18px;
		background: transparent;
		color: #2C5E30;
		font-size: 13px;
	}

	/* ---------- 底部弹层（下单窗口 / 地址选择） ---------- */
	.sheet { padding: 18px 16px 24px; }
	.sheet-title {
		font-size: 16px;
		font-weight: 600;
		color: #1a1a1a;
		text-align: center;
		margin-bottom: 14px;
	}
	.sheet-goods {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		background: #f7f7f7;
		border-radius: 10px;
	}
	.sheet-emoji { font-size: 22px; }
	.sheet-goods-info { flex: 1; min-width: 0; }
	.sheet-goods-name { font-size: 14px; color: #1a1a1a; font-weight: 600; }
	.sheet-goods-spec { font-size: 12px; color: #8a8a8a; margin-top: 3px; }
	.sheet-goods-price { font-size: 15px; color: #c75000; font-weight: 600; }
	.sheet-line {
		margin-top: 12px;
		display: flex;
		align-items: flex-start;
		gap: 8px;
		font-size: 13px;
		padding: 10px 12px;
		border: 1px solid rgba(0, 0, 0, .07);
		border-radius: 10px;
	}
	.sheet-line-label { color: #8a8a8a; flex-shrink: 0; }
	.sheet-line-value { flex: 1; color: #333; line-height: 1.5; word-break: break-all; }
	.sheet-line-edit { flex-shrink: 0; color: #2C5E30; font-weight: 600; }
	.sheet-total {
		margin-top: 14px;
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		font-size: 13px;
		color: #8a8a8a;
	}
	.sheet-total-price { font-size: 20px; color: #c75000; font-weight: 700; }
	.sheet-pay {
		display: block;
		width: 100%;
		margin-top: 16px;
		padding: 13px 0;
		border: none;
		border-radius: 24px;
		background: #2C5E30;
		color: #fff;
		font-size: 16px;
		font-weight: 600;
	}
	.sheet-pay[disabled] { background: #A8B5A9; }
	.sheet-pay.ghost {
		background: transparent;
		color: #2C5E30;
		border: 1px solid rgba(44, 94, 48, .45);
		font-size: 14px;
		padding: 11px 0;
	}

	/* ---------- 地址列表（弹层内复用） ---------- */
	.addr-list { max-height: 46vh; overflow-y: auto; }
	.addr-item {
		display: flex;
		align-items: flex-start;
		padding: 12px 4px;
		border-bottom: 1px solid rgba(0, 0, 0, .05);
	}
	.addr-item.active { background: rgba(44, 94, 48, .04); }
	.addr-radio { width: 22px; flex-shrink: 0; padding-top: 2px; }
	.radio-dot {
		display: block;
		width: 17px;
		height: 17px;
		border-radius: 50%;
		border: 1.5px solid #c8c8c8;
		box-sizing: border-box;
	}
	.radio-dot.on {
		border-color: #2C5E30;
		background: #2C5E30;
		box-shadow: inset 0 0 0 3.5px #fff;
	}
	.addr-body { flex: 1; min-width: 0; }
	.addr-line1 {
		font-size: 14px;
		color: #1a1a1a;
		line-height: 1.4;
		word-break: break-all;
	}
	.addr-line2 {
		margin-top: 5px;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 6px;
		font-size: 12px;
		color: #8a8a8a;
	}
	.addr-tag {
		font-size: 10px;
		padding: 1px 5px;
		border-radius: 3px;
		background: rgba(44, 94, 48, .1);
		color: #2C5E30;
	}
	.addr-tag.corp { background: rgba(43, 96, 205, .1); color: #2b60cd; }
	.addr-tag.default { background: rgba(255, 145, 0, .12); color: #e07b00; }
	.addr-name { color: #555; }
	.addr-phone { color: #8a8a8a; }
	.addr-empty {
		text-align: center;
		color: #999;
		font-size: 13px;
		padding: 30px 0;
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
