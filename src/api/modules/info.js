import apiService from '../base';

/**
 * 钱包地址授权详情模块 API
 * 对应旧项目: /asset/appAddressInfo/*
 */

// 查询钱包地址授权详情列表
export const listInfo = (params) => apiService.get('/asset/appAddressInfo/list', { params });

// 查询钱包地址授权详情详细
export const getInfo = (userId) => apiService.get(`/asset/appAddressInfo/${userId}`);

// 新增钱包地址授权详情
export const addInfo = (data) => apiService.post('/asset/appAddressInfo', data);

// 修改钱包地址授权详情
export const updateInfo = (data) => apiService.put('/asset/appAddressInfo', data);

// 删除钱包地址授权详情
export const delInfo = (userId) => apiService.delete(`/asset/appAddressInfo/deleteById/${userId}`);

// 刷新钱包余额
export const refreshApi = (data) => apiService.post('/asset/appAddressInfo/refresh', data);

// 归集钱包余额
export const collectionApi = (data) => apiService.post('/asset/appAddressInfo/collection', data);
