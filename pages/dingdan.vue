<template>
  <div class="tea-app orders-page">
    <!-- 宣纸底纹背景 -->
    <div class="paper-texture"></div>
    
    <!-- 顶部导航 -->
    <header class="tea-header">
      <div class="header-left" @click="goBack">
        <van-icon name="arrow-left" size="20" color="#2C5E30" />
      </div>
      <h1 class="page-title">我的订单</h1>
      <div class="header-right" @click="goToSearch">
        <van-icon name="manager" size="20" color="#8B5A2B" />
      </div>
    </header>

    <!-- 订单状态标签 -->
    <div class="order-tabs">
      <div 
        v-for="tab in orderTabs" 
        :key="tab.type"
        class="tab-item"
        :class="{ 'active': currentTab === tab.type }"
        @click="switchTab(tab.type)"
      >
        <span class="tab-name">{{ tab.name }}</span>
        <span v-if="tab.count" class="tab-count">{{ tab.count }}</span>
      </div>
    </div>

    <!-- 订单列表 -->
    <main class="orders-content">
      <div v-if="filteredOrders.length === 0" class="empty-orders">
        <div class="empty-icon">🍃</div>
        <p class="empty-text">暂无相关订单</p>
        <p class="empty-subtext">去挑选一些好茶吧</p>
        <button class="browse-btn" @click="goToHome">去逛逛</button>
      </div>

      <div v-else class="order-list">
        <div 
          v-for="order in filteredOrders" 
          :key="order.id"
          class="order-card"
        >
          <!-- 订单头部（店铺信息） -->
          <div class="order-header" @click="goToShop(order.shopId)">
            <div class="shop-info">
              <van-icon name="shop-o" size="16" color="#2C5E30" />
              <span class="shop-name">{{ order.shopName }}</span>
              <span class="shop-badge">{{ order.shopBadge }}</span>
            </div>
            <div class="order-status" :class="order.status">{{ order.statusText }}</div>
          </div>

          <!-- 订单商品列表 -->
          <div class="order-items">
            <div 
              v-for="item in order.items" 
              :key="item.id"
              class="order-item"
              @click="goToOrderDetail(order.id)"
            >
              <div class="item-image">
                <span class="item-emoji">{{ item.emoji }}</span>
              </div>
              <div class="item-info">
                <h4 class="item-name">{{ item.name }}</h4>
                <span class="item-spec">{{ item.spec }}</span>
              </div>
              <div class="item-price-info">
                <span class="item-price">¥{{ item.price }}</span>
                <span class="item-quantity">x{{ item.quantity }}</span>
              </div>
            </div>
          </div>

          <!-- 订单总计 -->
          <div class="order-total">
            <span class="total-label">共 {{ order.totalCount }} 件商品 实付</span>
            <span class="total-price">¥{{ order.payAmount }}</span>
          </div>

          <!-- 订单操作按钮 -->
          <div class="order-actions">
            <template v-if="order.status === 'unpaid'">
              <button class="action-btn cancel" @click="showCancelModal = true; currentOrderId = order.id">取消订单</button>
              <button class="action-btn primary" @click="showPaymentModal = true; currentOrderId = order.id; currentPayAmount = order.payAmount">立即付款</button>
            </template>
            
            <template v-else-if="order.status === 'unship'">
              <button class="action-btn" @click="remindShip(order.id)">提醒发货</button>
              <button class="action-btn" @click="viewLogistics(order.id)">查看物流</button>
            </template>
            
            <template v-else-if="order.status === 'unreceive'">
              <button class="action-btn" @click="viewLogistics(order.id)">查看物流</button>
              <button class="action-btn primary" @click="confirmReceive(order.id)">确认收货</button>
            </template>
            
            <template v-else-if="order.status === 'unreview'">
              <button class="action-btn" @click="buyAgain(order.id)">再次购买</button>
              <button class="action-btn primary" @click="reviewOrder(order.id)">去评价</button>
            </template>
            
            <template v-else-if="order.status === 'completed'">
              <button class="action-btn" @click="buyAgain(order.id)">再次购买</button>
              <button class="action-btn" @click="viewLogistics(order.id)">查看物流</button>
            </template>
          </div>
        </div>

        <!-- 加载更多 -->
        <div v-if="hasMore" class="load-more" @click="loadMore">
          加载更多
        </div>
      </div>

      <!-- 底部留白 -->
      <div class="bottom-space"></div>
    </main>

    <!-- 轻提示 -->
    <div class="toast" :class="{ visible: toastVisible }">
      <div class="toast-dot" />
      <span>{{ toastMessage }}</span>
    </div>

    <!-- ========== 取消订单确认弹窗 ========== -->
    <van-popup
      :show="showCancelModal"
      @close="closeCancelModal"
      round
      :z-index="2000"
    >
      <div class="popup-content">
        <div class="popup-title">取消订单</div>
        <div class="popup-body">
          <p class="popup-text">确定要取消该订单吗？</p>
          <div class="cancel-reasons">
            <div 
              v-for="reason in cancelReasons" 
              :key="reason.value"
              class="reason-item"
              @click="selectedCancelReason = reason.value"
            >
              <div class="radio-dot" :class="{ 'checked': selectedCancelReason === reason.value }"></div>
              <span>{{ reason.label }}</span>
            </div>
          </div>
        </div>
        <div class="popup-actions">
          <button class="popup-btn cancel" @click="closeCancelModal">再想想</button>
          <button class="popup-btn confirm" @click="confirmCancel" :disabled="!selectedCancelReason">确认取消</button>
        </div>
      </div>
    </van-popup>

    <!-- ========== 支付方式选择弹窗 ========== -->
    <van-popup
      :show="showPaymentModal"
      @close="closePaymentModal"
      round
      :z-index="2000"
    >
      <div class="popup-content">
        <div class="popup-title">选择支付方式</div>
        <div class="popup-body">
          <div class="pay-amount-info">
            支付金额：<span class="pay-amount">¥{{ currentPayAmount }}</span>
          </div>
          <div class="payment-methods">
            <div 
              v-for="method in paymentMethods" 
              :key="method.id"
              class="payment-method-item"
              :class="{ 'selected': selectedPayment === method.id }"
              @click="selectedPayment = method.id"
            >
              <div class="method-left">
                <span class="method-icon">{{ method.icon }}</span>
                <span class="method-name">{{ method.name }}</span>
              </div>
              <div class="method-right">
                <span class="method-balance">{{ method.balance }}</span>
                <div class="radio-dot" :class="{ 'checked': selectedPayment === method.id }"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="popup-actions">
          <button class="popup-btn cancel" @click="closePaymentModal">取消</button>
          <button class="popup-btn confirm" @click="confirmPayment" :disabled="!selectedPayment">确认支付</button>
        </div>
      </div>
    </van-popup>

    <!-- 评价弹窗 -->
    <van-popup
      :show="showReviewModal"
      @close="closeReviewModal"
      round
      :z-index="2000"
    >
      <div class="popup-content review-popup">
        <div class="popup-title">评价商品</div>
        <div class="popup-body">
          <div v-for="item in currentReviewItems" :key="item.id" class="review-item">
            <div class="review-item-header">
              <div class="item-image">
                <span class="item-emoji">{{ item.emoji }}</span>
              </div>
              <div class="item-info">
                <h4 class="item-name">{{ item.name }}</h4>
                <span class="item-spec">{{ item.spec }}</span>
              </div>
            </div>
            <div class="rating-stars">
              <span 
                v-for="star in 5" 
                :key="star"
                class="star"
                :class="{ 'active': star <= (item.rating || 0) }"
                @click="setRating(item, star)"
              >★</span>
            </div>
            <textarea 
              v-model="item.review"
              class="review-textarea"
              placeholder="请输入评价内容..."
              rows="3"
            ></textarea>
          </div>
        </div>
        <div class="popup-actions">
          <button class="popup-btn cancel" @click="closeReviewModal">取消</button>
          <button class="popup-btn confirm" @click="submitReview">提交评价</button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { VOrderItemDetail, cancelOrder } from '@/api/index.js'
