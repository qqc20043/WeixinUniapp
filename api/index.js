// main.js 或 api/index.js
import request from '../axios/axios-interceptor';

// 使用示例
export const login = (data) => {
  return request({
    url: '/user/login',
    method: 'post',
    data
  });
};

export const register = (data) => {
  return request({
    url: '/user/regist',
    method: 'post',
    data
  });
};

export const theme = () => {
  return request({
    url: '/theme/lists',
    method: 'get',
  });
};

// 获取茶叶类型
export const categoryLists = () => {
  return request({
    url: '/category/lists',
    method: 'get',
  });
};

// 获取全部茶叶
export const productThemeLists = () => {
  return request({
    url: '/theme/themeProductList',
    method: 'get',
  });
};

export const codeNo = (data) => {
  return request({
    url: '/coupon/codeNo',
    method: 'post',
    data
  });
};

// 获取优惠券
export const selectCUListId = () => {
  return request({
    url: '/coupon/selectCUListId',
    method: 'get'
  });
};

// 获取用户优惠券列表
export const selectCouponUserVOList = () => {
  return request({
    url: '/coupon/selectCouponUserVOList',
    method: 'get'
  });
};

// 获取单个商品数据（商品详情页面）
export const selectSingle = (data) => {
  return request({
    url: '/product/selectSingle',
    method: 'post',
    data
  });
};

//获取同主题所有商品
export const ThemeSingle = (data) => {
  return request({
    url: '/product/ThemeSingle',
    method: 'post',
    data
  });
};

//获取店铺详细信息
export const SingleOne = (data) => {
  return request({
    url: '/shop/SingleOne',
    method: 'post',
    data
  });
};

//获取店铺下的所有商品
export const shopProductList = (data) => {
  return request({
    url: '/shop/productList',
    method: 'post',
    data
  });
};

// 获取用户购物车商品数据
export const selectVCartDetail = () => {
  return request({
    url: '/cart/VCartDetail',
    method: 'get'
  });
};

// 获取product表中商品数据
export const shopSpecList = () => {
  return request({
    url: '/product/shopSpecList',
    method: 'get'
  });
};

// 删除购物车中的商品
export const delCartItem = (data) => {
  return request({
    url: '/cart/delCartItem',
    method: 'delete',
	data
  });
};

// 删除购物车全部的商品
export const delAllCartItem = () => {
  return request({
    url: '/cart/delAllCartItem',
    method: 'delete'
  });
};

// 更新购物车中的商品
export const insertCartItem = (data) => {
  return request({
    url: '/cart/insertCartItem',
    method: 'post',
	data
  });
};

// 获取当前用户基本数据
export const userDatas = () => {
  return request({
    url: '/user/userData',
    method: 'get'
  });
};

// 修改当前用户基本数据
export const userDataUpdate = (data) => {
  return request({
    url: '/user/userDataUpdate',
    method: 'post',
	data
  });
};

// 获取收藏茶具数据
export const productTeaware = () => {
  return request({
    url: '/product/teaware',
    method: 'get'
  });
};

// 获取用户余额
export const userBalanceI = () => {
  return request({
    url: '/user/balanceI',
    method: 'get'
  });
};

// 获取用户地址
export const userAddressList = () => {
  return request({
    url: '/user/addressI',
    method: 'get'
  });
};

// 修改用户地址
export const userAddressUpdateInsert = (data) => {
  return request({
    url: '/user/addressUpdateInsert',
    method: 'post',
	data
  });
};

// 修改用户默认地址
export const userAddressUpdateIsDefault = (data) => {
  return request({
    url: '/user/addressUpdateIsDefault',
    method: 'post',
	data
  });
};

// 删除用户地址
export const userAddressDelete = (data) => {
  return request({
    url: '/user/addressDelete',
    method: 'delete',
	data
  });
};

// 获取品茶笔记数据
export const userNoteList = () => {
  return request({
    url: '/user/noteI',
    method: 'get'
  });
};

// 修改用户地址
export const noteUpdateInsert = (data) => {
  return request({
    url: '/user/noteUpdateInsert',
    method: 'post',
	data
  });
};

// 删除用户地址
export const noteDelete = (data) => {
  return request({
    url: '/user/noteDelete',
    method: 'delete',
	data
  });
};

// 获取用户购买的茶叶
export const userProductCategory = () => {
  return request({
    url: '/user/productCategory',
    method: 'get'
  });
};

// 获取朋友圈数据
export const vMomentList = () => {
  return request({
    url: '/moment/list',
    method: 'get'
  });
};

// 获取对应朋友圈的评论
export const vMomentCommentList = (data) => {
  return request({
    url: '/moment/commentList',
    method: 'post',
	data
  });
};

// 当前朋友圈用户是否点赞
export const vMomentLikeFlag = (data) => {
  return request({
    url: '/moment/likeFlag',
    method: 'post',
	data
  });
};

// 获取动态emoji表情接口
export const vMomentImageFlag = (data) => {
  return request({
    url: '/moment/imageList',
    method: 'post',
	data
  });
};

// 修改点赞数据表
export const vMomentUpdateLike = (data) => {
  return request({
    url: '/moment/updateLike',
    method: 'post',
	data
  });
};

// 添加评论
export const vMomentInsertComment = (data) => {
  return request({
    url: '/moment/insertComment',
    method: 'post',
	data
  });
};

// 添加动态
export const vMomentInsertMoment = (data) => {
  return request({
    url: '/moment/insertMoment',
    method: 'post',
	data
  });
};

// 添加动态图片
export const vMomentInsertImage = (data) => {
  return request({
    url: '/moment/insertImage',
    method: 'post',
	data
  });
};

// 获取用户订单
export const VOrderData = () => {
  return request({
    url: '/order/VOrderData',
    method: 'get'
  });
};

// 获取用户订单详细
export const VOrderItemDetail = () => {
  return request({
    url: '/order/VOrderItemDetail',
    method: 'get'
  });
};

// 获取用户拥有的优惠券
export const VUserCouponService = () => {
  return request({
    url: '/coupon/vUserCouponService',
    method: 'get'
  });
};

// 添加订单
export const insertOrderData = (data) => {
  return request({
    url: '/order/OrderData',
    method: 'post',
	data
  });
};

// 添加订单详情
export const insertOrderItemData = (data) => {
  return request({
    url: '/order/OrderItemData',
    method: 'post',
	data
  });
};

// 获取验证码
export const userCaptcha = () => {
  return request({
    url: '/user/captcha',
    method: 'get',
  });
};

// 提交验证码后端判断
export const userYzmcap = (data) => {
  return request({
    url: '/user/yzmcap',
    method: 'post',
	data
  });
};