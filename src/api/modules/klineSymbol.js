import apiService from '../base';

/**
 * 系统代币K线信息模块 API
 * 对应旧项目: /match-engine/klineSymbol/*
 */

// 查询系统代币K线信息列表
export const listKlineSymbol = (params) => apiService.get('/match-engine/klineSymbol/list', { params });

// 查询系统代币K线信息详细
export const getKlineSymbol = (id) => apiService.get(`/match-engine/klineSymbol/${id}`);

// 新增系统代币K线信息
export const addKlineSymbol = (data) => apiService.post('/match-engine/klineSymbol', data);

// 修改系统代币K线信息
export const updateKlineSymbol = (data) => apiService.put('/match-engine/klineSymbol', data);

// 删除系统代币K线信息
export const delKlineSymbol = (ids) => apiService.delete(`/match-engine/klineSymbol/${ids}`);
