import apiService from '../base';

// ==================== 代理用户管理 ====================

/**
 * 获取代理用户列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.merchandiserUserId - 跟单员ID
 * @param {string} params.tranType - 交易类型 (0:秒合约, 1:合约, 2:现货)
 * @param {string} params.enable - 启用状态 (1:启用, 2:禁用)
 * @returns {Promise}
 */
export const getAgentList = (params) => apiService.get('/merchandiser/getList', { params });

/**
 * 获取代理用户详情
 * @param {Object} params - 查询参数
 * @param {number|string} params.id - 代理用户ID
 * @returns {Promise}
 */
export const getAgentDetail = (params) => apiService.get('/merchandiser/getInfo', { params });

/**
 * 新增代理用户
 * @param {Object} data - 代理用户数据
 * @param {string} data.tranType - 交易类型 (0:秒合约, 1:合约, 2:现货)
 * @param {string} data.merchandiserUserId - 跟单员ID
 * @param {string} data.name - 跟单员昵称
 * @param {string} data.introduce - 跟单员简介
 * @param {number} data.star - 跟单员星级 (1-5)
 * @param {string} data.logo - 头像URL
 * @param {number} data.ratio - 固定比例跟随
 * @param {number} data.thresholdRate - 门槛比例
 * @param {number} data.combo1 - 面额1
 * @param {number} data.combo2 - 面额2
 * @param {number} data.combo3 - 面额3
 * @param {number} data.combo4 - 面额4
 * @param {number} data.combo5 - 面额5
 * @param {number} data.combo6 - 面额6
 * @param {number} data.commissionRate - 返佣比例
 * @param {number} data.earningRate - 90日收益率
 * @param {number} data.income - 90日收益额
 * @param {number} data.initFollowerNum - 初始跟单人数
 * @param {number} data.followerNum - 跟单人数
 * @param {number} data.scale - 带单规模
 * @param {number} data.day - 带单天数
 * @param {string} data.lineImage - 折线图URL
 * @param {number} data.compEnable - 是否开启普通赔付 (1:开启, 2:关闭)
 * @param {number} data.compRatio - 普通赔付率
 * @param {number} data.fullCompEnable - 是否开启百分百赔付跟单 (1:开启, 0:关闭)
 * @param {string} data.fullCompBeginTime - 百分百赔付开始日期
 * @param {number} data.fullCompMinAmount - 最少跟单金额
 * @param {number} data.fullComp15dMaxNum - 15天总份额
 * @param {number} data.fullComp15dLeftNum - 15天剩余份额
 * @param {number} data.fullComp30dMaxNum - 30天总份额
 * @param {number} data.fullComp30dLeftNum - 30天剩余份额
 * @param {number} data.fullComp90dMaxNum - 90天总份额
 * @param {number} data.fullComp90dLeftNum - 90天剩余份额
 * @param {number} data.fullComp180dMaxNum - 180天总份额
 * @param {number} data.fullComp180dLeftNum - 180天剩余份额
 * @param {number} data.fullComp365dMaxNum - 365天总份额
 * @param {number} data.fullComp365dLeftNum - 365天剩余份额
 * @param {string} data.enable - 启用状态 (1:启用, 2:禁用)
 * @returns {Promise}
 */
export const saveAgent = (data) => apiService.post('/merchandiser/add', data);

/**
 * 更新代理用户
 * @param {Object} data - 代理用户数据（包含id）
 * @returns {Promise}
 */
export const updateAgent = (data) => apiService.post('/merchandiser/edit', data);

/**
 * 删除代理用户
 * @param {Object} params - 查询参数
 * @param {number|string} params.id - 代理用户ID
 * @returns {Promise}
 */
export const deleteAgent = (params) => apiService.post('/merchandiser/remove', params);

/**
 * 批量删除代理用户
 * @param {Object} params - 查询参数
 * @param {string} params.ids - 代理用户ID列表，逗号分隔
 * @returns {Promise}
 */
export const batchDeleteAgent = (params) => apiService.post('/merchandiser/remove', params);

// ==================== 代理等级管理 ====================

/**
 * 获取代理等级列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getAgentLevelList = (params) => apiService.get('/agentLevel/getList', { params });

/**
 * 新增代理等级
 * @param {Object} data - 代理等级数据
 * @returns {Promise}
 */
export const saveAgentLevel = (data) => apiService.post('/agentLevel/save', data);

/**
 * 更新代理等级
 * @param {Object} data - 代理等级数据（包含id）
 * @returns {Promise}
 */
export const updateAgentLevel = (data) => apiService.post('/agentLevel/update', data);

/**
 * 删除代理等级
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const deleteAgentLevel = (params) => apiService.post('/agentLevel/delete', params);

// ==================== 代理审核 ====================

/**
 * 获取代理审核列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getAgentAuditList = (params) => apiService.get('/agentAudit/getList', { params });

/**
 * 审核代理
 * @param {Object} data - 审核数据
 * @param {number|string} data.id - 代理ID
 * @param {number} data.auditStatus - 审核状态 (1:通过, 2:拒绝)
 * @param {string} data.auditRemark - 审核备注
 * @returns {Promise}
 */
export const auditAgent = (data) => apiService.post('/agentAudit/audit', data);

// ==================== 历史带单 ====================

/**
 * 获取历史带单列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {number|string} params.merchandiserId - 跟单员ID
 * @returns {Promise}
 */
export const getAgentHistoryList = (params) => apiService.get('/merchandiserFollow/getList', { params });

// ==================== 永续跟单 ====================

/**
 * 计算盈利
 * @param {Object} data - 计算参数
 * @returns {Promise}
 */
export const calculateProfit = (data) => apiService.post('/merchandiser/calculateProfit', data);

/**
 * 保存永续跟单
 * @param {Object} data - 永续跟单数据
 * @returns {Promise}
 */
export const saveFollowOrder = (data) => apiService.post('/merchandiser/saveFollowOrder', data);

// ==================== 代理活跃度管理 ====================

/**
 * 获取活跃代理列表
 * @param {Object} params - 查询参数
 * @param {number} params.day - 查询天数
 * @returns {Promise}
 */
export const getAgencyActivityList = (params) =>
  apiService.get('/asset/system/statistics/getAgencyActivityList', { params });

/**
 * 批量冻结代理
 * @param {Array<number>|number} ids - 代理用户ID数组或单个ID
 * @returns {Promise}
 */
export const batchFreezeAgency = (ids) =>
  apiService.post('/asset/appUser/batchFreeze', Array.isArray(ids) ? ids : [ids]);
