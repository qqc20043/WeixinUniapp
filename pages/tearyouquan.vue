<template>
	<div class="tea-app moments-page">
		<!-- 宣纸底纹背景 -->
		<div class="paper-texture"></div>

		<!-- 顶部导航 -->
		<header class="tea-header">
			<div class="header-left" @click="goBack">
				<van-icon name="arrow-left" size="20" color="#2C5E30" />
			</div>
			<h1 class="page-title">茶友圈</h1>
			<div class="header-right" @click="showPublishModal">
				<van-icon name="plus" size="20" color="#8B5A2B" />
			</div>
		</header>

		<!-- 封面图 -->
		<div class="cover-section">
			<div class="cover-image">
				<div class="cover-overlay"></div>
				<div class="cover-text">
					<h2>以茶会友</h2>
					<p>分享你的品茶时光</p>
				</div>
			</div>
			<div class="user-profile">
				<div class="profile-avatar">
					<span class="avatar-emoji">{{ userCountStore.avatarEmoji }}</span>
				</div>
				<div class="profile-info">
					<span class="profile-name">{{ userCountStore.nickName }}</span>
					<span class="profile-stats">{{ moments.length }}条动态 · {{ moments.length - 4 }}位茶友</span>
				</div>
			</div>
		</div>

		<!-- 朋友圈列表 -->
		<main class="moments-content">
			<div v-if="moments.length === 0" class="empty-moments">
				<div class="empty-icon">🍵</div>
				<p class="empty-text">暂无动态</p>
				<p class="empty-subtext">快来发布第一条茶友圈吧</p>
			</div>

			<div v-else class="moments-list">
				<div v-for="moment in moments" :key="moment.id" class="moment-card">
					<!-- 用户信息 -->
					<div class="moment-header">
						<div class="user-avatar">
							<span class="avatar-emoji">{{ moment.avatar }}</span>
						</div>
						<div class="user-info">
							<span class="user-name">{{ moment.userName }}</span>
							<span class="user-badge" v-if="moment.isVip">茶友</span>
						</div>
					</div>

					<!-- 动态内容 -->
					<div class="moment-content">
						<p class="content-text">{{ moment.content }}</p>

						<!-- 图片列表 -->
						<div v-if="moment.images && moment.images.length > 0" class="image-grid"
							:class="'grid-' + moment.images.length">
							<div v-for="(img, index) in moment.images" :key="index" class="image-item"
								@click="previewImage(moment.images, index)">
								<span class="image-emoji">{{ img.emoji }}</span>
							</div>
						</div>

						<!-- 茶品标签 -->
						<div v-if="moment.teaTag" class="tea-tag">
							<span class="tag-icon">🍃</span>
							<span>{{ moment.teaTag }}</span>
						</div>

						<!-- 时间信息 -->
						<div class="moment-footer">
							<span class="moment-time">{{ moment.time }}</span>
							<div class="moment-actions">
								<div class="action-item" @click="toggleLike(moment.id)">
									<span class="action-icon" :class="{ 'liked': moment.isLiked }">
										{{ moment.isLiked ? '❤️' : '🤍' }}
									</span>
									<span class="action-count">{{ moment.likeCount }}</span>
								</div>
								<div class="action-item" @click="showComments(moment.id)">
									<span class="action-icon">💬</span>
									<span class="action-count">{{ moment.commentCount }}</span>
								</div>
							</div>
						</div>
					</div>

					<!-- 评论列表 -->
					<div v-if="moment.showComments" class="comments-section">
						<div class="comments-list">
							<div v-for="comment in moment.comments" :key="comment.id" class="comment-item">
								<span class="comment-user">{{ comment.userName }}：</span>
								<span class="comment-text">{{ comment.content }}</span>
							</div>
						</div>

						<!-- 发表评论 -->
						<div class="comment-input-area">
							<input v-model="moment.newComment" class="comment-input" placeholder="写评论..."
								@keyup.enter="submitComment(moment.id)" />
							<button class="comment-submit" @click="submitComment(moment.id)">发送</button>
						</div>
					</div>
				</div>
			</div>

			<!-- 底部留白 -->
			<div class="bottom-space"></div>
		</main>

		<!-- 底部发布按钮 -->
		<div class="publish-btn" @click="showPublishModal">
			<span class="publish-icon">✏️</span>
		</div>

		<!-- 发布动态弹窗 -->
		<van-popup :show="showPublishPopup" @close="closePublishModal" round :z-index="2000" position="bottom"
			custom-style="height: 80%;">
			<div class="popup-content publish-popup">
				<div class="popup-title">发布茶友圈</div>
				<div class="popup-body">
					<textarea v-model="newMoment.content" class="publish-textarea" placeholder="分享你的品茶心得..."
						rows="6"></textarea>

					<!-- 茶品选择 -->
					<div class="tea-selector">
						<div class="selector-label">关联茶品</div>
						<div class="tea-tags">
							<span v-for="(tea, index) in teaList" :key="index" class="tea-tag-option"
								:class="{ 'active': newMoment.teaId === tea.id }" @click="selectTea(tea)">
								{{ tea.name }}
							</span>
						</div>
					</div>

					<!-- 图片上传 -->
					<div class="image-uploader">
						<div class="selector-label">添加图片</div>
						<div class="upload-area">
							<div v-for="(img, index) in newMoment.images" :key="index" class="upload-preview">
								<span class="preview-emoji">{{ img.emoji }}</span>
								<span class="remove-image" @click="removeImage(index)">✕</span>
							</div>
							<div v-if="newMoment.images.length < 9" class="upload-btn" @click="addImage">
								<span class="upload-icon">+</span>
							</div>
						</div>
					</div>
				</div>
				<div class="popup-actions">
					<button class="popup-btn cancel" @click="closePublishModal">取消</button>
					<button class="popup-btn confirm" @click="publishMoment" :disabled="!newMoment.content">发布</button>
				</div>
			</div>
		</van-popup>

		<!-- 图片预览弹窗 -->
		<van-popup :show="showPreviewPopup" @close="closePreview" :z-index="2100">
			<div class="preview-container">
				<div class="preview-image">
					<span class="preview-emoji-large">{{ previewImageEmoji }}</span>
				</div>
				<div class="preview-close" @click="closePreview">✕</div>
			</div>
		</van-popup>

		<!-- 轻提示 -->
		<div class="toast" :class="{ visible: toastVisible }">
			<div class="toast-dot" />
			<span>{{ toastMessage }}</span>
		</div>
	</div>
