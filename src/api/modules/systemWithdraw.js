import apiService from '../base';

/**
 * 提现管理模块 API
 * 对应旧项目: /asset/withdraw/*
 */

// 查询用户提现列表
export const listWithdraw = (params) => apiService.get('/asset/withdraw/list', { params });

// 提现管理.锁定
export const lockorder = (data) => apiService.post('/asset/withdraw/lockorder', data);

// 提现管理.解锁
export const unlockorder = (data) => apiService.post('/asset/withdraw/unlockorder', data);

// 提现管理.锁定判断
export const tryCheck = (data) => apiService.post('/asset/withdraw/tryCheck', data);

// 提现管理.审核通过
export const withdrawReview = (data) => apiService.post('/asset/withdraw/passOrderNew', data);

// 提现管理.审核拒绝
export const rejectReview = (data) => apiService.post('/asset/withdraw/rejectOrderNew', data);

/** 获取总提现金额 */
export const getAllWithdraw = (query) => apiService.post('/asset/withdraw/getAllWithdraw', null, { params: query });

/** 获取所有用户总资产 */
export const getAllAssets = (query) => apiService.get('/asset/appUser/allAssets', { params: query });

/** 获取所有用户总提现金额 */
export const getUserAllWithdraw = (query) => apiService.get('/asset/appUser/allWithdraw', { params: query });

/** 回退用户金额按钮 */
export const rollBackOrderNew = (query) => apiService.post('/asset/withdraw/rollBackOrderNew', query);

/** 重新发起提款按钮 */
export const retryOrderNew = (query) => apiService.post('/asset/withdraw/retryOrderNew', query);

/** 批量拒绝 */
export const rejectOrderBatch = (query) => apiService.post('/asset/withdraw/rejectOrderBatch', query);
