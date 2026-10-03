<template>
  <div class="tea-app checkout-page">
    <!-- 宣纸底纹背景 -->
    <div class="paper-texture"></div>
    
    <!-- 顶部导航 -->
    <header class="tea-header">
      <div class="header-left" @click="goBack">
        <van-icon name="arrow-left" size="20" color="#2C5E30" />
      </div>
      <h1 class="page-title">确认订单</h1>
      <div class="header-right" @click="goToHelp">
        <van-icon name="question-o" size="20" color="#8B5A2B" />
      </div>
    </header>

    <!-- 主内容区（可滚动） -->
    <main class="checkout-content">
      
      <!-- 地址卡片（点击弹出地址表单） -->
      <section class="address-card" @click="showAddressForm">
        <div class="address-info">
          <div class="user-info">
            <span class="user-name">{{ selectedAddress.name }}</span>
            <span class="user-phone">{{ selectedAddress.phone }}</span>
            <span v-if="selectedAddress.isDefault" class="default-badge">默认</span>
          </div>
          <div class="address-detail">
            <span class="address-tag">{{ selectedAddress.tag }}</span>
            <span class="address-text">{{ selectedAddress.fullAddress }}</span>
          </div>
        </div>
        <div class="address-arrow">
          <van-icon name="arrow" size="16" color="#8B5A2B" />
        </div>
      </section>

      <!-- 店铺商品分组 -->
      <section class="shops-section">
        <div v-for="(shop, shopIndex) in orderShops" :key="shop.id" class="shop-card">
          <!-- 店铺头 -->
          <div class="shop-header">
            <van-icon name="shop-o" size="16" color="#2C5E30" />
            <span class="shop-name">{{ shop.name }}</span>
            <span class="shop-badge">{{ shop.badge }}</span>
          </div>

          <!-- 商品列表 -->
          <div v-for="(item, itemIndex) in shop.items" :key="item.id" class="order-item">
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

          <!-- 店铺小计 -->
          <div class="shop-subtotal">
            <span class="subtotal-label">店铺小计</span>
            <span class="subtotal-price">¥{{ shop.subtotal }}</span>
          </div>

          <!-- 店铺备注 -->
          <div class="shop-remark" @click="addRemark(shopIndex)">
            <van-icon name="edit" size="14" color="#8E8E8E" />
            <span class="remark-text">{{ shop.remark || '给商家留言...' }}</span>
          </div>
        </div>
      </section>

      <!-- 配送方式 -->
      <section class="delivery-section">
        <div class="delivery-item" @click="showDeliveryMethodPicker">
          <span class="item-label">配送方式</span>
          <div class="item-value">
            <span class="value-text">{{ deliveryMethod }}</span>
            <van-icon name="arrow" size="14" color="#8B5A2B" />
          </div>
        </div>
        <div class="delivery-item" @click="showInvoicePickero">
          <span class="item-label">发票信息</span>
          <div class="item-value">
            <span class="value-text">{{ invoiceInfo }}</span>
            <van-icon name="arrow" size="14" color="#8B5A2B" />
          </div>
        </div>
      </section>

      <!-- 优惠券/积分（实时更新版） -->
      <section class="discount-section">
        <div class="discount-item" @click="showCouponPickero">
          <span class="item-label">优惠券</span>
          <div class="item-value">
            <span class="value-text coupon-text">{{ selectedCoupon ? selectedCoupon.name : '暂无可用的优惠券' }}</span>
            <van-icon name="arrow" size="14" color="#8B5A2B" />
          </div>
        </div>
        
        <!-- 茶积分数字输入框（实时更新） -->
        <div class="points-item">
          <div class="points-header">
            <span class="item-label">茶积分</span>
            <span class="points-info">可用 {{ userPoints }} 积分 (10积分=1元)</span>
          </div>
          <div class="points-input-container">
            <input 
              type="number" 
              v-model.number="usedPoints" 
              :min="0" 
              :max="userPoints" 
              step="10"
              class="points-input"
              @input="handlePointsInput"
              @blur="validatePoints"
              placeholder="输入使用积分数"
            />
            <span class="points-unit">积分</span>
          </div>
          <div class="points-deduction">
            可抵扣 <span class="deduction-amount">¥{{ pointsDeduction }}</span>
          </div>
          <div class="points-actions">
            <button class="points-btn" @click="setPoints(0)">清空</button>
            <button class="points-btn" @click="setPoints(userPoints)">全部使用</button>
          </div>
        </div>
      </section>

      <!-- 支付方式 -->
      <section class="payment-section">
        <div class="section-title">支付方式</div>
        <div class="payment-list">
          <div 
            v-for="method in paymentMethods" 
            :key="method.id"
            class="payment-item"
            :class="{ 'active': selectedPayment === method.id }"
            @click="selectPayment(method.id)"
          >
            <div class="payment-left">
              <span class="payment-icon">{{ method.icon }}</span>
              <span class="payment-name">{{ method.name }}</span>
            </div>
            <div class="payment-check">
              <div class="radio-dot" :class="{ 'checked': selectedPayment === method.id }"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- 底部留白 -->
      <div class="bottom-space"></div>
    </main>

    <!-- 底部结算栏 -->
    <footer class="checkout-footer">
      <div class="footer-left">
        <div class="total-info">
          <span class="total-label">共 {{ totalCount }} 件商品 合计</span>
          <span class="total-price">¥{{ finalAmount }}</span>
        </div>
        <div class="discount-info">
          已优惠 ¥{{ discountAmount }}
          <span v-if="deliveryTime.fee > 0" class="delivery-fee">(含运费 ¥{{ deliveryTime.fee }})</span>
        </div>
      </div>
      <button class="submit-btn" @click="submitOrder">
        提交订单
      </button>
    </footer>

    <!-- 轻提示 -->
    <div class="toast" :class="{ visible: toastVisible }">
      <div class="toast-dot" />
      <span>{{ toastMessage }}</span>
    </div>

    <!-- ========== 地址表单弹窗========== -->
    <div v-if="showAddressModal" class="modal">
      <!-- 半透明背景点击关闭 -->
      <div class="modal-mask" @click="closeAddressForm"></div>
      <div class="modal-content address-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-title">管理收货地址</div>
          <div class="modal-close" @click="closeAddressForm">✕</div>
        </div>
        
        <div class="address-list">
          <div 
            v-for="address in addressList" 
            :key="address.id"
            class="address-item"
            :class="{ 'selected': selectedAddress.id === address.id }"
            @click="selectAddress(address)"
          >
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
            <div class="address-item-right">
              <div class="radio-dot" :class="{ 'checked': selectedAddress.id === address.id }"></div>
            </div>
          </div>
        </div>

        <div class="add-address-btn" @click="showAddAddressForm">
          <van-icon name="plus" size="16" color="#2C5E30" />
          <span>添加新地址</span>
        </div>

        <div class="modal-buttons">
          <button class="modal-btn cancel" @click="closeAddressForm">取消</button>
          <button class="modal-btn confirm" @click="confirmAddress">确定</button>
        </div>
      </div>
    </div>

    <!-- 新增地址表单弹窗（修复版 + 地区选择器） -->
    <div v-if="showAddAddressModal" class="modal">
      <div class="modal-mask" @click="closeAddAddressForm"></div>
      <div class="modal-content address-form-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-title">新增收货地址</div>
          <div class="modal-close" @click="closeAddAddressForm">✕</div>
        </div>
        
        <div class="form-group">
          <label class="form-label">收货人</label>
          <input 
            type="text" 
            v-model="newAddress.name" 
            class="form-input"
            placeholder="请输入姓名"
            @click.stop
            @focus.stop
          />
        </div>

        <div class="form-group">
          <label class="form-label">手机号码</label>
          <input 
            type="tel" 
            v-model="newAddress.phone" 
            class="form-input"
            placeholder="请输入手机号"
            @click.stop
            @focus.stop
          />
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
          <input 
            type="text" 
            v-model="newAddress.detail" 
            class="form-input"
            placeholder="街道、门牌号等"
            @click.stop
            @focus.stop
          />
        </div>

        <div class="form-group">
          <label class="form-label">地址标签</label>
          <div class="tag-selector">
            <span 
              v-for="tag in addressTags" 
              :key="tag"
              class="tag-option"
              :class="{ 'active': newAddress.tag === tag }"
              @click="newAddress.tag = tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <div class="form-group checkbox-group">
          <label class="checkbox-label">
			<checkbox :value="newAddress.isDefault" @click="checkBoxFrom(newAddress.isDefault)"/>
            <span>设为默认地址</span>
          </label>
        </div>

        <div class="modal-buttons">
          <button class="modal-btn cancel" @click="closeAddAddressForm">取消</button>
          <button class="modal-btn confirm" @click="saveNewAddress">保存</button>
        </div>
      </div>
    </div>

    <!-- 地区选择弹窗（使用 Vant Weapp 组件） -->
    <van-popup
      :show="showAreaPopup"
      position="bottom"
      @close="closeAreaPicker"
      custom-style="height: 40%; z-index: 2000;"
      round
	  :z-index="2000"
    >
      <van-area
        :area-list="areaList"
        :columns-num="3"
        @confirm="onAreaConfirm"
        @cancel="closeAreaPicker"
        :title="'选择所在地区'"
      />
    </van-popup>

    <!-- 配送方式选择面板 -->
    <van-popup
      :show="showDeliveryPicker"
      position="bottom"
      @close="closeDeliveryPicker"
      round
    >
      <div class="popup-content">
        <div class="popup-title">选择配送方式</div>
        <div 
          v-for="method in deliveryMethods" 
          :key="method.id"
          class="popup-item"
          :class="{ 'selected': deliveryMethod === method.name }"
          @click="selectDeliveryMethod(method)"
        >
          <span class="item-name">{{ method.name }}</span>
          <span class="item-desc">{{ method.desc }}</span>
          <span v-if="deliveryMethod === method.name" class="selected-icon">✓</span>
        </div>
        <div class="popup-cancel" @click="closeDeliveryPicker">取消</div>
      </div>
    </van-popup>

    <!-- 发票信息选择面板 -->
    <van-popup
      :show="showInvoicePicker"
      position="bottom"
      @close="closeInvoicePicker"
      round
    >
      <div class="popup-content">
        <div class="popup-title">选择发票信息</div>
        <div 
          v-for="option in invoiceOptions" 
          :key="option.id"
          class="popup-item"
          :class="{ 'selected': invoiceInfo === option.name }"
          @click="selectInvoiceOption(option)"
        >
          <span class="item-name">{{ option.name }}</span>
          <span class="item-desc">{{ option.desc }}</span>
          <span v-if="invoiceInfo === option.name" class="selected-icon">✓</span>
        </div>
        <div class="popup-cancel" @click="closeInvoicePicker">取消</div>
      </div>
    </van-popup>

    <!-- 优惠券选择面板 -->
    <van-popup
      :show="showCouponPicker"
      position="bottom"
      @close="closeCouponPicker"
      round
    >
      <div class="popup-content">
        <div class="popup-title">选择优惠券</div>
        <div 
          v-for="coupon in couponList" 
          :key="coupon.id"
          class="popup-item coupon-item"
          :class="{ 'selected': selectedCoupon && selectedCoupon.id === coupon.id, 'disabled': !coupon.available }"
          @click="selectCoupon(coupon)"
        >
          <div class="coupon-info">
            <span class="coupon-value">¥{{ coupon.value }}</span>
            <span class="coupon-name">{{ coupon.name }}</span>
            <span class="coupon-condition">{{ coupon.condition }}</span>
          </div>
          <span v-if="selectedCoupon && selectedCoupon.id === coupon.id" class="selected-icon">✓</span>
          <span v-if="!coupon.available" class="disabled-tag">不可用</span>
        </div>
        <div class="popup-item" @click="selectCoupon('')">
          <span class="item-name">不使用优惠券</span>
          <span v-if="!selectedCoupon" class="selected-icon">✓</span>
        </div>
        <div class="popup-cancel" @click="closeCouponPicker">取消</div>
      </div>
    </van-popup>

    <!-- 商家留言输入框（修复版） -->
    <div v-if="showRemarkInput" class="modal">
      <div class="modal-mask" @click="closeRemarkInput"></div>
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-title">给商家留言</div>
          <div class="modal-close" @click="closeRemarkInput">✕</div>
        </div>
        <textarea 
          v-model="tempRemark" 
          class="remark-textarea"
          placeholder="请输入留言内容（如：麻烦包装结实些）"
          rows="4"
          @click.stop
          @focus.stop
        ></textarea>
        <div class="modal-buttons">
          <button class="modal-btn cancel" @click="closeRemarkInput">取消</button>
          <button class="modal-btn confirm" @click="saveRemark">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {userAddressList, 
		userAddressUpdateInsert, 
		userAddressUpdateIsDefault,
		VOrderData,
		VOrderItemDetail,
		VUserCouponService,
		insertOrderData,
		insertOrderItemData,
		delAllCartItem} from '../api/index.js'
