import apiService from '../base';

/**
 * 账变记录模块 API
 * 对应旧项目: /asset/appWalletRecord/*
 */

// 查询账变记录列表
export const listRecord = (params) => apiService.get('/asset/appWalletRecord/list', { params });

// 查询账变类型
export const getType = (data) => apiService.post('/system/common/recordType', data);

// 获取账变统计金额
export const getTotalMoney = () => apiService.post('/asset/appWalletRecord/statisticsAmount');

// 查询账变记录详情
export const getRecord = (id) => apiService.get(`/asset/appWalletRecord/${id}`);

// 新增账变记录
export const addRecord = (data) => apiService.post('/asset/appWalletRecord', data);

// 修改账变记录
export const updateRecord = (data) => apiService.put('/asset/appWalletRecord', data);

// 删除账变记录
export const delRecord = (id) => apiService.delete(`/asset/appWalletRecord/${id}`);
