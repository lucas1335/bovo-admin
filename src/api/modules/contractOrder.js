import apiService from '../base';

/**
 * U本位委托订单模块 API
 * 对应旧项目: /contract/contractOrder/*
 */

// 查询U本位委托列表
export const listContractOrder = (params) => apiService.get('/contract/contractOrder/list', { params });

// 查询U本位委托详细
export const getContractOrder = (id) => apiService.get(`/contract/contractOrder/${id}`);

// 新增U本位委托
export const addContractOrder = (data) => apiService.post('/contract/contractOrder', data);

// 修改U本位委托
export const updateContractOrder = (data) => apiService.put('/contract/contractOrder', data);

// 删除U本位委托
export const delContractOrder = (id) => apiService.delete(`/contract/contractOrder/${id}`);
