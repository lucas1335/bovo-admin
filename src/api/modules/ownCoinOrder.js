import apiService from '../base';

/**
 * 申购订单模块 API
 * 对应旧项目: /contract/ownCoinOrder/*
 */

// 查询申购订单列表
export const listOwnCoinOrder = (params) => apiService.get('/contract/ownCoinOrder/list', { params });

// 查询申购订单详细
export const getOwnCoinOrder = (id) => apiService.get(`/contract/ownCoinOrder/${id}`);

// 新增申购订单
export const addOwnCoinOrder = (data) => apiService.post('/contract/ownCoinOrder', data);

// 修改申购订单
export const updateOwnCoinOrder = (data) => apiService.put('/contract/ownCoinOrder', data);

// 删除申购订单
export const delOwnCoinOrder = (id) => apiService.delete(`/contract/ownCoinOrder/${id}`);
