import apiService from '../base';

/**
 * 秒合约币种周期配置模块 API
 * 对应旧项目: /contract/secondPeriod/*
 */

// 查询秒合约币种周期配置列表
export const listConfig = (params) => apiService.get('/contract/secondPeriod/list', { params });

// 查询秒合约币种周期配置详细
export const getConfig = (id) => apiService.get(`/contract/secondPeriod/${id}`);

// 新增秒合约币种周期配置
export const addConfig = (data) => apiService.post('/contract/secondPeriod', data);

// 修改秒合约币种周期配置
export const updateConfig = (data) => apiService.put('/contract/secondPeriod', data);

// 删除秒合约币种周期配置
export const delConfig = (id) => apiService.delete(`/contract/secondPeriod/${id}`);