import { onLoad } from '@dcloudio/uni-app'
import { areaList } from '@vant/area-data';
import { countStore } from "../store/count.js"

const userCountStore = countStore()
// ============ 状态定义 ============
const toastVisible = ref(false)
const toastMessage = ref('')
const toastTimer = ref(null)

// 弹窗控制
const showAddressModal = ref(false)
const showAddAddressModal = ref(false)
const showAreaPopup = ref(false) // 地区选择弹窗
const showDeliveryPicker = ref(false)
const showInvoicePicker = ref(false)
const showCouponPicker = ref(false)
const showDeliveryTimePicker = ref(false)
const showRemarkInput = ref(false)
const currentShopIndex = ref(0)
const tempRemark = ref('')

// ============ 地址相关 ============
const addressTags = ['家', '公司', '学校']

const addressList = ref([])

const selectedAddress = ref({})

const newAddress = ref({
  name: '',
  phone: '',
  tag: '家',
  region: '',
  regionText: '',
  detail: '',
  isDefault: false
})

onLoad((option) => {
	addressHandle()
	orderShops.value = [...userCountStore.cartOrderShops]
	orderShops.value.forEach(res => {
		res.items.forEach(ele => {
			couponThemeList.value.push(ele.themeId)
		})
	})
	selectCouponList()
})

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
			if(dat.isDefault == 1) selectedAddress.value = dat
		})
	})
}

