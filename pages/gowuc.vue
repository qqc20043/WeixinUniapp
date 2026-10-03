<template>
	<div class="tea-app cart-page">
		<!-- 宣纸底纹背景 -->
		<div class="paper-texture"></div>

		<!-- 顶部导航 -->
		<header class="tea-header">
			<div class="header-left">
				<van-icon name="arrow-left" size="20" color="#2C5E30" @click="goBack" />
			</div>
			<h1 class="page-title">购物车</h1>
			<div class="header-right" @click="toggleEditMode">
				<span class="edit-text">{{ isEditMode ? '完成' : '编辑' }}</span>
			</div>
		</header>

		<!-- 主内容区 -->
		<main class="tea-content">

			<!-- 如果购物车为空 -->
			<div v-if="cartItems.length === 0" class="empty-cart">
				<div class="empty-icon">🍃</div>
				<p class="empty-text">您的茶篮还空着</p>
				<p class="empty-subtext">去挑选一些好茶吧</p>
				<button class="browse-btn" @click="goToHome">去逛逛</button>
			</div>

			<!-- 购物车列表 -->
			<div v-else class="cart-list">
				<!-- 店铺分组 -->
				<div v-for="(shop, shopIndex) in cartShops" :key="shop.id" class="shop-section">
					<!-- 店铺头 -->
					<div class="shop-header">
						<div class="shop-check">
							<div class="custom-checkbox" :class="{ 'checked': shop.checked }"
								@click="toggleShopCheck(shopIndex)">
								<van-icon v-if="shop.checked" name="success" size="14" color="#F5F0E8" />
							</div>
						</div>
						<div class="shop-info">
							<van-icon name="shop-o" size="16" color="#2C5E30" />
							<span class="shop-name">{{ shop.name }}</span>
							<span class="shop-badge">{{ shop.badge }}</span>
						</div>
					</div>

					<!-- 店铺内商品 -->
					<div v-for="(item, itemIndex) in shop.items" :key="item.id" class="cart-item">
						<div class="item-check">
							<div class="custom-checkbox" :class="{ 'checked': item.checked }"
								@click="toggleItemCheck(shopIndex, itemIndex)">
								<van-icon v-if="item.checked" name="success" size="14" color="#F5F0E8" />
							</div>
						</div>

						<div class="item-content" @click="goToDetail(item)">
							<!-- 商品图片 -->
							<div class="item-image">
								<span class="item-emoji">{{ item.emoji }}</span>
							</div>

							<!-- 商品信息 -->
							<div class="item-info">
								<h4 class="item-name">{{ item.name }}</h4>
								<span class="item-spec">{{ item.spec }}</span>

								<div class="item-price-row">
									<span class="item-price">¥{{ item.price }}</span>
									<span v-if="item.originalPrice"
										class="item-original">¥{{ item.originalPrice }}</span>
								</div>
							</div>
						</div>

						<!-- 数量操作区 -->
						<div class="item-quantity">
							<div v-if="!isEditMode" class="quantity-control">
								<button class="qty-btn minus" @click.stop="decreaseQuantity(shopIndex, itemIndex)"
									:disabled="item.quantity <= 1">
									<van-icon name="minus" size="12" color="#8B5A2B" />
								</button>
								<span class="qty-number">{{ item.quantity }}</span>
								<button class="qty-btn plus" @click.stop="increaseQuantity(shopIndex, itemIndex)">
									<van-icon name="plus" size="12" color="#8B5A2B" />
								</button>
							</div>

							<!-- 编辑模式：删除按钮 -->
							<div v-else class="edit-control">
								<button class="delete-btn" @click.stop="deleteItem(shopIndex, itemIndex, item)">
									<van-icon name="delete" size="18" color="#CD5C5C" />
								</button>
							</div>
						</div>
					</div>
				</div>

				<!-- 为你推荐（茶文化相关） -->
				<section class="recommend-section">
					<div class="section-header">
						<h2 class="section-title">为您推荐</h2>
						<span class="more-link" @click="randomProduct">换一批</span>
					</div>

					<div class="recommend-grid">
						<div v-for="item in recommendItems" :key="item.productId" class="recommend-card"
							@click="goToDetail(item)">
							<div class="recommend-image">
								<span class="recommend-emoji">{{ item.emoji }}</span>
							</div>
							<div class="recommend-info">
								<h4 class="recommend-name">{{ item.name }}</h4>
								<span class="recommend-price">¥{{ item.price }}</span>
								<button class="add-cart-btn" @click.stop="goToDetail(item)">
									<van-icon name="cart-o" size="14" color="#F5F0E8" />
									<span>加入茶篮</span>
								</button>
							</div>
						</div>
					</div>
				</section>

				<!-- 底部留白 -->
				<div class="bottom-space"></div>
			</div>
		</main>

		<!-- 底部结算栏（购物车不为空时显示） -->
		<footer v-if="cartItems.length > 0" class="cart-footer">
			<div class="footer-left">
				<div class="all-check" @click="toggleAllCheck">
					<div class="custom-checkbox" :class="{ 'checked': allChecked }">
						<van-icon v-if="allChecked" name="success" size="14" color="#F5F0E8" />
					</div>
					<span class="all-check-text">全选</span>
				</div>

				<div class="total-info">
					<span class="total-label">合计：</span>
					<span class="total-price">¥{{ totalPrice }}</span>
				</div>
			</div>

			<button class="settle-btn" :class="{ 'active': totalPrice > 0 }" @click="handleSettle">
				<span class="btn-text">结算</span>
				<span class="btn-count">{{ selectedCount }}</span>
			</button>
		</footer>

		<!-- 底部导航栏（带放大效果） -->
		<footer class="tea-tabbar">
			<div v-for="(item, index) in tabbarItems" :key="index" class="tab-item"
				:class="{ 'active': currentTabbar === index }" @click="handleTabbarClick(index)">
				<div class="tab-icon-wrapper">
					<van-icon :name="item.icon" :size="22" :color="currentTabbar === index ? '#2C5E30' : '#8B5A2B'" />
				</div>
				<span class="tab-label">{{ item.label }}</span>
			</div>
		</footer>

		<!-- 茶具装饰元素 -->
		<div class="teapot-decoration"></div>
	</div>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue';
	import {
		selectVCartDetail,
		productThemeLists,
		delCartItem,
		insertCartItem
	} from "../api/index.js"
	import {
		onLoad
	} from '@dcloudio/uni-app'
	import {
		countStore
	} from "../store/count.js"

	const userCountStore = countStore()
	// ============ 状态定义 ============
	const currentTabbar = ref(3); // 购物车页选中
	const isEditMode = ref(false); // 是否为编辑模式

	// 底部导航数据
	const tabbarItems = ref([{
			icon: 'wap-home',
			label: '首页'
		},
		{
			icon: 'bars',
			label: '分类'
		},
		{
			icon: 'coupon',
			label: '优惠券'
		},
		{
			icon: 'shopping-cart',
			label: '购物车'
		},
		{
			icon: 'user',
			label: '我的'
		}
	]);

	// 店铺数据（按店铺分组）
	const cartShops = ref([]);
	// 全部商品
	const productList = ref([])

	// 为您推荐数据
	const recommendItems = ref([]);

	onLoad((option) => {
		vCartDetail()
	})

	// 获取购物车商品数据——随机推荐商品
	const vCartDetail = async () => {
		await selectVCartDetail().then(res => {
			res.VCartDetailEnhancedList.forEach(ele => {
				let indexC = cartShops.value.indexOf(ele.shopId);
				if(indexC == -1) {
					const datas = {
						id: ele.shopId,
						name: ele.shopName,
						badge: ele.shopBadge,
						checked: ele.checked,
						items:[]
					}
					cartShops.value.push(datas);
					indexC = cartShops.value.length - 1;
				}
				const item = {
					id: ele.productId,
					productId: ele.productId,
					themeId: ele.themeId,
					name: ele.productName,
					spec: ele.specName,
					specId: ele.specId,
					price: ele.specPrice,
					quantity: ele.quantity,
					emoji: ele.productEmoji,
					checked: ele.checked,
					stock: ele.specStock
				}
				cartShops.value[indexC].items.push(item)
			})
		})
		await productThemeLists().then(res => {
			productList.value = res.dataList.ProductThemeList
			randomProduct()
		})
	}
	
	// 随机获取推荐商品
	const randomProduct = () => {
		// 复制一份，避免修改原数组
		let tempArr = [...productList.value];
		recommendItems.value = []
		for(let i = 0; i < 4; i ++) {
			let randomIndex = Math.floor(Math.random() * tempArr.length)
			recommendItems.value.push(tempArr[randomIndex])
			tempArr.splice(randomIndex, 1);
		}
	}

	// 扁平化商品列表（用于计算）
	const cartItems = computed(() => {
		return cartShops.value.flatMap(shop => shop.items);
	});

	// 计算是否全选
	const allChecked = computed(() => {
		const allItems = cartShops.value.flatMap(shop => shop.items);
		return allItems.length > 0 && allItems.every(item => item.checked);
	});

	// 计算选中商品总数
	const selectedCount = computed(() => {
		return cartShops.value
			.flatMap(shop => shop.items)
			.filter(item => item.checked)
			.reduce((sum, item) => sum + item.quantity, 0);
	});

	// 计算总价
	const totalPrice = computed(() => {
		return cartShops.value
			.flatMap(shop => shop.items)
			.filter(item => item.checked)
			.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0)
			.toFixed(2);
	});

	// ============ 交互事件 ============
	// 切换编辑模式
	const toggleEditMode = () => {
		isEditMode.value = !isEditMode.value;
	};

	// 切换店铺内所有商品
	const toggleShopCheck = (shopIndex) => {
		const shop = cartShops.value[shopIndex];
		const newChecked = !shop.checked;
		shop.checked = newChecked;
		shop.items.forEach(item => {
			item.checked = newChecked;
		});
	};

	// 切换单个商品
	const toggleItemCheck = (shopIndex, itemIndex) => {
		const item = cartShops.value[shopIndex].items[itemIndex];
		item.checked = !item.checked;

		// 更新店铺选中状态
		const shop = cartShops.value[shopIndex];
		shop.checked = shop.items.every(item => item.checked);
	};

	// 全选/取消全选
	const toggleAllCheck = () => {
		const newChecked = !allChecked.value;
		cartShops.value.forEach(shop => {
			shop.checked = newChecked;
			shop.items.forEach(item => {
				item.checked = newChecked;
			});
		});
	};

	// 增加数量
	const increaseQuantity = async(shopIndex, itemIndex) => {
		const item = cartShops.value[shopIndex].items[itemIndex];
		item.quantity++;
		await insertCartItem(item)
	};

	// 减少数量
	const decreaseQuantity = async(shopIndex, itemIndex) => {
		const item = cartShops.value[shopIndex].items[itemIndex];
		if (item.quantity > 1) {
			item.quantity--;
		}
		await insertCartItem(item)
	};

	// 删除商品
	const deleteItem = async(shopIndex, itemIndex, item) => {
		await delCartItem(item).then(res => {
			cartShops.value[shopIndex].items.splice(itemIndex, 1);
			// 如果店铺内没有商品了，删除店铺
			if (cartShops.value[shopIndex].items.length === 0) {
				cartShops.value.splice(shopIndex, 1);
			}
		})
	};

	// 结算
	const handleSettle = () => {
		userCountStore.clearCartOrderShops()
		userCountStore.pushCartOrderShops(cartShops.value)
		if (totalPrice.value > 0) {
			console.log('结算金额:', totalPrice.value);
		}
		uni.navigateTo({
			url: '/pages/jiesuan'
		});
	};

	// 跳转详情
	const goToDetail = (ele) => {
		uni.navigateTo({
			url: '/pages/productxq',
			events: {
				// 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
				acceptGowucAndProductxq: function(data) {
					console.log("acceptGowucAndProductxq", data)
				}
			},
			success: function(res) {
				// 通过eventChannel向被打开页面传送数据
				res.eventChannel.emit('acceptGowucAndProductxq', {
					data: ele
				})
			}
		});
	};

	// 跳转首页
	const goToHome = () => {
		currentTabbar.value = 0;
		uni.redirectTo({
			url: '/pages/cate'
		});
	};
	
	const goBack = () => {
		wx.navigateBack()
	}

	// 底部导航点击
	const handleTabbarClick = (index) => {
		currentTabbar.value = index;
		if (index === 1) {
			uni.redirectTo({
				url: '/pages/cate'
			});
		} else if (index === 2) {
			uni.redirectTo({
				url: '/pages/youhuiq'
			});
		} else if (index === 0) {
			uni.redirectTo({
				url: '/pages/homepage'
			});
		} else if (index === 4) {
			uni.redirectTo({
				url: '/pages/my'
			});
		}
	};
