import apiService from '../base';

/**
 * 支持币种模块 API
 * 对应旧项目: /match-engine/symbols/*
 */

// 查询支持币种列表
export const listSymbols = (params) => apiService.get('/match-engine/symbols/list', { params });

// 查询支持币种详细
export const getSymbols = (slug) => apiService.get(`/match-engine/symbols/${slug}`);

// 新增支持币种
export const addSymbols = (data) => apiService.post('/match-engine/symbols', data);

// 修改支持币种
export const updateSymbols = (data) => apiService.put('/match-engine/symbols', data);

// 删除支持币种
export const delSymbols = (slug) => apiService.delete(`/match-engine/symbols/${slug}`);
