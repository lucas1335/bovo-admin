import axios from 'axios';
import { message } from 'antd';
import { clearAuth } from '@/utils/auth';

/**
 * 处理token过期
 * 清除本地存储并跳转到登录页
 */
const handleTokenExpired = () => {
  clearAuth();
  message.error('登录状态已过期，请重新登录');
  // 使用 replace 避免用户按返回键回到之前的页面
  window.location.replace('/login');
};

// 创建axios实例
const apiService = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiService.interceptors.request.use(
  (config) => {
    // 从localStorage中获取token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `${token}`;
    }

    // 检查是否需要使用 form-data 格式（通过 config.useFormData 标识）
    if (config.useFormData && config.method === 'post' && config.data) {
      // 将对象转换为 URLSearchParams (form-data 格式)
      const formData = new URLSearchParams();
      Object.keys(config.data).forEach(key => {
        const value = config.data[key];
        if (value !== null && value !== undefined) {
          // 处理数组和对象
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }
        }
      });
      config.data = formData;
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiService.interceptors.response.use(
  (response) => {
    const res = response.data;

    // 处理业务状态码401（登录状态已过期）
    if (res.code === 401) {
      handleTokenExpired();
      return Promise.reject(res);
    }

    if (res.code === 0 || res.code === 200) {
      return res;
    } else {
      message.error(res.msg || '服务器内部错误');
      return Promise.reject(res);
    }
  },
  (error) => {
    const { response } = error;

    if (response) {
      switch (response.status) {
        case 400:
          message.error('请求参数错误');
          break;
        case 401:
          handleTokenExpired();
          break;
        case 403:
          message.error('权限不足');
          break;
        case 404:
          message.error('接口不存在：' + response.config?.url);
          break;
        case 500:
          message.error('服务器内部错误');
          break;
        default:
          message.error(`请求失败: ${response.statusText}`);
          break;
      }
    } else {
      message.error('网络连接异常，请检查网络');
    }

    return Promise.reject(error);
  }
);

// ==================== 基础 CRUD 封装 ====================

/**
 * 基础 CRUD API 封装
 */
export const baseApi = {
  /**
   * 获取列表数据
   * @param {string} url - 接口地址
   * @param {object} params - 请求参数
   * @returns {Promise}
   */
  getList: (url, params = {}) => {
    return apiService.post(url, params);
  },

  /**
   * 获取详情
   * @param {string} url - 接口地址
   * @param {string|number} id - 数据ID
   * @returns {Promise}
   */
  getDetail: (url, id) => {
    return apiService.get(`${url}/${id}`);
  },

  /**
   * 新增数据
   * @param {string} url - 接口地址
   * @param {object} data - 提交数据
   * @returns {Promise}
   */
  create: (url, data = {}) => {
    return apiService.post(url, data);
  },

  /**
   * 更新数据
   * @param {string} url - 接口地址
   * @param {string|number} id - 数据ID
   * @param {object} data - 提交数据
   * @returns {Promise}
   */
  update: (url, id, data = {}) => {
    return apiService.put(`${url}/${id}`, data);
  },

  /**
   * 删除数据
   * @param {string} url - 接口地址
   * @param {string|number} id - 数据ID
   * @returns {Promise}
   */
  delete: (url, id) => {
    return apiService.delete(`${url}/${id}`);
  },

  /**
   * 批量删除
   * @param {string} url - 接口地址
   * @param {array} ids - ID数组
   * @returns {Promise}
   */
  batchDelete: (url, ids = []) => {
    return apiService.post(url, { ids });
  },
};

export default apiService;
