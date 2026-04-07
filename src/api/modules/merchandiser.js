import apiService from '../base';

/**
 * 商户管理模块 API
 * 对应旧项目: /contract/merchandiser/*
 */

// 查询列表
export const listMerchandiser = (params) => apiService.get('/contract/merchandiser/list', { params });

// 查询详细
export const getMerchandiser = (merchandiserId) => apiService.get(`/contract/merchandiser/${merchandiserId}`);

// 新增
export const addMerchandiser = (data) => apiService.post('/contract/merchandiser', data);

// 修改
export const updateMerchandiser = (data) => apiService.put('/contract/merchandiser', data);

// 删除
export const delMerchandiser = (merchandiserId) => apiService.delete(`/contract/merchandiser/${merchandiserId}`);

// 玩家管理列表
export const followList = (params) => apiService.get('/contract/merchandiser/followList', { params });

// 取消跟单
export const cancelFollow = (data) => apiService.post('/contract/merchandiser/cancelFollow', data);

// 跟单信息列表
export const merchandiserOrderLogList = (params) => apiService.get('/contract/merchandiser/merchandiserOrderLogList', { params });

// 计算盈利
export const calProfit = (data) => apiService.post('/contract/contractOrder/calProfit', data);

// 取消跟单记录列表
export const listCancelFollowLog = (params) => apiService.get('/contract/cancelFollowLog/list', { params });

// 保存跟单订单
export const saveContractFollowOrder = (data) => apiService.post('/contract/contractOrder/saveFollowOrder', data);

// 获取商户配置（GET请求，不需要参数或使用params）
export const getMerchandiserConfig = (params) => apiService.get('/contract/merchandiserConfig', { params });

// 更新商户配置
export const updateMerchandiserConfig = (data) => apiService.put('/contract/merchandiserConfig', data);

// 历史带单列表
export const getMerchandiserFollowList = (params) => apiService.get('/contract/merchandiserFollow/list', { params });
