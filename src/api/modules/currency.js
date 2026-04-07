import apiService from '../base';

/**
 * 币币交易币种配置模块 API
 * 对应旧项目: /contract/currencySymbol/*
 */

// 查询币币交易币种配置详细
export const getCurrency = (id) => apiService.get(`/bussiness/currency/${id}`);

// 查询可添加币种列表
export const getCoinList = () => apiService.get('/match-engine/klineSymbol/list');

// 查询币币交易币种配置列表
export const listConfiguration = (params) => apiService.get('/contract/currencySymbol/list', { params });

// 新增币币交易币种配置
export const addCurrency = (data) => apiService.post('/contract/currencySymbol', data);

// 一键新增
export const addOneCurrency = (data) => apiService.post('/contract/currencySymbol/addBatch/', null, { params: data });

// 修改币币交易币种配置
export const updateCurrency = (data) => apiService.put('/contract/currencySymbol', data);

// 删除币币交易币种配置
export const delCurrency = (id) => apiService.delete(`/contract/currencySymbol/${id}`);
