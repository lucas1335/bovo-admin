/**
 * 理财产品管理 API
 */
import apiService from '../base';

// ==================== 理财产品管理 ====================

/**
 * 获取理财产品列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getFinancialProductList = (params) => apiService.get('/contract/mineFinancial/list', { params });

/**
 * 获取理财产品详情
 * @param {String|Number} id - 产品ID
 * @returns {Promise}
 */
export const getFinancialProductDetail = (id) => apiService.get(`/contract/mineFinancial/${id}`);

/**
 * 新增理财产品
 * @param {Object} data - 产品数据
 * @returns {Promise}
 */
export const saveFinancialProduct = (data) => apiService.post('/contract/mineFinancial', data);

/**
 * 更新理财产品
 * @param {Object} data - 产品数据（包含id）
 * @returns {Promise}
 */
export const updateFinancialProduct = (data) => apiService.put('/contract/mineFinancial', data);

/**
 * 删除理财产品
 * @param {String|Number} id - 产品ID
 * @returns {Promise}
 */
export const deleteFinancialProduct = (id) => apiService.delete(`/contract/mineFinancial/${id}`);

// ==================== 理财订单管理 ====================

/**
 * 获取理财订单列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getFinancialOrderList = (params) => apiService.get('/contract/mineOrder/list', { params });

/**
 * 获取理财订单详情
 * @param {String|Number} id - 订单ID
 * @returns {Promise}
 */
export const getFinancialOrderDetail = (id) => apiService.get(`/contract/mineOrder/${id}`);

/**
 * 新增理财订单
 * @param {Object} data - 订单数据
 * @returns {Promise}
 */
export const saveFinancialOrder = (data) => apiService.post('/contract/mineOrder', data);

/**
 * 更新理财订单
 * @param {Object} data - 订单数据（包含id）
 * @returns {Promise}
 */
export const updateFinancialOrder = (data) => apiService.put('/contract/mineOrder', data);

/**
 * 删除理财订单
 * @param {String|Number} id - 订单ID
 * @returns {Promise}
 */
export const deleteFinancialOrder = (id) => apiService.delete(`/contract/mineOrder/${id}`);

/**
 * 理财订单赎回
 * @param {String|Number} id - 订单ID
 * @returns {Promise}
 */
export const reCallFinancialOrder = (id) => apiService.put(`/contract/mineOrder/reCall?id=${id}`);
