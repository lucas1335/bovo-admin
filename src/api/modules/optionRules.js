import apiService from '../base';

/**
 * 前台文本配置模块 API
 * 对应旧项目: /contract/optionRules/*
 */

// 查询前台文本配置列表
export const listRules = (params) => apiService.get('/contract/optionRules/list', { params });

// 查询前台标签页
export const getLabelList = (params) => apiService.get('/contract/optionRules/labelList', { params });

// 查询前台文本配置详细
export const getRules = (id) => apiService.get(`/contract/optionRules/${id}`);

// 新增前台文本配置
export const addRules = (data) => apiService.post('/contract/optionRules', data);

// 修改前台文本配置
export const updateRules = (data) => apiService.put('/contract/optionRules', data);

// 删除前台文本配置
export const delRules = (id) => apiService.delete(`/contract/optionRules/${id}`);
