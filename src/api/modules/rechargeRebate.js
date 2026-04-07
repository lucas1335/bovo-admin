import apiService from '../base';

/**
 * 充值返利配置模块 API
 * 对应旧项目: /system/setting/*
 */

/** 获取充值设置配置 */
export const getRechargeConfig = (type) => apiService.get(`/system/setting/get/${type}`);

/** 保存设置配置 */
export const saveRecharge = (type, data) => apiService.put(`/system/setting/put/${type}`, data);

/** 时区列表 */
export const getTimezone = () => apiService.get('/system/timezone/list');

/** 获取充值数据 */
export const getAllRecharge = (query) => apiService.post('/asset/recharge/getAllRecharge', null, { params: query });
