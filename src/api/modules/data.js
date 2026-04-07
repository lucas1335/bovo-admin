import apiService from '../base';

// ==================== 数据统计模块 API ====================

/**
 * 获取用户资金信息
 * @param {Object} data - 查询参数
 * @param {number} data.pageNum - 页码
 * @param {number} data.pageSize - 每页数量
 * @param {string} data.startTime - 开始时间
 * @param {string} data.endTime - 结束时间
 * @returns {Promise}
 */
export const getUserMoneyInfo = (data) => apiService.post('/asset/system/statistics/getUserMoneyInfo', data);

/**
 * 查询每日数据详情
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.userId - 用户ID
 * @returns {Promise}
 */
export const listData = (params) => apiService.get('/asset/userStatistics/list', { params });

/**
 * 查询代理数据详情
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.userId - 下级代理ID
 * @param {string} params.startTime - 开始时间
 * @param {string} params.endTime - 结束时间
 * @returns {Promise}
 */
export const agencyList = (params) => apiService.get('/asset/userStatistics/agencyList', { params });

/**
 * 查询代理下级玩家用户数据详情
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const agencyAppUserList = (params) => apiService.get('/asset/userStatistics/agencyAppUserList', { params });

/**
 * 查询每日数据
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const dailyData = (params) => apiService.get('/asset/userStatistics/dailyData', { params });

/**
 * 查询用户统计列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.agentId - 代理ID
 * @returns {Promise}
 */
export const userStatsList = (params) => apiService.get('/system/userStats/list', { params });

/**
 * 获取代理社区列表
 * @param {Object} data - 查询参数
 * @param {number} data.pageNum - 页码
 * @param {number} data.pageSize - 每页数量
 * @param {Array} data.inviterUserIdArr - 邀请用户ID数组
 * @param {string} data.beginTime - 开始时间
 * @param {string} data.endTime - 结束时间
 * @returns {Promise}
 */
export const getAgencyCommunityList = (data) => apiService.post('/asset/userStatistics/agencyCommunityList', data);

/**
 * 获取代理社区关系树
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getAgencyCommunityRelation = (params) => apiService.get('/asset/userStatistics/agencyCommunityRelation', { params });

/**
 * 查询下三级信息列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.userId - 用户ID
 * @returns {Promise}
 */
export const getNextThreeLevelByUserId = (params) => apiService.get('/asset/agentNetwork/getNextThreeLevelByUserId', { params });

/**
 * 获取活跃代理列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getAgencyActivityList = (params) => apiService.get('/asset/system/statistics/getAgencyActivityList', { params });

/**
 * 批量冻结代理
 * @param {Array} ids - 代理ID数组
 * @returns {Promise}
 */
export const batchFreezeAgency = (ids) => apiService.post('/asset/appUser/batchFreeze', ids);

/**
 * 获取跟单配置
 * @returns {Promise}
 */
export const getMerchandiserConfig = (params) => apiService.get('/contract/merchandiserConfig', { params });

/**
 * 更新跟单配置
 * @param {Object} data - 配置数据
 * @returns {Promise}
 */
export const updateMerchandiserConfig = (data) => apiService.put('/contract/merchandiserConfig', data);