import { onLoad, onShow } from '@dcloudio/uni-app'

// ============ 状态定义 ============
const toastVisible = ref(false)
const toastMessage = ref('')
const toastTimer = ref(null)

const currentTab = ref('all')
const currentTabbar = ref(4) // 我的页面选中

// 弹窗控制
const showCancelModal = ref(false)
const showPaymentModal = ref(false)
const showReviewModal = ref(false)
const currentOrderId = ref(null)
const currentPayAmount = ref('0.00')
const currentReviewItems = ref([])
const selectedCancelReason = ref('')
const selectedPayment = ref('')

// 订单标签（count 由真实订单计算，不再硬编码——原先写死 5/1/1/1/1/1 与用户实际订单无关）
const orderTabs = ref([
  { type: 'all', name: '全部', count: 0 },
  { type: 'unpaid', name: '待付款', count: 0 },
  { type: 'unship', name: '待发货', count: 0 },
  { type: 'unreceive', name: '待收货', count: 0 },
  { type: 'unreview', name: '待评价', count: 0 },
  { type: 'completed', name: '已完成', count: 0 }
])

// 取消原因
const cancelReasons = ref([
  { value: 'no_reason', label: '不想要了' },
  { value: 'change_address', label: '地址/电话信息填写错误' },
  { value: 'change_product', label: '改买其他商品' },
  { value: 'delivery_slow', label: '发货太慢' },
  { value: 'other', label: '其他原因' }
])

