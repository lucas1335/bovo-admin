import apiService from '../base';

/**
 * 用户充值地址模块 API
 * 对应旧项目: /asset/symbol/address/*
 */

// 查询用户充值地址列表
export const listUserRecharge = (params) => apiService.get('/asset/symbol/address/list', { params });

// 查询用户充值地址详细
export const getUserRecharge = (id) => apiService.get(`/asset/symbol/address/${id}`);

// 新增用户充值地址
export const addUserRecharge = (data) => apiService.post('/asset/symbol/address', data);

// 修改用户充值地址
export const updateUserRecharge = (data) => apiService.put('/asset/symbol/address', data);

// 删除用户充值地址
export const delUserRecharge = (id) => apiService.delete(`/asset/symbol/address/${id}`);

// 获取地址
export const getAdress = (data) => apiService.post('/asset/symbol/address/getAdress', data);
