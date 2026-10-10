<template>
	<view class="tea-app shop-page">
		<!-- 宣纸底纹背景 -->
		<view class="paper-texture"></view>

		<!-- 顶部导航 -->
		<view class="tea-header">
			<view class="header-left" @click="goBack">
				<van-icon name="arrow-left" size="20" color="#2C5E30" />
			</view>
			<text class="page-title">店铺主页</text>
		</view>

		<!-- 店铺头部信息 -->
		<view class="shop-header">
			<view class="shop-cover">
				<image class="cover-image" :src="shop.coverImage" mode="aspectFill"></image>
				<view class="cover-overlay"></view>
			</view>

			<view class="shop-info-wrapper">
				<view class="shop-logo">
					<text class="logo-emoji">{{ shop.logoEmoji }}</text>
				</view>
				<view class="shop-detail">
					<view class="shop-name-row">
						<text class="shop-name">{{ shop.name }}</text>
						<text class="shop-badge">{{ shop.badge }}</text>
					</view>
					<view class="shop-meta">
						<text class="shop-rating">⭐ {{ shop.rating }}</text>
						<!-- <text class="shop-fans">{{ formatNumber(shop.fansCount) }}粉丝</text> -->
						<!-- <text class="shop-sales">累计销量 {{ formatNumber(shop.salesCount) }}</text> -->
					</view>
				</view>
				<view class="shop-action">
					<button class="follow-btn" :class="{ 'followed': isFollowed }" @click="toggleFollow">
						<text>{{ isFollowed ? '已关注' : '+ 关注' }}</text>
					</button>
				</view>
			</view>
		</view>

		<!-- 店铺公告 -->
		<view class="shop-notice">
			<view class="notice-icon">📢</view>
			<text class="notice-text">{{ shop.description }}</text>
		</view>

		<!-- 店铺信息卡片 -->
		<view class="shop-info-card">
			<view class="info-item">
				<text class="info-label">营业时间</text>
				<text class="info-value">{{ shop.businessHours }}</text>
			</view>
			<view class="info-item">
				<text class="info-label">联系电话</text>
				<text class="info-value" @click="callPhone(shop.phone)">{{ shop.phone }}</text>
			</view>
			<view class="info-item">
				<text class="info-label">店铺地址</text>
				<text class="info-value">{{ shop.address }}</text>
			</view>
		</view>

		<!-- 商品分类标签 -->
		<view class="category-tabs">
			<scroll-view class="tabs-scroll" scroll-x show-scrollbar="false">
				<view v-for="cat in categories" :key="cat.id" class="tab-item"
					:class="{ 'active': currentCategory === cat.id }" @click="switchCategory(cat.id)">
					<text class="tab-name">{{ cat.name }}</text>
					<text v-if="cat.count" class="tab-count">{{ cat.count }}</text>
				</view>
			</scroll-view>
		</view>

		<!-- 排序栏 -->
		<view class="sort-bar">
			<view v-for="sort in sortOptions" :key="sort.value" class="sort-item"
				:class="{ 'active': currentSort === sort.value }" @click="switchSort(sort.value)">
				<text>{{ sort.name }}</text>
				<view v-if="sort.value === 'price'" class="price-sort">
					<text :class="{ 'active': currentSort === 'price_asc' }">↑</text>
					<text :class="{ 'active': currentSort === 'price_desc' }">↓</text>
				</view>
			</view>
		</view>

		<!-- 商品列表 -->
		<view class="product-list">
			<view v-if="filteredProducts.length === 0" class="empty-products">
				<text class="empty-icon">🍃</text>
				<text class="empty-text">该分类暂无商品</text>
			</view>

			<view v-else class="product-grid">
				<view v-for="item in filteredProducts" :key="item.id" class="product-card"
					@click="goToProductDetail(item)">
					<view class="product-image">
						<text class="product-emoji">{{ item.emoji }}</text>
						<view v-if="item.isNew" class="product-tag new">新品</view>
						<view v-if="item.isHot && !item.isNew" class="product-tag hot">热卖</view>
					</view>
					<view class="product-info">
						<text class="product-name">{{ item.name }}</text>
						<text class="product-subtitle">{{ item.subtitle }}</text>
						<view class="product-price-row">
							<text class="product-price">¥{{ item.price }}</text>
							<text v-if="item.originalPrice" class="product-original">¥{{ item.originalPrice }}</text>
						</view>
						<view class="product-footer">
							<text class="product-sales">已售 {{ item.sales }}</text>
							<view class="add-cart" @click.stop="addToCart(item)">
								<van-icon name="cart-o" size="16" color="#2C5E30" />
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 加载更多 -->
		<view v-if="hasMore" class="load-more" @click="loadMore">
			<text>加载更多</text>
		</view>
		<view v-else-if="filteredProducts.length > 0" class="no-more">
			<text>没有更多商品了</text>
		</view>

		<!-- 底部留白 -->
		<view class="bottom-space"></view>

		<!-- 加入购物车成功提示 -->
		<van-toast id="van-toast" />
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		getCurrentInstance,
		onMounted
	} from 'vue'
	import {
		SingleOne,
		shopProductList,
		categoryLists
	} from "../api/index.js"
	import {
		onLoad
	} from '@dcloudio/uni-app'

	// ============ 状态定义 ============
	const isFollowed = ref(false)
	const currentCategory = ref('all')
	const currentSort = ref('default')
	const hasMore = ref(false)

	// ============ 店铺数据 ============
	const shop = ref({})

	// ============ 分类数据 ============
	const categories = ref([{
			id: 'all',
			name: '全部'
		}
	])

	// ============ 排序选项 ============
	const sortOptions = ref([{
			name: '综合',
			value: 'default'
		},
		{
			name: '新品',
			value: 'new'
		},
		{
			name: '销量',
			value: 'sales'
		},
		{
			name: '价格',
			value: 'price'
		}
	])

	// ============ 商品数据 ============
	const products = ref([])

	// ============ 计算属性 ============
	const filteredProducts = computed(() => {
		let filtered = [...products.value]

		// 按分类筛选
		if (currentCategory.value !== 'all') {
			filtered = filtered.filter(p => p.categoryId === currentCategory.value)
		}

		// 按排序
		switch (currentSort.value) {
			case 'new':
				filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
				break
			case 'sales':
				filtered.sort((a, b) => b.sales - a.sales)
				break
			case 'price_asc':
				filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
				break
			case 'price_desc':
				filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
				break
			default:
				// 综合排序：新品优先，然后热卖，最后按销量
				filtered.sort((a, b) => {
					if (a.isNew && !b.isNew) return -1
					if (!a.isNew && b.isNew) return 1
					if (a.isHot && !b.isHot) return -1
					if (!a.isHot && b.isHot) return 1
					return b.sales - a.sales
				})
		}

		return filtered
	})

	// ============ 初始化 ============
	onLoad((option) => {
		// 获取当前组件实例
		const instance = getCurrentInstance()
		// 获取事件通道
		const eventChannel = instance.proxy.getOpenerEventChannel()
		if (eventChannel && typeof eventChannel.emit === 'function') {
			// 向父页面发送数据
			eventChannel.emit('acceptProductxqAndShop', {
				data: '商品详情页面传来的数据'
			})
			// 监听父页面传来的数据
			// 注意：这里的事件监听器会一直存在，需要在 onUnload 中移除
			const acceptProductxqAndShopHandlear = async (data) => {
				console.log('接收到父页面数据：', data)
				// 这里可以处理接收到的数据
				selectShop(data.data)
			}
			eventChannel.on('acceptProductxqAndShop', acceptProductxqAndShopHandlear)
		}
	})

	const selectShop = async (data) => {
		await SingleOne({
			id: data
		}).then(res => {
			shop.value = res.shopData
			shop.value.coverImage = "/static/login_back.png"
		})
		await categoryLists().then(res => {
			res.dataList.categoryList.forEach((element) => {
				const datas = {id: element.id, name: element.name}
				categories.value.push(datas)
			});
		})
		await shopProductList({
			shopId: data
		}).then(res => {
			products.value = []
			res.shopProductList.forEach((element) => {
				const datas = {
					id: element.productId,
					productId: element.productId,
					name: element.productName,
					subtitle: element.subtitle,
					price: element.price,
					originalPrice: element.originalPrice,
					sales: element.sales,
					emoji: element.emoji,
					categoryId: element.categoryId,
					isNew: element.isNew,
					isHot: element.isHot,
					themeId: element.themeId
				}
				products.value.push(datas)
			})
		})
	}

	// ============ 方法 ============
	const formatNumber = (num) => {
		if (num >= 10000) {
			return (num / 10000).toFixed(1) + '万'
		}
		return num.toString()
	}

	const goBack = () => {
		// 修复：原实现只有小程序分支，H5 下点返回完全没反应。
		// 两端统一，并在页面栈为空时兜底跳首页。
		const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
		if (pages && pages.length > 1) {
			uni.navigateBack()
		} else {
			uni.reLaunch({ url: '/pages/homepage' })
		}
	}

	const goToProductDetail = (id) => {
		uni.navigateTo({
			url: '/pages/productxq',
			events: {
				// 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
				acceptShopAndProductxq: function(data) {
					console.log("acceptShopAndProductxq", data)
				}
			},
			success: function(res) {
				// 通过eventChannel向被打开页面传送数据
				res.eventChannel.emit('acceptShopAndProductxq', {
					data: id
				})
			}
		});
	}

	const toggleFollow = () => {
		isFollowed.value = !isFollowed.value
	}

	const callPhone = (phone) => {
		uni.makePhoneCall({
			phoneNumber: phone
		})
	}

	const switchCategory = (id) => {
		currentCategory.value = id
	}

	const switchSort = (value) => {
		if (value === 'price') {
			if (currentSort.value === 'price_asc') {
				currentSort.value = 'price_desc'
			} else if (currentSort.value === 'price_desc') {
				currentSort.value = 'price_asc'
			} else {
				currentSort.value = 'price_asc'
			}
		} else {
			currentSort.value = value
		}
	}

	const addToCart = (item) => {
		// 实际项目中需要调用加入购物车接口
	}

	const loadMore = () => {
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
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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

	/* ========== 店铺头部 ========== */
	.shop-header {
		position: relative;
		margin-bottom: 60px;
	}

	.shop-cover {
		height: 160px;
		overflow: hidden;
		position: relative;
	}

	.cover-image {
		width: 100%;
		height: 100%;
	}

	.cover-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.6));
	}

	.shop-info-wrapper {
		position: absolute;
		bottom: -40px;
		left: 16px;
		right: 16px;
		display: flex;
		align-items: center;
		gap: 12px;
		background: #FDFAF5;
		padding: 12px;
		border-radius: 16px;
		box-shadow: 0 4px 12px rgba(44, 94, 48, 0.15);
		border: 0.5px solid rgba(139, 90, 43, 0.1);
		z-index: 2;
	}

	.shop-logo {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		background: linear-gradient(145deg, #2C5E30, #1E4322);
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid #FDFAF5;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.logo-emoji {
		font-size: 32px;
	}

	.shop-detail {
		flex: 1;
	}

	.shop-name-row {
		display: flex;
		align-items: center;
		gap: 6px;
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
		flex-wrap: wrap;
		gap: 8px;
		font-size: 11px;
		color: #8E8E8E;
	}

	.shop-action {
		margin-left: auto;
	}

	.follow-btn {
		padding: 6px 12px;
		background: transparent;
		border: 1px solid #2C5E30;
		border-radius: 20px;
		font-size: 12px;
		color: #2C5E30;
		line-height: 1.2;
		cursor: pointer;
	}

	.follow-btn.followed {
		background: #2C5E30;
		color: #FFFFFF;
		border-color: #2C5E30;
	}

	/* ========== 店铺公告 ========== */
	.shop-notice {
		margin: 16px 16px 8px;
		padding: 12px;
		background: rgba(44, 94, 48, 0.05);
		border-radius: 12px;
		display: flex;
		align-items: center;
		gap: 8px;
		border-left: 3px solid #2C5E30;
	}

	.notice-icon {
		font-size: 18px;
	}

	.notice-text {
		flex: 1;
		font-size: 12px;
		color: #5A5A5A;
		line-height: 1.5;
	}

	/* ========== 店铺信息卡片 ========== */
	.shop-info-card {
		margin: 0 16px 16px;
		padding: 12px;
		background: #FDFAF5;
		border-radius: 12px;
		border: 0.5px solid rgba(139, 90, 43, 0.1);
	}

	.info-item {
		display: flex;
		padding: 8px 0;
		border-bottom: 0.5px solid rgba(139, 90, 43, 0.08);
	}

	.info-item:last-child {
		border-bottom: none;
	}

	.info-label {
		width: 70px;
		font-size: 12px;
		color: #8E8E8E;
	}

	.info-value {
		flex: 1;
		font-size: 12px;
		color: #2C2C2C;
	}

	/* ========== 分类标签 ========== */
	.category-tabs {
		margin: 8px 16px;
		background: #FDFAF5;
		border-radius: 30px;
		padding: 4px;
		border: 0.5px solid rgba(139, 90, 43, 0.1);
	}

	.tabs-scroll {
		white-space: nowrap;
	}

	.tab-item {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 8px 16px;
		border-radius: 26px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.tab-item.active {
		background: #2C5E30;
	}

	.tab-name {
		font-size: 13px;
		color: #5A5A5A;
	}

	.tab-item.active .tab-name {
		color: #FFFFFF;
		font-weight: 500;
	}

	.tab-count {
		font-size: 10px;
		padding: 2px 6px;
		background: rgba(205, 92, 92, 0.1);
		border-radius: 10px;
		color: #CD5C5C;
	}

	.tab-item.active .tab-count {
		background: rgba(255, 255, 255, 0.2);
		color: #FFFFFF;
	}

	/* ========== 排序栏 ========== */
	.sort-bar {
		display: flex;
		align-items: center;
		justify-content: space-around;
		margin: 8px 16px 16px;
		padding: 8px 0;
		background: #FDFAF5;
		border-radius: 30px;
		border: 0.5px solid rgba(139, 90, 43, 0.1);
	}

	.sort-item {
		display: flex;
		align-items: center;
		gap: 2px;
		font-size: 13px;
		color: #8E8E8E;
		cursor: pointer;
		position: relative;
	}

	.sort-item.active {
		color: #2C5E30;
		font-weight: 500;
	}

	.price-sort {
		display: flex;
		flex-direction: column;
		font-size: 10px;
		line-height: 1;
		margin-left: 2px;
	}

	.price-sort text {
		color: #8E8E8E;
	}

	.price-sort text.active {
		color: #2C5E30;
		font-weight: 600;
	}

	/* ========== 商品列表 ========== */
	.product-list {
		padding: 0 16px 20px;
	}

	.empty-products {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40px 0;
	}

	.empty-icon {
		font-size: 48px;
		margin-bottom: 12px;
		opacity: 0.5;
	}

	.empty-text {
		font-size: 14px;
		color: #8E8E8E;
	}

	.product-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}

	.product-card {
		background: #FDFAF5;
		border-radius: 16px;
		overflow: hidden;
		border: 0.5px solid rgba(139, 90, 43, 0.1);
		box-shadow: 0 2px 8px rgba(44, 94, 48, 0.04);
		cursor: pointer;
		transition: all 0.2s;
	}

	.product-card:active {
		transform: scale(0.98);
	}

	.product-image {
		position: relative;
		aspect-ratio: 1;
		background: linear-gradient(145deg, #EAEFE0, #DDE2D5);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.product-emoji {
		font-size: 40px;
	}

	.product-tag {
		position: absolute;
		top: 8px;
		left: 8px;
		padding: 2px 8px;
		border-radius: 12px;
		font-size: 10px;
		color: #FFFFFF;
	}

	.product-tag.new {
		background: #2C5E30;
	}

	.product-tag.hot {
		background: #CD5C5C;
	}

	.product-info {
		padding: 12px;
	}

	.product-name {
		display: block;
		font-size: 14px;
		font-weight: 600;
		color: #2C2C2C;
		margin-bottom: 4px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.product-subtitle {
		display: block;
		font-size: 11px;
		color: #8E8E8E;
		margin-bottom: 8px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.product-price-row {
		display: flex;
		align-items: baseline;
		gap: 6px;
		margin-bottom: 8px;
	}

	.product-price {
		font-size: 16px;
		font-weight: 700;
		color: #8B5A2B;
	}

	.product-original {
		font-size: 11px;
		color: #A7B89E;
		text-decoration: line-through;
	}

	.product-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.product-sales {
		font-size: 10px;
		color: #8E8E8E;
	}

	.add-cart {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: rgba(44, 94, 48, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}

	.add-cart:active {
		background: rgba(44, 94, 48, 0.2);
	}

	/* ========== 加载更多 ========== */
	.load-more,
	.no-more {
		padding: 20px;
		text-align: center;
		font-size: 12px;
		color: #8E8E8E;
	}

	.load-more {
		cursor: pointer;
	}

	.bottom-space {
		height: 20px;
	}

	/* 滚动条隐藏 */
	::-webkit-scrollbar {
		display: none;
	}




	/* #ifdef H5 */
	/* ========== H5 适配：PC 端统一 360px 居中（仅网页端，小程序零影响） ==========
	   为什么是 360px：与登录页 .phone-frame 的 min(360px, 92vw) 保持一致，
	   整个站点在电脑上呈现为「一部手机居中」的形态。手机端（<=768px）不加覆盖。
	*/
	@media screen and (min-width: 769px) {
		.tea-app { max-width: 360px; box-shadow: 0 0 40px rgba(44, 94, 48, 0.06); }
		.paper-texture { width: 360px; }
	}
	/* #endif */
</style>