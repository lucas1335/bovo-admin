import apiService from '../base';

/**
 * 自发币管理模块 API
 * 对应旧项目: /contract/spontaneousCoin/*
 */

// 查询自发币列表
export const getSpontaneousCoinList = (params) => apiService.get('/contract/spontaneousCoin/list', { params });

// 查询自发币详细
export const getSpontaneousCoinDetail = (id) => apiService.get(`/contract/spontaneousCoin/${id}`);

// 新增自发币
export const addSpontaneousCoin = (data) => apiService.post('/contract/spontaneousCoin', data);

// 修改自发币
export const updateSpontaneousCoin = (data) => apiService.put('/contract/spontaneousCoin', data);

// 删除自发币
export const deleteSpontaneousCoin = (id) => apiService.delete(`/contract/spontaneousCoin/${id}`);

// 查询价格
export const getCoinPrice = (data) => apiService.post('/system/common/getCoinPrice', data);

/**
 * 自发币列表 (新版本 - 用于K线创建)
 */
export const getSpontaneousCoinNewList = (params) => apiService.get('/contract/spontaneousCoinNew/list', { params });

/**
 * 创建K线数据
 */
export const createKlineData = (params) => apiService.post('/match-engine/kline/create', params);