// 支付方式
const paymentMethods = ref([
  { 
    id: 'wechat', 
    name: '微信支付', 
    icon: '🟢', 
    balance: '余额 ¥1280.50' 
  },
  { 
    id: 'alipay', 
    name: '支付宝', 
    icon: '🔵', 
    balance: '余额 ¥961.80' 
  }
])

// 订单数据（来自老项目真实接口 /order/VOrderItemDetail，按 orderId 分组）
// 说明：原实现是页面内硬编码的演示数据（订单号 ORD2024xxxx、日期 2024-03），
// 与登录用户无关，会出现「显示的不是我订的订单」。现改为调真实接口。
const orders = ref([])
const loading = ref(false)

// 后端 status → 展示文案 / 筛选 tab 分组
const STATUS_TEXT = {
  unpaid: '待付款',
  paid: '待发货',
  unship: '待发货',
  shipped: '待收货',
  unreceive: '待收货',
  received: '待评价',
  unreview: '待评价',
  completed: '已完成',
  cancelled: '已取消',
  canceled: '已取消'
}

const STATUS_TAB = {
  unpaid: 'unpaid',
  paid: 'unship',
  unship: 'unship',
  shipped: 'unreceive',
  unreceive: 'unreceive',
  received: 'unreview',
  unreview: 'unreview',
  completed: 'completed'
}

/** 拉取真实订单：接口返回扁平的「订单项」列表，需按 orderId 聚合 */
const loadOrders = async () => {
  loading.value = true
  try {
    const res = await VOrderItemDetail()
    const rows = (res && res.vOrderItemDetailList) || []
    const byOrder = new Map()

    rows.forEach(r => {
      const oid = r.orderId
      if (!byOrder.has(oid)) {
        const st = r.orderStatus || 'unpaid'
        byOrder.set(oid, {
          id: oid,
          orderNo: r.orderNo,
          shopId: r.shopId,
          shopName: r.shopName || '未知店铺',
          shopBadge: r.shopBadge || '',
          status: STATUS_TAB[st] || st,
          rawStatus: st,
          statusText: STATUS_TEXT[st] || st,
          createTime: (r.orderCreatedAt || '').replace('T', ' ').slice(0, 16),
          totalCount: 0,
          totalAmount: Number(r.totalAmount || 0).toFixed(2),
          payAmount: Number(r.payAmount || 0).toFixed(2),
          items: []
        })
      }
      const o = byOrder.get(oid)
      o.items.push({
        id: r.orderItemId,
        productId: r.productId,
        name: r.productName,
        spec: r.productSpec,
        price: Number(r.unitPrice || 0).toFixed(2),
        quantity: r.quantity,
        emoji: r.orderItemEmoji || r.productEmoji || '🍃'
      })
      o.totalCount += r.quantity || 0
    })

    orders.value = Array.from(byOrder.values())
    updateTabCounts()
  } catch (e) {
    console.error('订单加载失败', e)
    showToast('订单加载失败，请检查登录状态')
  } finally {
    loading.value = false
  }
}

const hasMore = ref(false)

// 支持从「我的」页带 tab 参数进入（如 /pages/dingdan?tab=unship）
onLoad((option) => {
  const t = option && option.tab
  if (t && orderTabs.value.some(x => x.type === t)) {
    currentTab.value = t
  }
})

// 每次进入页面都重新拉取：下单后返回本页能看到新订单
onShow(() => {
  loadOrders()
})

// ============ 计算属性 ============
const filteredOrders = computed(() => {
  if (currentTab.value === 'all') {
    return orders.value
  }
  return orders.value.filter(order => order.status === currentTab.value)
})