// 获取用户拥有的优惠券
const selectCouponList = async() => {
	couponList.value = []
	VUserCouponService().then(res => {
		res.vUserCouponList.forEach(ele => {
			let flag = couponThemeList.value.includes(ele.themeId) &&
							ele.availableStatus == '可用' &&
							finalAmount.value >= ele.minOrderAmount
			if(ele.themeId == null) flag = ele.availableStatus == '可用' &&
							finalAmount.value >= ele.minOrderAmount
			const data = {
				id: ele.couponCodeId,
				name: ele.couponName,
				value: ele.couponValue,
				condition: ele.couponCondition,
				available: flag
			}
			couponList.value.push(data)
		})
	})
}

// 选中默认地址
const checkBoxFrom = (res)=> {
	newAddress.value.isDefault = !res
}

// 显示地址选择弹窗
const showAddressForm = () => {
  showAddressModal.value = true
}

const closeAddressForm = () => {
  showAddressModal.value = false
}

const selectAddress = (address) => {
  selectedAddress.value = address
}

const confirmAddress = async() => {
  showToast(`已选择：${selectedAddress.value.name} ${selectedAddress.value.phone}`)
  const dat = {
	  id: selectedAddress.value.id
  }
  await userAddressUpdateIsDefault(dat).then(res =>{
	  showToast(res.msg)
  })
  addressHandle()
  closeAddressForm()
}

