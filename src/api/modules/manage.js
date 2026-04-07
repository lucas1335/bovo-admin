import apiService from '../base';

/**
 * 币种管理模块 API
 * 对应旧项目: /match-engine/symbolManage/*
 */

// 查询币种管理列表
export const listManage = (params) => apiService.get('/match-engine/symbolManage/list', { params });

// 查询可添加币种列表
export const getCoinList = () => apiService.get('/match-engine/klineSymbol/list');

// 一键新增
export const addCoin = (data) => apiService.post('/match-engine/symbolManage/addBatch/', null, { params: data });

// 查询币种管理详细
export const getManage = (id) => apiService.get(`/match-engine/symbolManage/${id}`);

// 新增币种管理
export const addManage = (data) => apiService.post('/match-engine/symbolManage', data);

// 修改币种管理
export const updateManage = (data) => apiService.put('/match-engine/symbolManage', data);

// 删除币种管理
export const delManage = (id) => apiService.delete(`/match-engine/symbolManage/${id}`);

// 查询币种兑换记录
export const swapRecordList = (params) => apiService.get('/match-engine/symbolManage/list', { params });
