import apiService from '../base';

/**
 * 贷款订单模块 API
 * 对应旧项目: /loadOrder/*
 */

// 查询贷款订单列表
export const listLoadOrder = (params) => apiService.get('/loadOrder/orderList', { params });

// 通过贷款订单
export const passTLoadOrder = (data) => apiService.post('/loadOrder/passTLoadOrder', data);

// 贷款订单不通过
export const refuseTLoadOrder = (data) => apiService.post('/loadOrder/refuseTLoadOrder', data);

// 还款
export const repayment = (data) => apiService.post('/loadOrder/repayment/', null, { params: data });

// 查看订单详情
export const getLoadOrder = (id) => apiService.get(`/loadOrder/getTLoadOrder/${id}`);
