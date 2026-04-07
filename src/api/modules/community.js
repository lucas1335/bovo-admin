import apiService from '../base';

/**
 * 社区管理模块 API
 * 对应旧项目: /system/news/*
 */

// 查询社区列表
export const getCommunityList = (params) => apiService.get('/system/news/list', { params });

// 查询社区详细
export const getCommunityDetail = (id) => apiService.get(`/system/news/${id}`);

// 新增社区
export const addCommunity = (data) => apiService.post('/system/news', data);

// 修改社区
export const updateCommunity = (data) => apiService.put('/system/news', data);

// 删除社区
export const deleteCommunity = (id) => apiService.delete(`/system/news/${id}`);