// 更新标签计数（全部/已完成也按真实数据算，不再写死）
const updateTabCounts = () => {
  const counts = {
    all: orders.value.length,
    unpaid: orders.value.filter(o => o.status === 'unpaid').length,
    unship: orders.value.filter(o => o.status === 'unship').length,
    unreceive: orders.value.filter(o => o.status === 'unreceive').length,
    unreview: orders.value.filter(o => o.status === 'unreview').length,
    completed: orders.value.filter(o => o.status === 'completed').length
  }
  orderTabs.value = orderTabs.value.map(tab => ({ ...tab, count: counts[tab.type] || 0 }))
}

// ============ 交互方法 ============
const showToast = (msg, duration = 2000) => {
  if (toastTimer.value) clearTimeout(toastTimer.value)
  toastMessage.value = msg
  toastVisible.value = true
  toastTimer.value = setTimeout(() => {
    toastVisible.value = false
  }, duration)
}

/**
 * 返回上一页。
 *
 * 修复：原来 H5 分支里的 router.back() 是**注释掉的**，导致网页端点返回完全没反应
 * （只有小程序走 uni.navigateBack()）。现在两端统一用 uni.navigateBack()，
 * 并在页面栈为空时（例如直接以 URL 打开本页）兜底跳回首页，避免点了没反应。
 */
const goBack = () => {
  const pages = getCurrentPages ? getCurrentPages() : []
  if (pages && pages.length > 1) {
    uni.navigateBack()
  } else {
    // 页面栈只有本页：没有"上一页"可回，退回首页
    uni.reLaunch({ url: '/pages/homepage' })
  }
}

const goToHome = () => {
  currentTabbar.value = 0
  showToast('跳转首页')
}

const goToShop = (shopId) => {
  showToast(`进入店铺：${shopId}`)
}

const goToOrderDetail = (orderId) => {
  showToast(`订单详情：${orderId}`)
}

const switchTab = (type) => {
  currentTab.value = type
}

// ============ 取消订单功能 ============
const closeCancelModal = () => {
  showCancelModal.value = false
  currentOrderId.value = null
  selectedCancelReason.value = ''
}

/**
 * 确认取消订单。
 *
 * ⚠️ 这里原来是「纯 UI 假动作」：只把本地数组里那条 splice 掉就提示成功，
 * 数据库状态从未改变 —— 用户下次进页面又看到同一笔未付款订单（实测 bug）。
 * 现在改为真正调用后端 /order/CancelOrder，成功后才更新界面；
 * 后端会校验「本人 + 未发货」，失败（如已发货/越权）时如实提示，不假装成功。
 */
const confirmCancel = async () => {
  if (!selectedCancelReason.value) {
    showToast('请选择取消原因')
    return
  }
  const reason = cancelReasons.value.find(r => r.value === selectedCancelReason.value).label
  const orderId = currentOrderId.value
  if (!orderId) {
    closeCancelModal()
    return
  }

  try {
    const res = await cancelOrder(orderId, reason)
    // 老项目 Result：code===200 表示成功
    if (res && res.code === 200) {
      const orderIndex = orders.value.findIndex(o => o.id === orderId)
      if (orderIndex !== -1) {
        orders.value.splice(orderIndex, 1)
        updateTabCounts()
      }
      showToast(`订单已取消，原因：${reason}`)
      closeCancelModal()
    } else {
      // 后端拒绝（例如订单已发货、无权操作）——如实告知，不要静默吞掉
      showToast((res && res.msg) || '取消失败，请稍后重试')
    }
  } catch (e) {
    showToast('取消失败，请检查网络后重试')
  }
}

// ============ 支付功能 ============
const closePaymentModal = () => {
  showPaymentModal.value = false
  currentOrderId.value = null
  selectedPayment.value = ''
}

const confirmPayment = () => {
  if (!selectedPayment.value) {
    showToast('请选择支付方式')
    return
  }

  const paymentMethod = paymentMethods.value.find(m => m.id === selectedPayment.value)
  
  // 找到订单并更新状态
  const order = orders.value.find(o => o.id === currentOrderId.value)
  if (order) {
    order.status = 'unship'
    order.statusText = '待发货'
    updateTabCounts()
    showToast(`支付成功！使用 ${paymentMethod.name} 支付 ¥${currentPayAmount.value}`)
  }
  
  closePaymentModal()
}

