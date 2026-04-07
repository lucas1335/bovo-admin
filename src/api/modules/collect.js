import apiService from '../base';

/**
 * 收藏订单模块 API
 * 对应旧项目: /asset/collectionOrder/*
 */

// 查询收藏订单列表
export const listOrder = (params) => apiService.get('/asset/collectionOrder/list', { params });

// 查询收藏订单详细
export const getOrder = (id) => apiService.get(`/asset/collectionOrder/${id}`);

// 新增收藏订单
export const addOrder = (data) => apiService.post('/asset/collectionOrder', data);

// 修改收藏订单
export const updateOrder = (data) => apiService.put('/asset/collectionOrder', data);

// 删除收藏订单
export const delOrder = (id) => apiService.delete(`/asset/collectionOrder/${id}`);