// 显示新增地址表单
const showAddAddressForm = () => {
  showAddAddressModal.value = true
}

const closeAddAddressForm = () => {
  showAddAddressModal.value = false
  // 重置表单
  newAddress.value = {
    name: '',
    phone: '',
    tag: '家',
    region: '',
    regionText: '',
    detail: '',
    isDefault: false
  }
}

// 显示地区选择器
const showAreaPicker = () => {
  showAreaPopup.value = true
}

const closeAreaPicker = () => {
  showAreaPopup.value = false
}

// 地区选择确认
const onAreaConfirm = (event) => {
  const values = event.detail.values
  if (values && values.length > 0) {
    const province = values[0]?.name || ''
    const city = values[1]?.name || ''
    const county = values[2]?.name || ''
    
    // 拼接地区代码
    const codes = []
    if (values[0]?.code) codes.push(values[0].code)
    if (values[1]?.code) codes.push(values[1].code)
    if (values[2]?.code) codes.push(values[2].code)
    
    newAddress.value.region = codes.join(',')
    newAddress.value.regionText = [province, city, county].filter(Boolean).join(' ')
  }
  closeAreaPicker()
}

const saveNewAddress = async() => {
  // 表单验证
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
  	// id: newAddr.id,
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
  	isDefault: newAddr.isDefault? 1: 0
  }
  console.log(dat)
  await userAddressUpdateInsert(dat).then(res => {
  	showToast(res.msg)
  	addressHandle()
  })
  closeAddAddressForm()
}

// ============ 送达时间 ============
const deliveryTime = ref({
	id: '',
	deliveryTime: '',
	deliveryMethod: '',
	fee: 0
})

// ============ 配送方式 ============
const deliveryMethod = ref('')
const deliveryMethods = ref([
  { id: 'sf', name: '顺丰快递', desc: '预计1-2天送达，运费12元', value: 12},
  { id: 'yt', name: '圆通快递', desc: '预计2-3天送达，运费8元', value: 8 },
  { id: 'yz', name: '邮政快递', desc: '预计3-5天送达，运费6元', value: 6 }
])

// ============ 发票信息 ============
const invoiceInfo = ref('不开发票')
const invoiceOptions = ref([
  { id: 'none', name: '不开发票', desc: '无需发票' },
  { id: 'personal', name: '个人发票', desc: '发票类型：个人' }
])

// ============ 优惠券 ============
const selectedCoupon = ref('')
const couponList = ref([])
const couponThemeList = ref([])

// ============ 茶积分（实时更新版）============
const userPoints = ref(1280)
const usedPoints = ref(0)

// 计算积分抵扣金额（实时计算）
const pointsDeduction = computed(() => {
  return (usedPoints.value / 10).toFixed(2)
})

