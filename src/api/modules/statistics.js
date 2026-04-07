import apiService from '../base';

/**
 * 统计数据模块 API
 * 对应旧项目: /asset/system/statistics/*
 */

// 获取用户资金信息
export const getUserMoneyInfo = (data) => apiService.post('/asset/system/statistics/getUserMoneyInfo', data);

// 获取活跃代理
export const getAgencyActivityList = (params) => apiService.get('/asset/system/statistics/getAgencyActivityList', { params });

// 批量冻结代理
export const batchFreezeAgency = (ids) => apiService.post('/asset/appUser/batchFreeze', ids);
