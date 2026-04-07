import apiService from '../base';

// ==================== OTC广告管理 ====================

/**
 * 获取OTC广告列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.searchParam - 搜索条件JSON字符串
 * @returns {Promise}
 */
export const getOtcAdvertisementList = (params) => apiService.post('/otcAdvertisement/getList', params);

/**
 * 获取OTC广告详情
 * @param {Object} params - 查询参数
 * @param {number} params.id - 广告ID
 * @returns {Promise}
 */
export const getOtcAdvertisementDetail = (params) => apiService.post('/otcAdvertisement/getDetail', params);

/**
 * 新增OTC广告
 * @param {Object} data - 广告数据
 * @param {string} data.advertiseName - 广告名称
 * @param {number} data.advertiseType - 广告类型 1=购买 2=出售
 * @param {number} data.currencyType - 货币类型 0=人民币 1=美元 2=港币
 * @param {string} data.price - 价格
 * @param {string} data.minLimit - 最小限额
 * @param {string} data.maxLimit - 最大限额
 * @param {string} data.startTime - 开始时间 (格式: HHmm, 如 930=09:30)
 * @param {string} data.endTime - 结束时间 (格式: HHmm, 如 2400=24:00)
 * @param {string} data.remark - 留言内容
 * @param {number} data.paymentMethodId - 收款方式ID
 * @returns {Promise}
 */
export const saveOtcAdvertisement = (data) => apiService.post('/otcAdvertisement/save', data);

/**
 * 更新OTC广告
 * @param {Object} data - 广告数据
 * @param {number} data.id - 广告ID
 * @param {string} data.advertiseName - 广告名称
 * @param {number} data.advertiseType - 广告类型 1=购买 2=出售
 * @param {number} data.currencyType - 货币类型 0=人民币 1=美元 2=港币
 * @param {string} data.price - 价格
 * @param {string} data.minLimit - 最小限额
 * @param {string} data.maxLimit - 最大限额
 * @param {string} data.startTime - 开始时间
 * @param {string} data.endTime - 结束时间
 * @param {string} data.remark - 留言内容
 * @param {number} data.paymentMethodId - 收款方式ID
 * @returns {Promise}
 */
export const updateOtcAdvertisement = (data) => apiService.post('/otcAdvertisement/update', data);

/**
 * 删除OTC广告
 * @param {Object} params - 删除参数
 * @param {number} params.id - 广告ID
 * @returns {Promise}
 */
export const deleteOtcAdvertisement = (params) => apiService.post('/otcAdvertisement/delete', params);

/**
 * 更新广告价格
 * @param {Object} data - 更新数据
 * @param {number} data.id - 广告ID
 * @param {string} data.price - 新价格
 * @returns {Promise}
 */
export const updateOtcAdvertisementPrice = (data) => apiService.post('/otcAdvertisement/updatePrice', data);

/**
 * 广告上架/下架
 * @param {Object} data - 操作数据
 * @param {number} data.id - 广告ID
 * @param {number} data.status - 状态 0=下架 1=上架
 * @returns {Promise}
 */
export const updateOtcAdvertisementStatus = (data) => apiService.post('/otcAdvertisement/updateStatus', data);

/**
 * 设置快捷广告
 * @param {Object} data - 操作数据
 * @param {number} data.id - 广告ID
 * @param {number} data.quickType - 快捷类型 0=普通区 1=快捷区
 * @returns {Promise}
 */
export const updateOtcAdvertisementQuick = (data) => apiService.post('/otcAdvertisement/updateQuick', data);

/**
 * 获取商家列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getOtcMerchantList = (params) => apiService.post('/otcMerchant/getList', params);

/**
 * 新增OTC商家
 * @param {Object} data - 商家数据
 * @returns {Promise}
 */
export const saveOtcMerchant = (data) => apiService.post('/otcMerchant/save', data);

/**
 * 更新OTC商家
 * @param {Object} data - 商家数据
 * @returns {Promise}
 */
