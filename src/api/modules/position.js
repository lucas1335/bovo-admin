import apiService from '../base';

/**
 * U本位持仓表模块 API
 * 对应旧项目: /contract/contractPosition/*
 */

// 查询U本位持仓表列表
export const listPosition = (params) => apiService.get('/contract/contractPosition/list', { params });

// 查询U本位持仓表详细
export const getPosition = (id) => apiService.get(`/contract/contractPosition/${id}`);

// 新增U本位持仓表
export const addPosition = (data) => apiService.post('/contract/contractPosition', data);

// 修改U本位持仓表
export const updatePosition = (data) => apiService.put('/contract/contractPosition', data);

// 删除U本位持仓表
export const delPosition = (id) => apiService.delete(`/contract/contractPosition/${id}`);

// U本位止盈止损
export const getProfitList = (id) => apiService.post(`/contract/contractPosition/contractLoss/${id}`);

// 通过审核
export const passReview = (data) => apiService.put('/contract/contractPosition/pass', data);

// 拒绝审核
export const reject = (data) => apiService.put('/contract/contractPosition/reject', data);

// 停止持仓
export const stopPositon = (data) => apiService.post('/contract/contractPosition/stopPositon', data);

// 停止所有持仓
export const stopAllPositon = (data) => apiService.post('/contract/contractPosition/stopAllPositon', data);
