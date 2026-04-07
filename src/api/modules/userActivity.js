import apiService from '../base';

/**
 * 活跃用户模块 API
 * 对应旧项目: /asset/activeUser/*
 */

// 查询活跃用户列表
export const listActiveUser = (params) => apiService.get('/asset/activeUser/list', { params });

// 查询活跃用户详细
export const getActiveUser = (userId) => apiService.get(`/asset/activeUser/${userId}`);

// 导出活跃用户
export const exportActiveUser = (params) => apiService.get('/asset/activeUser/export', { params, responseType: 'blob' });

// 发送消息给用户
export const sendMessage = (data) => apiService.post('/asset/activeUser/sendMessage', data);

// 批量发送消息
export const sendBatchMessage = (data) => apiService.post('/asset/activeUser/sendBatchMessage', data);