export const updateOtcMerchant = (data) => apiService.post('/otcMerchant/update', data);

/**
 * 删除OTC商家
 * @param {Object} params - 删除参数
 * @returns {Promise}
 */
export const deleteOtcMerchant = (params) => apiService.post('/otcMerchant/delete', params);

/**
 * 获取收款方式列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getOtcPaymentMethodList = (params) => apiService.post('/otcPaymentMethod/getList', params);

// ==================== OTC交易记录管理 ====================

/**
 * 获取OTC交易记录列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.searchParam - 搜索条件（JSON字符串）
 * @returns {Promise} API响应
 */
export const getOtcRecordList = (params) => apiService.post('/otcRecord/list', params);

/**
 * 获取OTC交易记录详情
 * @param {Object} params - 查询参数
 * @param {string|number} params.id - 交易记录ID
 * @returns {Promise} API响应
 */
export const getOtcRecordDetail = (params) => apiService.post('/otcRecord/getDetail', params);

/**
 * 获取OTC交易统计数据
 * @param {Object} params - 查询参数
 * @param {string} params.type - 交易类型（1-出金，2-入金）
 * @param {string} params.startTime - 开始时间
 * @param {string} params.endTime - 结束时间
 * @returns {Promise} API响应
 */
export const getOtcStatistics = (params) => apiService.get('/otcRecord/statistics', { params });

/**
 * 标记/取消标记交易订单
 * @param {Object} data - 标记数据
 * @param {string|number} data.id - 订单ID
 * @param {number} data.markType - 标记类型（0-取消标记，1-标记）
 * @returns {Promise} API响应
 */
export const markOtcOrder = (data) => apiService.post('/otcRecord/mark', data);

/**
 * 处理OTC交易申诉
 * @param {Object} data - 申诉处理数据
 * @param {string|number} data.id - 订单ID
 * @param {string} data.appealResult - 申诉结果
 * @param {string} data.remark - 备注
 * @returns {Promise} API响应
 */
export const handleOtcAppeal = (data) => apiService.post('/otcRecord/appeal/handle', data);

/**
 * 取消OTC交易订单
 * @param {Object} data - 取消数据
 * @param {string|number} data.id - 订单ID
 * @param {string} data.reason - 取消原因
 * @returns {Promise} API响应
 */
export const cancelOtcOrder = (data) => apiService.post('/otcRecord/cancel', data);

/**
 * 完成OTC交易订单（放币）
 * @param {Object} data - 完成数据
 * @param {string|number} data.id - 订单ID
 * @returns {Promise} API响应
 */
export const completeOtcOrder = (data) => apiService.post('/otcRecord/complete', data);

// ==================== OTC商家管理 ====================

/**
 * 获取OTC商家列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getOtcBusinessList = (params) => apiService.post('/otcBusiness/list', params);

/**
 * 获取OTC商家详情
 * @param {Object} params - 查询参数
 * @param {number} params.id - 商家ID
 * @returns {Promise}
 */
export const getOtcBusinessDetail = (params) => apiService.post('/otcBusiness/getDetail', params);

/**
 * 新增OTC商家
 * @param {Object} data - 商家数据
 * @returns {Promise}
 */
export const addOtcBusiness = (data) => apiService.post('/otcBusiness/add', data);

/**
 * 更新OTC商家
 * @param {Object} data - 商家数据
 * @returns {Promise}
 */
export const updateOtcBusiness = (data) => apiService.post('/otcBusiness/update', data);

/**
 * 删除OTC商家
 * @param {Object} params - 删除参数
 * @returns {Promise}
 */
export const deleteOtcBusiness = (params) => apiService.post('/otcBusiness/delete', params);

/**
 * 发布OTC商家
 * @param {Object} data - 发布数据
 * @returns {Promise}
 */
export const releaseOtcBusiness = (data) => apiService.post('/otcBusiness/release', data);
