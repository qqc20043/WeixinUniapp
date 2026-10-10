<template>
    <div class="tea-app coupon-page">
      <!-- 宣纸底纹背景 -->
      <div class="paper-texture"></div>
      
      <!-- 顶部导航 -->
      <header class="tea-header">
        <div class="header-left">
          <van-icon name="arrow-left" size="20" color="#2C5E30" />
        </div>
        <h1 class="page-title">优惠券</h1>
        <div class="header-right">
          <van-icon name="ellipsis" size="20" color="#8B5A2B" />
        </div>
      </header>
  
      <!-- 主内容区 -->
      <main class="tea-content">
        <!-- 优惠券标签页 -->
        <section class="tab-section">
          <div 
            v-for="(tab, index) in couponTabs" 
            :key="index"
            class="tab-item"
            :class="{ 'active': currentTab === index }"
            @click="handleTabSwitch(index)"
          >
            <span class="tab-text">{{ tab.name }}</span>
            <span v-if="tab.count" class="tab-count">{{ tab.count }}</span>
          </div>
        </section>
  
        <!-- 口令兑换区 -->
        <section class="code-exchange">
          <div class="code-header">
            <van-icon name="coupon-o" size="20" color="#DAA520" />
            <span class="code-title">口令兑换</span>
            <span class="code-sub">输入茶令 领取好礼</span>
          </div>
          
          <div class="input-group">
            <div class="input-wrapper">
              <span class="input-label">券号</span>
              <div class="input-field">
                <input 
                  type="text" 
                  placeholder="请输入券号" 
                  v-model="couponCode"
                  @input="handleCodeInput"
                />
                <van-icon v-if="couponCode" name="close" size="16" color="#8E8E8E" @click="clearCode" />
              </div>
            </div>
            <div class="input-wrapper">
              <span class="input-label">密码</span>
              <div class="input-field">
                <input 
                  type="password" 
                  placeholder="请输入密码" 
                  v-model="couponPwd"
                  @input="handlePwdInput"
                />
                <span class="tea-decoration">🍃</span>
              </div>
            </div>
          </div>
  
          <button 
            class="exchange-btn" 
            :class="{ 'active': canExchange }"
            @click="handleExchange"
            :disabled="!canExchange"
          >
            <span class="btn-text">立即兑换</span>
            <span class="seal-mark"></span>
          </button>
        </section>
  
        <!-- 优惠券列表 -->
        <section class="coupon-list">
          <div v-for="tab in couponTabsList" :key="tab.id" class="coupon-card">
            <div class="coupon-left">
              <span class="coupon-value">¥{{ tab.value }}</span>
              <span class="coupon-condition">{{ tab.condition }}</span>
            </div>
            <div class="coupon-right">
              <h4 class="coupon-title">{{ tab.name }}</h4>
              <span class="coupon-date">{{ tab.expireTime }} 截止</span>
              <span class="coupon-badge" :class="currentTab === 0 ? 'available' : currentTab === 1 ? 'used' : 'expired'">
                {{ currentTab === 0 ? '已领取' : currentTab === 1 ? '待使用' : '已失效' }}
              </span>
            </div>
          </div>
        </section>
  
        <!-- 直播状态条 -->
        <section class="live-status">
          <div class="live-left">
            <span class="live-dot"></span>
            <span class="live-host">相送</span>
            <span class="live-badge">已连接</span>
          </div>
          <div class="live-right" @click="handleExpand">
            <span class="expand-text">展开</span>
            <van-icon name="arrow-down" size="14" color="#8E8E8E" />
          </div>
        </section>
  
        <div class="bottom-space"></div>
      </main>
  
      <!-- 底部导航栏（修正为放大效果，移除绿色矩形背景） -->
      <footer class="tea-tabbar">
        <div 
          v-for="(item, index) in tabbarItems" 
          :key="index"
          class="tab-item"
          :class="{ 'active': currentTabbar === index }"
          @click="handleTabbarClick(index)"
        >
          <div class="tab-icon-wrapper">
            <van-icon :name="item.icon" :size="22" :color="currentTabbar === index ? '#2C5E30' : '#8B5A2B'" />
          </div>
          <span class="tab-label" :class="{ 'active-label': currentTabbar === index }">{{ item.label }}</span>
        </div>
      </footer>
	  
	  <!-- 轻提示 -->
	  <div class="toast" :class="{ visible: toastVisible, error: toastError }">
	  	<div class="toast-dot" />
	  	<span>{{ toastMessage }}</span>
	  </div>
  
      <!-- 茶具装饰元素 -->
      <div class="teacup-decoration"></div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { codeNo, selectCUListId, selectCouponUserVOList } from "../api/index.js"
  import {
  	onLoad
  } from '@dcloudio/uni-app'
  
  // ============ 状态定义 ============
  const currentTab = ref(0); // 当前选中的优惠券标签
  const currentTabbar = ref(2); // 当前选中的底部导航（优惠券页高亮）
  const couponCode = ref(''); // 券号输入
  const couponPwd = ref(''); // 密码输入
  const toastVisible = ref(false)
  const toastError = ref(false)
  const toastMessage = ref('登录成功，正在为你沏好一杯茶…')
  const toastTimer = ref(null)
  
  // 优惠券标签数据
  const couponTabs = ref([
    { name: '已领取', count: '' },
    { name: '待使用', count: '' },
    { name: '已失效', count: '' }
  ]);
  const couponUserList = ref([]); // 用户拥有的优惠券
  
  // 底部导航数据
  const tabbarItems = ref([
    { icon: 'wap-home', label: '首页' },
    { icon: 'bars', label: '分类' },
    { icon: 'coupon', label: '优惠券' },
    { icon: 'shopping-cart', label: '购物车' },
    { icon: 'user', label: '我的' }
  ]);
  
  // 计算是否可兑换
  const canExchange = computed(() => {
    return couponCode.value.trim() !== '' && couponPwd.value.trim() !== '';
  });
  // 渲染拥有的优惠券
  const couponTabsList = computed(() => {
	  return couponUserList.value.reduce((acc, item) => {
	  const expireTime = item.expireTime.slice(0, 10)
	  const data = {
		  id: item.id,
		  name: item.name,
		  value: item.value,
		  condition: item.condition,
		  expireTime: expireTime
	  }
	  if((currentTab.value == 0 || currentTab.value == 1)  && item.status == "claimed") acc.push(data); // 提取属性并添加到累加器
	  else if(currentTab.value == 2 && item.status == "expired") acc.push(data);
	  return acc;
	}, []); // 初始值为空数组
  }) 
  
  // ============ 交互事件 ============
  onLoad((option) => {
  	selectCoupon();
  })
  
  // 获取拥有的优惠券
  const selectCoupon = async() => {
	  await selectCUListId().then(res => {
		  couponTabs.value[0].count = res.dataList.claimedCount;
		  couponTabs.value[1].count = res.dataList.unusedCount;
		  couponTabs.value[2].count = res.dataList.expiredCount;
	  })
	  await selectCouponUserVOList().then(res => {
		  couponUserList.value = res.dataList.cuvoList;
	  })
  }
  // 切换优惠券标签
  const handleTabSwitch = (index) => {
    currentTab.value = index;
    console.log('切换到', couponTabs.value[index].name, '标签');
  };
  
  // 券号输入
  const handleCodeInput = (e) => {
    // 功能：实时校验券号格式
  };
  
  // 密码输入
  const handlePwdInput = (e) => {
    // 功能：密码输入处理
  };
  
  // 清空券号
  const clearCode = () => {
    couponCode.value = '';
  };
  
  // 立即兑换
  const handleExchange = async() => {
    if (!canExchange.value) return;
	const data = {
		"code": couponCode.value,
		"password": couponPwd.value
	}
	await codeNo(data).then(res => {
		showToast(res.msg);
	})
	selectCoupon();
  };
  
  // 展开直播
  const handleExpand = () => {
    console.log('展开直播详情');
  };
  
  // 底部导航点击
  const handleTabbarClick = (index) => {
    currentTabbar.value = index;
    if(index === 1) {
      uni.redirectTo({
        url: '/pages/cate'
      });
    }else if(index === 0) {
      uni.redirectTo({
        url: '/pages/homepage'
      });
    }else if(index === 3) {
      uni.redirectTo({
        url: '/pages/gowuc'
      });
    }else if(index === 4) {
      uni.redirectTo({
        url: '/pages/my'
      });
    }
  };
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
	  .tea-content {
		  padding-bottom: 60px;
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
  /* ========== 全局基调 ========== */
  .coupon-app {
    position: relative;
    width: 100%;
    min-height: 100vh;
    max-width: 375px;
    margin: 0 auto;
    background: linear-gradient(145deg, #F5F0E8 0%, #F0E9E0 100%);
    font-family: '思源宋体', 'Songti SC', 'Times New Roman', serif;
    box-shadow: 0 0 40px rgba(44,94,48,0.08);
    overflow-x: hidden;
  }
  
  /* 宣纸纹理叠加 */
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
        transparent 8px),
      radial-gradient(circle at 80% 20%, rgba(44,94,48,0.02) 0%, transparent 40%);
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
  
  .page-title::after {
    content: '';
    position: absolute;
    right: -16px;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 20px;
    background: #2C5E30;
    border-radius: 2px;
    opacity: 0.3;
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
  
  /* ========== 优惠券标签页 ========== */
  .tab-section {
    display: flex;
    margin: 20px 16px;
    background: #FDFAF5;
    border-radius: 30px;
    padding: 4px;
    border: 0.5px solid rgba(139,90,43,0.1);
    box-shadow: 0 4px 12px rgba(44,94,48,0.04);
    z-index: 2;
  }
  
  .tab-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 0;
    border-radius: 26px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    z-index: 2;
  }
  
  .tab-item.active {
    background: #2C5E30;
    box-shadow: 0 4px 8px rgba(44,94,48,0.2);
  }
  
  .tab-text {
    font-size: 15px;
    font-weight: 500;
    color: #5A5A5A;
  }
  
  .tab-item.active .tab-text {
    color: #2C5E30;
    font-weight: 600;
  }
  
  .tab-count {
    font-size: 12px;
    padding: 2px 8px;
    background: rgba(139,90,43,0.1);
    border-radius: 30px;
    color: #8B5A2B;
  }
  
  .tab-item.active .tab-count {
    background: rgba(255,255,255,0.2);
    color: #2C5E30;
  }
  
  /* ========== 口令兑换区 ========== */
  .code-exchange {
    margin: 8px 16px 24px;
    padding: 24px 20px;
    background: #FDFAF5;
    border-radius: 24px;
    border: 0.5px solid rgba(139,90,43,0.12);
    box-shadow: 0 12px 24px -12px rgba(44,94,48,0.2);
    position: relative;
    z-index: 2;
    backdrop-filter: blur(2px);
  }
  
  /* 水墨晕染背景 */
  .code-exchange::before {
    content: '';
    position: absolute;
    top: 10px;
    right: 10px;
    width: 80px;
    height: 80px;
    background: radial-gradient(circle, rgba(218,165,32,0.03) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }
  
  .code-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 1px dashed rgba(139,90,43,0.2);
  }
  
  .code-title {
    font-size: 18px;
    font-weight: 700;
    color: #2C2C2C;
    letter-spacing: 2px;
  }
  
  .code-sub {
    font-size: 12px;
    color: #8B5A2B;
    margin-left: auto;
    font-style: italic;
  }
  
  /* 输入组 */
  .input-group {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 28px;
  }
  
  .input-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .input-label {
    width: 42px;
    font-size: 16px;
    font-weight: 500;
    color: #5A5A5A;
    position: relative;
  }
  
  .input-label::after {
    content: '：';
    position: absolute;
    right: 0;
  }
  
  .input-field {
    flex: 1;
    display: flex;
    align-items: center;
    height: 48px;
    padding: 0 16px;
    background: #F8F5F0;
    border-radius: 30px;
    border: 0.5px solid rgba(139,90,43,0.15);
    transition: all 0.2s ease;
  }
  
  .input-field:focus-within {
    border-color: #2C5E30;
    box-shadow: 0 0 0 3px rgba(44,94,48,0.08);
    background: #FFFFFF;
  }
  
  .input-field input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 15px;
    color: #2C2C2C;
    font-family: '思源宋体', serif;
    outline: none;
  }
  
  .input-field input::placeholder {
    color: #8E8E8E;
    font-size: 14px;
    font-style: italic;
  }
  
  .tea-decoration {
    font-size: 18px;
    opacity: 0.5;
    margin-left: 4px;
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
    background-image: repeating-linear-gradient(45deg, rgba(139,90,43,0.02) 0px, rgba(139,90,43,0.02) 2px, transparent 2px, transparent 8px);
    pointer-events: none;
    z-index: 0;
  }
  
  /* 兑换按钮（朱砂印风格） */
  .exchange-btn {
    position: relative;
    width: 100%;
    height: 52px;
    background: #E0D9D0;
    border: none;
    border-radius: 30px;
    font-size: 18px;
    font-weight: 600;
    color: #8E8E8E;
    cursor: not-allowed;
    transition: all 0.3s ease;
    overflow: hidden;
    border: 0.5px solid rgba(139,90,43,0.2);
    font-family: '思源宋体', serif;
    letter-spacing: 4px;
  }
  
  .exchange-btn.active {
    background: #CD5C5C;
    color: #F5F0E8;
    cursor: pointer;
    box-shadow: 0 8px 16px -4px rgba(205,92,92,0.3);
    border-color: rgba(205,92,92,0.3);
  }
  
  /* 印章效果 */
  .seal-mark {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    border: 1px solid rgba(245,240,232,0.5);
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .exchange-btn.active .seal-mark {
    opacity: 1;
    box-shadow: 0 0 0 2px rgba(245,240,232,0.3);
  }
  
  .exchange-btn.active::before {
    content: '印';
    position: absolute;
    right: 26px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 12px;
    color: rgba(245,240,232,0.6);
    font-family: 'KaiTi', serif;
  }
  
  .exchange-btn.active:active {
    transform: scale(0.98);
    background: #B84C4C;
  }
  
  /* ========== 优惠券列表 ========== */
  .coupon-list {
    padding: 0 16px;
    margin-bottom: 24px;
  }
  
  .coupon-card {
    display: flex;
    background: #FDFAF5;
    border-radius: 16px;
    margin-bottom: 12px;
    overflow: hidden;
    border: 0.5px solid rgba(139,90,43,0.1);
    box-shadow: 0 4px 12px rgba(44,94,48,0.04);
  }
  
  .coupon-left {
    width: 100px;
    background: rgba(44,94,48,0.05);
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-right: 1px dashed rgba(139,90,43,0.2);
  }
  
  .coupon-value {
    font-size: 28px;
    font-weight: 700;
    color: #2C5E30;
    line-height: 1.2;
  }
  
  .coupon-condition {
    font-size: 11px;
    color: #8B5A2B;
    margin-top: 4px;
  }
  
  .coupon-right {
    flex: 1;
    padding: 16px;
    position: relative;
  }
  
  .coupon-title {
    font-size: 16px;
    font-weight: 600;
    color: #2C2C2C;
    margin: 0 0 6px;
  }
  
  .coupon-date {
    font-size: 11px;
    color: #8E8E8E;
    display: block;
    margin-bottom: 12px;
  }
  
  .coupon-badge {
    position: absolute;
    top: 16px;
    right: 16px;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 500;
  }
  
  .coupon-badge.available {
    background: rgba(218,165,32,0.1);
    color: #DAA520;
  }
  
  .coupon-badge.used {
    background: rgba(44,94,48,0.1);
    color: #2C5E30;
  }
  
  .coupon-badge.expired {
    background: rgba(142,142,142,0.1);
    color: #8E8E8E;
  }
  
  /* ========== 直播状态条 ========== */
  .live-status {
    margin: 16px 16px 0;
    padding: 14px 20px;
    background: linear-gradient(145deg, #2C5E30, #1E4322);
    border-radius: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #F5F0E8;
    box-shadow: 0 8px 16px -4px rgba(44,94,48,0.3);
    border: 0.5px solid rgba(218,165,32,0.2);
    z-index: 2;
    position: relative;
  }
  
  .live-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .live-dot {
    width: 8px;
    height: 8px;
    background: #4CAF50;
    border-radius: 50%;
    box-shadow: 0 0 8px #4CAF50;
    animation: pulse 1.5s infinite;
  }
  
  @keyframes pulse {
    0% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.2); }
    100% { opacity: 1; transform: scale(1); }
  }
  
  .live-host {
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 1px;
  }
  
  .live-badge {
    padding: 2px 12px;
    background: rgba(255,255,255,0.15);
    border-radius: 30px;
    font-size: 12px;
    border: 0.5px solid rgba(255,255,255,0.2);
  }
  
  .live-right {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 14px;
    background: rgba(255,255,255,0.1);
    border-radius: 30px;
    cursor: pointer;
  }
  
  .expand-text {
    font-size: 13px;
  }
  
  /* ========== 底部导航栏（修正为放大效果，无绿色矩形背景）========== */
  .tea-tabbar {
  	position: fixed;
  	bottom: 0;
  	width: 100%;
  	display: flex;
  	justify-content: space-around;
  	align-items: center;
  	/* padding: 8px 0 12px; */
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
    /* 确保激活时也没有背景色 */
    background: transparent;
    box-shadow: none;
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
    font-weight: 400;
  }
  
  .tab-item.active .tab-label {
    transform: scale(1.05);
    color: #2C5E30;
    font-weight: 600;
  }
  
  /* 确保任何状态下都没有背景色 */
  .tab-item:hover,
  .tab-item:focus,
  .tab-item:active {
    background: transparent;
  }
  
  /* ========== 装饰元素 ========== */
  .teacup-decoration {
    position: fixed;
    bottom: 70px;
    left: 12px;
    width: 40px;
    height: 40px;
    background: radial-gradient(circle at 30% 40%, rgba(139,90,43,0.06), transparent 70%);
    border-radius: 40% 40% 30% 30%;
    border: 1px dashed rgba(139,90,43,0.15);
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
  




	/* #ifdef H5 */
	/* ========== H5 适配：PC 端统一 360px 居中（仅网页端，小程序零影响） ==========
	   为什么是 360px：与登录页 .phone-frame 的 min(360px, 92vw) 保持一致，
	   整个站点在电脑上呈现为「一部手机居中」的形态。手机端（<=768px）不加覆盖。
	*/
	@media screen and (min-width: 769px) {
		.tea-app { max-width: 360px; box-shadow: 0 0 40px rgba(44, 94, 48, 0.06); }
		.paper-texture { width: 360px; }
		.tea-tabbar { max-width: 360px; margin: 0 auto; }
		.teacup-decoration { left: 50%; margin-left: -180px; right: auto; width: 360px; }
	}
	/* #endif */
</style>