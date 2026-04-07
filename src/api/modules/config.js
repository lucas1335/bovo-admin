import apiService from '../base';

/**
 * 参数配置模块 API
 * 对应旧项目: /system/config/*
 */

// 查询参数列表
export const listConfig = (params) => apiService.get('/system/config/list', { params });

// 查询参数详细
export const getConfig = (configId) => apiService.get(`/system/config/${configId}`);

// 根据参数键名查询参数值
export const getConfigKey = (configKey) => apiService.get(`/system/config/configKey/${configKey}`);

// 新增参数配置
export const addConfig = (data) => apiService.post('/system/config', data);

// 修改参数配置
export const updateConfig = (data) => apiService.put('/system/config', data);

// 删除参数配置
export const delConfig = (configId) => apiService.delete(`/system/config/${configId}`);

// 刷新参数缓存
export const refreshCache = () => apiService.delete('/system/config/refreshCache');

/**
 * 获取设置配置
 * @param {string} type - 配置类型
 */
export const getSettingConfig = (type) => apiService.get(`/system/setting/get/${type}`);

/**
 * 保存设置配置
 * @param {string} type - 配置类型
 * @param {object} data - 配置数据
 */
export const saveSettingConfig = (type, data) => apiService.put(`/system/setting/put/${type}`, data);

/**
 * 保存设置配置（带bio参数，别名）
 * @param {string} type - 配置类型
 * @param {object} data - 配置数据
 */
export const saveSettingConfigWithBio = (type, data) => apiService.put(`/system/setting/put/${type}`, data);

/**
 * 重启TG机器人
 */
export const Restart = () => apiService.post('/system/tgbot/restart');

/**
 * 获取时区列表
 */
export const getTimezone = () => apiService.get('/system/timezone/list');
