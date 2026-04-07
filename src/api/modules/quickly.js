import apiService from '../base';

// ==================== 闪兑订单管理 ====================

/**
 * 获取闪兑订单列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getQuicklyOrderList = (params) => apiService.get('/contract/secondContractOrder/list', { params });

/**
 * 获取闪兑订单详情
 * @param {number|string} id - 订单ID
 * @returns {Promise}
 */
export const getQuicklyOrder = (id) => apiService.get(`/contract/secondContractOrder/${id}`);

/**
 * 新增闪兑订单
 * @param {Object} data - 订单数据
 * @returns {Promise}
 */
export const saveQuicklyOrder = (data) => apiService.post('/contract/secondContractOrder', data);

/**
 * 更新闪兑订单
 * @param {Object} data - 订单数据
 * @returns {Promise}
 */
export const updateQuicklyOrder = (data) => apiService.put('/contract/secondContractOrder', data);

/**
 * 批量更新闪兑订单（订单标记）
 * @param {Array} data - 订单数据数组
 * @returns {Promise}
 */
export const batchUpdateQuicklyOrder = (data) => apiService.put('/contract/secondContractOrder/edits', data);

/**
 * 删除闪兑订单
 * @param {number|string} id - 订单ID
 * @returns {Promise}
 */
export const deleteQuicklyOrder = (id) => apiService.delete(`/contract/secondContractOrder/${id}`);

// ==================== 闪兑交易对管理 ====================

/**
 * 获取闪兑交易对列表
 * @param {object} params - 查询参数
 * @returns {Promise}
 */
export const getQuicklyTradePairList = (params) => apiService.get('/contract/secondCoinConfig/list', { params });

/**
 * 获取闪兑交易对详情
 * @param {object} params - 查询参数 { id }
 * @returns {Promise}
 */
export const getQuicklyTradePairDetail = (params) => apiService.get(`/contract/secondCoinConfig/${params.id}`);

/**
 * 新增闪兑交易对
 * @param {object} data - 交易对数据
 * @returns {Promise}
 */
export const saveQuicklyTradePair = (data) => apiService.post('/contract/secondCoinConfig', data);

/**
 * 更新闪兑交易对
 * @param {object} data - 交易对数据
 * @returns {Promise}
 */
export const updateQuicklyTradePair = (data) => apiService.put('/contract/secondCoinConfig', data);

/**
 * 删除闪兑交易对
 * @param {object} params - 查询参数 { id }
 * @returns {Promise}
 */
export const deleteQuicklyTradePair = (params) => apiService.delete(`/contract/secondCoinConfig/${params.id}`);

/**
 * 获取币种列表（用于下拉选择）
 * @param {object} params - 查询参数
 * @returns {Promise}
 */
export const getCoinList = (params) => apiService.get('/match-engine/klineSymbol/list', { params });

/**
 * 获取周期列表（用于周期复制）
 * @param {object} params - 查询参数
 * @returns {Promise}
 */
export const getCycleList = (params) => apiService.get('/contract/secondCoinConfig/copylist', { params });

/**
 * 保存周期复制
 * @param {object} data - 复制数据 { copyId, copyIds }
 * @returns {Promise}
 */
export const saveCopy = (data) => apiService.post('/contract/secondCoinConfig/bathCopyIng', data);

// ==================== 闪兑周期配置管理 ====================

/**
 * 获取闪兑周期配置列表
 * @param {object} params - 查询参数
 * @returns {Promise}
 */
export const getQuicklyCycleList = (params) => apiService.get('/contract/secondPeriod/list', { params });

/**
 * 获取闪兑周期配置详情
 * @param {number|string} id - 配置ID
 * @returns {Promise}
 */
export const getQuicklyCycleDetail = (id) => apiService.get(`/contract/secondPeriod/${id}`);

/**
 * 新增闪兑周期配置
 * @param {object} data - 周期配置数据
 * @returns {Promise}
 */
export const saveQuicklyCycle = (data) => apiService.post('/contract/secondPeriod', data);

/**
 * 更新闪兑周期配置
 * @param {object} data - 周期配置数据
 * @returns {Promise}
 */
export const updateQuicklyCycle = (data) => apiService.put('/contract/secondPeriod', data);

/**
 * 删除闪兑周期配置
 * @param {number|string} id - 配置ID
 * @returns {Promise}
 */
export const deleteQuicklyCycle = (id) => apiService.delete(`/contract/secondPeriod/${id}`);
