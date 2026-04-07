import apiService from '../base';

/**
 * 发币管理模块 API
 * 对应旧项目: /contract/ownCoin/*
 */

// 提前发布新币
export const publishCoinApi = (id) => apiService.get(`/contract/ownCoin/editStatus/${id}`);

// 到期发布新币
export const publishedCoinApi = (id) => apiService.get(`/contract/ownCoin/editReleaseStatus/${id}`);

// 查询发币列表
export const listCoin = (params) => apiService.get('/contract/ownCoin/list', { params });

// 查询发币详细
export const getCoin = (id) => apiService.get(`/contract/ownCoin/${id}`);

// 新增发币
export const addCoin = (data) => apiService.post('/contract/ownCoin', data);

// 修改发币
export const updateCoin = (data) => apiService.put('/contract/ownCoin', data);

// 删除发币
export const delCoin = (id) => apiService.delete(`/contract/ownCoin/${id}`);

// 查询价格
export const getCoinPrice = (data) => apiService.post('/system/common/getCoinPrice', data);
