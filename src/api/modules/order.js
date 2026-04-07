import apiService from '../base';

// ==================== 订单管理 ====================

/**
 * 获取订单列表
 */
export const getOrderList = (params) => apiService.get('/kOrder/getList', { params });

/**
 * 新增订单
 */
export const saveOrder = (data) => apiService.post('/kOrder/save', data);

/**
 * 更新订单
 */
export const updateOrder = (data) => apiService.post('/kOrder/update', data);

/**
 * 删除订单
 */
export const deleteOrder = (params) => apiService.post('/kOrder/delete', params);

/**
 * 获取订单详情
 */
export const getOrderDetail = (params) => apiService.get('/kOrder/getDetail', { params });

/**
 * 更新订单状态
 */
export const updateOrderStatus = (data) => apiService.post('/kOrder/updateStatus', data);