// 处理积分输入（实时更新）
const handlePointsInput = (event) => {
  let value = parseInt(event.target.value)
  if (isNaN(value)) value = 0
  if (value < 0) value = 0
  if (value > userPoints.value) value = userPoints.value
  usedPoints.value = value
}

// 验证积分输入（失去焦点时）
const validatePoints = () => {
  if (usedPoints.value < 0) usedPoints.value = 0
  if (usedPoints.value > userPoints.value) usedPoints.value = userPoints.value
  // 确保是10的倍数（可选）
  usedPoints.value = Math.floor(usedPoints.value / 10) * 10
}

// 设置积分使用量
const setPoints = (points) => {
  usedPoints.value = points
}

// ============ 支付方式 ============
const selectedPayment = ref('wechat')
const paymentMethods = ref([
  { id: 'wechat', name: '微信支付', icon: '🟢' },
  { id: 'alipay', name: '支付宝', icon: '🔵' },
  { id: 'balance', name: '余额支付', icon: '🟤' }
])

// ============ 订单店铺数据 ============
const orderShops = ref([])

// ============ 计算属性 ============
const totalCount = computed(() => {
  return orderShops.value.reduce((sum, shop) => {
    return sum + shop.items.reduce((itemSum, item) => itemSum + item.quantity, 0)
  }, 0)
})

const subtotalAmount = computed(() => {
  const amount = orderShops.value.reduce((sum, shop) => {
    return sum + parseFloat(shop.subtotal)
  }, 0)
  return amount
})

const couponDiscount = computed(() => {
  if (selectedCoupon.value) {
    return selectedCoupon.value.value
  }
  return 0
})

const pointsDiscount = computed(() => {
  return usedPoints.value / 10
})

const discountAmount = computed(() => {
  return (couponDiscount.value + pointsDiscount.value).toFixed(2)
})

const finalAmount = computed(() => {
  const amount = subtotalAmount.value - couponDiscount.value - pointsDiscount.value + deliveryTime.value.fee
  return amount.toFixed(2)
})

// ============ 交互方法 ============
const showToast = (msg, duration = 2000) => {
  if (toastTimer.value) clearTimeout(toastTimer.value)
  toastMessage.value = msg
  toastVisible.value = true
  toastTimer.value = setTimeout(() => {
    toastVisible.value = false
  }, duration)
}

const goBack = () => {
  uni.navigateTo({
  	url: '/pages/gowuc'
  });
}

const goToHelp = () => {
  showToast('在线客服 400-888-1234')
}

// ============ 配送方式功能 ============
const showDeliveryMethodPicker = () => {
  showDeliveryPicker.value = true
}

const closeDeliveryPicker = () => {
  showDeliveryPicker.value = false
}

const selectDeliveryMethod = (method) => {
  deliveryMethod.value = method.name
  deliveryTime.value.id = method.id
  deliveryTime.value.deliveryTime = method.desc
  deliveryTime.value.deliveryMethod = method.name
  deliveryTime.value.fee = method.value
  showToast(`已选择：${method.name}`)
  closeDeliveryPicker()
}

// ============ 发票信息功能 ============
const showInvoicePickero = () => {
  showInvoicePicker.value = true
}

const closeInvoicePicker = () => {
  showInvoicePicker.value = false
}

const selectInvoiceOption = (option) => {
  invoiceInfo.value = option.name
  showToast(`已选择：${option.name}`)
  closeInvoicePicker()
}

// ============ 优惠券功能 ============
const showCouponPickero = () => {
  showCouponPicker.value = true
}

const closeCouponPicker = () => {
  showCouponPicker.value = false
}

const selectCoupon = (coupon) => {
  if (coupon && !coupon.available) {
    showToast('该优惠券不可用', 1500)
    return
  }
  selectedCoupon.value = coupon
  if (coupon) {
    showToast(`已使用：${coupon.name}`)
  } else {
    showToast('不使用优惠券')
  }
  closeCouponPicker()
}

// ============ 商家留言功能 ============
const addRemark = (shopIndex) => {
  currentShopIndex.value = shopIndex
  tempRemark.value = orderShops.value[shopIndex].remark
  showRemarkInput.value = true
}

const closeRemarkInput = () => {
  showRemarkInput.value = false
}

const saveRemark = () => {
  orderShops.value[currentShopIndex.value].remark = tempRemark.value
  showToast('留言已保存')
  closeRemarkInput()
}

// ============ 其他功能 ============
const selectPayment = (id) => {
  selectedPayment.value = id
}

