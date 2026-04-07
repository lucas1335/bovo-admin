import apiService from '../base';

/**
 * App下载链接模块 API
 * 对应旧项目: /system/applink/*
 */

// 查询App下载链接列表
export const getAppLinkList = (params) => apiService.get('/system/applink/list', { params });

// 查询App下载链接详细
export const getAppLink = (id) => apiService.get(`/system/applink/${id}`);

// 新增App下载链接
export const addAppLink = (data) => apiService.post('/system/applink', data);

// 修改App下载链接
export const updateAppLink = (data) => apiService.put('/system/applink', data);

// 删除App下载链接
export const deleteAppLink = (id) => apiService.delete(`/system/applink/${id}`);
