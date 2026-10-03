<template>
	<div class="tea-app product-detail-page">
		<!-- 宣纸底纹背景 -->
		<div class="paper-texture"></div>

		<!-- 顶部导航 -->
		<header class="tea-header">
			<div class="header-left" @click="goBack">
				<van-icon name="arrow-left" size="20" color="#2C5E30" />
			</div>
			<h1 class="page-title">商品详情</h1>
			<div class="header-right" @click="goToCart">
				<van-icon name="shopping-cart-o" size="20" color="#8B5A2B" />
				<span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
			</div>
		</header>
       
		<!-- 主内容区（可滚动） -->
		<main class="detail-content">
			<!-- 商品图片轮播（基于van-swipe-cell实现） -->
			<div class="product-swipe">
				<!-- van-swipe-cell 侧滑单元格：左右可滑动显示操作按钮 -->
				<van-swipe-cell :right-width="80" 
					:left-width="80"
					>
					<div class="swipe-cell-content">
						<van-swipe :autoplay="3000" indicator-color="#2C5E30">
							<van-swipe-item :key="index">
								<div class="swipe-item">
									<span class="image-emoji">{{ product.emoji }}</span>
								</div>
							</van-swipe-item>
						</van-swipe>
						<div class="product-tag" :class="product.isNew ? 'new' : 'hot'">
							{{ product.isNew ? '新品' : '热卖' }}
						</div>
					</div>

					<!-- 右侧侧滑操作按钮（示例：收藏） -->
					<template #right>
						<div class="swipe-cell-btn right-btn">
							收藏
						</div>
					</template>

					<!-- 左侧侧滑操作按钮（示例：分享） -->
					<template #left>
						<div class="swipe-cell-btn left-btn">
							分享
						</div>
					</template>
				</van-swipe-cell>
			</div>
			<!-- 商品基本信息 -->
			<div class="product-info-card">
				<div class="product-header">
					<div class="product-title">
						<h2 class="product-name">{{ product.name }}</h2>
						<span class="product-subtitle">{{ product.subtitle }}</span>
					</div>
					<div class="product-price">
						<span class="current-price">¥{{ product.price }}</span>
						<span v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice }}</span>
					</div>
				</div>

				<div class="product-meta">
					<div class="meta-item">
						<span class="meta-label">评分</span>
						<span class="meta-value">
							<van-rate v-model="product.rating" :size="16" color="#DAA520" void-icon="star"
								void-color="#E0D9D0" :value="Math.round(product.rating)" allow-half/>
							<span class="rating-text">{{ product.rating }}分</span>
						</span>
					</div> 
					<div class="meta-item">
						<span class="meta-label">销量</span>
						<span class="meta-value">{{ product.sales }}件</span>
					</div>
					<div class="meta-item">
						<span class="meta-label">库存</span>
						<span class="meta-value">{{ product.stock }}件</span>
					</div>
				</div>

				<div class="product-origin">
					<span class="origin-label">产地</span>
					<span class="origin-value">{{ product.origin }} · {{ product.originDetail }}</span>
				</div>
			</div>

			<!-- 规格选择 -->
			<div class="spec-section">
				<div class="section-title">选择规格</div>
				<div class="spec-list">
					<div v-for="spec in product.specs" :key="spec.id" class="spec-item"
						:class="{ 'active': selectedSpec === spec.id }" @click="btnProductSpec(spec)">
						<span class="spec-name">{{ spec.specName }}</span>
						<span class="spec-price">¥{{ spec.price }}</span>
					</div>
				</div>
			</div>

			<!-- 数量选择 -->
			<div class="quantity-section">
				<div class="section-title">购买数量</div>
				<div class="quantity-control">
					<button class="qty-btn minus" @click="decreaseQuantity" :disabled="quantity <= 1">
						<van-icon name="minus" size="14" color="#8B5A2B" />
					</button>
					<span class="qty-number">{{ quantity }}</span>
					<button class="qty-btn plus" @click="increaseQuantity" :disabled="quantity >= product.stock">
						<van-icon name="plus" size="14" color="#8B5A2B" />
					</button>
					<span class="stock-text">库存 {{ product.stock }} 件</span>
				</div>
			</div>

			<!-- 店铺信息 -->
			<div class="shop-section" @click="goToShop(product.shopId)">
				<div class="shop-info">
					<div class="shop-avatar">
						<span class="shop-emoji">{{ product.shopEmoji || '🏪' }}</span>
					</div>
					<div class="shop-detail">
						<div class="shop-name-row">
							<span class="shop-name">{{ product.shopName }}</span>
							<span class="shop-badge">{{ product.shopBadge }}</span>
						</div>
						<div class="shop-meta">
							<span class="shop-rating">⭐ {{ product.shopRating }}</span>
							<span class="shop-fans">{{ product.fansCount }}粉丝</span>
						</div>
					</div>
				</div>
				<div class="shop-arrow">
					<van-icon name="arrow" size="16" color="#8B5A2B" />
				</div>
			</div>

			<!-- 商品详情 -->
			<div class="detail-section">
				<div class="section-title">商品详情</div>
				<div class="detail-content">
					<p class="detail-text">{{ product.description }}</p>

					<div class="detail-attributes">
						<div class="attribute-item">
							<span class="attribute-label">🍃 茶类</span>
							<span class="attribute-value">{{ product.categoryName }}</span>
						</div>
						<div class="attribute-item">
							<span class="attribute-label">📦 规格</span>
							<span class="attribute-value">{{ product.spec }}</span>
						</div>
						<div class="attribute-item">
							<span class="attribute-label">🏭 工艺</span>
							<span class="attribute-value">{{ product.craft || '传统工艺' }}</span>
						</div>
						<div class="attribute-item">
							<span class="attribute-label">📅 年份</span>
							<span class="attribute-value">{{ product.year || '2025' }}</span>
						</div>
					</div>

					<div class="tasting-notes">
						<h4 class="notes-title">🍵 品鉴笔记</h4>
						<p class="notes-text">{{ product.tastingNotes }}</p>
					</div>
				</div>
			</div>

			<!-- 相关主题推荐 -->
			<div class="related-section">
				<div class="section-header">
					<h3 class="section-title">同主题推荐</h3>
				</div>
				<div class="related-products">
					<div v-for="item in relatedProducts" :key="item.productId" class="related-item"
						@click="goToProduct(item.productId)">
						<div class="related-image">
							<span class="related-emoji">{{ item.productEmoji }}</span>
						</div>
						<div class="related-info">
							<h4 class="related-name">{{ item.productName }}</h4>
							<span class="related-price">¥{{ item.price }}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- 底部留白 -->
			<div class="bottom-space"></div>
		</main>

		<!-- 底部操作栏 -->
		<footer class="detail-footer">
			<div class="footer-actions">
				<div class="action-item" @click="toggleFavorite">
					<van-icon :name="isFavorite ? 'like' : 'like-o'" :color="isFavorite ? '#CD5C5C' : '#8B5A2B'"
						size="22" />
					<span class="action-text">{{ isFavorite ? '已收藏' : '收藏' }}</span>
				</div>
				<div class="action-item" @click="goToCart">
					<van-icon name="shopping-cart-o" color="#8B5A2B" size="22" />
					<span class="action-text">购物车</span>
				</div>
			</div>
			<div class="footer-buttons">
				<button class="cart-btn" @click="addToCart">加入购物车</button>
				<button class="buy-btn" @click="buyNow">立即购买</button>
			</div>
		</footer>

		<!-- 加入购物车成功提示 -->
		<div class="toast" :class="{ visible: toastVisible }">
			<div class="toast-dot success" />
			<span>{{ toastMessage }}</span>
		</div>

		<!-- 添加到购物车动画 -->
		<div v-if="showAddAnimation" class="add-animation" @animationend="showAddAnimation = false">
			<span class="animation-emoji">🛒</span>
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
		selectSingle,
		ThemeSingle,
		selectVCartDetail,
		insertCartItem
	} from "../api/index.js"
	import { onLoad } from '@dcloudio/uni-app'

	// ============ 状态定义 ============
	const toastVisible = ref(false)
	const toastMessage = ref('')
	const toastTimer = ref(null)
	const showAddAnimation = ref(false)
	const cartCount = ref(0) // 模拟购物车数量
	const selectedSpec = ref(1)
	const quantity = ref(1)
	const isFavorite = ref(false)

	// ============ 商品数据 ============
	const product = ref({})

	// ============ 同主题推荐商品 ============
	const relatedProducts = ref([])

	// ============ 方法 ============
	
	onLoad((option) => {
		// 获取当前组件实例
		const instance = getCurrentInstance()
		// 获取事件通道
		const eventChannel = instance.proxy.getOpenerEventChannel()
		if (eventChannel && typeof eventChannel.emit === 'function') {
			// 向父页面发送数据
			eventChannel.emit('acceptCateAndProductxq', {
				data: '首页面传来的数据'
			})
			eventChannel.emit('acceptShopAndProductxq', {
				data: '店铺页面传来的数据'
			})
			eventChannel.emit('acceptGowucAndProductxq', {
				data: '购物车页面传来的数据'
			})
			// 监听父页面传来的数据
			// 注意：这里的事件监听器会一直存在，需要在 onUnload 中移除
			const acceptCateAndProductxqHandler = async(data) => {
				// 这里可以处理接收到的数据
				selectProudctSingle(data.data)
			}
			const acceptShopAndProductxqHandler = async(data) => {
				// 这里可以处理接收到的数据
				selectProudctSingle(data.data)
			}
			const acceptGowucAndProductxqHandler = async(data) => {
				// 这里可以处理接收到的数据
				selectProudctSingle(data.data)
				quantity.value = data.data.quantity || 1
				selectedSpec.value = data.data.specId
				
			}
			eventChannel.on('acceptCateAndProductxq', acceptCateAndProductxqHandler)
			eventChannel.on('acceptShopAndProductxq', acceptShopAndProductxqHandler)
			eventChannel.on('acceptGowucAndProductxq', acceptGowucAndProductxqHandler)
		}
		quantityCount()
	})
	
	const btnProductSpec = (res) => {
		selectedSpec.value = res.id
		product.value.price = res.price
		product.value.originalPrice = res.originalPrice
	}
	
	// 计算当前用户购物车已有的数量
	const quantityCount = async() => {
		cartCount.value = 0;
		await selectVCartDetail().then(res => {
			res.VCartDetailEnhancedList.forEach(ele => {
				cartCount.value += ele.quantity
			})
		})
	}
	
	//获取商品数据
	const selectProudctSingle = async(data) => {
		await selectSingle({id: data.productId}).then(res => {
			product.value = res.vProductShopFull;
			product.value.specs = res.productSpecs;
		})
		await ThemeSingle({themeId: data.themeId}).then(res => {
			relatedProducts.value = res.themeProductCategory
		})
	}
	
	const showToast = (msg, duration = 2000) => {
		if (toastTimer.value) clearTimeout(toastTimer.value)
		toastMessage.value = msg
		toastVisible.value = true
		toastTimer.value = setTimeout(() => {
			toastVisible.value = false
		}, duration)
	}

	const goBack = () => {
		wx.navigateBack()
	}

	const goToCart = () => {
		showToast('跳转购物车')
		uni.redirectTo({
			url: '/pages/gowuc'
		})
	}

	const goToShop = (shopId) => {
		showToast(`进入店铺：${shopId}`)
		uni.navigateTo({
			url: '/pages/shop',
			events: {
				// 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
				acceptProductxqAndShop: function(data) {
					console.log("acceptProductxqAndShop", data)
				}
			},
			success: function(res) {
				// 通过eventChannel向被打开页面传送数据
				res.eventChannel.emit('acceptProductxqAndShop', {
					data: shopId
				})
			}
		});
	}

	const goToProduct = async(productId) => {
		showToast(`跳转商品：${productId}`)
		// 实际项目中更新当前页面
		await selectSingle({id: productId}).then(res => {
			product.value = res.vProductShopFull;
			product.value.specs = res.productSpecs;
		})
	}

	const toggleFavorite = () => {
		isFavorite.value = !isFavorite.value
		showToast(isFavorite.value ? '已添加到收藏' : '已取消收藏')
	}

	const decreaseQuantity = () => {
		if (quantity.value > 1) {
			quantity.value--
		}
	}

	const increaseQuantity = () => {
		if (quantity.value < product.value.stock) {
			quantity.value++
		}
	}

	const addToCart = async() => {
		// 显示动画
		showAddAnimation.value = true

		// 模拟加入购物车
		showToast(`成功加入购物车，数量：${quantity.value}`)
		const dat = {
			productId: product.value.id,
			quantity: quantity.value,
			checked: 1,
			specId: selectedSpec.value
		}
		// 更新购物车
		await insertCartItem(dat).then(res => {
			// 重新计算右上角购物车数量
			quantityCount()
		})
	}

	const buyNow = () => {
		showToast(`立即购买：${product.value.name} x${quantity.value}`)
		// 跳转到确认订单页
		// router.push('/checkout')
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
				rgba(139, 90, 43, 0.02) 0px,
				rgba(139, 90, 43, 0.02) 2px,
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
		background: rgba(253, 250, 245, 0.92);
		backdrop-filter: blur(8px);
		border-bottom: 0.5px solid rgba(139, 90, 43, 0.15);
		z-index: 10;
	}

	.page-title {
		margin: 0;
		font-size: 18px;
		font-weight: 600;
		color: #2C2C2C;
		letter-spacing: 1px;
	}

	.header-left,
	.header-right {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: rgba(245, 240, 232, 0.8);
		border: 0.5px solid rgba(139, 90, 43, 0.1);
		cursor: pointer;
		position: relative;
	}

	.cart-badge {
		position: absolute;
		top: -4px;
		right: -4px;
		min-width: 18px;
		height: 18px;
		background: #CD5C5C;
		border-radius: 10px;
		color: #FFFFFF;
		font-size: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 4px;
	}

	/* ========== 商品图片轮播 ========== */
	/* 轮播容器样式 */
	.product-swipe {
	  position: relative;
	  width: 100%;
	  height: 100%; /* 根据需求调整 */
	}
	/* swipe-cell主体内容样式 */
	.swipe-cell-content {
	  height: 100%;
	}
	/* 轮播项样式 */
	.swipe-item {
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  height: 100%;
	  background-color: #f5f5f5;
	}
	/* 图片表情样式 */
	.image-emoji {
	  font-size: 150px; /* 根据需求调整 */
	}
	/* 商品标签样式 */
	.product-tag {
	  position: absolute;
	  top: 10px;
	  right: 10px;
	  padding: 4px 8px;
	  border-radius: 4px;
	  color: #fff;
	  font-size: 12px;
	}
	/* 新品标签 */
	.product-tag.new {
	  background-color: #2C5E30;
	}
	/* 热卖标签 */
	.product-tag.hot {
	  background-color: #e64340;
	}
	/* 侧滑按钮样式 */
	.swipe-cell-btn {
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  height: 100%;
	  width: 80px;
	  color: #fff;
	}
	/* 右侧按钮（收藏） */
	.right-btn {
	  background-color: #1989fa;
	}
	/* 左侧按钮（分享） */
	.left-btn {
	  background-color: #4cd964;
	}

	/* ========== 商品信息卡片 ========== */
	.product-info-card {
		background: #FDFAF5;
		padding: 20px 16px;
		margin-bottom: 8px;
		border-bottom: 0.5px solid rgba(139, 90, 43, 0.1);
	}

	.product-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 12px;
	}

	.product-title {
		flex: 1;
	}

	.product-name {
		font-size: 20px;
		font-weight: 700;
		color: #2C2C2C;
		margin: 0 0 4px;
	}

	.product-subtitle {
		font-size: 13px;
		color: #8E8E8E;
	}

	.product-price {
		text-align: right;
	}

	.current-price {
		font-size: 24px;
		font-weight: 700;
		color: #8B5A2B;
		display: block;
	}

	.original-price {
		font-size: 14px;
		color: #A7B89E;
		text-decoration: line-through;
	}

	.product-meta {
		display: flex;
		gap: 24px;
		margin-bottom: 12px;
		padding: 12px 0;
		border-top: 1px solid rgba(139, 90, 43, 0.08);
		border-bottom: 1px solid rgba(139, 90, 43, 0.08);
	}

	.meta-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.meta-label {
		font-size: 12px;
		color: #8E8E8E;
	}

	.meta-value {
		font-size: 14px;
		font-weight: 500;
		color: #2C2C2C;
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.rating-text {
		width: 30px;
		margin-left: 4px;
		font-size: 13px;
		color: #DAA520;
	}

	.product-origin {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
	}

	.origin-label {
		color: #8E8E8E;
		min-width: 40px;
	}

	.origin-value {
		color: #2C5E30;
		font-weight: 500;
	}

	/* ========== 规格选择 ========== */
	.spec-section,
	.quantity-section,
	.shop-section,
	.theme-section,
	.detail-section,
	.related-section {
		background: #FDFAF5;
		padding: 16px;
		margin-bottom: 8px;
		border-bottom: 0.5px solid rgba(139, 90, 43, 0.1);
	}

	.section-title {
		font-size: 15px;
		font-weight: 600;
		color: #2C2C2C;
		margin-bottom: 12px;
		position: relative;
		padding-left: 10px;
	}

	.section-title::before {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 3px;
		height: 16px;
		background: #2C5E30;
		border-radius: 2px;
	}

	.spec-list {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.spec-item {
		flex: 1;
		min-width: 100px;
		padding: 12px;
		border: 1px solid rgba(139, 90, 43, 0.2);
		border-radius: 8px;
		text-align: center;
		cursor: pointer;
		transition: all 0.2s;
	}

	.spec-item.active {
		border-color: #2C5E30;
		background: rgba(44, 94, 48, 0.02);
		box-shadow: 0 0 0 1px #2C5E30;
	}

	.spec-name {
		display: block;
		font-size: 13px;
		color: #2C2C2C;
		margin-bottom: 4px;
	}

	.spec-price {
		display: block;
		font-size: 14px;
		font-weight: 600;
		color: #8B5A2B;
	}

	/* ========== 数量选择 ========== */
	.quantity-control {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.qty-btn {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		border: 1px solid rgba(139, 90, 43, 0.2);
		background: #FFFFFF;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
	}

	.qty-btn:active:not(:disabled) {
		background: rgba(44, 94, 48, 0.05);
		transform: scale(0.95);
	}

	.qty-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.qty-number {
		font-size: 16px;
		font-weight: 600;
		color: #2C2C2C;
		min-width: 30px;
		text-align: center;
	}

	.stock-text {
		font-size: 13px;
		color: #8E8E8E;
		margin-left: auto;
	}

	/* ========== 店铺信息 ========== */
	.shop-section {
		display: flex;
		align-items: center;
		justify-content: space-between;
		cursor: pointer;
	}

	.shop-info {
		display: flex;
		gap: 12px;
	}

	.shop-avatar {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: linear-gradient(145deg, #EAEFE0, #DDE2D5);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24px;
	}

	.shop-detail {
		flex: 1;
	}

	.shop-name-row {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 4px;
	}

	.shop-name {
		font-size: 15px;
		font-weight: 600;
		color: #2C2C2C;
	}

	.shop-badge {
		padding: 2px 8px;
		background: rgba(44, 94, 48, 0.1);
		border-radius: 20px;
		font-size: 10px;
		color: #2C5E30;
	}

	.shop-meta {
		display: flex;
		gap: 16px;
		font-size: 12px;
		color: #8E8E8E;
	}

	.shop-arrow {
		padding: 8px;
	}

	/* ========== 主题关联 ========== */
	.theme-section {
		display: flex;
		align-items: center;
		justify-content: space-between;
		cursor: pointer;
		background: linear-gradient(145deg, rgba(44, 94, 48, 0.02), rgba(139, 90, 43, 0.02));
	}

	.theme-info {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.theme-emoji {
		font-size: 24px;
	}

	.theme-text {
		display: flex;
		flex-direction: column;
	}

	.theme-name {
		font-size: 14px;
		font-weight: 600;
		color: #2C5E30;
		margin-bottom: 2px;
	}

	.theme-desc {
		font-size: 11px;
		color: #8E8E8E;
	}

	.theme-arrow {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.theme-count {
		font-size: 11px;
		color: #8E8E8E;
	}

	/* ========== 商品详情 ========== */
	.detail-text {
		font-size: 14px;
		line-height: 1.7;
		color: #5A5A5A;
		margin-bottom: 16px;
	}

	.detail-attributes {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
		margin-bottom: 20px;
		padding: 16px;
		background: rgba(139, 90, 43, 0.02);
		border-radius: 12px;
	}

	.attribute-item {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.attribute-label {
		font-size: 11px;
		color: #8E8E8E;
	}

	.attribute-value {
		font-size: 13px;
		font-weight: 500;
		color: #2C2C2C;
	}

	.tasting-notes {
		padding: 16px;
		background: rgba(44, 94, 48, 0.02);
		border-radius: 12px;
		border-left: 3px solid #2C5E30;
	}

	.notes-title {
		font-size: 14px;
		font-weight: 600;
		color: #2C5E30;
		margin: 0 0 8px;
	}

	.notes-text {
		font-size: 13px;
		line-height: 1.6;
		color: #5A5A5A;
		margin: 0;
	}

	/* ========== 同主题推荐 ========== */
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}

	.more-link {
		font-size: 12px;
		color: #8E8E8E;
		cursor: pointer;
	}

	.related-products {
		display: flex;
		gap: 12px;
		overflow-x: auto;
		padding-bottom: 4px;
	}

	.related-item {
		flex: 0 0 100px;
		background: #FFFFFF;
		border-radius: 12px;
		padding: 12px;
		border: 0.5px solid rgba(139, 90, 43, 0.1);
		cursor: pointer;
		transition: all 0.2s;
	}

	.related-item:active {
		transform: scale(0.95);
	}

	.related-image {
		width: 60px;
		height: 60px;
		margin: 0 auto 8px;
		background: linear-gradient(145deg, #EAEFE0, #DDE2D5);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.related-emoji {
		font-size: 28px;
	}

	.related-info {
		text-align: center;
	}

	.related-name {
		font-size: 12px;
		font-weight: 500;
		color: #2C2C2C;
		margin: 0 0 4px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.related-price {
		font-size: 13px;
		font-weight: 600;
		color: #8B5A2B;
	}

	/* ========== 底部操作栏 ========== */
	.detail-footer {
		position: fixed;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 100%;
		max-width: 375px;
		display: flex;
		align-items: center;
		background: rgba(253, 250, 245, 0.95);
		backdrop-filter: blur(10px);
		border-top: 0.5px solid rgba(139, 90, 43, 0.15);
		box-shadow: 0 -4px 12px rgba(44, 94, 48, 0.04);
		z-index: 20;
		box-sizing: border-box;
		padding: 8px 16px;
		gap: 16px;
	}

	.footer-actions {
		display: flex;
		gap: 16px;
	}

	.action-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		cursor: pointer;
	}

	.action-text {
		font-size: 10px;
		color: #5A5A5A;
	}

	.footer-buttons {
		flex: 1;
		display: flex;
		gap: 8px;
	}

	.cart-btn,
	.buy-btn {
		flex: 1;
		height: 44px;
		border: none;
		border-radius: 22px;
		font-size: 15px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.cart-btn {
		background: #F0E9E0;
		color: #5A5A5A;
		border: 0.5px solid rgba(139, 90, 43, 0.2);
	}

	.buy-btn {
		background: #2C5E30;
		color: #FFFFFF;
		box-shadow: 0 4px 8px rgba(44, 94, 48, 0.2);
	}

	.cart-btn:active {
		background: #E8DDD2;
	}

	.buy-btn:active {
		background: #1E4322;
		transform: scale(0.98);
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

	.toast-dot.success {
		background: #9bffb9;
	}

	/* ========== 加入购物车动画 ========== */
	.add-animation {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 10000;
		pointer-events: none;
		animation: addToCart 0.6s ease-out forwards;
	}

	.animation-emoji {
		font-size: 60px;
		filter: drop-shadow(0 8px 16px rgba(44, 94, 48, 0.3));
	}

	@keyframes addToCart {
		0% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}

		50% {
			opacity: 0.8;
			transform: translate(100px, -100px) scale(0.5);
		}

		100% {
			opacity: 0;
			transform: translate(200px, -200px) scale(0.1);
		}
	}

	.bottom-space {
		height: 80px;
	}

	/* 滚动条隐藏 */
	::-webkit-scrollbar {
		display: none;
	}
</style>