// 使用时间戳作为流水号
function generateOrderNo() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const dateStr = `${year}${month}${day}`;

  // 使用毫秒数作为流水号（取后4位或完整）
  const ms = String(now.getTime()).slice(-4);
  return `ORD${dateStr}${ms}`;
}

const submitOrder = async() => {
  const summary = `
    订单提交成功！
    收货人：${selectedAddress.value.name} ${selectedAddress.value.phone}
    地址：${selectedAddress.value.fullAddress}
    商品总额：¥${subtotalAmount.value.toFixed(2)}
    优惠券抵扣：-¥${couponDiscount.value.toFixed(2)}
    积分抵扣：-¥${pointsDiscount.value.toFixed(2)}
    运费：+¥${deliveryTime.value.fee}
    实付金额：¥${finalAmount.value}
    支付方式：${paymentMethods.value.find(m => m.id === selectedPayment.value).name}
  `
  const data = {
	  orderNo: generateOrderNo(),
	  userId: null,
	  addressId: selectedAddress.value.id,
	  shopId: orderShops.value[0].id,
	  shopName: orderShops.value[0].name,
	  shopBadge: orderShops.value[0].badge,
	  status: 'unpaid',
	  totalAmount: subtotalAmount.value,
	  discountAmount: couponDiscount.value + pointsDiscount.value,
	  pointsDiscount: pointsDiscount.value,
	  couponDiscount: couponDiscount.value,
	  deliveryFee: deliveryTime.value.fee,
	  payAmount: finalAmount.value,
	  couponId: selectedCoupon.value.id,
	  usedPoints: usedPoints.value,
	  remark: orderShops.value[0].remark,
	  deliveryTime: deliveryTime.value.deliveryTime,
	  deliveryMethod: deliveryTime.value.deliveryMethod,
	  invoiceType: invoiceInfo.value,
	  paymentMethod: selectedPayment.value
  }
  let orderId = '';
  await insertOrderData(data).then(res => {
	  orderId = res.orderId;
  })
  let orderItemList = []
  orderShops.value.forEach(e => {
	  e.items.forEach(l => {
		  const zj = l.price * l.quantity
		  const d = {
			  orderId: orderId,
			  productId: l.id,
			  productName: l.name,
			  productSpec: l.spec,
			  productEmoji: l.emoji,
			  price: l.price,
			  quantity: l.quantity,
			  subtotal: zj
		  }
		  orderItemList.push(d)
	  })
  })
  await insertOrderItemData(orderItemList)
  showToast(summary, 3000)
  await delAllCartItem();
  uni.redirectTo({
  	url: '/pages/dingdan'
  });
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

/* ========== 主内容区 ========== */
.checkout-content {
  padding: 16px;
  padding-bottom: 80px;
  position: relative;
  z-index: 1;
}

/* ========== 地址卡片 ========== */
.address-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #FDFAF5;
  border-radius: 16px;
  margin-bottom: 12px;
  border: 0.5px solid rgba(139,90,43,0.1);
  box-shadow: 0 4px 12px rgba(44,94,48,0.04);
  cursor: pointer;
}

.address-info {
  flex: 1;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #2C2C2C;
}

.user-phone {
  font-size: 14px;
  color: #5A5A5A;
}

.default-badge {
  padding: 2px 8px;
  background: rgba(44,94,48,0.1);
  border-radius: 20px;
  font-size: 10px;
  color: #2C5E30;
}

.address-detail {
  display: flex;
  align-items: center;
  gap: 8px;
}

.address-tag {
  padding: 2px 8px;
  background: rgba(139,90,43,0.1);
  border-radius: 20px;
  font-size: 10px;
  color: #8B5A2B;
}

.address-text {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.address-arrow {
  padding: 8px;
}

/* ========== 送达时间 ========== */
.delivery-time {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #FDFAF5;
  border-radius: 12px;
  margin-bottom: 12px;
  border: 0.5px solid rgba(139,90,43,0.1);
  cursor: pointer;
}

.time-label {
  font-size: 14px;
  color: #5A5A5A;
}

.time-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-text {
  font-size: 13px;
  color: #2C5E30;
}

.time-fee {
  font-size: 12px;
  color: #CD5C5C;
  font-weight: 500;
}

/* ========== 店铺卡片 ========== */
.shops-section {
  margin-bottom: 12px;
}

.shop-card {
  background: #FDFAF5;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  border: 0.5px solid rgba(139,90,43,0.1);
  box-shadow: 0 4px 12px rgba(44,94,48,0.04);
}

.shop-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px dashed rgba(139,90,43,0.2);
  margin-bottom: 12px;
}

