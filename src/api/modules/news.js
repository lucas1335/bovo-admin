import apiService from '../base';

/**
 * 社区新闻模块 API
 * 对应旧项目: /system/news/*
 */

// 查询商户列表
export const getList = (params) => apiService.get('/system/news/list', { params });

// 查询商户详细
export const getDetail = (id) => apiService.get(`/system/news/${id}`);

// 新增商户
export const addNew = (data) => apiService.post('/system/news', data);

// 修改商户
export const updateNew = (data) => apiService.put('/system/news', data);

// 删除商户
export const delNew = (ids) => apiService.delete(`/system/news/${ids}`);
