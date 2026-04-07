import apiService from '../base';

// ==================== DEFI订单管理 ====================

/**
 * 获取DEFI订单列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.amount - 收益金额
 * @param {string} params.totleAmount - 钱包金额
 * @param {string} params.rate - 收益率
 * @returns {Promise}
 */
export const getDefiOrderList = (params) => apiService.get('/contract/defiOrder/list', { params });

/**
 * 获取DEFI订单详情
 * @param {string|number} id - 订单ID
 * @returns {Promise}
 */
export const getDefiOrderDetail = (id) => apiService.get(`/contract/defiOrder/${id}`);

/**
 * 新增DEFI订单
 * @param {Object} data - 订单数据
 * @returns {Promise}
 */
export const saveDefiOrder = (data) => apiService.post('/contract/defiOrder', data);

/**
 * 更新DEFI订单
 * @param {Object} data - 订单数据
 * @returns {Promise}
 */
export const updateDefiOrder = (data) => apiService.put('/contract/defiOrder', data);

/**
 * 删除DEFI订单
 * @param {string|number} id - 订单ID
 * @returns {Promise}
 */
export const deleteDefiOrder = (id) => apiService.delete(`/contract/defiOrder/${id}`);

// ==================== 空投活动管理 ====================

/**
 * 获取空投活动列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.totleAmount - 金额任务
 * @param {string} params.amount - 奖励金额
 * @param {string} params.endTime - 结束时间
 * @returns {Promise}
 */
export const getDefiActivityList = (params) => apiService.get('/contract/defiActivity/list', { params });

/**
 * 获取空投活动详情
 * @param {string|number} id - 活动ID
 * @returns {Promise}
 */
export const getDefiActivityDetail = (id) => apiService.get(`/contract/defiActivity/${id}`);

/**
 * 新增空投活动
 * @param {Object} data - 活动数据
 * @returns {Promise}
 */
export const saveDefiActivity = (data) => apiService.post('/contract/defiActivity', data);

/**
 * 更新空投活动
 * @param {Object} data - 活动数据
 * @returns {Promise}
 */
export const updateDefiActivity = (data) => apiService.put('/contract/defiActivity', data);

/**
 * 删除空投活动
 * @param {string|number} id - 活动ID
 * @returns {Promise}
 */
export const deleteDefiActivity = (id) => apiService.delete(`/contract/defiActivity/${id}`);

// ==================== 挖矿利率配置管理 ====================

/**
 * 获取挖矿利率配置列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.minAmount - 最小金额
 * @param {string} params.maxAmount - 最大金额
 * @param {string} params.rate - 利率
 * @returns {Promise}
 */
export const getDefiRateList = (params) => apiService.get('/contract/defiRate/list', { params });

/**
 * 获取挖矿利率配置详情
 * @param {string|number} id - 配置ID
 * @returns {Promise}
 */
export const getDefiRateDetail = (id) => apiService.get(`/contract/defiRate/${id}`);

/**
 * 新增挖矿利率配置
 * @param {Object} data - 配置数据
 * @returns {Promise}
 */
export const saveDefiRate = (data) => apiService.post('/contract/defiRate', data);

/**
 * 更新挖矿利率配置
 * @param {Object} data - 配置数据
 * @returns {Promise}
 */
export const updateDefiRate = (data) => apiService.put('/contract/defiRate', data);

/**
 * 删除挖矿利率配置
 * @param {string|number} id - 配置ID
 * @returns {Promise}
 */
export const deleteDefiRate = (id) => apiService.delete(`/contract/defiRate/${id}`);
