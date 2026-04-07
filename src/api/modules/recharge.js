import apiService from '../base';

// ==================== 充值订单管理 ====================

/**
 * 获取充值订单列表
 */
export const getRechargeOrderList = (params) => apiService.get('/asset/recharge/list', { params });

/**
 * 获取充值订单详情
 */
export const getRechargeOrderDetail = (params) => apiService.get(`/asset/recharge/${params.id}`);

/**
 * 充值订单审核通过
 */
export const passRechargeOrder = (data) => apiService.post('/asset/recharge/passOrder', data);

/**
 * 充值订单审核拒绝
 */
export const rejectRechargeOrder = (data) => apiService.post('/asset/recharge/failedOrder', data);

/**
 * 获取充值总金额统计
 */
export const getRechargeTotalAmount = (params) => apiService.post('/asset/recharge/getAllRecharge', null, { params });

/**
 * 获取充值配置（币种类型等）
 */
export const getRechargeConfig = (configType) => apiService.get(`/system/setting/get/${configType}`);

/**
 * 导出充值订单
 */
export const exportRechargeOrder = (params) => apiService.post('/asset/recharge/export', params);

/**
 * 获取充值通道配置
 */
export const getRechargeConfigSetting = (configType) => apiService.get(`/system/setting/get/${configType}`);

/**
 * 保存充值通道配置
 */
export const saveRechargeConfigSetting = (configType, data) => apiService.put(`/system/setting/put/${configType}`, data);
