import apiService from '../base';

// ==================== 佣金配置管理 ====================

/**
 * 获取充值返佣配置
 * @param {String} type - 配置类型 (RECHARGE_REBATE_SETTING | FINANCIAL_REBATE_SETTING)
 */
export const getCommissionConfig = (type) => apiService.get(`/system/setting/get/${type}`);

/**
 * 保存充值返佣配置
 * @param {String} type - 配置类型 (RECHARGE_REBATE_SETTING | FINANCIAL_REBATE_SETTING)
 * @param {Object} data - 配置数据
 */
export const saveCommissionConfig = (type, data) => apiService.put(`/system/setting/put/${type}`, data);

/**
 * 获取佣金记录列表
 */
export const getCommissionRecordList = (params) => apiService.get('/commission/record/getList', { params });

/**
 * 获取佣金结算记录列表
 */
export const getCommissionSettlementList = (params) => apiService.get('/commission/settlement/getList', { params });

/**
 * 获取佣金统计数据
 */
export const getCommissionStatistics = (params) => apiService.get('/commission/statistics/getData', { params });

/**
 * 创建佣金结算
 */
export const createCommissionSettlement = (data) => apiService.post('/commission/settlement/create', data);

/**
 * 审核佣金结算
 */
export const auditCommissionSettlement = (data) => apiService.post('/commission/settlement/audit', data);
