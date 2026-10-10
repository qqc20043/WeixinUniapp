<template>
	<div class="tea-app category-page">
		<div class="paper-texture"></div>

		<!-- 顶部导航 - 整合搜索栏 -->
		<header class="tea-header">
			<div class="header-left">
				<h2 class="brand-name">漫思茶</h2>
			</div>

			<!-- 搜索栏区域 -->
			<div class="search-section">
				<div class="search-container" :class="{ 'active': isSearchFocused || searchKeyword }"
					@click="focusSearch">
					<van-icon name="search" size="16" color="#8B5A2B" class="search-icon" @click="HandleSearchProduct" />
					<input ref="searchInput" type="search" class="search-input" :placeholder="searchPlaceholder"
						v-model="searchKeyword" @focus="handleSearchFocus" @blur="handleSearchBlur"
						@input="onSearchInput" @keyup.enter="onSearchSubmit" enterkeyhint="search" inputmode="search" />
					<span v-if="searchKeyword" class="search-clear" @click.stop="clearSearch">
						<van-icon name="close" size="14" color="#8E8E8E" />
					</span>
				</div>
			</div>

			<div class="header-right">
				<span v-if="!isSearchFocused" class="cancel-btn" @click="goToMessage">
					<van-icon name="bell" size="20" color="#8B5A2B" />
				</span>
				<span v-else class="cancel-btn" @click="cancelSearch">取消</span>
			</div>
		</header>

		<!-- 搜索历史/推荐 (仅在搜索聚焦时显示) -->
		<div v-if="isSearchFocused" class="search-overlay">
			<div class="search-history">
				<div class="history-header">
					<span class="history-title">历史搜索</span>
					<span class="history-clear" @click="clearHistory">
						<van-icon name="delete-o" size="14" color="#8E8E8E" />
					</span>
				</div>
				<div class="history-tags">
					<span v-for="(item, index) in searchHistory" :key="index" class="history-tag"
						@click="selectHistory(item)">
						{{ item }}
					</span>
					<span v-if="!searchHistory.length" class="empty-history">暂无搜索历史</span>
				</div>
			</div>

			<div class="hot-search">
				<div class="hot-title">热门搜索</div>
				<div class="hot-tags">
					<span v-for="(item, index) in hotSearches" :key="index" class="hot-tag"
						:class="'hot-' + (index + 1)" @click="selectHot(item)">
						{{ item }}
					</span>
				</div>
			</div>
		</div>

		<main class="main-content" :class="{ 'searching': isSearchFocused }">
			<!-- 分类侧边栏 + 内容区 -->
			<div class="category-layout">
				<!-- 左侧主分类 -->
				<div class="category-sidebar">
					<div v-for="cat in mainCategories" :key="cat.id" class="sidebar-item"
						:class="{ 'active': currentMainCat === cat.id }" @click="handleMainCatClick(cat.id)">
						<span class="cat-name">{{ cat.name }}</span>
						<span class="cat-count">{{ cat.count }}</span>
					</div>
				</div>

				<!-- 右侧子分类+商品 -->
				<div class="category-content">
					<!-- 子分类标签 -->
					<div class="subcategory-tags">
						<div v-for="sub in subCategories" :key="sub.id" class="tag-item"
							:class="{ 'active': currentSubCat === sub.id }" @click="handleSubCatClick(sub.id)">
							{{ sub.name }}
						</div>
					</div>
					<!-- 分类商品展示 -->
					<div class="category-products">
						<div class="product-header">
							<span class="header-title">推荐茶品</span>
							<span class="header-desc">精选{{ currentMainCatName }}系列</span>
						</div>

						<van-grid :column-num="2" :gutter="12">
							<van-grid-item use-slot v-for="item in filteredProducts" :key="item.id">
								<div class="product-card" @click="handleProductClick(item)">
									<div class="product-image">
										<span class="product-emoji">{{ item.emoji }}</span>
									</div>
									<div class="product-info">
										<h4 class="product-name">{{ item.name }}</h4>
										<span class="product-origin">{{ item.originDetail }}</span>
										<div class="product-footer">
											<span class="product-price">¥{{ item.price }}</span>
											<span class="product-sales">销量 {{ item.sales }}+</span>
										</div>
									</div>
								</div>
							</van-grid-item>
						</van-grid>
					</div>
				</div>
			</div>

			<div class="bottom-space"></div>
		</main>

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

		<!-- 轻提示 -->
		<div class="toast" :class="{ visible: toastVisible, error: toastError }">
			<div class="toast-dot" />
			<span>{{ toastMessage }}</span>
		</div>
	</div>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted,
		nextTick,
		getCurrentInstance
	} from 'vue';
	import {
		categoryLists,
		theme,
		productThemeLists,
		shopSpecList
	} from "@/api/index.js"
	import {
		onLoad
	} from '@dcloudio/uni-app'
	import {
		countStore
	} from "../store/count.js"
	
	const userCountStore = countStore()
	const toastVisible = ref(false)
	const toastError = ref(false)
	const toastMessage = ref('登录成功，正在为你沏好一杯茶…')
	const toastTimer = ref(null)
	const currentTabbar = ref(1); // 分类页选中
	const currentMainCat = ref(1);
	const currentSubCat = ref(-1);
	const searchInput = ref(null)
	const searchKeyword = ref('')
	const isSearchFocused = ref(false)
	const searchHistory = ref([])
	const hotSearches = ref(['明前龙井', '狗牯脑茶', '井冈翠绿', '大红袍', '白毫银针', '祁门红茶'])

	// 搜索占位符
	const searchPlaceholder = ref('搜索茶叶、茶具、茶文化...')

	// 加载搜索历史
	onMounted(() => {
		loadSearchHistory()
		// 获取当前组件实例
		const instance = getCurrentInstance()
		// 获取事件通道
		const eventChannel = instance.proxy.getOpenerEventChannel()
		if (eventChannel && typeof eventChannel.emit === 'function') {
			const acceptHomePageAndCateHandler = function(data) {
				// 这里可以处理接收到的数据
				if (data != null) currentMainCat.value = data.data
			}
			eventChannel.on('acceptHomePageAndCate', acceptHomePageAndCateHandler)
		}
	})

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
	const mainCategories = ref([{}]);

	const subCategories = ref([]);

	const products = ref([]);
	const products_two = ref([]);

	// onLoad 接收页面参数
	onLoad((option) => {
		getProductsList()
		currentMainCat.value = 1 // 展示第一主题数据
	})
	
	const HandleSearchProduct = () => {
		onSearchSubmit()
	}

	const getProductsList = async () => {
		try {
			// 获取茶叶类别
			await categoryLists().then(res => {
				subCategories.value = res.dataList.categoryList.reduce((acc, item) => {
					const data = {
						id: item.id,
						name: item.name
					}
					acc.push(data); // 提取属性并添加到累加器
					return acc;
				}, []); // 初始值为空数组
			})
			// 获取茶叶主题
			await theme().then(res => {
				mainCategories.value = res.dataList.themeList.reduce((acc, item) => {
					const data = {
						id: item.id,
						name: item.name,
						count: item.productCount
					}
					acc.push(data); // 提取属性并添加到累加器
					return acc;
				}, []); // 初始值为空数组
			})
			// 获取全部茶叶
			await productThemeLists().then(res => {
				products.value = res.dataList.ProductThemeList;
			})
			// 获取product表中的茶叶给茶友圈使用
			await shopSpecList().then(res => {
				userCountStore.clearProdect();
				res.ShopSpecList.forEach(ele => {
					const da = {
						id: ele.id,
						name: ele.name
					}
					userCountStore.pushProduct(da)
				})
			})
			
		} catch (error) {
			showToast("获取茶叶数据失败!")
		}
	}

	const currentMainCatName = computed(() => mainCategories.value[currentMainCat.value - 1].name);
	const filteredProducts = computed({
		get() {
			const tempList = products.value.filter(p => p.themeId === currentMainCat.value);
			if (currentSubCat.value != -1) return tempList.filter(p => p.categoryId === currentSubCat.value);
			return tempList;
		}

	});

	const handleMainCatClick = (index) => {
		currentMainCat.value = index;
		currentSubCat.value = -1;
		mainCategories.value[index-1].count = filteredProducts.value.length
	};

	const handleSubCatClick = async (index) => {
		currentSubCat.value = index;
		mainCategories.value[currentMainCat.value-1].count = filteredProducts.value.length
	};

	const handleProductClick = (id) => {
		// 跳转详情
		uni.navigateTo({
			url: '/pages/productxq',
			events: {
				// 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
				acceptCateAndProductxq: function(data) {
					console.log("acceptCateAndProductxq", data)
				}
			},
			success: function(res) {
				// 通过eventChannel向被打开页面传送数据
				res.eventChannel.emit('acceptCateAndProductxq', {
					data: id
				})
			}
		});
	};

	const handleTabbarClick = (index) => {
		currentTabbar.value = index;
		if (index === 0) {
			uni.redirectTo({
				url: '/pages/homepage'
			});
		} else if (index === 2) {
			uni.redirectTo({
				url: '/pages/youhuiq'
			});
		} else if (index === 3) {
			uni.redirectTo({
				url: '/pages/gowuc'
			});
		} else if (index === 4) {
			uni.redirectTo({
				url: '/pages/my'
			});
		}
	};

	// 加载历史记录
	const loadSearchHistory = () => {
		const saved = uni.getStorageSync('searchHistory')
		if (saved) {
			searchHistory.value = JSON.parse(saved)
		}
	}

	// 保存历史记录
	const saveSearchHistory = () => {
		uni.setStorageSync('searchHistory', JSON.stringify(searchHistory.value))
	}

	// 聚焦搜索
	const focusSearch = async () => {
		if (searchInput.value) {
			searchInput.value.focus()
		}
	}

	/**
	 * 处理搜索框获得焦点 - 弹出虚拟键盘
	 * 这个函数会在用户点击搜索框时被调用
	 */
	const handleSearchFocus = async () => {
		// 设置聚焦状态
		isSearchFocused.value = true

		// 确保DOM更新完成
		await nextTick()

		// 再次确保输入框获得焦点（双重保障）
		if (searchInput.value) {
			searchInput.value.focus()

			// 移动端优化：确保输入框可见，不会被其他元素遮挡
			setTimeout(() => {
				searchInput.value.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
					inline: 'nearest'
				})
			}, 100)
		}

		console.log('搜索框已获得焦点，虚拟键盘已弹出')
	}

	/**
	 * 处理搜索框失去焦点
	 */
	const handleSearchBlur = () => {
		// 延迟关闭，以便处理点击历史标签等事件
		setTimeout(() => {
			if (!searchKeyword.value) {
				isSearchFocused.value = false
			}
		}, 200)
	}

	/**
	 * 输入事件
	 */
	const onSearchInput = () => {
		// 实时搜索逻辑可以在这里实现
		console.log('搜索输入:', searchKeyword.value)
	}

	/**
	 * 提交搜索
	 */
	const onSearchSubmit = () => {
		if (!searchKeyword.value.trim()) {
			showToast('请输入搜索关键词')
			return
		}

		// 添加到历史记录
		addToHistory(searchKeyword.value)

		// 执行搜索
		performSearch(searchKeyword.value)

		// 收起键盘
		if (searchInput.value) {
			searchInput.value.blur()
		}

		// 关闭搜索面板
		isSearchFocused.value = false
	}

	/**
	 * 取消搜索
	 */
	const cancelSearch = () => {
		searchKeyword.value = ''
		isSearchFocused.value = false
		if (searchInput.value) {
			searchInput.value.blur()
		}
	}

	/**
	 * 清空搜索
	 */
	const clearSearch = () => {
		searchKeyword.value = ''
		if (searchInput.value) {
			searchInput.value.focus()
		}
	}

	/**
	 * 添加到历史
	 */
	const addToHistory = (keyword) => {
		const trimmed = keyword.trim()
		if (!trimmed) return

		// 去重
		const index = searchHistory.value.indexOf(trimmed)
		if (index > -1) {
			searchHistory.value.splice(index, 1)
		}

		// 添加到开头，限制数量
		searchHistory.value.unshift(trimmed)
		if (searchHistory.value.length > 10) {
			searchHistory.value.pop()
		}

		saveSearchHistory()
	}

	/**
	 * 清除历史
	 */
	const clearHistory = () => {
		searchHistory.value = []
		uni.removeStorageSync('searchHistory')
		showToast('历史记录已清除')
	}

	/**
	 * 选择历史记录
	 */
	const selectHistory = (keyword) => {
		searchKeyword.value = keyword
		onSearchSubmit()
	}

	/**
	 * 选择热门搜索
	 */
	const selectHot = (keyword) => {
		searchKeyword.value = keyword
		onSearchSubmit()
	}

	/**
	 * 执行搜索
	 */
	const performSearch = (keyword) => {
		for (const res of products.value) {
		    if(res.name == searchKeyword.value) {
		        handleProductClick(res);
		        break; 
		    }
		}
		showToast(`搜索: ${keyword}`)
		// 这里实现实际的搜索逻辑，比如过滤商品列表
	}

	/**
	 * 跳转到消息中心
	 */
	const goToMessage = () => {
		console.log('跳转到消息中心')
		showToast('消息中心')
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

	/* ========== 顶部导航 ========== */
	.brand-name {
		margin: 0;
		margin-left: 2px;
		font-size: 15px;
		font-weight: 700;
		color: #2C5E30;
		letter-spacing: 4px;
	}

	.main-content {
		transition: opacity 0.2s;
		padding-bottom: 60px;
	}

	.main-content.searching {
		opacity: 0.3;
		pointer-events: none;
	}

	:deep(.van-grid-item__content) {
		padding: 0;
		background-color: #ffffff00;
	}

	/* 顶部导航优化 */
	.tea-header {
		display: flex;
		align-items: center;
		padding: 8px 12px;
		background: rgba(253, 250, 245, 0.95);
		backdrop-filter: blur(10px);
		border-bottom: 0.5px solid rgba(139, 90, 43, 0.15);
		z-index: 100;
		position: sticky;
		top: 0;
	}

	.header-right {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.search-section {
		flex: 1;
		margin: 0 12px;
	}

	.search-container {
		display: flex;
		align-items: center;
		background: #F5F0E8;
		border-radius: 20px;
		padding: 8px 12px;
		border: 1px solid rgba(139, 90, 43, 0.15);
		transition: all 0.2s ease;
	}

	.search-container.active {
		border-color: #2C5E30;
		box-shadow: 0 0 0 2px rgba(44, 94, 48, 0.1);
		background: #FFFFFF;
	}

	.search-icon {
		margin-right: 8px;
		flex-shrink: 0;
	}

	.search-input {
		flex: 1;
		border: none;
		outline: none;
		background: transparent;
		font-size: 14px;
		color: #2C2C2C;
		font-family: '思源宋体', serif;
		-webkit-appearance: none;
		appearance: none;
		min-width: 0;
		/* 防止flex溢出 */
	}

	/* 移除搜索输入框默认样式 */
	.search-input::-webkit-search-decoration,
	.search-input::-webkit-search-cancel-button,
	.search-input::-webkit-search-results-button,
	.search-input::-webkit-search-results-decoration {
		display: none;
	}

	.search-clear {
		cursor: pointer;
		padding: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.cancel-btn {
		color: #2C5E30;
		font-size: 14px;
		cursor: pointer;
		white-space: nowrap;
	}

	/* 搜索覆盖层 */
	.search-overlay {
		position: absolute;
		top: 64px;
		left: 0;
		right: 0;
		background: #FDFAF5;
		border-bottom-left-radius: 16px;
		border-bottom-right-radius: 16px;
		padding: 16px;
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
		z-index: 90;
		animation: slideDown 0.2s ease;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.search-history,
	.hot-search {
		margin-bottom: 20px;
	}

	.history-header,
	.hot-title {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
		font-size: 14px;
		color: #2C2C2C;
		font-weight: 500;
	}

	.history-clear {
		cursor: pointer;
		padding: 4px;
	}

	.history-tags,
	.hot-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.history-tag {
		padding: 6px 12px;
		background: rgba(44, 94, 48, 0.05);
		border-radius: 20px;
		font-size: 12px;
		color: #5A5A5A;
		cursor: pointer;
		transition: all 0.2s;
		border: 0.5px solid rgba(139, 90, 43, 0.1);
	}

	.history-tag:active {
		background: rgba(44, 94, 48, 0.1);
		transform: scale(0.95);
	}

	.hot-tag {
		padding: 6px 16px;
		border-radius: 20px;
		font-size: 12px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.hot-tag.hot-1 {
		background: rgba(218, 165, 32, 0.1);
		color: #DAA520;
	}

	.hot-tag.hot-2 {
		background: rgba(44, 94, 48, 0.1);
		color: #2C5E30;
	}

	.hot-tag.hot-3 {
		background: rgba(205, 92, 92, 0.1);
		color: #CD5C5C;
	}

	.hot-tag:not([class*="hot-"]) {
		background: rgba(139, 90, 43, 0.05);
		color: #8B5A2B;
	}

	.empty-history {
		color: #8E8E8E;
		font-size: 12px;
		padding: 8px 0;
	}

	/* 复用首页基础样式，添加分类特有样式 */
	.category-layout {
		display: flex;
		min-height: calc(100vh - 180px);
	}

	.category-sidebar {
		width: 100px;
		background: rgba(253, 250, 245, 0.6);
		border-right: 0.5px solid rgba(139, 90, 43, 0.1);
		padding: 12px 0;
	}

	.sidebar-item {
		padding: 16px 12px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		cursor: pointer;
		transition: all 0.2s;
		border-left: 3px solid transparent;
	}

	.sidebar-item.active {
		background: rgba(44, 94, 48, 0.08);
		border-left-color: #2C5E30;
	}

	.sidebar-item.active .cat-name {
		color: #2C5E30;
		font-weight: 600;
	}

	.cat-name {
		font-size: 20px;
		color: #5A5A5A;
	}

	.cat-count {
		font-size: 11px;
		color: #8E8E8E;
		background: rgba(139, 90, 43, 0.08);
		padding: 2px 6px;
		border-radius: 20px;
	}

	.category-content {
		flex: 1;
		padding: 0 16px;
	}

	.subcategory-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		padding: 16px 0;
		border-bottom: 1px solid rgba(139, 90, 43, 0.08);
	}

	.tag-item {
		padding: 6px 16px;
		background: #FDFAF5;
		border-radius: 30px;
		font-size: 13px;
		color: #5A5A5A;
		border: 0.5px solid rgba(139, 90, 43, 0.1);
		cursor: pointer;
		transition: all 0.2s;
	}

	.tag-item.active {
		background: #2C5E30;
		color: #F5F0E8;
	}

	.product-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin: 20px 0 16px;
	}

	.header-title {
		font-size: 18px;
		font-weight: 700;
		color: #2C2C2C;
	}

	.header-desc {
		font-size: 12px;
		color: #8B5A2B;
	}

	.product-card {
		background: #FDFAF5;
		border-radius: 16px;
		overflow: hidden;
		border: 0.5px solid rgba(139, 90, 43, 0.08);
		transition: all 0.2s;
	}

	.product-card:active {
		transform: scale(0.97);
	}

	.product-image {
		aspect-ratio: 1;
		background: linear-gradient(145deg, #EAEFE0, #DDE2D5);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.product-emoji {
		font-size: 32px;
	}

	.product-info {
		padding: 12px;
	}

	.product-name {
		font-size: 15px;
		font-weight: 600;
		color: #2C2C2C;
		margin-bottom: 4px;
	}

	.product-origin {
		font-size: 11px;
		color: #8E8E8E;
		display: block;
		margin-bottom: 8px;
	}

	.product-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.product-price {
		font-size: 16px;
		font-weight: 700;
		color: #8B5A2B;
	}

	.product-sales {
		font-size: 10px;
		color: #A7B89E;
	}

	/* ========== 全局样式 ========== */
	.tea-app {
		position: relative;
		width: 100%;
		min-height: 100vh;
		max-width: 400px;
		margin: 0 auto;
		background: linear-gradient(145deg, #F5F0E8 0%, #F0E9E0 100%);
		font-family: '思源宋体', 'Songti SC', serif;
		overflow-x: hidden;
	}

	.paper-texture {
		position: fixed;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 375px;
		height: 100%;
		background-image: repeating-linear-gradient(45deg, rgba(139, 90, 43, 0.02) 0px, rgba(139, 90, 43, 0.02) 2px, transparent 2px, transparent 8px);
		pointer-events: none;
		z-index: 0;
	}

	/* ========== 底部导航栏（带放大效果）========== */
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

	.tab-item.active {
		transform: translateY(-2px);
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
		transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.tab-item.active .tab-label {
		transform: scale(1.05);
		color: #2C5E30;
		font-weight: 600;
	}

	/* 移动端优化 */
	/* * {
    -webkit-tap-highlight-color: transparent;
  } */

	::-webkit-scrollbar {
		display: none;
	}



	/* #ifdef H5 */
	/* ========== H5 适配：PC 端统一 360px 居中（仅网页端，小程序零影响） ==========
	   为什么是 360px：与登录页 .phone-frame 的 min(360px, 92vw) 保持一致，
	   整个站点在电脑上呈现为「一部手机居中」的形态，而不是铺满宽屏。
	   手机端（<=768px）不加任何覆盖，完全沿用原设计。
	*/
	@media screen and (min-width: 769px) {
		.tea-app { max-width: 360px; box-shadow: 0 0 40px rgba(44, 94, 48, 0.06); }
		.paper-texture { width: 360px; }
	}
	/* 固定定位元素（底部导航/输入栏/浮动按钮等）原本贴视口边缘，
	   宽屏下会跑到内容区外（实测 1920px 时「问茶」按钮贴到屏幕最右侧）。
	   用 right 定位的元素不能用 margin:auto（fixed 下 right 优先），
	   必须改成「视口宽 - 内容区宽)/2 + 原偏移」。 */
	@media screen and (min-width: 769px) {
	@media screen and (min-width: 769px) {
		.tea-tabbar { max-width: 360px; margin: 0 auto; }
	}
	}
	/* #endif */
</style>