</script>

<style scoped>
	/* ========== 全局基调 ========== */
	.tea-content {
		padding-bottom: 60px;
	}
	.tea-app {
		position: relative;
		width: 100%;
		min-height: 100vh;
		max-width: 400px;
		margin: 0 auto;
		background: linear-gradient(145deg, #F5F0E8 0%, #F0E9E0 100%);
		font-family: '思源宋体', 'Songti SC', 'Times New Roman', serif;
		overflow-x: hidden;
	}

	/* 宣纸纹理叠加 */
	.paper-texture {
		position: fixed;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 400px;
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
	}

	.edit-text {
		font-size: 15px;
		color: #2C5E30;
		font-weight: 500;
	}

	/* ========== 空购物车 ========== */
	.empty-cart {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60px 0;
		text-align: center;
	}

	.empty-icon {
		font-size: 64px;
		margin-bottom: 16px;
		opacity: 0.6;
	}

	.empty-text {
		font-size: 18px;
		font-weight: 600;
		color: #2C2C2C;
		margin-bottom: 8px;
	}

	.empty-subtext {
		font-size: 14px;
		color: #8E8E8E;
		margin-bottom: 24px;
	}

	.browse-btn {
		padding: 12px 32px;
		background: #2C5E30;
		border: none;
		border-radius: 30px;
		font-size: 16px;
		color: #F5F0E8;
		font-family: '思源宋体', serif;
		cursor: pointer;
		box-shadow: 0 8px 16px -4px rgba(44, 94, 48, 0.3);
	}

	/* ========== 购物车列表 ========== */
	.cart-list {
		padding: 16px;
	}

	.shop-section {
		background: #FDFAF5;
		border-radius: 16px;
		margin-bottom: 12px;
		padding: 12px;
		border: 0.5px solid rgba(139, 90, 43, 0.1);
		box-shadow: 0 4px 12px rgba(44, 94, 48, 0.04);
	}

	.shop-header {
		display: flex;
		align-items: center;
		gap: 12px;
		padding-bottom: 12px;
		border-bottom: 1px dashed rgba(139, 90, 43, 0.2);
		margin-bottom: 12px;
	}

	.shop-info {
		display: flex;
		align-items: center;
		gap: 6px;
		flex: 1;
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

	/* 自定义复选框 */
	.custom-checkbox {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		border: 1.5px solid rgba(139, 90, 43, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
		background: #FDFAF5;
	}

	.custom-checkbox.checked {
		background: #2C5E30;
		border-color: #2C5E30;
	}

	/* 购物车商品项 */
	.cart-item {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 12px;
		position: relative;
	}

	.cart-item:last-child {
		margin-bottom: 0;
	}

	.item-check {
		align-self: flex-start;
		margin-top: 30px;
	}

	.item-content {
		flex: 1;
		display: flex;
		gap: 12px;
		cursor: pointer;
	}

	.item-image {
		width: 80px;
		height: 80px;
		background: linear-gradient(145deg, #EAEFE0, #DDE2D5);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 0.5px solid rgba(139, 90, 43, 0.1);
	}

	.item-emoji {
		font-size: 32px;
	}

	.item-info {
		flex: 1;
		padding: 4px 0;
	}

	.item-name {
		font-size: 15px;
		font-weight: 600;
		color: #2C2C2C;
		margin: 0 0 4px;
	}

	.item-spec {
		font-size: 12px;
		color: #8E8E8E;
		display: block;
		margin-bottom: 8px;
	}

	.item-price-row {
		display: flex;
		align-items: baseline;
		gap: 8px;
	}

	.item-price {
		font-size: 16px;
		font-weight: 700;
		color: #8B5A2B;
	}

	.item-original {
		font-size: 12px;
		color: #A7B89E;
		text-decoration: line-through;
	}

	/* 数量操作区 */
	.item-quantity {
		align-self: flex-end;
		margin-bottom: 8px;
	}

	.quantity-control {
		display: flex;
		align-items: center;
		gap: 8px;
		background: rgba(139, 90, 43, 0.05);
		border-radius: 30px;
		padding: 4px;
		border: 0.5px solid rgba(139, 90, 43, 0.1);
	}

	.qty-btn {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: 0.5px solid rgba(139, 90, 43, 0.2);
		background: #FDFAF5;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
	}

	.qty-btn:active {
		transform: scale(0.9);
		background: #2C5E30;
	}

	.qty-btn:active van-icon {
		color: #F5F0E8 !important;
	}

	.qty-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.qty-number {
		font-size: 14px;
		font-weight: 600;
		color: #2C2C2C;
		min-width: 20px;
		text-align: center;
	}

	.edit-control {
		display: flex;
		align-items: center;
	}

	.delete-btn {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		border: 0.5px solid rgba(205, 92, 92, 0.2);
		background: rgba(205, 92, 92, 0.05);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
	}

	.delete-btn:active {
		transform: scale(0.9);
		background: rgba(205, 92, 92, 0.1);
	}

	/* ========== 为您推荐 ========== */
	.recommend-section {
		margin-top: 24px;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: 16px;
	}

	.section-title {
		font-size: 18px;
		font-weight: 700;
		color: #2C2C2C;
		position: relative;
		padding-left: 12px;
	}

	.section-title::before {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 4px;
		height: 18px;
		background: #2C5E30;
		border-radius: 2px;
	}

	.more-link {
		font-size: 13px;
		color: #8E8E8E;
		cursor: pointer;
	}

	.recommend-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}

	.recommend-card {
		background: #FDFAF5;
		border-radius: 16px;
		overflow: hidden;
		border: 0.5px solid rgba(139, 90, 43, 0.1);
		box-shadow: 0 4px 12px rgba(44, 94, 48, 0.04);
		cursor: pointer;
		transition: all 0.2s;
	}

	.recommend-card:active {
		transform: scale(0.97);
	}

	.recommend-image {
		aspect-ratio: 1;
		background: linear-gradient(145deg, #EAEFE0, #DDE2D5);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.recommend-emoji {
		font-size: 32px;
	}

	.recommend-info {
		padding: 12px;
	}

	.recommend-name {
		font-size: 14px;
		font-weight: 600;
		color: #2C2C2C;
		margin: 0 0 6px;
	}

	.recommend-price {
		font-size: 16px;
		font-weight: 700;
		color: #8B5A2B;
		display: block;
		margin-bottom: 10px;
	}

	.add-cart-btn {
		width: 100%;
		padding: 8px 0;
		background: #2C5E30;
		border: none;
		border-radius: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		color: #F5F0E8;
		font-size: 12px;
		font-family: '思源宋体', serif;
		cursor: pointer;
		transition: all 0.2s;
	}

	.add-cart-btn:active {
		transform: scale(0.95);
		background: #1E4322;
	}

	/* ========== 底部结算栏 ========== */
	.cart-footer {
		position: fixed;
		bottom: 60px;
		width: 90%;
		max-width: 400px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 7px 8px;
		background: rgba(253, 250, 245, 0.95);
		backdrop-filter: blur(10px);
		border-top: 0.5px solid rgba(139, 90, 43, 0.15);
		box-shadow: 0 -4px 12px rgba(44, 94, 48, 0.04);
		z-index: 15;
	}

	.footer-left {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.all-check {
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
	}

	.all-check-text {
		font-size: 14px;
		color: #2C2C2C;
		margin-top: 2px;
	}

	.total-info {
		display: flex;
		align-items: baseline;
		gap: 4px;
		margin-left: 43px;
		margin-bottom: 3px;
	}

	.total-label {
		font-size: 14px;
		color: #5A5A5A;
	}

	.total-price {
		font-size: 18px;
		font-weight: 700;
		color: #8B5A2B;
	}

	.settle-btn {
		/* padding: 12px 28px; */
		margin: 0;
		background: #E0D9D0;
		border: none;
		border-radius: 30px;
		display: flex;
		align-items: center;
		gap: 8px;
		color: #8E8E8E;
		font-size: 16px;
		font-weight: 600;
		font-family: '思源宋体', serif;
		cursor: not-allowed;
		transition: all 0.3s;
		border: 0.5px solid rgba(139, 90, 43, 0.2);
	}

	.settle-btn.active {
		background: #CD5C5C;
		color: #F5F0E8;
		cursor: pointer;
		box-shadow: 0 8px 16px -4px rgba(205, 92, 92, 0.3);
	}

	.btn-count {
		padding: 2px 8px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 20px;
		font-size: 12px;
	}

	/* ========== 底部导航栏（放大效果）========== */
	.tea-tabbar {
		position: fixed;
		bottom: 0;
		width: 100%;
		display: flex;
		justify-content: space-around;
		align-items: center;
		padding: 8px 0 12px;
		background: rgba(253, 250, 245, 0.92);
		backdrop-filter: blur(10px);
		border-top: 0.5px solid rgba(139, 90, 43, 0.15);
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
	}
	/* .tea-tabbar {
		position: fixed;
		bottom: 0;
		width: 100%;
		display: flex;
		justify-content: space-around;
		align-items: center;
		padding: 8px 0 12px;
		background: rgba(253, 250, 245, 0.92);
		backdrop-filter: blur(10px);
		border-top: 0.5px solid rgba(139, 90, 43, 0.15);
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
	} */

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

	/* ========== 装饰元素 ========== */
	.teapot-decoration {
		position: fixed;
		bottom: 70px;
		right: 8px;
		width: 40px;
		height: 40px;
		background: radial-gradient(circle at 30% 40%, rgba(139, 90, 43, 0.06), transparent 70%);
		border-radius: 40% 40% 30% 30%;
		border: 1px dashed rgba(139, 90, 43, 0.15);
		transform: rotate(-10deg);
		pointer-events: none;
		z-index: 5;
	}

	.bottom-space {
		height: 30px;
	}

	/* 滚动条隐藏 */
	::-webkit-scrollbar {
		display: none;
	}

	/* 移动端点击高亮去除 */
	/* * {
    -webkit-tap-highlight-color: transparent;
  } */
</style>