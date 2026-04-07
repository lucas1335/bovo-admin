import apiService from '../base';

/**
 * 币币交易订单模块 API
 * 对应旧项目: /contract/currencyOrder/*
 */

// 查询币币交易订单列表
export const listOrder = (params) => apiService.get('/contract/currencyOrder/list', { params });
