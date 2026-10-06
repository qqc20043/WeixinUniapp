<template>
	<div class="tea-app profile-page">
		<!-- 宣纸底纹背景 -->
		<div class="paper-texture"></div>

		<!-- 顶部导航 -->
		<header class="tea-header">
			<div class="header-left" @click="goBack">
				<van-icon name="arrow-left" size="20" color="#2C5E30" />
			</div>
			<h1 class="page-title">我的</h1>
			<div class="header-right" @click="goToSettings">
				<van-icon name="setting-o" size="20" color="#8B5A2B" />
			</div>
		</header>

		<!-- 主内容区 -->
		<main class="tea-content">

			<!-- 用户信息卡片（茶文化风格） -->
			<section class="user-card">
				<div class="user-info">
					<div class="avatar-wrapper">
						<div class="avatar-border">
							<div class="avatar">
								<span class="avatar-emoji">{{ users.avatarEmoji }}</span>
							</div>
						</div>
						<div class="ink-effect"></div>
					</div>

					<div class="user-detail">
						<div class="user-name-row">
							<h2 class="user-name">{{ users.nickname }}</h2>
							<span class="user-badge">vip{{ users.vipLevel }}</span>
						</div>
						<div class="user-phone">{{ users.phone }}</div>
						<div class="user-tags">
							<span class="tag">茶龄{{ users.teaAge }}年</span>
							<div v-for="(pre, index) in selectedTeas" :key="index">
								<span class="tag">{{ pre }}</span>
							</div>
						</div>
					</div>
				</div>
				<div class="signature-section">
					<div class="signature-container">
						<span class="signature-text" :class="{'has-signature': users.signature}">
							{{ users.signature || '一杯清茶，品味人生' }}
						</span>
					</div>
				</div>

				<!-- 会员进度条（茶文化特色） -->
				<div class="member-progress">
					<div class="progress-header">
						<span class="progress-title">成长值</span>
						<span class="progress-value">{{ users.totalPoints }}/5000</span>
					</div>
					<div class="progress-bar">
						<div class="progress-fill" :style="{ width: totalbfl }"></div>
					</div>
					<div class="member-benefits">
						<span class="benefit">✓ 包邮特权</span>
						<span class="benefit">✓ 双倍积分</span>
						<span class="benefit">✓ 茶礼定制</span>
					</div>
				</div>
			</section>

			<!-- 订单状态栏 -->
			<section class="orders-section">
				<div class="section-header">
					<h2 class="section-title">我的订单</h2>
					<span class="more-link" @click="goToAllOrders">全部订单 <van-icon name="arrow" size="12"
							color="#8E8E8E" /></span>
				</div>

				<div class="order-status-grid">
					<div v-for="status in orderStatus" :key="status.name" class="status-item"
						@click="goToOrderList(status.type)">
						<div class="status-icon-wrapper">
							<van-icon :name="status.icon" :size="24" :color="status.color" />
							<span v-if="status.count" class="status-badge">{{ status.count }}</span>
						</div>
						<span class="status-name">{{ status.name }}</span>
					</div>
				</div>
			</section>

			<!-- 资产卡片（茶文化风格） -->
			<section class="assets-section">
				<div class="assets-grid">
					<div class="asset-item" @click="goToCoupons">
						<span class="asset-value">{{ youHui }}</span>
						<span class="asset-label">优惠券</span>
					</div>
					<div class="asset-item" @click="goToPoints">
						<span class="asset-value">{{ users.totalPoints }}</span>
						<span class="asset-label">茶积分</span>
					</div>
					<div class="asset-item" @click="goToBalance">
						<span class="asset-value">¥{{ balance }}</span>
						<span class="asset-label">余额</span>
					</div>
					<div class="asset-item" @click="goToCollection">
						<span class="asset-value">{{ teawareCount }}</span>
						<span class="asset-label">收藏</span>
					</div>
				</div>
			</section>

			<!-- 功能列表（茶文化相关） -->
			<section class="functions-section">
				<div class="function-list">
					<!-- 地址管理 - 完善版 -->
					<div class="function-item" @click="showAddressManagement">
						<div class="item-left">
							<div class="item-icon address">
								<van-icon name="location-o" size="18" color="#2C5E30" />
							</div>
							<span class="item-label">地址管理</span>
						</div>
						<div class="item-right">
							<span class="item-desc">{{ defaultAddressText }}</span>
							<van-icon name="arrow" size="14" color="#8E8E8E" />
						</div>
					</div>

					<!-- 我的茶具 - 完善版 -->
					<div class="function-item" @click="showTeawareList">
						<div class="item-left">
							<div class="item-icon teaware">
								<van-icon name="gift-o" size="18" color="#8B5A2B" />
							</div>
							<span class="item-label">我的茶具</span>
						</div>
						<div class="item-right">
							<span class="item-desc">{{ teawareCount }}件藏品</span>
							<van-icon name="arrow" size="14" color="#8E8E8E" />
						</div>
					</div>

					<!-- 品茶笔记 - 完善版 -->
					<div class="function-item" @click="showNotesList">
						<div class="item-left">
							<div class="item-icon notes">
								<van-icon name="edit" size="18" color="#DAA520" />
							</div>
							<span class="item-label">品茶笔记</span>
						</div>
						<div class="item-right">
							<span class="item-desc">记录{{ notesCount }}篇</span>
							<van-icon name="arrow" size="14" color="#8E8E8E" />
						</div>
					</div>

					<!-- 茶友圈 -->
					<div class="function-item" @click="goToCommunity">
						<div class="item-left">
							<div class="item-icon community">
								<van-icon name="friends-o" size="18" color="#CD5C5C" />
							</div>
							<span class="item-label">茶友圈</span>
						</div>
						<div class="item-right">
							<span class="item-desc">{{ momentLen }}条动态</span>
							<span class="red-dot"></span>
						</div>
					</div>

					<!-- 客服帮助 - 完善版 -->
					<div class="function-item" @click="showCustomerService">
						<div class="item-left">
							<div class="item-icon help">
								<van-icon name="service-o" size="18" color="#708070" />
							</div>
							<span class="item-label">客服帮助</span>
						</div>
						<div class="item-right">
							<span class="item-desc">在线咨询</span>
							<van-icon name="arrow" size="14" color="#8E8E8E" />
						</div>
					</div>

					<!-- 关于我们 - 完善版 -->
					<div class="function-item" @click="showAboutUs">
						<div class="item-left">
							<div class="item-icon about">
								<van-icon name="info-o" size="18" color="#8B5A2B" />
							</div>
							<span class="item-label">关于我们</span>
						</div>
						<div class="item-right">
							<span class="item-desc">版本 {{ appVersion }}</span>
							<van-icon name="arrow" size="14" color="#8E8E8E" />
						</div>
					</div>
				</div>
			</section>

			<!-- 退出登录按钮 -->
			<section class="logout-section">
				<button class="logout-btn" @click="handleLogout">
					<van-icon name="power-off" size="16" color="#CD5C5C" />
					<span>退出登录</span>
				</button>
			</section>

			<!-- 底部留白 -->
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
		<div class="toast" :class="{ visible: toastVisible }">
			<div class="toast-dot" />
			<span>{{ toastMessage }}</span>
		</div>

		<!-- ========== 地址管理弹窗 ========== -->
		<van-popup :show="showAddressPopup" @close="closeAddressPopup" round :z-index="2000">
			<div class="popup-content address-popup">
				<div class="popup-title">地址管理</div>
				<div class="popup-body">
					<div class="address-list">
						<div v-for="address in addressList" :key="address.id" class="address-item">
							<div class="address-item-left">
								<div class="address-item-header">
									<span class="address-item-name">{{ address.name }}</span>
									<span class="address-item-phone">{{ address.phone }}</span>
									<span v-if="address.isDefault" class="default-tag">默认</span>
								</div>
								<div class="address-item-detail">
									<span class="address-tag">{{ address.tag }}</span>
									<span class="address-text">{{ address.fullAddress }}</span>
								</div>
							</div>
							<div class="address-item-actions">
								<span class="address-edit" @click="editAddress(address)">编辑</span>
								<span class="address-delete" @click="deleteAddress(address)">删除</span>
							</div>
						</div>
					</div>

					<div class="add-address-btn" @click="showAddAddressForm">
						<van-icon name="plus" size="16" color="#2C5E30" />
						<span>添加新地址</span>
					</div>
				</div>
				<div class="popup-actions single">
					<button class="popup-btn confirm" @click="closeAddressPopup">关闭</button>
				</div>
			</div>
		</van-popup>

		<!-- 新增地址表单弹窗 -->
		<van-popup :show="showAddAddressPopup" @close="closeAddAddressForm" round :z-index="2100">
			<div class="popup-content address-form-popup">
				<div class="popup-title">新增收货地址</div>
				<div class="popup-body">
					<div class="form-group">
						<label class="form-label">收货人</label>
						<input type="text" v-model="newAddress.name" class="form-input" placeholder="请输入姓名"
							@click.stop />
					</div>

					<div class="form-group">
						<label class="form-label">手机号码</label>
						<input type="tel" v-model="newAddress.phone" class="form-input" placeholder="请输入手机号"
							@click.stop />
					</div>

					<div class="form-group">
						<label class="form-label">所在地区</label>
						<div class="region-selector" @click.stop="showAreaPicker">
							<span :class="{ 'placeholder': !newAddress.regionText }">
								{{ newAddress.regionText || '请选择省/市/区' }}
							</span>
							<van-icon name="arrow-down" size="14" color="#8E8E8E" />
						</div>
					</div>

					<div class="form-group">
						<label class="form-label">详细地址</label>
						<input type="text" v-model="newAddress.detail" class="form-input" placeholder="街道、门牌号等"
							@click.stop />
					</div>

					<div class="form-group">
						<label class="form-label">地址标签</label>
						<div class="tag-selector">
							<span v-for="tag in addressTags" :key="tag" class="tag-option"
								:class="{ 'active': newAddress.tag === tag }" @click="newAddress.tag = tag">
								{{ tag }}
							</span>
						</div>
					</div>

					<div class="form-group checkbox-group">
						<label class="checkbox-label">
							<!-- #ifdef MP-WEIXIN -->
							<van-checkbox :value="newAddress.isDefault" @change="onIsDefault">默认地址勾选</van-checkbox>
							<!-- #endif -->
							<!-- #ifdef H5 -->
							<van-checkbox :model-value="newAddress.isDefault" @change="onIsDefault">默认地址勾选</van-checkbox>
							<!-- #endif -->
						</label>
					</div>
				</div>
				<div class="popup-actions">
					<button class="popup-btn cancel" @click="closeAddAddressForm">取消</button>
					<button class="popup-btn confirm" @click="saveNewAddress">保存</button>
				</div>
			</div>
		</van-popup>

		<!-- 地区选择弹窗 -->
		<van-popup :show="showAreaPopup" position="bottom" @close="closeAreaPicker" :z-index="2200" round>
			<!-- #ifdef MP-WEIXIN -->
			<van-area :area-list="areaList" :columns-num="3" @confirm="onAreaConfirm" @cancel="closeAreaPicker"
				:title="'选择所在地区'" :value="newAddress.region" />
			<!-- #endif -->
			<!-- #ifdef H5 -->
			<van-picker title="选择所在地区" :columns="[]" @confirm="onAreaConfirm" @cancel="closeAreaPicker" />
			<!-- #endif -->
		</van-popup>

		<!-- ========== 我的茶具弹窗 ========== -->
		<van-popup :show="showTeawarePopup" @close="closeTeawarePopup" round :z-index="2000">
			<div class="popup-content teaware-popup">
				<div class="popup-title">我的茶具 ({{ teawareCount }})</div>
				<div class="popup-body">
					<div v-if="teawareList.length === 0" class="empty-list">
						<div class="empty-icon">🍵</div>
						<p class="empty-text">暂无茶具藏品</p>
						<p class="empty-subtext">去商城挑选心仪的茶具吧</p>
					</div>
					<div v-else class="teaware-grid">
						<div v-for="item in teawareList" :key="item.id" class="teaware-item">
							<div class="teaware-image">
								<span class="teaware-emoji">{{ item.emoji }}</span>
							</div>
							<div class="teaware-info">
								<h4 class="teaware-name">{{ item.name }}</h4>
								<span class="teaware-desc">{{ item.desc }}</span>
								<span class="teaware-date">收藏于 {{ item.date }}</span>
							</div>
						</div>
					</div>
				</div>
				<div class="popup-actions single">
					<button class="popup-btn confirm" @click="closeTeawarePopup">关闭</button>
				</div>
			</div>
		</van-popup>

		<!-- ========== 品茶笔记弹窗 ========== -->
		<van-popup :show="showNotesPopup" @close="closeNotesPopup" round :z-index="2000">
			<div class="popup-content notes-popup">
				<div class="popup-title">品茶笔记</div>
				<div class="popup-body">
					<div v-if="notesList.length === 0" class="empty-list">
						<div class="empty-icon">📝</div>
						<p class="empty-text">暂无品茶笔记</p>
						<p class="empty-subtext">记录你的品茶心得吧</p>
					</div>
					<div v-else class="notes-list">
						<div v-for="note in notesList" :key="note.id" class="note-item">
							<div class="note-header">
								<span class="note-title">{{ note.title }}</span>
								<span class="note-date">{{ note.createdAt }}</span>
							</div>
							<p class="note-content">{{ note.content }}</p>
							<div class="note-actions">
								<span>
									<span class="note-tea">——{{ note.teaName }}</span>
									<span class="note-Rat">★{{ note.rating }}</span>
								</span>
								<span>
									<span class="note-edit" @click="editNote(note)">编辑</span>
									<span class="note-delete" @click="deleteNote(note)">删除</span>
								</span>
							</div>
						</div>
					</div>
					<button class="add-note-btn" @click="showAddNoteForm">
						<van-icon name="plus" size="16" color="#2C5E30" />
						<span>写新笔记</span>
					</button>
				</div>
				<div class="popup-actions single">
					<button class="popup-btn confirm" @click="closeNotesPopup">关闭</button>
				</div>
			</div>
		</van-popup>

		<!-- 新增笔记弹窗 -->
		<van-popup :show="showAddNotePopup" @close="closeAddNoteForm" round :z-index="2100">
			<div class="popup-content note-form-popup">
				<div class="popup-title">{{ editingNote ? '编辑笔记' : '写新笔记' }}</div>
				<div class="popup-body">
					<div class="form-group">
						<label class="form-label">笔记标题</label>
						<input type="text" v-model="currentNote.title" class="form-input" placeholder="请输入标题" />
					</div>

					<div class="form-group">
						<label class="form-label">茶品名称</label>
						<input type="text" v-model="currentNote.teaName" class="form-input" placeholder="请输入茶品名称" />
					</div>

					<div class="form-group">
						<label class="form-label">品茶感受</label>
						<textarea v-model="currentNote.content" class="form-textarea" placeholder="记录你的品茶感受..."
							rows="5"></textarea>
					</div>

					<div class="form-group">
						<label class="form-label">评分</label>
						<div class="rating-stars">
							<span v-for="star in 5" :key="star" class="star"
								:class="{ 'active': star <= currentNote.rating }"
								@click="currentNote.rating = star">★</span>
						</div>
					</div>
				</div>
				<div class="popup-actions">
					<button class="popup-btn cancel" @click="closeAddNoteForm">取消</button>
					<button class="popup-btn confirm" @click="saveNote">保存</button>
				</div>
			</div>
		</van-popup>

		<!-- ========== 客服聊天弹窗 ========== -->
		<van-popup :show="showCustomerServicePopup" @close="closeCustomerService" round :z-index="2000">
			<div class="popup-content chat-popup">
				<div class="popup-title">在线客服</div>
				<div class="chat-messages" ref="chatMessagesRef">
					<div v-for="(msg, index) in chatMessages" :key="index" class="chat-message" :class="msg.type">
						<div class="message-avatar">{{ msg.type === 'agent' ? '👤' : '👤' }}</div>
						<div class="message-content">
							<div class="message-text">{{ msg.content }}</div>
							<span class="message-time">{{ msg.time }}</span>
						</div>
					</div>
				</div>
				<div class="chat-input-area">
					<input type="text" v-model="chatInput" class="chat-input" placeholder="请输入消息..."
						@keyup.enter="sendMessage" />
					<button class="chat-send-btn" @click="sendMessage">发送</button>
				</div>
				<div class="popup-actions single">
					<button class="popup-btn confirm" @click="closeCustomerService">关闭</button>
				</div>
			</div>
		</van-popup>

		<!-- ========== 关于我们弹窗 ========== -->
		<van-popup :show="showAboutPopup" @close="closeAboutPopup" round :z-index="2000">
			<div class="popup-content about-popup">
				<div class="popup-title">关于我们</div>
				<div class="popup-body">
					<div class="about-logo">
						<div class="logo-circle">T</div>
					</div>
					<div class="app-name-large">漫思茶</div>
					<div class="app-slogan">一杯好茶，一刻安然</div>

					<div class="info-list">
						<div class="info-item">
							<span class="info-label">版本号</span>
							<span class="info-value">{{ appVersion }}</span>
						</div>
						<div class="info-item">
							<span class="info-label">开发者</span>
							<span class="info-value">漫思茶科技</span>
						</div>
						<div class="info-item">
							<span class="info-label">客服热线</span>
							<span class="info-value">400-888-1234</span>
						</div>
						<div class="info-item">
							<span class="info-label">服务时间</span>
							<span class="info-value">9:00-21:00</span>
						</div>
						<div class="info-item">
							<span class="info-label">公司地址</span>
							<span class="info-value">杭州市西湖区龙井路88号</span>
						</div>
					</div>

					<div class="copyright">
						© 2024 漫思茶科技 版权所有
					</div>
				</div>
				<div class="popup-actions single">
					<button class="popup-btn confirm" @click="closeAboutPopup">关闭</button>
				</div>
			</div>
		</van-popup>
		<van-popup :show="showUser" @close="handleClose" position="center"
			:style="{ width: '90%', maxWidth: '340px', borderRadius: '20px' }" closeable close-icon="close"
			close-icon-position="top-right">
			<div class="edit-popup">
				<div class="popup-header">
					<span class="popup-title">编辑个人资料</span>
				</div>

				<div class="popup-body">
					<!-- 头像编辑 -->
					<div class="avatar-section">
						<div class="avatar-wrapper" @click="handleAvatarClick">
							<div class="avatar">
								<span class="avatar-emoji">{{ formData.avatarEmoji }}</span>
							</div>
							<div class="avatar-edit-overlay">
								<van-icon name="photograph" size="20" color="#FFFFFF" />
							</div>
						</div>
						<span class="avatar-tip">点击更换头像</span>
					</div>

					<!-- 基本信息表单 -->
					<div class="form-section">
						<div class="form-item">
							<span class="form-label">昵称</span>
							<input type="text" v-model="formData.nickname" class="form-input" placeholder="请输入昵称"
								maxlength="20" />
						</div>

						<div class="form-item">
							<span class="form-label">性别</span>
							<div class="gender-selector">
								<span class="gender-option" :class="{ active: formData.gender === 1 }"
									@click="formData.gender = 1">男</span>
								<span class="gender-option" :class="{ active: formData.gender === 2 }"
									@click="formData.gender = 2">女</span>
							</div>
						</div>

						<div class="form-item">
							<span class="form-label">生日</span>
							<van-cell title="选择日期" :value="formData.birthday" @click="onDisplay" />
						</div>
						<div class="form-item">
							<span class="form-label">个性签名</span>
							<textarea v-model="formData.signature" class="form-textarea" placeholder="介绍一下自己..."
								rows="3" maxlength="100"></textarea>
						</div>

						<!-- 茶龄选择 -->
						<div class="form-item">
							<span class="form-label">茶龄</span>
							<div class="tea-age-selector">
								<span v-for="year in teaAgeOptions" :key="year" class="age-option"
									:class="{ active: formData.teaAge === year }"
									@click="formData.teaAge = year">{{ year }}年</span>
							</div>
						</div>

						<!-- 兴趣爱好标签 -->
						<div class="form-item">
							<span class="form-label">茶类偏好</span>
							<div class="tags-selector">
								<span v-for="tea in teaTypes" :key="tea" class="tag-option"
									:class="{ active: selectedTeas.includes(tea) }"
									@click="toggleTea(tea)">{{ tea }}</span>
							</div>
						</div>
					</div>
				</div>

				<div class="popup-footer">
					<button class="cancel-btn" @click="handleClose">取消</button>
					<button class="save-btn" @click="handleSave">保存</button>
				</div>
			</div>
		</van-popup>
		<van-popup :show="calendarShow" position="bottom" custom-style="height: 50%;" @close="onClose">
			<!-- #ifdef MP-WEIXIN -->
			<van-datetime-picker type="date" :value="birthdayd" :min-date="minDate" 
			:max-date="maxDate" @confirm="onConfirm" @cancel="onClose" />
			<!-- #endif -->
			<!-- #ifdef H5 -->
			<van-date-picker title="选择生日" :min-date="minDate" :max-date="maxDate" @confirm="onConfirm" @cancel="onClose" />
			<!-- #endif -->
		</van-popup>

		<!-- 头像选择弹窗 -->
		<van-action-sheet :show="showAvatarSheet" :actions="avatarActions"
			@select="onAvatarSelect" />
	</div>