.shop-name {
  font-size: 15px;
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

.order-item {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
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
  font-size: 15px;
  font-weight: 600;
  color: #8B5A2B;
  display: block;
}

.item-quantity {
  font-size: 12px;
  color: #8E8E8E;
}

.shop-subtotal {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid rgba(139,90,43,0.08);
  border-bottom: 1px solid rgba(139,90,43,0.08);
  margin: 12px 0;
}

.subtotal-label {
  font-size: 13px;
  color: #5A5A5A;
}

.subtotal-price {
  font-size: 16px;
  font-weight: 700;
  color: #8B5A2B;
}

.shop-remark {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: rgba(139,90,43,0.04);
  border-radius: 8px;
  cursor: pointer;
}

.remark-text {
  font-size: 12px;
  color: #8E8E8E;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ========== 配送方式 ========== */
.delivery-section,
.discount-section {
  background: #FDFAF5;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  border: 0.5px solid rgba(139,90,43,0.1);
}

.delivery-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  cursor: pointer;
}

.delivery-item:not(:last-child) {
  border-bottom: 1px solid rgba(139,90,43,0.08);
}

/* ========== 优惠券/积分 ========== */
.discount-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  cursor: pointer;
  border-bottom: 1px solid rgba(139,90,43,0.08);
}

.points-item {
  padding: 12px 0;
}

.points-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.points-info {
  font-size: 12px;
  color: #DAA520;
}

.points-input-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.points-input {
  flex: 1;
  height: 40px;
  padding: 0 12px;
  border: 1px solid rgba(139,90,43,0.2);
  border-radius: 8px;
  font-size: 14px;
  color: #2C2C2C;
  background: #FFFFFF;
  outline: none;
}

.points-input:focus {
  border-color: #2C5E30;
  box-shadow: 0 0 0 2px rgba(44,94,48,0.1);
}

.points-unit {
  font-size: 12px;
  color: #5A5A5A;
  min-width: 40px;
}

.points-deduction {
  font-size: 13px;
  color: #5A5A5A;
  margin-bottom: 8px;
}

.deduction-amount {
  color: #2C5E30;
  font-weight: 600;
  font-size: 16px;
}

.points-actions {
  display: flex;
  gap: 8px;
}

.points-btn {
  flex: 1;
  padding: 8px 0;
  background: rgba(44,94,48,0.05);
  border: 1px solid rgba(44,94,48,0.2);
  border-radius: 6px;
  font-size: 12px;
  color: #2C5E30;
  cursor: pointer;
  transition: all 0.2s;
}

.points-btn:active {
  background: rgba(44,94,48,0.1);
}

.item-label {
  font-size: 14px;
  color: #5A5A5A;
}

.item-value {
  display: flex;
  align-items: center;
  gap: 8px;
}

.value-text {
  font-size: 13px;
  color: #2C5E30;
}

.coupon-text {
  color: #DAA520;
}

/* ========== 支付方式 ========== */
.payment-section {
  background: #FDFAF5;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  border: 0.5px solid rgba(139,90,43,0.1);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #2C2C2C;
  margin-bottom: 12px;
  padding-left: 8px;
  position: relative;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 14px;
  background: #2C5E30;
  border-radius: 2px;
}

.payment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  cursor: pointer;
}

.payment-item:not(:last-child) {
  border-bottom: 1px solid rgba(139,90,43,0.08);
}

.payment-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.payment-icon {
  font-size: 20px;
}

