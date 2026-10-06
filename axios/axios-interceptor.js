// axios-interceptor.js
import axios from 'axios';
import mpAdapter from 'axios-miniprogram-adapter';

// 配置小程序适配器
axios.defaults.adapter = mpAdapter;

// 创建axios实例
// 说明：小程序模拟器 / 真机中 localhost 指向设备自身，连不到后端主机，
//       因此统一使用 127.0.0.1（开发者工具需关闭「校验合法域名」）；
//       H5/生产环境可用环境变量覆盖，部署时改这一处即可。
const BASE_URL =
  (typeof process !== 'undefined' && process.env && process.env.VUE_APP_BASE_URL) ||
  'http://127.0.0.1:8080';

const service = axios.create({
  baseURL: BASE_URL, // 部署时改为服务器地址，如 http://47.114.36.73
  timeout: 15000, // 请求超时时间
});

// 白名单列表 - 不需要token验证的接口
const whiteList = [
  '/user/login',
  '/user/regist',
  '/user/captcha',
  '/user/yzmcap'
  // 可以添加更多白名单路径，支持正则表达式
];

/**
 * 检查URL是否在白名单中
 * @param {string} url - 请求URL
 * @returns {boolean} - true表示在白名单中，false表示不在
 */
const isWhiteList = (url) => {
  return whiteList.some(pattern => {
    if (pattern instanceof RegExp) {
      return pattern.test(url);
    }
    // 支持字符串匹配（包含关系，因为URL可能带查询参数）
    return url.includes(pattern);
  });
};

/**
 * 清除用户登录信息
 */
const clearUserInfo = () => {
  uni.removeStorageSync("token");
  uni.removeStorageSync("userInfo");
  // 如果有其他存储的用户信息，也一并清除
  sessionStorage.clear();
};

/**
 * 重定向到登录页
 */
const redirectToLogin = () => {
  // 获取当前完整路径作为重定向参数
  // const currentPath = encodeURIComponent(window.location.href);
  uni.navigateTo({
  	url: '/pages/login',
	events: {
	  // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
	  acceptAxiosAndLogin: function(data) {
	    console.log(data)
	  }
	},
	success: function(res) {
	  // 通过eventChannel向被打开页面传送数据
	  res.eventChannel.emit('acceptAxiosAndLogin', { data: "身份过期，请重新登录！" })
	}
  });
};

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 获取请求URL
    const url = config.url || '';
    
    // 检查是否在白名单中
    if (!isWhiteList(url)) {
      // 从localStorage获取token
	  const token = uni.getStorageSync("token");
      
      if (token) {
        // 将token添加到请求头
        config.headers['token'] = token;
      } else {
        // 如果token不存在，可以在这里处理，比如重定向
        console.warn('Token不存在，但请求需要认证');
        // 注意：这里不直接重定向，因为可能某些接口虽然不在白名单但实际不需要token
        // 如果需要严格模式，可以取消下面的注释
        redirectToLogin();
        return Promise.reject(new Error('Token不存在'));
      }
    }
    return config;
  },
  (error) => {
    // 请求错误处理
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 直接返回响应数据，让具体业务代码处理
    // 如果你的后端有统一的数据格式，可以在这里统一处理
    return response.data;
  },
  (error) => {
    // 错误响应处理
    if (error.response) {
      // 服务器返回了错误状态码
      const { status, config } = error.response;
      
      // 处理401未授权或token过期
      if (status === 401) {
        // 检查请求URL是否在白名单中，避免重复处理
        const url = config?.url || '';
        if (!isWhiteList(url)) {
          console.warn('Token已过期或未授权，准备重定向到登录页');
          uni.navigateTo({
          	url: '/pages/login'
          });
          // 清除用户信息
          clearUserInfo();
          
          // 弹出提示（可选）
          if (typeof window !== 'undefined' && window.$message) {
            // 如果你使用了UI库的消息组件
            window.$message.error('登录已过期，请重新登录');
          } else {
            // 使用原生提示
            setTimeout(() => {
              alert('登录已过期，请重新登录');
            }, 100);
          }
          
          // 重定向到登录页
          redirectToLogin();
          
          // 返回一个特殊的错误，避免后续处理
          return Promise.reject(new Error('登录已过期，请重新登录'));
        }
      }
      
      // 处理其他HTTP错误状态码
      switch (status) {
        case 403:
          console.error('403 Forbidden:', error.response.data);
          break;
        case 404:
          console.error('404 Not Found:', error.response.data);
          break;
        case 500:
          console.error('500 Internal Server Error:', error.response.data);
          break;
        default:
          console.error(`HTTP Error ${status}:`, error.response.data);
      }
      
      return Promise.reject(error.response.data || error);
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('网络错误，服务器未响应:', error.request);
      
      // 可以在这里统一处理网络错误提示
      if (typeof window !== 'undefined' && window.$message) {
        window.$message.error('网络连接失败，请检查网络');
      }
      
      return Promise.reject(new Error('网络连接失败，请检查网络'));
    } else {
      // 请求配置出错
      console.error('请求配置错误:', error.message);
      return Promise.reject(error);
    }
  }
);

// 导出axios实例，方便在其他文件中使用
export default service;

// 也可以单独导出拦截器相关功能，方便在其他地方使用
export { clearUserInfo, redirectToLogin, isWhiteList };