</template>

<script setup>
	import {
		ref,
		computed,
		nextTick,
		watch
	} from 'vue'
	import {
		userDatas,
		selectCUListId,
		productTeaware,
		userBalanceI,
		userAddressList,
		userAddressUpdateInsert,
		userAddressDelete,
		userNoteList,
		noteUpdateInsert,
		noteDelete,
		categoryLists,
		userProductCategory,
		userDataUpdate,
		vMomentList
	} from "../api/index.js"
	import {
		onLoad
	} from '@dcloudio/uni-app'
	import {
		areaList
	} from '@vant/area-data';
	import {
		countStore
	} from "../store/count.js"
	
	const userCountStore = countStore()
	const minDate = ref(new Date(1900, 0, 1).getTime())
	const maxDate = ref(new Date().getTime())
	const birthdayd = ref(new Date())
	const showUser = ref(false) 
	const calendarShow = ref(false)
	
	const onDisplay = () => {
		calendarShow.value = true
	}
	const onClose = () => {
		calendarShow.value = false
	}
	const onConfirm = (event) => {
		const date = new Date(event.detail)
		formData.value.birthday = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
		onClose()
	}
	
	// 表单数据
	const formData = ref({})
	
	// 选中的茶类
	const selectedTeas = ref([])
	
	// 茶龄选项
	const teaAgeOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20]
	
	// 茶类选项
	const teaTypes = ref([])
	
	// 头像选择弹窗
	const showAvatarSheet = ref(false)
	const avatarActions = [
	  { name: '🍃 茶友', value: '🍃' },
	  { name: '🍂 秋叶', value: '🍂' },
	  { name: '🌿 青草', value: '🌿' },
	  { name: '🍵 清茶', value: '🍵' },
	  { name: '🌱 嫩芽', value: '🌱' },
	  { name: '🌸 花茶', value: '🌸' },
	  { name: '☁️ 云雾', value: '☁️' },
	  { name: '⛰️ 高山', value: '⛰️' }
	]
	
	// 关闭头像弹窗
	const onActionSheetClose = () => {
		showAvatarSheet.value = false
	}
	
	// 处理关闭
	const handleClose = () => {
	  showUser.value = false
	}
	
	// 处理头像点击
	const handleAvatarClick = () => {
	  showAvatarSheet.value = true
	}
	
	// 头像选择
	const onAvatarSelect = (action) => {
	  formData.value.avatarEmoji = action.detail.value
	  showAvatarSheet.value = false
	}
	
	// 切换茶类
	const toggleTea = (tea) => {
	  const index = selectedTeas.value.indexOf(tea)
	  if (index > -1) {
	    selectedTeas.value.splice(index, 1)
	  } else {
	    if (selectedTeas.value.length < 3) {
	      selectedTeas.value.push(tea)
	    } else {
	      showToast('最多选择3种茶类')
	    }
	  }
	}
	
	// 保存
	const handleSave = async() => {
	  if (!formData.value.nickname.trim()) {
	    showToast('请输入昵称')
	    return
	  }
	  const savedData = {
	    ...formData.value,
	    teaPreferences: []
	  }
	  selectedTeas.value.forEach(res => {
	  	savedData.teaPreferences.push(res)
	  })
	  showUser.value = false
	  await userDataUpdate(savedData).then(res => {
		  userDatasHandle()
		  showToast(res.msg)
	  })
	}

	// ============ 状态定义 ============ 
	const toastVisible = ref(false)
	const toastMessage = ref('')
	const toastTimer = ref(null)

	const currentTabbar = ref(4) // 我的页面选中
	const appVersion = ref('2.3.0')

	// 弹窗控制
	const showAddressPopup = ref(false)
	const showAddAddressPopup = ref(false)
	const showAreaPopup = ref(false)
	const showTeawarePopup = ref(false)
	const showNotesPopup = ref(false)
	const showAddNotePopup = ref(false)
	const showCustomerServicePopup = ref(false)
	const showAboutPopup = ref(false)
	const momentLen = ref(null)

	// 编辑状态
	const editingNote = ref(null)
	const currentNote = ref({
		title: '',
		teaName: '',
		content: '',
		rating: 0
	})

	// 聊天相关
	const chatMessagesRef = ref(null)
	const chatInput = ref('')
	const chatMessages = ref([{
		type: 'agent',
		content: '您好，我是客服小茶，请问有什么可以帮您？',
		time: '09:00'
	}])

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
	])

	// 订单状态数据
	const orderStatus = ref([{
			name: '待付款',
			type: 'unpaid',
			icon: 'clock-o',
			color: '#8B5A2B',
			count: 1
		},
		{
			name: '待发货',
			type: 'unship',
			icon: 'send-gift-o',
			color: '#2C5E30',
			count: 1
		},
		{
			name: '待收货',
			type: 'unreceive',
			icon: 'logistics',
			color: '#DAA520',
			count: 1
		},
		{
			name: '待评价',
			type: 'unreview',
			icon: 'chat-o',
			color: '#708070',
			count: 1
		}
	])

	// ============ 地址相关 ============
	const addressTags = ['家', '公司', '学校']

	const addressList = ref([])

	const newAddress = ref({
		name: '',
		phone: '',
		tag: '家',
		region: '',
		regionText: '',
		detail: '',
		isDefault: false
	})


	// 默认地址显示
	const defaultAddressText = computed(() => {
		const defaultAddr = addressList.value.find(addr => addr.isDefault)
		return defaultAddr ?
			`${defaultAddr.name} ${defaultAddr.phone.substring(0, 3)}****${defaultAddr.phone.substring(7)}` :
			'请添加地址'
	})

	// ============ 我的茶具相关 ============
	const teawareCount = ref(3)
	const teawareList = ref([])

	// ============ 品茶笔记相关 ============
	const notesCount = ref(0)
	const notesList = ref([])

	const users = ref({}) // 用户基本信息
	const totalbfl = ref({}) // 积分百分率
	const youHui = ref() // 优惠券数量
	const balance = ref() // 用户余额
	// ============ 交互方法 ============
	onLoad((option) => {
		obtainUserData()
		addressHandle()
		userNoteHandle()
	})

	const onIsDefault = (res) => {
		newAddress.value.isDefault = newAddress.value.isDefault ? 0 : 1;
	}

	// 加密电话号码
	const maskPhoneNumber = (phone) => {
		// 移除所有非数字字符
		const cleanPhone = phone.replace(/\D/g, '');

		if (cleanPhone.length !== 11) {
			return '无效的手机号码';
		}

		// 保留前3位和后4位，中间4位替换为****
		return cleanPhone.slice(0, 3) + '****' + cleanPhone.slice(7);
	}

	// 获取用户数据
	const obtainUserData = async () => {
		userDatasHandle()
		await selectCUListId().then(res => {
			youHui.value = res.dataList.claimedCount;
		})
		await productTeaware().then(res => {
			teawareCount.value = res.teawareList.length;
			res.teawareList.forEach(ele => {
				const dat = {
					id: ele.id,
					name: ele.name,
					desc: ele.description,
					emoji: ele.emoji,
					date: ele.createdAt
				}
				teawareList.value.push(dat);
			})
		})
		await userBalanceI().then(res => {
			balance.value = res.userBalance.totalBalance
		})
		await categoryLists().then(res => {
			res.dataList.categoryList.forEach(ele => {
				teaTypes.value.push(ele.name)
			})
		})
		await userProductCategory().then(res => {
			res.productCategory.forEach(res => {
				users.value.teaPreferences.push(res.categoryname);
			})
			selectedTeas.value = [...users.value.teaPreferences]
		})
		await vMomentList().then(res => {
			momentLen.value = res.list.length
		})
	}
	
	// 用户基本信息获取
	const userDatasHandle = async () => {
		await userDatas().then(res => {
			users.value = res.userData;
			users.value.teaPreferences = [];
			users.value.teaAge = Math.floor(users.value.teaAge / 365);
			users.value.phone = maskPhoneNumber(res.userData.phone);
			users.value.birthday = users.value.birthday.slice(0, 10)
			totalbfl.value = `${res.userData.totalPoints / 5000 * 100}%`;
			const dat = {
				nickname: users.value.nickname,
				avatarEmoji: users.value.avatarEmoji,
				gender: users.value.gender,
				birthday: users.value.birthday,
				signature: users.value.signature,
				teaAge: users.value.teaAge
			}
			formData.value = dat;
			userCountStore.setUserId(users.value.id)
			userCountStore.setNickName(users.value.nickname)
			userCountStore.setAvatarEmoji(users.value.avatarEmoji)
		})
	}

	// 用户地址更新
	const addressHandle = async () => {
		await userAddressList().then(res => {
			addressList.value = []
			res.addressList.forEach(ele => {
				const dat = {
					id: ele.id,
					name: ele.name,
					phone: ele.phone,
					tag: ele.tag,
					region: `${ele.provinceCode},${ele.cityCode},${ele.districtCode}`,
					regionText: `${ele.province} ${ele.city} ${ele.district}`,
					detail: ele.detail,
					fullAddress: ele.fullAddress,
					isDefault: ele.isDefault
				}
				addressList.value.push(dat);
			})
		})
	}

	// 品尝笔记更新
	const userNoteHandle = async () => {
		await userNoteList().then(res => {
			notesCount.value = res.notesList.length;
			notesList.value = res.notesList.map(ele => ({
				...ele,
				createdAt: ele.createdAt.slice(0, 10)
			}))
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
		uni.navigateBack()
	}

	const goToSettings = () => {
		showUser.value = true;
	}

	const goToAllOrders = () => {
		uni.navigateTo({
			url: '/pages/dingdan',
		});
	}

	const goToOrderList = (type) => {
		showToast(`跳转${type}订单`)
	}

	const goToCoupons = () => {
		currentTabbar.value = 2
		showToast('跳转优惠券')
	}

	const goToPoints = () => {
		showToast('积分功能开发中')
	}

	const goToBalance = () => {
		showToast('余额功能开发中')
	}

	const goToCollection = () => {
		showToast('收藏功能开发中')
	}

	const goToCommunity = () => {
		uni.navigateTo({
			url: '/pages/tearyouquan'
		});
	}

	const handleLogout = () => {
		uni.navigateTo({
			url: '/pages/login',
			events: {
				// 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
				acceptLoginAndMy: function(data) {
					console.log("LonginAndMy", data)
				}
			},
			success: function(res) {
				// 通过eventChannel向被打开页面传送数据
				res.eventChannel.emit('acceptLoginAndMy')
			}
		});
	}

	const handleTabbarClick = (index) => {
		currentTabbar.value = index
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
		} else if (index === 0) {
			uni.redirectTo({
				url: '/pages/homepage'
			});
		}
	}

	// ============ 地址管理功能 ============
	const showAddressManagement = () => {
		showAddressPopup.value = true
	}

	const closeAddressPopup = () => {
		showAddressPopup.value = false
	}

	const showAddAddressForm = () => {
		resetNewAddress();
		showAddAddressPopup.value = true
	}

	const closeAddAddressForm = () => {
		showAddAddressPopup.value = false
		resetNewAddress()
	}

	const resetNewAddress = () => {
		newAddress.value = {
			id: null,
			name: '',
			phone: '',
			tag: '家',
			region: '',
			regionText: '',
			detail: '',
			isDefault: false
		}
	}

	const resetNewNote = () => {
		currentNote.value = {
			title: '',
			teaName: '',
			content: '',
			rating: 0
		}
	}

	const showAreaPicker = () => {
		showAreaPopup.value = true
	}

	const closeAreaPicker = () => {
		showAreaPopup.value = false
	}

	const onAreaConfirm = (event) => {
		const values = event.detail.values
		if (values && values.length > 0) {
			const province = values[0]?.name || ''
			const city = values[1]?.name || ''
			const county = values[2]?.name || ''

			const codes = []
			if (values[0]?.code) codes.push(values[0].code)
			if (values[1]?.code) codes.push(values[1].code)
			if (values[2]?.code) codes.push(values[2].code)

			newAddress.value.region = codes.join(',')
			newAddress.value.regionText = [province, city, county].filter(Boolean).join(' ')
		}
		closeAreaPicker()
	}

	const saveNewAddress = async () => {
		if (!newAddress.value.name) {
			showToast('请输入收货人姓名')
			return
		}
		if (!newAddress.value.phone || !/^1[3-9]\d{9}$/.test(newAddress.value.phone)) {
			showToast('请输入正确的手机号码')
			return
		}
		if (!newAddress.value.region) {
			showToast('请选择所在地区')
			return
		}
		if (!newAddress.value.detail) {
			showToast('请输入详细地址')
			return
		}
		const regionList = newAddress.value.region.split(',');
		const regionTextList = newAddress.value.regionText.split(' ');
		const fullAddress = regionTextList.join('') + newAddress.value.detail

		const newAddr = {
			...newAddress.value,
			fullAddress
		}

		const dat = {
			id: newAddr.id,
			province: regionTextList[0],
			provinceCode: regionList[0],
			city: regionTextList[1],
			cityCode: regionList[1],
			district: regionTextList[2],
			districtCode: regionList[2],
			name: newAddr.name,
			phone: newAddr.phone,
			tag: newAddr.tag,
			detail: newAddr.detail,
			fullAddress: newAddr.fullAddress,
			isDefault: newAddr.isDefault
		}
		console.log(dat)
		await userAddressUpdateInsert(dat).then(res => {
			showToast(res.msg)
			addressHandle()
		})
		closeAddAddressForm()
	}

	const editAddress = (address) => {
		showAddAddressPopup.value = true;
		newAddress.value = {
			id: address.id,
			name: address.name,
			phone: address.phone,
			tag: address.tag,
			region: address.region,
			regionText: address.regionText,
			detail: address.detail,
			isDefault: address.isDefault
		}
	}

	const deleteAddress = async (address) => {
		if (addressList.value.length <= 1) {
			showToast('至少保留一个地址')
			return
		}
		await userAddressDelete(address).then(res => {
			showToast(res.msg)
			addressHandle()
		})
	}

	// ============ 我的茶具功能 ============
	const showTeawareList = () => {
		showTeawarePopup.value = true
	}

	const closeTeawarePopup = () => {
		showTeawarePopup.value = false
	}

	// ============ 品茶笔记功能 ============
	const showNotesList = () => {
		showNotesPopup.value = true
	}

	const closeNotesPopup = () => {
		showNotesPopup.value = false
	}

	const showAddNoteForm = () => {
		editingNote.value = null
		currentNote.value = {
			title: '',
			teaName: '',
			content: '',
			rating: 0
		}
		showAddNotePopup.value = true
	}

	const closeAddNoteForm = () => {
		showAddNotePopup.value = false
		resetNewNote()
	}

	const editNote = (note) => {
		editingNote.value = note
		currentNote.value = {
			...note
		}
		showAddNotePopup.value = true
	}

	const deleteNote = async (ele) => {
		await noteDelete(ele).then(res => {
			showToast(res.msg)
			userNoteHandle();
		})
	}

	const saveNote = async () => {
		if (!currentNote.value.title) {
			showToast('请输入笔记标题')
			return
		}
		if (!currentNote.value.content) {
			showToast('请输入品茶感受')
			return
		}
		await noteUpdateInsert(currentNote.value).then(res => {
			showToast(res.msg);
			userNoteHandle();
		})
		closeAddNoteForm()
	}

	// ============ 客服聊天功能 ============
	const showCustomerService = () => {
		showCustomerServicePopup.value = true
		// 滚动到底部
		nextTick(() => {
			if (chatMessagesRef.value) {
				chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
			}
		})
	}

	const closeCustomerService = () => {
		showCustomerServicePopup.value = false
	}

	const sendMessage = () => {
		if (!chatInput.value.trim()) return

		const now = new Date()
		const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

		// 添加用户消息
		chatMessages.value.push({
			type: 'user',
			content: chatInput.value,
			time: timeStr
		})

		chatInput.value = ''

		// 滚动到底部
		nextTick(() => {
			if (chatMessagesRef.value) {
				chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
			}
		})

		// 模拟客服回复 - 根据用户消息内容智能回复
		setTimeout(() => {
			const replyTime = new Date()
			const replyTimeStr =
				`${String(replyTime.getHours()).padStart(2, '0')}:${String(replyTime.getMinutes()).padStart(2, '0')}`

			// 获取用户最后一条消息
			const lastUserMessage = chatMessages.value.filter(msg => msg.type === 'user').pop()
			const userContent = lastUserMessage?.content || ''

			// 根据用户消息关键词匹配回复
			let replyContent = ''

			if (userContent.includes('价格') || userContent.includes('多少钱')) {
				const priceReplies = [
					'这款茶的价格是¥198.00，现在有新品优惠活动哦。',
					'您询问的这款茶具目前售价¥580.00，性价比很高。',
					'价格方面我可以为您介绍一下，请问您看的是哪款产品？',
					'这款茶叶有不同规格，价格从¥168到¥398不等。'
				]
				replyContent = priceReplies[Math.floor(Math.random() * priceReplies.length)]
			} else if (userContent.includes('库存') || userContent.includes('有货')) {
				const stockReplies = [
					'这款商品库存充足，可以放心下单。',
					'目前库存还有100件，建议您尽快下单。',
					'这款茶具是手工制作，库存有限，喜欢的话要抓紧哦。',
					'我帮您查一下库存，请稍等...好的，还有现货。'
				]
				replyContent = stockReplies[Math.floor(Math.random() * stockReplies.length)]
			} else if (userContent.includes('发货') || userContent.includes('快递')) {
				const deliveryReplies = [
					'下单后24小时内发货，预计2-3天送达。',
					'我们默认使用顺丰快递，确保茶叶新鲜送达。',
					'发货后会给您推送物流信息，请耐心等待。',
					'您可以选顺丰、圆通、邮政三种快递方式。'
				]
				replyContent = deliveryReplies[Math.floor(Math.random() * deliveryReplies.length)]
			} else if (userContent.includes('退货') || userContent.includes('退款')) {
				const refundReplies = [
					'支持7天无理由退货，请保持商品完好。',
					'退货流程：在我的订单中申请退货即可。',
					'退款会在收到退货后1-3个工作日原路返回。',
					'有什么问题我们可以帮您解决，不一定非要退货的。'
				]
				replyContent = refundReplies[Math.floor(Math.random() * refundReplies.length)]
			} else if (userContent.includes('茶') || userContent.includes('茶叶')) {
				const teaReplies = [
					'我们店里的茶叶都是原产地直采，品质有保障。',
					'这款茶的特点是香气清高，滋味鲜爽，回甘持久。',
					'您问的这款茶是今年的新茶，口感特别好。',
					'建议您先买品鉴装试试，喜欢再买大包装。'
				]
				replyContent = teaReplies[Math.floor(Math.random() * teaReplies.length)]
			} else if (userContent.includes('茶具') || userContent.includes('紫砂')) {
				const teawareReplies = [
					'这款茶具是宜兴原矿紫砂，手工制作。',
					'建盏需要开盏后才能使用，我教您怎么开盏。',
					'这套茶具包括一壶四杯，送礼很合适。',
					'紫砂壶需要养，越用越有光泽。'
				]
				replyContent = teawareReplies[Math.floor(Math.random() * teawareReplies.length)]
			} else if (userContent.includes('优惠') || userContent.includes('折扣')) {
				const discountReplies = [
					'现在有满200减30的优惠活动，很划算。',
					'新品上市限时8折，不要错过哦。',
					'会员可以享受双倍积分，积分可以抵扣现金。',
					'关注店铺可以领取5元无门槛优惠券。'
				]
				replyContent = discountReplies[Math.floor(Math.random() * discountReplies.length)]
			} else {
				// 默认随机回复
				const defaultReplies = [
					'感谢您的咨询，客服正在为您处理，请稍候...',
					'您好，我已经收到您的消息，马上为您解答。',
					'感谢您的耐心等待，请问有什么可以帮您的？',
					'好的，我理解您的问题了，正在为您查询。',
					'您好，您的问题我已经记录下来，会尽快回复您。'
				]
				replyContent = defaultReplies[Math.floor(Math.random() * defaultReplies.length)]
			}

			chatMessages.value.push({
				type: 'agent',
				content: replyContent,
				time: replyTimeStr
			})

			nextTick(() => {
				if (chatMessagesRef.value) {
					chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
				}
			})
		}, 1000)
	}

	// ============ 关于我们功能 ============
	const showAboutUs = () => {
		showAboutPopup.value = true
	}

	const closeAboutPopup = () => {
		showAboutPopup.value = false
	}
</script>

<style scoped>
	/* ========== 全局样式 ========== */
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
	/* ========== 编辑用户信息弹窗 ========== */
	/* 个性签名展示区域 */
	.signature-section {
	  margin: 12px 16px;
	  padding: 12px 16px;
	  background: rgba(253, 250, 245, 0.8);
	  border-radius: 16px;
	  border: 0.5px solid rgba(139, 90, 43, 0.1);
	  backdrop-filter: blur(4px);
	  position: relative;
	  overflow: hidden;
	}
	
	/* 签名装饰引号 */
	.signature-section::before {
	  content: '“';
	  position: absolute;
	  top: 8px;
	  left: 8px;
	  font-size: 32px;
	  color: rgba(44, 94, 48, 0.1);
	  font-family: 'Times New Roman', serif;
	  font-weight: 700;
	}
	
	.signature-section::after {
	  content: '”';
	  position: absolute;
	  bottom: 4px;
	  right: 8px;
	  font-size: 32px;
	  color: rgba(44, 94, 48, 0.1);
	  font-family: 'Times New Roman', serif;
	  font-weight: 700;
	}
	
	/* 签名内容容器 */
	.signature-container {
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  min-height: 60px;
	  padding: 8px 24px;
	}
	/* 签名文本 */
	.signature-text {
	  font-size: 14px;
	  line-height: 1.5;
	  color: #5A5A5A;
	  text-align: center;
	  word-break: break-word;
	  font-style: italic;
	  letter-spacing: 1px;
	}
	/* 无签名时的占位样式 */
	.signature-text.placeholder {
	  color: #A7B89E;
	  font-style: normal;
	  opacity: 0.6;
	}
	
	/* 有签名时的样式 */
	.signature-text.has-signature {
	  color: #2C5E30;
	  font-style: normal;
	  font-weight: 500;
	}
	.edit-popup {
	  background: #FDFAF5;
	  border-radius: 20px;
	  overflow: hidden;
	  width: 350px;
	}
	
	.popup-header {
	  padding: 20px 20px 10px;
	  text-align: center;
	  border-bottom: 1px solid rgba(139,90,43,0.1);
	}
	
	.popup-title {
	  font-size: 18px;
	  font-weight: 600;
	  color: #2C5E30;
	  position: relative;
	  padding-bottom: 8px;
	}
	
	.popup-title::after {
	  content: '';
	  position: absolute;
	  bottom: 0;
	  left: 50%;
	  transform: translateX(-50%);
	  width: 40px;
	  height: 2px;
	  background: #2C5E30;
	  border-radius: 1px;
	}
	
	.popup-body {
	  padding: 20px;
	  max-height: 60vh;
	  overflow-y: auto;
	}
	
	/* 头像部分 */
	.avatar-section {
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  margin-bottom: 24px;
	}
	
	.avatar-wrapper {
	  position: relative;
	  width: 80px;
	  height: 80px;
	  cursor: pointer;
	  margin-bottom: 8px;
	}
	
	.avatar {
	  width: 100%;
	  height: 100%;
	  border-radius: 50%;
	  background: linear-gradient(145deg, #2C5E30, #1E4322);
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  border: 3px solid #FDFAF5;
	  box-shadow: 0 4px 12px rgba(44,94,48,0.2);
	}
	
	.avatar-emoji {
	  font-size: 40px;
	}
	
	.avatar-edit-overlay {
	  position: absolute;
	  top: 0;
	  left: 0;
	  width: 100%;
	  height: 100%;
	  border-radius: 50%;
	  background: rgba(0,0,0,0.5);
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  opacity: 0;
	  transition: opacity 0.2s;
	}
	
	.avatar-wrapper:hover .avatar-edit-overlay {
	  opacity: 1;
	}
	
	.avatar-tip {
	  font-size: 12px;
	  color: #8E8E8E;
	}
	
	/* 表单部分 */
	.form-section {
	  display: flex;
	  flex-direction: column;
	  gap: 16px;
	}
	
	.form-item {
	  display: flex;
	  flex-direction: column;
	  gap: 6px;
	}
	
	.form-label {
	  font-size: 14px;
	  font-weight: 500;
	  color: #2C5E30;
	}
	
	.form-input {
	  width: 100%;
	  height: 40px;
	  padding: 0 12px;
	  border: 1px solid rgba(139,90,43,0.2);
	  border-radius: 8px;
	  font-size: 14px;
	  color: #2C2C2C;
	  background: #FFFFFF;
	  outline: none;
	  box-sizing: border-box;
	}
	
	.form-input:focus {
	  border-color: #2C5E30;
	  box-shadow: 0 0 0 2px rgba(44,94,48,0.1);
	}
	
	.form-textarea {
	  width: 100%;
	  padding: 10px 12px;
	  border: 1px solid rgba(139,90,43,0.2);
	  border-radius: 8px;
	  font-size: 14px;
	  color: #2C2C2C;
	  background: #FFFFFF;
	  outline: none;
	  resize: none;
	  font-family: inherit;
	}
	
	.form-textarea:focus {
	  border-color: #2C5E30;
	  box-shadow: 0 0 0 2px rgba(44,94,48,0.1);
	}
	
	/* 性别选择器 */
	.gender-selector {
	  display: flex;
	  gap: 12px;
	}
	
	.gender-option {
	  flex: 1;
	  padding: 8px 0;
	  text-align: center;
	  border: 1px solid rgba(139,90,43,0.2);
	  border-radius: 8px;
	  font-size: 14px;
	  color: #5A5A5A;
	  cursor: pointer;
	  transition: all 0.2s;
	}
	
	.gender-option.active {
	  background: #2C5E30;
	  border-color: #2C5E30;
	  color: #FFFFFF;
	}
	
	/* 茶龄选择器 */
	.tea-age-selector {
	  display: flex;
	  flex-wrap: wrap;
	  gap: 8px;
	}
	
	.age-option {
	  padding: 6px 12px;
	  border: 1px solid rgba(139,90,43,0.2);
	  border-radius: 20px;
	  font-size: 13px;
	  color: #5A5A5A;
	  cursor: pointer;
	  transition: all 0.2s;
	}
	
	.age-option.active {
	  background: #2C5E30;
	  border-color: #2C5E30;
	  color: #FFFFFF;
	}
	
	/* 标签选择器 */
	.tags-selector {
	  display: flex;
	  flex-wrap: wrap;
	  gap: 8px;
	}
	
	.tag-option {
	  padding: 6px 12px;
	  border: 1px solid rgba(139,90,43,0.2);
	  border-radius: 20px;
	  font-size: 13px;
	  color: #5A5A5A;
	  cursor: pointer;
	  transition: all 0.2s;
	}
	
	.tag-option.active {
	  background: #2C5E30;
	  border-color: #2C5E30;
	  color: #FFFFFF;
	}
	
	/* 底部按钮 */
	.popup-footer {
	  display: flex;
	  border-top: 1px solid rgba(139,90,43,0.1);
	}
	
	.cancel-btn,
	.save-btn {
	  flex: 1;
	  height: 48px;
	  border: none;
	  font-size: 15px;
	  font-weight: 500;
	  cursor: pointer;
	  transition: all 0.2s;
	}
	
	.cancel-btn {
	  background: #F0E9E0;
	  color: #5A5A5A;
	  border-right: 1px solid rgba(139,90,43,0.1);
	}
	
	.save-btn {
	  background: #2C5E30;
	  color: #FFFFFF;
	}
	
	.cancel-btn:active {
	  background: #E8DDD2;
	}
	
	.save-btn:active {
	  background: #1E4322;
	}
	
	/* 滚动条隐藏 */
	::-webkit-scrollbar {
	  display: none;
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

	/* ========== 用户卡片 ========== */
	.user-card {
		margin: 16px;
		padding: 20px;
		background: #FDFAF5;
		border-radius: 24px;
		border: 0.5px solid rgba(139, 90, 43, 0.12);
		box-shadow: 0 8px 20px -8px rgba(44, 94, 48, 0.12);
		position: relative;
		overflow: hidden;
	}

	.user-card::before {
		content: '茶';
		position: absolute;
		bottom: 10px;
		right: 10px;
		font-size: 60px;
		color: rgba(44, 94, 48, 0.03);
		font-family: 'KaiTi', serif;
		transform: rotate(-10deg);
		pointer-events: none;
	}

	.user-info {
		display: flex;
		gap: 16px;
		margin-bottom: 20px;
	}

	.avatar-wrapper {
		position: relative;
		width: 70px;
		height: 70px;
	}

	.avatar-border {
		width: 70px;
		height: 70px;
		border-radius: 50%;
		background: linear-gradient(145deg, #2C5E30, #8B5A2B);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		z-index: 2;
	}

	.avatar {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background: linear-gradient(145deg, #EAEFE0, #DDE2D5);
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid #FDFAF5;
	}

	.avatar-emoji {
		font-size: 32px;
	}

	.ink-effect {
		position: absolute;
		top: -5px;
		left: -5px;
		width: 80px;
		height: 80px;
		background: radial-gradient(circle, rgba(44, 94, 48, 0.1) 0%, transparent 70%);
		border-radius: 50%;
		z-index: 1;
		filter: blur(4px);
	}

	.user-detail {
		flex: 1;
		padding-top: 4px;
	}

	.user-name-row {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 4px;
	}

	.user-name {
		font-size: 18px;
		font-weight: 700;
		color: #2C2C2C;
		margin: 0;
	}

	.user-badge {
		padding: 2px 10px;
		background: linear-gradient(145deg, #DAA520, #C6951C);
		border-radius: 20px;
		font-size: 10px;
		color: #FDFAF5;
		font-weight: 600;
		letter-spacing: 1px;
	}

	.user-phone {
		font-size: 13px;
		color: #8E8E8E;
		margin-bottom: 8px;
	}

	.user-tags {
		display: flex;
		gap: 8px;
	}

	.tag {
		padding: 2px 10px;
		background: rgba(44, 94, 48, 0.08);
		border-radius: 20px;
		font-size: 10px;
		color: #2C5E30;
	}

	.member-progress {
		background: rgba(139, 90, 43, 0.04);
		border-radius: 16px;
		padding: 16px;
	}

	.progress-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}

	.progress-title {
		font-size: 14px;
		font-weight: 500;
		color: #5A5A5A;
	}

	.progress-value {
		font-size: 13px;
		color: #8B5A2B;
	}

	.progress-bar {
		height: 6px;
		background: rgba(44, 94, 48, 0.1);
		border-radius: 3px;
		overflow: hidden;
		margin-bottom: 12px;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #2C5E30, #8B5A2B);
		border-radius: 3px;
		transition: width 0.3s;
	}

	.member-benefits {
		display: flex;
		gap: 16px;
	}

	.benefit {
		font-size: 11px;
		color: #708070;
		display: flex;
		align-items: center;
		gap: 2px;
	}

	/* ========== 订单状态 ========== */
	.orders-section {
		margin: 16px;
		padding: 16px;
		background: #FDFAF5;
		border-radius: 16px;
		border: 0.5px solid rgba(139, 90, 43, 0.1);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}

	.section-title {
		font-size: 16px;
		font-weight: 600;
		color: #2C2C2C;
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

	.more-link {
		font-size: 12px;
		color: #8E8E8E;
		display: flex;
		align-items: center;
		gap: 4px;
		cursor: pointer;
	}

	.order-status-grid {
		display: flex;
		justify-content: space-around;
	}

	.status-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		cursor: pointer;
		position: relative;
	}

	.status-icon-wrapper {
		position: relative;
	}

	.status-badge {
		position: absolute;
		top: -6px;
		right: -10px;
		min-width: 16px;
		height: 16px;
		background: #CD5C5C;
		border-radius: 10px;
		font-size: 10px;
		color: #FDFAF5;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 4px;
	}

	.status-name {
		font-size: 12px;
		color: #5A5A5A;
	}

	/* ========== 资产卡片 ========== */
	.assets-section {
		margin: 16px;
		padding: 16px;
		background: #FDFAF5;
		border-radius: 16px;
		border: 0.5px solid rgba(139, 90, 43, 0.1);
	}

	.assets-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 8px;
	}

	.asset-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		cursor: pointer;
		padding: 8px 0;
	}

	.asset-value {
		font-size: 16px;
		font-weight: 700;
		color: #2C5E30;
	}

	.asset-label {
		font-size: 11px;
		color: #8E8E8E;
	}

	/* ========== 功能列表 ========== */
	.functions-section {
		margin: 16px;
		padding: 8px 0;
		background: #FDFAF5;
		border-radius: 16px;
		border: 0.5px solid rgba(139, 90, 43, 0.1);
	}

	.function-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px;
		border-bottom: 0.5px solid rgba(139, 90, 43, 0.08);
		cursor: pointer;
		transition: background 0.2s;
	}

	.function-item:last-child {
		border-bottom: none;
	}

	.function-item:active {
		background: rgba(44, 94, 48, 0.02);
	}

	.item-left {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.item-icon {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.item-icon.address {
		background: rgba(44, 94, 48, 0.1);
	}

	.item-icon.teaware {
		background: rgba(139, 90, 43, 0.1);
	}

	.item-icon.notes {
		background: rgba(218, 165, 32, 0.1);
	}

	.item-icon.community {
		background: rgba(205, 92, 92, 0.1);
	}

	.item-icon.help {
		background: rgba(112, 128, 112, 0.1);
	}

	.item-icon.about {
		background: rgba(139, 90, 43, 0.1);
	}

	.item-label {
		font-size: 14px;
		color: #2C2C2C;
	}

	.item-right {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.item-desc {
		font-size: 12px;
		color: #8E8E8E;
	}

	.red-dot {
		width: 8px;
		height: 8px;
		background: #CD5C5C;
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

	/* ========== 退出登录按钮 ========== */
	.logout-section {
		margin: 16px 16px 24px;
		display: flex;
		justify-content: center;
	}

	.logout-btn {
		width: 200px;
		padding: 12px 0;
		background: transparent;
		border: 1px solid rgba(205, 92, 92, 0.3);
		border-radius: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		color: #CD5C5C;
		font-size: 14px;
		font-family: '思源宋体', serif;
		cursor: pointer;
		transition: all 0.2s;
		backdrop-filter: blur(4px);
	}

	.logout-btn:active {
		transform: scale(0.97);
		background: rgba(205, 92, 92, 0.05);
	}

	/* ========== 底部导航栏 ========== */
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
		max-height: 80vh;
		display: flex;
		flex-direction: column;
	}

	.popup-title {
		padding: 16px;
		text-align: center;
		font-size: 16px;
		font-weight: 600;
		color: #2C2C2C;
		border-bottom: 1px solid rgba(139, 90, 43, 0.1);
		background: #F5F0E8;
	}

	.popup-body {
		padding: 20px;
		overflow-y: auto;
		flex: 1;
	}

	.popup-actions {
		display: flex;
		border-top: 1px solid rgba(139, 90, 43, 0.1);
	}

	.popup-actions.single {
		border-top: none;
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
		border-right: 1px solid rgba(139, 90, 43, 0.1);
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
		background: rgba(44, 94, 48, 0.05);
	}

	/* 地址管理相关 */
	.address-popup,
	.address-form-popup {
		max-width: 360px;
	}

	.address-list {
		max-height: 300px;
		overflow-y: auto;
		margin-bottom: 16px;
	}

	.address-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px;
		border: 1px solid rgba(139, 90, 43, 0.1);
		border-radius: 12px;
		margin-bottom: 8px;
	}

	.address-item-left {
		flex: 1;
	}

	.address-item-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 4px;
	}

	.address-item-name {
		font-size: 14px;
		font-weight: 600;
		color: #2C2C2C;
	}

	.address-item-phone {
		font-size: 12px;
		color: #5A5A5A;
	}

	.default-tag {
		padding: 2px 6px;
		background: rgba(44, 94, 48, 0.1);
		border-radius: 4px;
		font-size: 10px;
		color: #2C5E30;
	}

	.address-item-detail {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.address-tag {
		padding: 2px 6px;
		background: rgba(139, 90, 43, 0.1);
		border-radius: 4px;
		font-size: 10px;
		color: #8B5A2B;
	}

	.address-text {
		font-size: 12px;
		color: #666;
	}

	.address-item-actions {
		display: flex;
		gap: 8px;
		margin-left: 12px;
	}

	.address-edit,
	.address-delete {
		font-size: 12px;
		padding: 4px 8px;
		border-radius: 4px;
	}

	.address-edit {
		color: #2C5E30;
	}

	.address-delete {
		color: #CD5C5C;
	}

	.add-address-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 12px;
		background: rgba(44, 94, 48, 0.05);
		border: 1px dashed rgba(44, 94, 48, 0.3);
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.add-address-btn:active {
		background: rgba(44, 94, 48, 0.1);
	}

	.add-address-btn span {
		font-size: 14px;
		color: #2C5E30;
	}

	/* 表单样式 */
	.form-group {
		margin-bottom: 16px;
	}

	.form-label {
		display: block;
		font-size: 13px;
		color: #5A5A5A;
		margin-bottom: 6px;
	}

	.form-input {
		width: 100%;
		height: 40px;
		padding: 0 12px;
		border: 1px solid rgba(139, 90, 43, 0.2);
		border-radius: 8px;
		font-size: 14px;
		color: #2C2C2C;
		background: #FFFFFF;
		outline: none;
		box-sizing: border-box;
	}

	.form-input:focus {
		border-color: #2C5E30;
		box-shadow: 0 0 0 2px rgba(44, 94, 48, 0.1);
	}

	.form-textarea {
		width: 100%;
		padding: 12px;
		border: 1px solid rgba(139, 90, 43, 0.2);
		border-radius: 8px;
		font-size: 14px;
		color: #2C2C2C;
		background: #FFFFFF;
		outline: none;
		resize: none;
		box-sizing: border-box;
	}

	.form-textarea:focus {
		border-color: #2C5E30;
		box-shadow: 0 0 0 2px rgba(44, 94, 48, 0.1);
	}

	.region-selector {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 40px;
		padding: 0 12px;
		border: 1px solid rgba(139, 90, 43, 0.2);
		border-radius: 8px;
		background: #FFFFFF;
		cursor: pointer;
	}

	.region-selector span {
		font-size: 14px;
		color: #2C2C2C;
	}

	.region-selector span.placeholder {
		color: #999999;
	}

	.tag-selector {
		display: flex;
		gap: 8px;
	}

	.tag-option {
		padding: 6px 12px;
		border: 1px solid rgba(139, 90, 43, 0.2);
		border-radius: 20px;
		font-size: 12px;
		color: #5A5A5A;
		cursor: pointer;
		transition: all 0.2s;
	}

	.tag-option.active {
		background: #2C5E30;
		border-color: #2C5E30;
		color: #FFFFFF;
	}

	.checkbox-group {
		display: flex;
		align-items: center;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
	}

	.checkbox-input {
		display: none;
	}

	.checkbox-custom {
		width: 18px;
		height: 18px;
		border: 2px solid rgba(139, 90, 43, 0.3);
		border-radius: 4px;
		position: relative;
	}

	.checkbox-input:checked+.checkbox-custom {
		background: #2C5E30;
		border-color: #2C5E30;
	}

	.checkbox-input:checked+.checkbox-custom::after {
		content: '✓';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: #FFFFFF;
		font-size: 12px;
	}

	/* 茶具相关 */
	.teaware-grid {
		display: grid;
		gap: 12px;
	}

	.teaware-item {
		display: flex;
		gap: 12px;
		padding: 12px;
		border: 1px solid rgba(139, 90, 43, 0.1);
		border-radius: 12px;
	}

	.teaware-image {
		width: 60px;
		height: 60px;
		background: linear-gradient(145deg, #EAEFE0, #DDE2D5);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.teaware-emoji {
		font-size: 24px;
	}

	.teaware-info {
		flex: 1;
	}

	.teaware-name {
		font-size: 14px;
		font-weight: 600;
		color: #2C2C2C;
		margin: 0 0 4px;
	}

	.teaware-desc {
		font-size: 12px;
		color: #8E8E8E;
		display: block;
		margin-bottom: 4px;
	}

	.teaware-date {
		font-size: 10px;
		color: #A7B89E;
	}

	/* 笔记相关 */
	.notes-list {
		max-height: 300px;
		overflow-y: auto;
		margin-bottom: 16px;
	}

	.note-item {
		padding: 12px;
		border: 1px solid rgba(139, 90, 43, 0.1);
		border-radius: 12px;
		margin-bottom: 8px;
	}

	.note-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}

	.note-title {
		font-size: 14px;
		font-weight: 600;
		color: #2C2C2C;
	}

	.note-date {
		font-size: 10px;
		color: #A7B89E;
	}

	.note-content {
		font-size: 12px;
		color: #5A5A5A;
		line-height: 1.5;
		margin-bottom: 8px;
	}

	.note-actions {
		display: flex;
		justify-content: space-between;
		gap: 12px;
	}

	.note-tea {
		font-size: 12px;
		font-weight: 700;
		color: deeppink;
	}

	.note-Rat {
		font-size: 12px;
		color: tomato;
		margin-left: 8px;
	}

	.note-edit,
	.note-delete {
		font-size: 12px;
		padding: 2px 8px;
	}

	.note-edit {
		color: #2C5E30;
	}

	.note-delete {
		color: #CD5C5C;
	}

	.add-note-btn {
		width: 100%;
		padding: 12px;
		background: rgba(44, 94, 48, 0.05);
		border: 1px dashed rgba(44, 94, 48, 0.3);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		cursor: pointer;
	}

	.add-note-btn span {
		font-size: 14px;
		color: #2C5E30;
	}

	/* 空状态 */
	.empty-list {
		text-align: center;
		padding: 30px 0;
	}

	.empty-icon {
		font-size: 48px;
		margin-bottom: 12px;
		opacity: 0.5;
	}

	.empty-text {
		font-size: 14px;
		font-weight: 500;
		color: #2C2C2C;
		margin-bottom: 4px;
	}

	.empty-subtext {
		font-size: 12px;
		color: #8E8E8E;
	}

	/* 评分星星 */
	.rating-stars {
		display: flex;
		gap: 8px;
		margin: 8px 0;
		justify-content: center;
	}

	.star {
		font-size: 24px;
		color: rgba(139, 90, 43, 0.2);
		cursor: pointer;
		transition: all 0.2s;
	}

	.star.active {
		color: #DAA520;
	}

	/* 聊天相关 */
	.chat-popup {
		max-width: 360px;
		height: 500px;
		display: flex;
		flex-direction: column;
	}

	.chat-messages {
		flex: 1;
		overflow-y: auto;
		padding: 16px;
		background: rgba(245, 240, 232, 0.5);
	}

	.chat-message {
		display: flex;
		gap: 8px;
		margin-bottom: 16px;
	}

	.chat-message.user {
		flex-direction: row-reverse;
	}

	.message-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: #EAEFE0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 16px;
	}

	.message-content {
		max-width: 70%;
	}

	.message-text {
		padding: 10px 12px;
		border-radius: 12px;
		background: #FFFFFF;
		font-size: 13px;
		color: #2C2C2C;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.chat-message.user .message-text {
		background: #2C5E30;
		color: #FFFFFF;
	}

	.message-time {
		font-size: 10px;
		color: #8E8E8E;
		margin-top: 4px;
		display: block;
	}

	.chat-message.user .message-time {
		text-align: right;
	}

	.chat-input-area {
		display: flex;
		gap: 8px;
		padding: 12px;
		background: #F5F0E8;
		border-top: 1px solid rgba(139, 90, 43, 0.1);
	}

	.chat-input {
		flex: 1;
		height: 36px;
		padding: 0 12px;
		border: 1px solid rgba(139, 90, 43, 0.2);
		border-radius: 18px;
		font-size: 13px;
		color: #2C2C2C;
		background: #FFFFFF;
		outline: none;
	}

	.chat-input:focus {
		border-color: #2C5E30;
	}

	.chat-send-btn {
		padding: 0 16px;
		height: 36px;
		background: #2C5E30;
		border: none;
		border-radius: 18px;
		color: #FFFFFF;
		font-size: 13px;
		cursor: pointer;
	}

	.chat-send-btn:active {
		background: #1E4322;
	}

	/* 关于我们相关 */
	.about-popup {
		max-width: 340px;
	}

	.about-logo {
		display: flex;
		justify-content: center;
		margin-bottom: 16px;
	}

	.logo-circle {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background: linear-gradient(145deg, #2C5E30, #1E4322);
		display: flex;
		align-items: center;
		justify-content: center;
		color: #F5F0E8;
		font-size: 28px;
		font-weight: 700;
		box-shadow: 0 8px 16px rgba(44, 94, 48, 0.3);
	}

	.app-name-large {
		font-size: 20px;
		font-weight: 700;
		color: #2C2C2C;
		text-align: center;
		margin-bottom: 4px;
	}

	.app-slogan {
		font-size: 13px;
		color: #8E8E8E;
		text-align: center;
		margin-bottom: 24px;
	}

	.info-list {
		margin-bottom: 24px;
	}

	.info-item {
		display: flex;
		justify-content: space-between;
		padding: 8px 0;
		border-bottom: 1px solid rgba(139, 90, 43, 0.08);
	}

	.info-item:last-child {
		border-bottom: none;
	}

	.info-label {
		font-size: 13px;
		color: #5A5A5A;
	}

	.info-value {
		font-size: 13px;
		color: #2C2C2C;
		font-weight: 500;
	}

	.copyright {
		text-align: center;
		font-size: 11px;
		color: #A7B89E;
	}

	/* 滚动条隐藏 */
	::-webkit-scrollbar {
		display: none;
	}
</style>