// ============ 其他订单操作 ============
const remindShip = (orderId) => {
  showToast(`已提醒发货：${orderId}`)
}

const viewLogistics = (orderId) => {
  showToast(`查看物流：${orderId}`)
}

const confirmReceive = (orderId) => {
  showToast(`确认收货：${orderId}`)
  // 更新订单状态
  const order = orders.value.find(o => o.id === orderId)
  if (order) {
    order.status = 'unreview'
    order.statusText = '待评价'
    updateTabCounts()
  }
}

const buyAgain = (orderId) => {
  showToast(`再次购买：${orderId}`)
}

const reviewOrder = (orderId) => {
  const order = orders.value.find(o => o.id === orderId)
  if (order) {
    currentOrderId.value = orderId
    // 深拷贝商品用于评价
    currentReviewItems.value = order.items.map(item => ({
      ...item,
      rating: 0,
      review: ''
    }))
    showReviewModal.value = true
  }
}

const closeReviewModal = () => {
  showReviewModal.value = false
  currentOrderId.value = null
  currentReviewItems.value = []
}

const setRating = (item, star) => {
  item.rating = star
}

const submitReview = () => {
  // 验证评价
  for (const item of currentReviewItems.value) {
    if (item.rating === 0) {
      showToast('请为所有商品评分')
      return
    }
    if (!item.review.trim()) {
      showToast('请输入评价内容')
      return
    }
  }
  orderTabs.value[5].count += 1;
  showToast('评价成功，感谢您的反馈')
  
  // 更新订单状态
  const order = orders.value.find(o => o.id === currentOrderId.value)
  if (order) {
    order.status = 'completed'
    order.statusText = '已完成'
    updateTabCounts()
  }
  
  closeReviewModal()
}

const goToSearch = () => {
	uni.redirectTo({
		url: '/pages/my'
	});
}

const loadMore = () => {
  showToast('没有更多订单了')
}
</script>

<style scoped>
/* ========== 全局样式 ========== */
.tea-app {
  position: relative;
  width: 100%;
  min-height: 100vh;
  max-width: 375px;
  margin: 0 auto;
  background: linear-gradient(145deg, #F5F0E8 0%, #F0E9E0 100%);
  font-family: '思源宋体', 'Songti SC', 'Times New Roman', serif;
  overflow-x: hidden;
}

.paper-texture {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 375px;
  height: 100%;
  background-image: 
    repeating-linear-gradient(45deg, 
      rgba(139,90,43,0.02) 0px, 
      rgba(139,90,43,0.02) 2px, 
      transparent 2px, 
      transparent 8px);
  pointer-events: none;
  z-index: 0;
}

/* ========== 顶部导航 ========== */
.tea-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(253,250,245,0.92);
  backdrop-filter: blur(8px);
  border-bottom: 0.5px solid rgba(139,90,43,0.15);
  z-index: 10;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #2C2C2C;
  letter-spacing: 2px;
  position: relative;
}

.page-title::before {
  content: '';
  position: absolute;
  left: -16px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background: #2C5E30;
  border-radius: 2px;
  opacity: 0.8;
}

.header-left, .header-right {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(245,240,232,0.8);
  border: 0.5px solid rgba(139,90,43,0.1);
  cursor: pointer;
}

/* ========== 订单标签 ========== */
.order-tabs {
  display: flex;
  padding: 12px 16px;
  background: #FDFAF5;
  border-bottom: 0.5px solid rgba(139,90,43,0.1);
  overflow-x: auto;
  gap: 16px;
}

.order-tabs::-webkit-scrollbar {
  display: none;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
  position: relative;
  cursor: pointer;
  white-space: nowrap;
}

.tab-name {
  font-size: 14px;
  color: #5A5A5A;
  transition: all 0.2s;
}

.tab-item.active .tab-name {
  color: #2C5E30;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 2px;
  background: #2C5E30;
  border-radius: 1px;
}

.tab-count {
  font-size: 11px;
  padding: 0 4px;
  background: rgba(205,92,92,0.1);
  border-radius: 10px;
  color: #CD5C5C;
}

/* ========== 搜索栏 ========== */
.search-bar {
  display: flex;
  align-items: center;
  margin: 12px 16px;
  padding: 8px 12px;
  background: #FDFAF5;
  border-radius: 20px;
  border: 0.5px solid rgba(139,90,43,0.1);
  gap: 8px;
  cursor: pointer;
}

