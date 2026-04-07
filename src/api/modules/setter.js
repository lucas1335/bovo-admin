import apiService from '../base';

/**
 * 规则说明模块 API
 * 对应旧项目: /system/home/setter/*
 */

// 查询规则说明列表
export const listSetter = (params) => apiService.get('/system/home/setter/list', { params });

// 查询规则说明详细
export const getSetter = (id) => apiService.get(`/system/home/setter/${id}`);

// 新增规则说明
export const addSetter = (data) => apiService.post('/system/home/setter', data);

// 修改规则说明
export const updateSetter = (data) => apiService.put('/system/home/setter', data);

// 删除规则说明
export const delSetter = (id) => apiService.delete(`/system/home/setter/${id}`);
