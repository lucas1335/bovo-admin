import apiService from '../base';

/**
 * 字典类型模块 API
 * 对应旧项目: /system/dict/type/*
 */

// 查询字典类型列表
export const listType = (params) => apiService.get('/system/dict/type/list', { params });

// 查询字典类型详细
export const getType = (dictId) => apiService.get(`/system/dict/type/${dictId}`);

// 新增字典类型
export const addType = (data) => apiService.post('/system/dict/type', data);

// 修改字典类型
export const updateType = (data) => apiService.put('/system/dict/type', data);

// 删除字典类型
export const delType = (dictId) => apiService.delete(`/system/dict/type/${dictId}`);

// 刷新字典缓存
export const refreshCache = () => apiService.delete('/system/dict/type/refreshCache');

// 获取字典选择框列表
export const optionselect = () => apiService.get('/system/dict/type/optionselect');