.search-placeholder {
  font-size: 13px;
  color: #8E8E8E;
}

/* ========== 订单列表 ========== */
.orders-content {
  padding: 0 16px 80px;
  position: relative;
  z-index: 1;
}

/* 空状态 */
.empty-orders {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-text {
  font-size: 16px;
  font-weight: 600;
  color: #2C2C2C;
  margin-bottom: 8px;
}

.empty-subtext {
  font-size: 13px;
  color: #8E8E8E;
  margin-bottom: 24px;
}

.browse-btn {
  padding: 10px 28px;
  background: #2C5E30;
  border: none;
  border-radius: 30px;
  font-size: 14px;
  color: #F5F0E8;
  cursor: pointer;
  box-shadow: 0 8px 16px -4px rgba(44,94,48,0.3);
}

/* 订单卡片 */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-card {
  background: #FDFAF5;
  border-radius: 16px;
  padding: 16px;
  border: 0.5px solid rgba(139,90,43,0.1);
  box-shadow: 0 4px 12px rgba(44,94,48,0.04);
}

/* 订单头部 */
.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px dashed rgba(139,90,43,0.2);
  margin-bottom: 12px;
  cursor: pointer;
}

.shop-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.shop-name {
  font-size: 14px;
  font-weight: 600;
  color: #2C2C2C;
}

.shop-badge {
  padding: 2px 8px;
  background: rgba(44,94,48,0.1);
  border-radius: 20px;
  font-size: 10px;
  color: #2C5E30;
}

.order-status {
  font-size: 13px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 20px;
}

.order-status.unpaid {
  color: #CD5C5C;
  background: rgba(205,92,92,0.1);
}

.order-status.unship {
  color: #DAA520;
  background: rgba(218,165,32,0.1);
}

.order-status.unreceive {
  color: #2C5E30;
  background: rgba(44,94,48,0.1);
}

.order-status.unreview {
  color: #8B5A2B;
  background: rgba(139,90,43,0.1);
}

.order-status.completed {
  color: #8E8E8E;
  background: rgba(142,142,142,0.1);
}

/* 订单商品 */
.order-items {
  margin-bottom: 12px;
}

.order-item {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  cursor: pointer;
}

.order-item:last-child {
  margin-bottom: 0;
}

