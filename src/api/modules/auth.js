import apiService from '../base';

// ==================== 认证相关 API ====================

/**
 * 获取验证码图片
 * 对应旧项目: /code
 */
export const getCodeImage = (params) => apiService.get('/code', { params });

/**
 * 用户登录
 * 对应旧项目: /auth/l_l
 * @param {Object} data - 登录数据
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @param {string} data.code - 图片验证码
 * @param {string} data.uuid - 验证码ID
 * @param {string} data.authCode - Google验证码
 */
export const login = (data) => apiService.post('/auth/l_l', data, { headers: { isToken: false } });

/**
 * 用户登出
 * 对应旧项目: /auth/logout
 */
export const logout = () => apiService.delete('/auth/logout');

/**
 * 获取用户信息
 * 对应旧项目: /system/user/getInfo
 */
export const getUserInfo = () => apiService.get('/system/user/getInfo');

/**
 * 获取系统设置
 * 对应旧项目: /system/common/getAllSetting
 */
export const getAllSetting = () => apiService.post('/system/common/getAllSetting', {}, { headers: { isToken: false } });

/**
 * 获取路由菜单
 * 对应旧项目: /system/menu/getRouters
 */
export const getRouters = () => apiService.get('/system/menu/getRouters');
