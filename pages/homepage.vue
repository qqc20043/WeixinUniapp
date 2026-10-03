<template>
	<div class="tea-app home-page">
		<!-- 宣纸底纹背景 -->
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
					<van-icon name="search" size="16" color="#8B5A2B" class="search-icon" @click="HandleSearchProduct"/>
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
						@click="selectHistory(item, index+1)">
						{{ item }}
					</span>
					<span v-if="!searchHistory.length" class="empty-history">暂无搜索历史</span>
				</div>
			</div>

			<div class="hot-search">
				<div class="hot-title">热门搜索</div>
				<div class="hot-tags">
					<span v-for="(item, index) in hotSearches" :key="index" class="hot-tag"
						:class="'hot-' + (index + 1)" @click="selectHot(item, index+1)">
						{{ item }}
					</span>
				</div>
			</div>
		</div>


		<!-- 主内容区 -->
		<main class="tea-content main-content" :class="{ 'searching': isSearchFocused }">
			<!-- 翘盼品牌区 -->
			<section class="brand-section">
				<div class="brand-seal">
					<span class="seal-text">翘盼</span>
					<span class="seal-sub">春茶·敬候</span>
				</div>
				<div class="brand-inscription">
					<span class="inscription-char">君</span>
					<span class="inscription-char">往</span>
				</div>
			</section>

			<!-- 茶叶分类区 -->
			<section class="category-section">
				<div v-for="(item, index) in teaCategories" :key="index" class="category-item"
					:class="{ 'active': currentCategory === index }" @click="handleCategoryClick(index)">
					<span class="category-name">{{ item }}</span>
				</div>
			</section>
			<!-- 优惠资讯区 -->
			<section class="promo-section">
				<div class="section-header">
					<h2 class="section-title">优惠资讯</h2>
					<!-- <span class="more-link">更多</span> -->
				</div>
				<div class="promo-grid">
					<div class="promo-card tea-product">
						<div class="card-content">
							<span class="card-main">茶产品哦！</span>
							<span class="card-desc">明前特级·限时8折</span>
						</div>
						<span class="card-tag hot">热卖</span>
					</div>
					<div class="promo-card tea-culture">
						<div class="card-content">
							<span class="card-main">茶文化</span>
							<span class="card-desc">宋代点茶·雅集</span>
						</div>
						<span class="card-tag culture">文化</span>
					</div>
					<div class="promo-card tea-gift">
						<div class="card-content">
							<span class="card-main">好礼</span>
							<span class="card-desc">春日茶礼·满赠</span>
						</div>
						<span class="card-tag gift">礼遇</span>
					</div>
				</div>
			</section>
			
			<!-- 直播预热区 -->
			<section class="live-section">
				<div class="live-header">
					<div class="live-title">
						<van-icon name="live" size="20" color="#CD5C5C" />
						<span class="live-text">直播预热</span>
					</div>
					<div class="live-date">
						<span>4.23-5.1</span>
						<span class="live-time">每晚19:00-21:00</span>
					</div>
				</div>
				<div class="live-host-area">
					<div class="host-info">
						<span class="host-name">相送</span>
					</div>
					<div class="host-status">
						<span class="status-dot"></span>
						<span class="status-label">已连接</span>
					</div>
				</div>
			</section>
			<scroll-view show-scrollbar="true" class="scroll-area" scroll-y="true" :scroll-into-view="targetId" @scroll="handleScroll">
				<!-- 商品列表 -->
				<section class="product-section">
					<div class="section-header">
						<h2 class="section-title">商品列表</h2>
						<!-- <span class="more-link">查看更多</span> -->
					</div>
					<van-grid column-num="2" gutter="12">
						<van-grid-item use-slot v-for="(item, index) in teaProducts" :key="item.id" :id="'section-' + item.id">
							<div class="tea-card" @click="handleProductClick(item.id)"
								@longpress="handleCollect(item.id)">
								<div class="tea-image">
									<image class="image-placeholder" :src="'/static/' + index + '.jpg'" mode="scaleToFill">
										<span class="tea-emoji">{{ item.emoji }}</span>
									</image>
									<span class="emoji-seal">{{ item.emoji }}</span>
									<span class="origin-seal">{{ item.origin }}</span>
								</div>
								<div class="tea-info">
									<h3 class="tea-name">{{ item.name }}</h3>
									<span class="tea-origin">{{ item.originDetail }}</span>
									<div class="tea-price-row">
										<span class="tea-price">¥{{ item.price }}</span>
										<span class="tea-rating">⭐{{ item.rating }}</span>
									</div>
								</div>
							</div>
						</van-grid-item>
					</van-grid>
				</section>
			</scroll-view>
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
		getCurrentInstance,
		nextTick,
		onMounted
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app'
	import {
		theme,
		productThemeLists
	} from "../api/index.js"

	const toastVisible = ref(false)
	const toastError = ref(false)
	const toastMessage = ref('登录成功，正在为你沏好一杯茶…')
	const toastTimer = ref(null)
	const searchInput = ref(null)
	const searchKeyword = ref('')
	const searchId = ref('')
	const isSearchFocused = ref(false)
	const searchHistory = ref([])
	const hotSearches = ref([])
	const targetId = ref('') // 目标元素ID
	const products = ref([])

	// 搜索占位符
	const searchPlaceholder = ref('搜索茶叶、茶具、茶文化...')

	// 状态定义
	const currentCategory = ref(0);
	const currentTabbar = ref(0); // 首页选中

	// 标签页数据
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

	// 茶叶分类数据
	const teaCategories = ref([]);

	// 商品数据
	const teaProducts = ref([]);

	// onLoad 接收页面参数
	onLoad((option) => {
		getThemeList()
		selectProducts()
		// 获取当前组件实例
		const instance = getCurrentInstance()
		// 获取事件通道
		const eventChannel = instance.proxy.getOpenerEventChannel()
		if (eventChannel && typeof eventChannel.emit === 'function') {
			// 向父页面发送数据
			eventChannel.emit('acceptLoginAndHomePage', {
				data: '首页面传来的数据'
			})
			// 监听父页面传来的数据
			// 注意：这里的事件监听器会一直存在，需要在 onUnload 中移除
			const acceptLoginAndHomePage = function(data) {
				console.log('接收到父页面数据：', data)
				// 这里可以处理接收到的数据
				showToast(`登录成功！账号：${data.data}`, false)
			}
			eventChannel.on('acceptLoginAndHomePage', acceptLoginAndHomePage)	
		}
	})
	
	// 获取全部茶叶
	const selectProducts = async() => {
		await productThemeLists().then(res => {
			products.value = res.dataList.ProductThemeList;
		})
	}
	
	// 搜索详细商品
	const HandleSearchProduct = () => {
		if (!searchKeyword.value.trim()) {
			showToast('请输入搜索关键词')
			return
		}
		
		// 添加到历史记录
		addToHistory(searchKeyword.value)
		
		// 执行搜索
		for (const res of products.value) {
		    if(res.name == searchKeyword.value) {
		        handleProductXQClick(res);
		        break; 
		    }
		}
		
		// 收起键盘
		if (searchInput.value) {
			searchInput.value.blur()
		}
		
		// 关闭搜索面板
		isSearchFocused.value = false
	}
	
	// 获取茶叶主题分类数据
	const getThemeList = async() => {
		await theme().then(res => {
			teaCategories.value = res.dataList.themeList.map(item => item.name || "空值")
			hotSearches.value = res.dataList.themeList.map(item => item.name || "空值")
			// 用 reduce 提取 name 属性
			teaProducts.value = res.dataList.themeList.reduce((acc, item) => {
			  const originT = item.name.slice(0, 2)
			  const data = {
				  id: item.id,
				  name: item.name,
				  origin: originT,
				  originDetail: item.subtitle,
				  price: item.minPrice,
				  rating: item.rating,
				  emoji: item.coverEmoji,
				  image: item.coverImage
			  }
			  acc.push(data); // 提取属性并添加到累加器
			  return acc;
			}, []); // 初始值为空数组
		})
	}

	// 监听滚动事件(可用于联动高亮导航)
	const handleScroll = (event) => {
		// console.log('滚动位置：', event.detail.scrollTop)
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

	// 交互事件
	const handleCategoryClick = (index) => {
		currentCategory.value = index;
		targetId.value = 'section-' + index
		console.log(targetId.value)
	};
	
	const handleProductXQClick = (id) => {
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
	}

	const handleProductClick = (id) => {
		// 跳转商品详情
		uni.navigateTo({
			url: '/pages/cate',
			events: {
				// 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
				acceptHomePageAndCate: function(data) {
					console.log("acceptHomePageAndCate", data)
				}
			},
			success: function(res) {
				// 通过eventChannel向被打开页面传送数据
				res.eventChannel.emit('acceptHomePageAndCate', {
					data: id
				})
			}
		});
		searchId.value = ''
	};

	const handleCollect = (id) => {
		// 长按收藏
	};

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


	// 加载搜索历史
	onMounted(() => {
		loadSearchHistory()
	})

	// 加载历史记录
	const loadSearchHistory = () => {
		const saved = uni.getStorageSync('searchHistory')
		if (saved) {
			searchHistory.value = JSON.parse(saved)
		}
	}

	// 保存历史记录
	const saveSearchHistory = () => {
		// localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
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
		let flag = 1;
		for(let i = 0; i < hotSearches.value.length; i ++) {
			if(searchKeyword.value == hotSearches.value[i]) {
				performSearch(i+1)
				flag = 0
				break;
			}
		}
		if(flag == 1) {
			for (const res of products.value) {
			    if(res.name == searchKeyword.value) {
			        handleProductXQClick(res);
			        break; 
			    }
			}
		}
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
		// localStorage.removeItem('searchHistory')
		uni.removeStorageSync('searchHistory')
		showToast('历史记录已清除')
	}

	/**
	 * 选择历史记录
	 */
	const selectHistory = (keyword, idr) => {
		searchKeyword.value = keyword
		searchId.value = idr
		onSearchSubmit()
	}

	/**
	 * 选择热门搜索
	 */
	const selectHot = (keyword, idr) => {
		searchKeyword.value = keyword
		searchId.value = idr
		onSearchSubmit()
	}

	/**
	 * 执行搜索
	 */
	const performSearch = (keyword) => {
		showToast(`搜索: ${searchKeyword.value}`)
		handleProductClick(keyword)
		// 这里实现实际的搜索逻辑，比如过滤商品列表
	}

	/**
	 * 跳转到消息中心
	 */
	const goToMessage = () => {
		console.log('跳转到消息中心')
		showToast('消息中心')
	}
</script>

<style scoped>
	
	:deep(.van-grid-item__content) {
		padding: 0;
		background-color: #ffffff00;
	}
	
	.image-placeholder {
		width: 100%;
		height: 100%;
		/* object-fit: contain; */
	}
	
	.scroll-area {
		height: 600px;
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
		width: 400px;
		height: 100%;
		background-image: repeating-linear-gradient(45deg, rgba(139, 90, 43, 0.02) 0px, rgba(139, 90, 43, 0.02) 2px, transparent 2px, transparent 8px);
		pointer-events: none;
		z-index: 0;
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

	.search-wrapper {
		display: flex;
		align-items: center;
		flex: 0 1 180px;
		height: 36px;
		padding: 0 10px;
		background: #FDFAF5;
		border-radius: 30px;
		border: 0.5px solid rgba(139, 90, 43, 0.2);
	}

	.search-placeholder {
		margin-left: 6px;
		font-size: 14px;
		color: #8E8E8E;
	}

	.recruit-badge {
		padding: 6px 14px;
		background: #2C5E30;
		border-radius: 30px;
		font-size: 12px;
		color: #F5F0E8;
		margin-left: 2px;
	}

	/* ========== 翘盼品牌区 ========== */
	.brand-section {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px 16px 12px;
	}

	.brand-seal {
		display: flex;
		flex-direction: column;
	}

	.seal-text {
		font-size: 28px;
		font-weight: 700;
		color: #2C2C2C;
		letter-spacing: 6px;
		position: relative;
	}

	.seal-text::before {
		content: '';
		position: absolute;
		left: -8px;
		top: 0;
		width: 4px;
		height: 32px;
		background: #8B5A2B;
		border-radius: 2px;
		opacity: 0.6;
	}

	.seal-sub {
		font-size: 12px;
		color: #8B5A2B;
		margin-top: 4px;
	}

	.brand-inscription {
		display: flex;
		gap: 8px;
	}

	.inscription-char {
		font-size: 32px;
		color: rgba(44, 94, 48, 0.25);
		font-family: 'KaiTi', serif;
		transform: rotate(2deg);
	}

	/* ========== 分类区 ========== */
	.category-section {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		padding: 0 16px 20px;
	}

	.category-item {
		padding: 8px 18px;
		background: #FDFAF5;
		border-radius: 30px;
		border: 0.5px solid rgba(139, 90, 43, 0.15);
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.category-item.active {
		background: #2C5E30;
	}

	.category-name {
		font-size: 14px;
		color: #5A5A5A;
	}

	.category-item.active .category-name {
		color: #F5F0E8;
	}

	/* ========== 优惠资讯 ========== */
	.promo-section {
		padding: 20px 16px;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: 16px;
	}

	.section-title {
		font-size: 20px;
		font-weight: 700;
		color: #2C2C2C;
		padding-left: 12px;
		position: relative;
	}

	.section-title::before {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 4px;
		height: 20px;
		background: #2C5E30;
		border-radius: 2px;
	}

	.promo-grid {
		display: flex;
		gap: 12px;
		overflow-x: auto;
	}

	.promo-card {
		flex: 0 0 160px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px;
		border-radius: 16px;
		background: #FDFAF5;
		box-shadow: 0 8px 20px -8px rgba(44, 94, 48, 0.12);
	}

	.card-main {
		font-size: 18px;
		font-weight: 700;
		color: #2C2C2C;
	}

	.card-tag {
		padding: 6px 12px;
		border-radius: 30px;
		font-size: 12px;
	}

	.card-tag.hot {
		background: rgba(205, 92, 92, 0.1);
		color: #CD5C5C;
	}

	.card-tag.culture {
		background: rgba(44, 94, 48, 0.08);
		color: #2C5E30;
	}

	.card-tag.gift {
		background: rgba(218, 165, 32, 0.12);
		color: #DAA520;
	}

	/* ========== 直播区 ========== */
	.live-section {
		margin: 8px 16px 24px;
		padding: 20px;
		background: linear-gradient(145deg, #2C5E30, #1E4322);
		border-radius: 24px;
		color: #F5F0E8;
	}

	.live-host-area {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 16px;
	}

	.host-name {
		font-size: 24px;
		font-weight: 700;
		letter-spacing: 4px;
		color: #FFE4C4;
	}

	.host-status {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 4px 12px;
		background: rgba(255, 255, 255, 0.15);
		border-radius: 30px;
	}

	.status-dot {
		width: 8px;
		height: 8px;
		background: #4CAF50;
		border-radius: 50%;
		animation: pulse 1.5s infinite;
	}

	@keyframes pulse {
		0% {
			opacity: 1;
			transform: scale(1);
		}

		50% {
			opacity: 0.6;
			transform: scale(1.2);
		}

		100% {
			opacity: 1;
			transform: scale(1);
		}
	}

	.live-action {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 6px 14px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 30px;
		cursor: pointer;
	}

	/* ========== 商品卡片 ========== */
	.product-section {
		
	}

	.tea-card {
		background: #FDFAF5;
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 8px 20px -8px rgba(44, 94, 48, 0.08);
		transition: all 0.3s ease;
	}

	.tea-card:active {
		transform: scale(0.98);
	}

	.tea-image {
		position: relative;
		width: 100%;
		aspect-ratio: 4/3;
		background: #EAEFE0;
	}
	
	.emoji-seal {
		position: absolute;
		top: 5px;
		left: 5px;
	}

	.origin-seal {
		position: absolute;
		bottom: 12px;
		right: 12px;
		padding: 4px 10px;
		background: rgba(44, 94, 48, 0.85);
		border-radius: 30px;
		font-size: 10px;
		color: #F5F0E8;
	}

	.tea-info {
		padding: 14px 12px;
	}

	.tea-name {
		font-size: 16px;
		font-weight: 700;
		color: #2C2C2C;
		margin-bottom: 6px;
	}

	.tea-price {
		font-size: 18px;
		font-weight: 700;
		color: #8B5A2B;
		margin-right: 2px;
	}
	.tea-rating {
		font-size: 18px;
		font-weight: 700;
		color: #ff5500;
		margin-left: 20px;
	}
	.tea-origin {
		color: #5A5A5A
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

	::-webkit-scrollbar {
		display: none;
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

	/* 主内容区域 */
	.main-content {
		transition: opacity 0.2s;
		padding: 16px;
		padding-bottom: 60px;
	}

	.main-content.searching {
		opacity: 0.3;
		pointer-events: none;
	}

	/* 移动端优化 */
	@media (max-width: 375px) {
		.search-container {
			padding: 6px 10px;
		}

		.search-input {
			font-size: 13px;
		}

		.search-overlay {
			top: 60px;
			padding: 12px;
		}
	}

	/* 确保底部导航栏不影响搜索 */
	.tea-tabbar {
		position: fixed;
		bottom: 0;
		z-index: 20;
	}
</style>