</template>

<script setup>
	import {
		ref
	} from 'vue'
	import {
		vMomentList,
		vMomentCommentList,
		vMomentLikeFlag,
		vMomentImageFlag,
		vMomentUpdateLike,
		vMomentInsertComment,
		vMomentInsertMoment,
		vMomentInsertImage
	} from "../api/index.js"
	import {
		onLoad
	} from '@dcloudio/uni-app'
	import {
		countStore
	} from "../store/count.js"

	const userCountStore = countStore()
	// ============ 状态定义 ============
	const toastVisible = ref(false)
	const toastMessage = ref('')
	const toastTimer = ref(null)

	const showPublishPopup = ref(false)
	const showPreviewPopup = ref(false)
	const previewImageEmoji = ref('')

	// 茶品列表
	const teaList = ref(userCountStore.product)

	// 新动态
	const newMoment = ref({
		content: '',
		teaId: null,
		images: []
	})

	// 朋友圈数据
	const moments = ref([])

	// ============ 交互方法 ============
	onLoad((option) => {
		selectVMomentList()
	})

	const selectVMomentList = async () => {
		await vMomentList().then(res => {
			res.list.forEach(ele => {
				const dat = {
					id: ele.id,
					userId: ele.userId,
					userName: ele.userName,
					avatar: ele.userAvatar,
					isVip: true,
					content: ele.content,
					teaTag: ele.teaTag,
					teaId: ele.teaId,
					images: ele.images,
					time: ele.timeAgo,
					likeCount: ele.actualLikeCount,
					isLiked: false,
					commentCount: ele.actualCommentCount,
					showComments: false,
					newComment: '',
					createdAt: ele.createdAt,
					comments: []
				}
				moments.value.push(dat);
			})
			moments.value.sort((a, b) => {
				return new Date(b.createdAt) - new Date(a.createdAt);
			});
		})
		for (let i = 0; i < moments.value.length; i++) {
			await vMomentCommentList({
				momentId: moments.value[i].id
			}).then(res => {
				res.momentComment.forEach(que => {
					const da = {
						id: que.id,
						userId: que.userId,
						userName: que.userNickname,
						content: que.content
					}
					moments.value[i].comments.push(da)
				})
			})
			await vMomentLikeFlag({
				momentId: moments.value[i].id
			}).then(res => {
				moments.value[i].isLiked = res.flag;
			})
			moments.value[i].images = []
			await vMomentImageFlag({
				momentId: moments.value[i].id
			}).then(res => {
				res.imageList.forEach(que => {
					const da = {
						emoji: que.emoji
					}
					moments.value[i].images.push(da)
				})

			})
		}
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
		// 修复：原 H5 分支的 router.back() 被注释掉了（只有小程序能返回），
		// 导致网页端点返回完全没反应。两端统一，并在页面栈为空时兜底跳首页。
		const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
		if (pages && pages.length > 1) {
			uni.navigateBack()
		} else {
			uni.reLaunch({ url: '/pages/homepage' })
		}
	}

	// ============ 发布动态 ============
	const showPublishModal = () => {
		showPublishPopup.value = true
	}

	const closePublishModal = () => {
		showPublishPopup.value = false
		resetNewMoment()
	}

	const resetNewMoment = () => {
		newMoment.value = {
			content: '',
			teaId: null,
			images: []
		}
	}

	const selectTea = (tea) => {
		newMoment.value.teaId = tea.id
	}

	const addImage = () => {
		if (newMoment.value.images.length >= 9) {
			showToast('最多上传9张图片')
			return
		}

		// 模拟添加图片
		const emojis = ['🍵', '🌱', '🍂', '🏺', '🍃', '🌿', '🍀', '🌾', '🌸']
		const eid = Math.floor(Math.random() * emojis.length);
		const randomEmoji = emojis[eid]

		newMoment.value.images.push({
			id: eid,
			emoji: randomEmoji
		})
	}

	const removeImage = (index) => {
		newMoment.value.images.splice(index, 1)
	}

	const publishMoment = async () => {
		if (!newMoment.value.content) {
			showToast('请输入内容')
			return
		}

		// 创建新动态
		const now = new Date()
		const timeStr = '刚刚'

		const newMomentItem = {
			userId: userCountStore.userId,
			userName: userCountStore.nickName,
			avatar: userCountStore.avatarEmoji,
			isVip: true,
			content: newMoment.value.content,
			teaTag: teaList.value.find(t => t.id === newMoment.value.teaId)?.name || '',
			teaId: newMoment.value.teaId,
		}
		let resId = null;
		await vMomentInsertMoment(newMomentItem).then(res => {
			resId = res.newId;
			showToast(res.msg)
		})
		for (let i = 0; i < newMoment.value.images.length; i++) {
			const data = {
				momentId: resId,
				emoji: newMoment.value.images[i].emoji
			}
			await vMomentInsertImage(data);
		}
		newMomentItem.images = newMoment.value.images
		newMomentItem.comments = []
		newMomentItem.likeCount = 0,
		newMomentItem.commentCount = 0,
		newMomentItem.id = resId
		moments.value.unshift(newMomentItem)
		closePublishModal()
	}

	// ============ 点赞功能 ============
	const toggleLike = async (momentId) => {
		console.log(momentId)
		const moment = moments.value.find(m => m.id === momentId)
		await vMomentUpdateLike({
			momentId: momentId
		}).then(res => {
			showToast(res.msg)
		})
		if (moment) {
			moment.isLiked = !moment.isLiked
			moment.likeCount += moment.isLiked ? 1 : -1
		}
	}

	// ============ 评论功能 ============
	const showComments = (momentId) => {
		console.log(momentId)
		const moment = moments.value.find(m => m.id === momentId)
		if (moment) {
			moment.showComments = !moment.showComments
		}
	}

	const submitComment = async (momentId) => {
		const moment = moments.value.find(m => m.id === momentId)
		if (!moment || !moment.newComment.trim()) return
		const newComment = {
			momentId: momentId,
			userId: userCountStore.userId,
			userName: userCountStore.nickName,
			userNickname: userCountStore.nickName,
			content: moment.newComment
		}
		await vMomentInsertComment(newComment).then(res => {
			showToast(res.msg)
		})
		moment.comments.push(newComment)
		moment.commentCount++
		moment.newComment = ''

	}

	// ============ 图片预览 ============
	const previewImage = (images, index) => {
		previewImageEmoji.value = images[index].emoji
		showPreviewPopup.value = true
	}

	const closePreview = () => {
		showPreviewPopup.value = false
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

	/* ========== 封面区 ========== */
	.cover-section {
		position: relative;
		margin-bottom: 60px;
	}

	.cover-image {
		height: 160px;
		background: linear-gradient(145deg, #2C5E30, #1E4322);
		position: relative;
		overflow: hidden;
	}

	.cover-overlay {
		position: absolute;
		inset: 0;
		background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" opacity="0.1"><path d="M20,30 Q40,10 60,30 Q80,50 60,70 Q40,90 20,70 Q0,50 20,30" fill="%23F5F0E8"/><path d="M70,20 Q85,35 70,50 Q55,65 40,50 Q25,35 40,20 Q55,5 70,20" fill="%23F5F0E8"/></svg>') repeat;
		background-size: 60px 60px;
	}

	.cover-text {
		position: absolute;
		bottom: 20px;
		left: 20px;
		color: #F5F0E8;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.cover-text h2 {
		font-size: 24px;
		font-weight: 700;
		margin: 0 0 4px;
	}

	.cover-text p {
		font-size: 13px;
		opacity: 0.9;
		margin: 0;
	}

	.user-profile {
		position: absolute;
		bottom: -30px;
		left: 20px;
		right: 20px;
		display: flex;
		align-items: center;
		gap: 16px;
		background: #FDFAF5;
		padding: 12px;
		border-radius: 16px;
		box-shadow: 0 4px 12px rgba(44, 94, 48, 0.1);
		border: 0.5px solid rgba(139, 90, 43, 0.1);
	}

	.profile-avatar {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		background: linear-gradient(145deg, #EAEFE0, #DDE2D5);
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid #FDFAF5;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.avatar-emoji {
		font-size: 32px;
	}

	.profile-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.profile-name {
		font-size: 16px;
		font-weight: 600;
		color: #2C2C2C;
	}

	.profile-stats {
		font-size: 12px;
		color: #8E8E8E;
	}

	/* ========== 朋友圈列表 ========== */
	.moments-content {
		padding: 40px 16px 80px;
		position: relative;
		z-index: 1;
	}

	/* 空状态 */
	.empty-moments {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40px 0;
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

	/* 动态卡片 */
	.moments-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.moment-card {
		background: #FDFAF5;
		border-radius: 16px;
		padding: 16px;
		border: 0.5px solid rgba(139, 90, 43, 0.1);
		box-shadow: 0 4px 12px rgba(44, 94, 48, 0.04);
	}

	/* 用户信息 */
	.moment-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 12px;
	}

	.user-avatar {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: linear-gradient(145deg, #EAEFE0, #DDE2D5);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.user-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.user-name {
		font-size: 15px;
		font-weight: 600;
		color: #2C2C2C;
	}

	.user-badge {
		font-size: 10px;
		padding: 2px 8px;
		background: rgba(44, 94, 48, 0.1);
		border-radius: 20px;
		color: #2C5E30;
		align-self: flex-start;
	}

	/* 动态内容 */
	.moment-content {
		margin-left: 60px;
	}

	.content-text {
		font-size: 14px;
		color: #2C2C2C;
		line-height: 1.6;
		margin: 0 0 12px;
		white-space: pre-wrap;
	}

	/* 图片网格 */
	.image-grid {
		display: grid;
		gap: 4px;
		margin-bottom: 12px;
	}

	.image-grid.grid-1 {
		grid-template-columns: 1fr;
	}

	.image-grid.grid-2 {
		grid-template-columns: repeat(2, 1fr);
	}

	.image-grid.grid-3 {
		grid-template-columns: repeat(3, 1fr);
	}

	.image-grid.grid-4,
	.image-grid.grid-5,
	.image-grid.grid-6 {
		grid-template-columns: repeat(3, 1fr);
	}

	.image-item {
		aspect-ratio: 1;
		background: linear-gradient(145deg, #EAEFE0, #DDE2D5);
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}

	.image-emoji {
		font-size: 24px;
	}

	/* 茶品标签 */
	.tea-tag {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 4px 12px;
		background: rgba(44, 94, 48, 0.05);
		border-radius: 20px;
		font-size: 12px;
		color: #2C5E30;
		margin-bottom: 12px;
	}

	.tag-icon {
		font-size: 14px;
	}

	/* 动态底部 */
	.moment-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 8px;
		border-top: 1px solid rgba(139, 90, 43, 0.08);
	}

	.moment-time {
		font-size: 11px;
		color: #8E8E8E;
	}

	.moment-actions {
		display: flex;
		gap: 16px;
	}

	.action-item {
		display: flex;
		align-items: center;
		gap: 4px;
		cursor: pointer;
	}

	.action-icon {
		font-size: 16px;
		transition: transform 0.2s;
	}

	.action-icon.liked {
		animation: likePop 0.3s ease;
	}

	@keyframes likePop {
		0% {
			transform: scale(1);
		}

		50% {
			transform: scale(1.3);
		}

		100% {
			transform: scale(1);
		}
	}

	.action-count {
		font-size: 12px;
		color: #5A5A5A;
	}

	/* 评论区域 */
	.comments-section {
		margin-top: 12px;
		padding-top: 12px;
		border-top: 1px solid rgba(139, 90, 43, 0.08);
	}

	.comments-list {
		background: rgba(139, 90, 43, 0.02);
		border-radius: 8px;
		padding: 8px;
		margin-bottom: 8px;
	}

	.comment-item {
		font-size: 13px;
		line-height: 1.8;
		color: #5A5A5A;
	}

	.comment-user {
		font-weight: 600;
		color: #2C5E30;
		margin-right: 4px;
	}

	.comment-text {
		color: #2C2C2C;
	}

	.comment-input-area {
		display: flex;
		gap: 8px;
	}

	.comment-input {
		flex: 1;
		height: 32px;
		padding: 0 12px;
		border: 1px solid rgba(139, 90, 43, 0.2);
		border-radius: 20px;
		font-size: 12px;
		color: #2C2C2C;
		background: #FFFFFF;
		outline: none;
	}

	.comment-input:focus {
		border-color: #2C5E30;
	}

	.comment-submit {
		padding: 0 16px;
		height: 32px;
		background: #2C5E30;
		border: none;
		border-radius: 20px;
		color: #FFFFFF;
		font-size: 12px;
		cursor: pointer;
	}

	.comment-submit:active {
		background: #1E4322;
	}

	/* ========== 底部发布按钮 ========== */
	.publish-btn {
		position: fixed;
		bottom: 80px;
		right: 16px;
		width: 56px;
		height: 56px;
		background: #2C5E30;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 12px rgba(44, 94, 48, 0.3);
		cursor: pointer;
		z-index: 30;
		transition: transform 0.2s;
	}

	.publish-btn:active {
		transform: scale(0.95);
	}

	.publish-icon {
		font-size: 24px;
		color: #F5F0E8;
	}

	/* ========== 发布弹窗 ========== */
	.publish-popup {
		max-width: 375px;
		height: 80%;
	}

	.publish-textarea {
		width: 100%;
		padding: 12px;
		border: 1px solid rgba(139, 90, 43, 0.2);
		border-radius: 12px;
		font-size: 14px;
		color: #2C2C2C;
		background: #FFFFFF;
		outline: none;
		resize: none;
		box-sizing: border-box;
		margin-bottom: 16px;
	}

	.publish-textarea:focus {
		border-color: #2C5E30;
		box-shadow: 0 0 0 2px rgba(44, 94, 48, 0.1);
	}

	.tea-selector,
	.image-uploader {
		margin-bottom: 16px;
	}

	.selector-label {
		font-size: 13px;
		color: #5A5A5A;
		margin-bottom: 8px;
	}

	.tea-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.tea-tag-option {
		padding: 6px 12px;
		background: #FFFFFF;
		border: 1px solid rgba(139, 90, 43, 0.2);
		border-radius: 20px;
		font-size: 12px;
		color: #5A5A5A;
		cursor: pointer;
		transition: all 0.2s;
	}

	.tea-tag-option.active {
		background: #2C5E30;
		border-color: #2C5E30;
		color: #FFFFFF;
	}

	.upload-area {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.upload-preview {
		position: relative;
		width: 70px;
		height: 70px;
		background: linear-gradient(145deg, #EAEFE0, #DDE2D5);
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.preview-emoji {
		font-size: 28px;
	}

	.remove-image {
		position: absolute;
		top: -4px;
		right: -4px;
		width: 20px;
		height: 20px;
		background: #CD5C5C;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #FFFFFF;
		font-size: 12px;
		cursor: pointer;
	}

	.upload-btn {
		width: 70px;
		height: 70px;
		background: rgba(44, 94, 48, 0.05);
		border: 1px dashed rgba(44, 94, 48, 0.3);
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}

	.upload-icon {
		font-size: 24px;
		color: #2C5E30;
	}

	/* ========== 图片预览 ========== */
	.preview-container {
		position: relative;
		width: 80vw;
		height: 80vw;
		max-width: 300px;
		max-height: 300px;
		background: rgba(0, 0, 0, 0.9);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.preview-image {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.preview-emoji-large {
		font-size: 80px;
		color: #FFFFFF;
	}

	.preview-close {
		position: absolute;
		top: 10px;
		right: 10px;
		width: 30px;
		height: 30px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #FFFFFF;
		font-size: 18px;
		cursor: pointer;
	}

	/* ========== Vant Popup 样式覆盖 ========== */
	:deep(.van-popup) {
		background: transparent;
	}

	.popup-content {
		background: #FDFAF5;
		border-radius: 20px 20px 0 0;
		overflow: hidden;
		width: 100%;
		height: 100%;
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
		background: #FFFFFF;
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

	/* 滚动条隐藏 */
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
		.publish-btn { right: calc((100vw - 360px) / 2 + 16px); }
		.toast { max-width: 360px; margin: 0 auto; }
	}
	}
	/* #endif */
</style>