.payment-name {
  font-size: 14px;
  color: #2C2C2C;
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

/* ========== 底部结算栏 ========== */
.checkout-footer {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 375px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(253,250,245,0.95);
  backdrop-filter: blur(10px);
  border-top: 0.5px solid rgba(139,90,43,0.15);
  box-shadow: 0 -4px 12px rgba(44,94,48,0.04);
  z-index: 20;
  box-sizing: border-box;
}

.footer-left {
  flex: 1;
}

.total-info {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}

.total-label {
  font-size: 13px;
  color: #5A5A5A;
}

.total-price {
  font-size: 20px;
  font-weight: 700;
  color: #8B5A2B;
}

.discount-info {
  font-size: 11px;
  color: #CD5C5C;
}

.delivery-fee {
  color: #8E8E8E;
  margin-left: 4px;
}

.submit-btn {
  padding: 12px 28px;
  background: #CD5C5C;
  border: none;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 600;
  color: #F5F0E8;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 8px 16px -4px rgba(205,92,92,0.3);
  font-family: '思源宋体', serif;
  letter-spacing: 2px;
}

.submit-btn:active {
  transform: scale(0.95);
  background: #B84C4C;
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

/* ========== 模态框样式（修复版）========== */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  animation: fadeIn 0.2s ease;
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 340px;
  max-height: 80vh;
  overflow-y: auto;
  background: #FDFAF5;
  border-radius: 20px;
  padding: 20px;
  animation: scaleIn 0.2s ease;
  z-index: 1001;
}

.address-modal {
  max-width: 360px;
}

.address-form-modal {
  max-width: 360px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #2C2C2C;
  position: relative;
}

.modal-close {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #8E8E8E;
  cursor: pointer;
  border-radius: 50%;
  background: rgba(139,90,43,0.05);
}

.modal-close:active {
  background: rgba(139,90,43,0.1);
}

/* 地址列表 */
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
  border: 1px solid rgba(139,90,43,0.1);
  border-radius: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.address-item:hover {
  background: rgba(44,94,48,0.02);
}

.address-item.selected {
  border-color: #2C5E30;
  background: rgba(44,94,48,0.02);
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
  font-size: 15px;
  font-weight: 600;
  color: #2C2C2C;
}

.address-item-phone {
  font-size: 13px;
  color: #5A5A5A;
}

.default-tag {
  padding: 2px 6px;
  background: rgba(44,94,48,0.1);
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
  background: rgba(139,90,43,0.1);
  border-radius: 4px;
  font-size: 10px;
  color: #8B5A2B;
}

.address-text {
  font-size: 12px;
  color: #666;
}

.address-item-right {
  margin-left: 12px;
}

.add-address-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: rgba(44,94,48,0.05);
  border: 1px dashed rgba(44,94,48,0.3);
  border-radius: 12px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-address-btn:active {
  background: rgba(44,94,48,0.1);
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
  font-size: 14px;
  color: #5A5A5A;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  height: 44px;
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

.region-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 12px;
  border: 1px solid rgba(139,90,43,0.2);
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
  padding: 8px 16px;
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
  border: 2px solid rgba(139,90,43,0.3);
  border-radius: 4px;
  position: relative;
}

.checkbox-input:checked + .checkbox-custom {
  background: #2C5E30;
  border-color: #2C5E30;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #FFFFFF;
  font-size: 12px;
}

/* 模态框按钮 */
.modal-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.modal-btn {
  flex: 1;
  height: 44px;
  border: none;
  border-radius: 22px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-btn.cancel {
  background: #F0E9E0;
  color: #5A5A5A;
}

.modal-btn.cancel:active {
  background: #E8DDD2;
}

.modal-btn.confirm {
  background: #2C5E30;
  color: #FFFFFF;
}

.modal-btn.confirm:active {
  background: #1E4322;
}

/* 备注输入框 */
.remark-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(139,90,43,0.2);
  border-radius: 8px;
  font-size: 14px;
  color: #2C2C2C;
  background: #FFFFFF;
  outline: none;
  resize: none;
  box-sizing: border-box;
  margin: 16px 0;
}

.remark-textarea:focus {
  border-color: #2C5E30;
  box-shadow: 0 0 0 2px rgba(44,94,48,0.1);
}

/* ========== Vant Popup 样式覆盖 ========== */
:deep(.van-popup) {
  background: transparent;
}

.popup-content {
  background: #FDFAF5;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  overflow: hidden;
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

.popup-item {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid rgba(139,90,43,0.05);
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
  background: #FFFFFF;
}

.popup-item:active {
  background: rgba(44,94,48,0.05);
}

.popup-item.selected {
  background: rgba(44,94,48,0.02);
}

.popup-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.popup-cancel {
  padding: 16px;
  text-align: center;
  font-size: 15px;
  color: #CD5C5C;
  cursor: pointer;
  background: #F5F0E8;
  font-weight: 500;
}

.popup-cancel:active {
  background: #E8DDD2;
}

.item-name {
  font-size: 15px;
  font-weight: 500;
  color: #2C2C2C;
}

.item-desc {
  font-size: 12px;
  color: #8E8E8E;
  margin-left: auto;
}

.item-fee {
  font-size: 13px;
  color: #CD5C5C;
  margin-left: auto;
}

.item-fee.free {
  color: #2C5E30;
}

.selected-icon {
  color: #2C5E30;
  font-size: 18px;
  font-weight: 600;
  margin-left: 8px;
}

.disabled-tag {
  padding: 2px 8px;
  background: rgba(142,142,142,0.1);
  border-radius: 4px;
  font-size: 10px;
  color: #8E8E8E;
  margin-left: auto;
}

.coupon-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.coupon-value {
  font-size: 16px;
  font-weight: 700;
  color: #CD5C5C;
}

.coupon-name {
  font-size: 14px;
  color: #2C2C2C;
}

.coupon-condition {
  font-size: 11px;
  color: #8E8E8E;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* 滚动条隐藏 */
::-webkit-scrollbar {
  display: none;
}
</style>