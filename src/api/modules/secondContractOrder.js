import apiService from '../base';

/**
 * 秒合约订单模块 API
 * 对应旧项目: /contract/secondContractOrder/*
 */

// 查询秒合约订单列表
export const listOrder = (params) => apiService.get('/contract/secondContractOrder/list', { params });

// 查询秒合约订单详细
export const getOrder = (id) => apiService.get(`/contract/secondContractOrder/${id}`);

// 新增秒合约订单
export const addOrder = (data) => apiService.post('/contract/secondContractOrder', data);

// 修改秒合约订单
export const updateOrder = (data) => apiService.put('/contract/secondContractOrder', data);

// 修改秒合约订单（备选接口）
export const updateOrder1 = (data) => apiService.put('/contract/secondContractOrder/edits', data);

// 删除秒合约订单
export const delOrder = (id) => apiService.delete(`/contract/secondContractOrder/${id}`);
