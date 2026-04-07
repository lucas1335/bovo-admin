import apiService from '../base';

/**
 * 交易对配置 API 模块
 * 用于管理币币交易的交易对配置
 */

// ==================== 交易对配置 ====================

/**
 * 获取交易对配置列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.searchParam - 搜索条件（JSON字符串）
 * @returns {Promise} API响应
 */
export const getTradingPairList = (params) => apiService.get('/contract/currencySymbol/list', { params });

/**
 * 获取交易对配置详情
 * @param {string|number} id - 交易对ID
 * @returns {Promise} API响应
 */
export const getTradingPairDetail = (id) => apiService.get(`/bussiness/currency/${id}`);

/**
 * 新增交易对配置
 * @param {Object} data - 交易对配置数据
 * @returns {Promise} API响应
 */
export const saveTradingPair = (data) => apiService.post('/contract/currencySymbol', data);

/**
 * 批量新增交易对配置（一键新增）
 * @param {Object} data - 批量数据
 * @param {string} data.symbols - 交易对符号（逗号分隔）
 * @returns {Promise} API响应
 */
export const saveTradingPairBatch = (data) => apiService.post('/contract/currencySymbol/addBatch/', data);

/**
 * 更新交易对配置
 * @param {Object} data - 交易对配置数据
 * @returns {Promise} API响应
 */
export const updateTradingPair = (data) => apiService.post('/contract/currencySymbol', data);

/**
 * 删除交易对配置
 * @param {string|number} id - 交易对ID
 * @returns {Promise} API响应
 */
export const deleteTradingPair = (params) => apiService.post('/contract/currencySymbol/delete', params);

// ==================== 币种管理 ====================

/**
 * 获取可添加的币种列表
 * @returns {Promise} API响应
 */
export const getCoinList = () => apiService.get('/match-engine/klineSymbol/list');

// ==================== 导出 ====================

export default {
  getTradingPairList,
  getTradingPairDetail,
  saveTradingPair,
  saveTradingPairBatch,
  updateTradingPair,
  deleteTradingPair,
  getCoinList,
};
