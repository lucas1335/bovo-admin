import apiService from '../base';

/**
 * 充值审核模块 API
 * 对应旧项目: /asset/recharge/*
 */

// 查询用户充值列表
export const listRecharge = (params) => apiService.get('/asset/recharge/list', { params });

// 查询用户充值详细
export const getRecharge = (id) => apiService.get(`/asset/recharge/${id}`);

// 充值审核通过
export const passRecharge = (data) => apiService.post('/asset/recharge/passOrder', data);

// 充值审核失败
export const unRecharge = (data) => apiService.post('/asset/recharge/failedOrder', data);
