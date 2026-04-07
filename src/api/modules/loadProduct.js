import apiService from '../base';

/**
 * 借贷产品模块 API
 * 对应旧项目: /contract/loadProduct/*
 */

// 查询借贷产品列表
export const listProduct = (params) => apiService.get('/contract/loadProduct/list', { params });

// 查询借贷产品详细
export const getProduct = (id) => apiService.get(`/contract/loadProduct/${id}`);

// 新增借贷产品
export const addProduct = (data) => apiService.post('/contract/loadProduct', data);

// 修改借贷产品
export const updateProduct = (data) => apiService.put('/contract/loadProduct', data);

// 删除借贷产品
export const delProduct = (id) => apiService.delete(`/contract/loadProduct/${id}`);
