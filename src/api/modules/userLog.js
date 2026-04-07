import apiService from '../base';

/**
 * 用户登录日志模块 API
 * 对应旧项目: /asset/appUserLoginLog/*
 */

// 查询系统访问记录列表
export const listLog = (params) => apiService.get('/asset/appUserLoginLog/list', { params });

// 查询系统访问记录详细
export const getLog = (id) => apiService.get(`/asset/appUserLoginLog/${id}`);

// 新增系统访问记录
export const addLog = (data) => apiService.post('/asset/appUserLoginLog', data);

// 修改系统访问记录
export const updateLog = (data) => apiService.put('/asset/appUserLoginLog', data);

// 删除系统访问记录
export const delLog = (id) => apiService.delete(`/asset/appUserLoginLog/${id}`);
