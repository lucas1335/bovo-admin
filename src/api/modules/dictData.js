import apiService from '../base';

/**
 * 字典数据模块 API
 * 对应旧项目: /system/dict/data/*
 */

// 查询字典数据列表
export const listData = (params) => apiService.get('/system/dict/data/list', { params });

// 查询字典数据详细
export const getData = (dictCode) => apiService.get(`/system/dict/data/${dictCode}`);

// 根据字典类型查询字典数据信息
export const getDicts = (dictType) => apiService.get(`/system/dict/data/type/${dictType}`);

// 新增字典数据
export const addData = (data) => apiService.post('/system/dict/data', data);

// 修改字典数据
export const updateData = (data) => apiService.put('/system/dict/data', data);

// 删除字典数据
export const delData = (dictCode) => apiService.delete(`/system/dict/data/${dictCode}`);