.item-image {
  width: 60px;
  height: 60px;
  background: linear-gradient(145deg, #EAEFE0, #DDE2D5);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0.5px solid rgba(139,90,43,0.1);
}

.item-emoji {
  font-size: 24px;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 14px;
  font-weight: 600;
  color: #2C2C2C;
  margin: 0 0 4px;
}

.item-spec {
  font-size: 12px;
  color: #8E8E8E;
}

.item-price-info {
  text-align: right;
  min-width: 100px;
}

.item-price {
  font-size: 14px;
  font-weight: 600;
  color: #8B5A2B;
  display: block;
}

.item-quantity {
  font-size: 12px;
  color: #8E8E8E;
}

/* 订单总计 */
.order-total {
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
  gap: 8px;
  padding: 12px 0;
  border-top: 1px solid rgba(139,90,43,0.08);
  border-bottom: 1px solid rgba(139,90,43,0.08);
  margin-bottom: 12px;
}

.total-label {
  font-size: 12px;
  color: #5A5A5A;
}

.total-price {
  font-size: 16px;
  font-weight: 700;
  color: #8B5A2B;
}

/* 订单操作按钮 */
.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.action-btn {
  padding: 8px 16px;
  border: 0.5px solid rgba(139,90,43,0.2);
  border-radius: 20px;
  background: transparent;
  font-size: 12px;
  color: #5A5A5A;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: #2C5E30;
  border-color: #2C5E30;
  color: #F5F0E8;
}

.action-btn.cancel {
  color: #CD5C5C;
  border-color: rgba(205,92,92,0.3);
}

.action-btn:active {
  transform: scale(0.95);
  opacity: 0.8;
}

/* 加载更多 */
.load-more {
  padding: 16px;
  text-align: center;
  font-size: 13px;
  color: #8E8E8E;
  cursor: pointer;
}

/* ========== 底部导航栏 ========== */
.tea-tabbar {
  position: sticky;
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px 0 12px;
  background: rgba(253,250,245,0.92);
  backdrop-filter: blur(10px);
  border-top: 0.5px solid rgba(139,90,43,0.15);
  z-index: 20;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: center;
  background: transparent;
}

.tab-item.active {
  transform: translateY(-2px);
  background: transparent;
}

.tab-icon-wrapper {
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.tab-item.active .tab-icon-wrapper {
  transform: scale(1.15);
}

.tab-label {
  font-size: 11px;
  color: #8B5A2B;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.tab-item.active .tab-label {
  transform: scale(1.05);
  color: #2C5E30;
  font-weight: 600;
}

/* ========== 轻提示 ========== */
.toast {
  position: fixed;
  left: 50%;
  bottom: 100px;
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

.bottom-space {
  height: 20px;
}

/* ========== Vant Popup 样式覆盖 ========== */
:deep(.van-popup) {
  background: transparent;
}

.popup-content {
  background: #FDFAF5;
  border-radius: 20px;
  overflow: hidden;
  width: 90vw;
  max-width: 340px;
}

.popup-title {
  padding: 16px;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #2C2C2C;
  border-bottom: 1px solid rgba(139,90,43,0.1);
  background: #F5F0E8;
}

.popup-body {
  padding: 20px;
}

.popup-text {
  font-size: 14px;
  color: #2C2C2C;
  text-align: center;
  margin-bottom: 16px;
}

.popup-actions {
  display: flex;
  border-top: 1px solid rgba(139,90,43,0.1);
}

.popup-btn {
  flex: 1;
  padding: 14px 0;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
}

.popup-btn.cancel {
  color: #8E8E8E;
  border-right: 1px solid rgba(139,90,43,0.1);
}

.popup-btn.confirm {
  color: #2C5E30;
  font-weight: 600;
}

.popup-btn.confirm:disabled {
  color: #8E8E8E;
  cursor: not-allowed;
}

.popup-btn:active {
  background: rgba(44,94,48,0.05);
}

/* 取消原因列表 */
.cancel-reasons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reason-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  cursor: pointer;
}

.reason-item span {
  font-size: 14px;
  color: #5A5A5A;
}

/* 支付相关 */
.pay-amount-info {
  text-align: center;
  margin-bottom: 20px;
  font-size: 14px;
  color: #5A5A5A;
}

.pay-amount {
  font-size: 20px;
  font-weight: 700;
  color: #8B5A2B;
  margin-left: 4px;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-method-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border: 1px solid rgba(139,90,43,0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-method-item.selected {
  border-color: #2C5E30;
  background: rgba(44,94,48,0.02);
}

.method-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.method-icon {
  font-size: 20px;
}

.method-name {
  font-size: 14px;
  color: #2C2C2C;
}

.method-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.method-balance {
  font-size: 12px;
  color: #8E8E8E;
}

.radio-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid rgba(139,90,43,0.3);
  transition: all 0.2s;
}

.radio-dot.checked {
  border-color: #2C5E30;
  background: #2C5E30;
  box-shadow: 0 0 0 2px rgba(44,94,48,0.2);
}

/* 评价相关 */
.review-popup {
  max-width: 360px;
}

.review-item {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(139,90,43,0.08);
}

.review-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.review-item-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.rating-stars {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  justify-content: center;
}

.star {
  font-size: 24px;
  color: rgba(139,90,43,0.2);
  cursor: pointer;
  transition: all 0.2s;
}

.star.active {
  color: #DAA520;
}

.review-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(139,90,43,0.2);
  border-radius: 8px;
  font-size: 13px;
  color: #2C2C2C;
  background: #FFFFFF;
  outline: none;
  resize: none;
  box-sizing: border-box;
}

.review-textarea:focus {
  border-color: #2C5E30;
  box-shadow: 0 0 0 2px rgba(44,94,48,0.1);
}

/* 滚动条隐藏 */
::-webkit-scrollbar {
  display: none;
}







	/* #ifdef H5 */
	/* ========== H5 适配：PC 端 640px 居中（仅网页端，小程序零影响） ==========
	   手机端（<=768px）不加任何覆盖，完全沿用原设计（等于满屏）。
	   平板/电脑（>=769px）用 640px 居中：比 360px 宽松、不至于两侧大片空白，
	   同时仍保持「手机应用」的窄栏形态。
	*/
	@media screen and (min-width: 769px) {
		.tea-app { max-width: 640px; box-shadow: 0 0 40px rgba(44, 94, 48, 0.06); }
		.toast { max-width: 640px; margin: 0 auto; }
		.paper-texture { width: 640px; }
	}
	/* #endif */
</style>
